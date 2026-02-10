"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetOrganizationPassword = exports.forgotOrganizationPassword = exports.resendOrganizationVerificationEmail = exports.verifyOrganizationEmail = exports.individualUserLogin = exports.organizationUserLogin = exports.organizationUserRegistration = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const organizationAuth_model_1 = __importDefault(require("./organizationAuth.model"));
const organizationEmail_utils_1 = require("../../../utilities/organizationEmail.utils");
const individualUserAuth_model1_1 = __importDefault(require("../individualUserAuth/individualUserAuth.model1"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createSessionAndSendToken_util_1 = require("../../../utilities/createSessionAndSendToken.util");
const crypto_1 = __importDefault(require("crypto"));
const cookieConfig_util_1 = require("../../../utilities/cookieConfig.util");
const organizationUserRegistration = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organization_name, organization_email, contact_email, contact_number, password, confirm_password, } = req.body;
        if (!organization_name ||
            !organization_email ||
            !contact_email ||
            !contact_number ||
            !password ||
            !confirm_password) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "All fields (organization_name, organization_email, contact_email, contact_number, password, confirm_password) are required",
            };
            return next(error);
        }
        if (password !== confirm_password) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Passwords do not match",
            };
            return next(error);
        }
        // Check if organization email already exists in both models
        const organizationEmailAlreadyExist = yield organizationAuth_model_1.default.findOne({
            organization_email,
        });
        const individualEmailAlreadyExist = yield individualUserAuth_model1_1.default.findOne({
            email: organization_email,
        });
        if (organizationEmailAlreadyExist) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Organization email exists, please proceed to login",
            };
            return next(error);
        }
        const newOrganization = new organizationAuth_model_1.default({
            organization_name,
            organization_email,
            contact_email,
            contact_number,
            password,
            role: "org",
        });
        yield newOrganization.save();
        const verificationToken = jsonwebtoken_1.default.sign({ organization_email: newOrganization.organization_email }, process.env.JWT_SECRET, { expiresIn: "2h" });
        yield (0, organizationEmail_utils_1.sendOrganizationVerificationEmail)(organization_email, verificationToken, organization_name);
        res.status(201).json({
            status: "success",
            message: "Organization account created successfully! Verification email sent. Please verify your account to continue. Note that token expires in 2 hours",
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error registering the organization",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.organizationUserRegistration = organizationUserRegistration;
const organizationUserLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organization_email, password } = req.body;
        if (!organization_email || !password) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Organization email and password are required",
            };
            return next(error);
        }
        const organization = yield organizationAuth_model_1.default.findOne({
            organization_email,
        }).select("+password");
        if (!organization) {
            const error = {
                statusCode: 404,
                status: "fail",
                message: "Organization not found",
            };
            return next(error);
        }
        if (!organization.email_verified) {
            const error = {
                statusCode: 403,
                status: "fail",
                message: "Please verify your organization email before logging in",
            };
            return next(error);
        }
        const userAgent = req.get("User-Agent") || "unknown";
        const result = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)({
            user: {
                _id: organization._id,
                email: organization.organization_email,
                phone_number: organization.contact_number,
                role: organization.role,
            },
            userAgent: userAgent,
            role: "org",
            message: "Organization login successful",
        });
        // ✅ FIX: Use the cookie configuration utility
        res.cookie("access_token", result.accessToken, (0, cookieConfig_util_1.getCookieOptions)(15 * 60 * 1000) // 15 minutes
        );
        res.cookie("refresh_token", result.refreshToken, (0, cookieConfig_util_1.getCookieOptions)(30 * 24 * 60 * 60 * 1000) // 30 days
        );
        res.status(200).json({
            status: "success",
            message: result.message,
            organization: {
                id: organization._id,
                organization_name: organization.organization_name,
                organization_email: organization.organization_email,
                contact_email: organization.contact_email,
                contact_number: organization.contact_number,
                role: organization.role,
            },
            token: result.accessToken, // ✅ ADD: For Redux compatibility
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error logging in organization",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.organizationUserLogin = organizationUserLogin;
const individualUserLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Email and password are required",
            };
            return next(error);
        }
        // Find user and include password field
        const user = yield individualUserAuth_model1_1.default.findOne({ email }).select("+password");
        if (!user) {
            const error = {
                statusCode: 404,
                status: "fail",
                message: "Invalid email or password",
            };
            return next(error);
        }
        // Check if email is verified
        if (!user.email_verified) {
            const error = {
                statusCode: 403,
                status: "fail",
                message: "Please verify your email before logging in",
            };
            return next(error);
        }
        // Verify password
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            const error = {
                statusCode: 401,
                status: "fail",
                message: "Invalid email or password",
            };
            return next(error);
        }
        // Get user agent from request headers
        const userAgent = req.get("User-Agent") || "unknown";
        // Create session and generate tokens
        const result = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)({
            user: {
                _id: user._id,
                email: user.email,
                phone_number: user.phone_number,
                role: user.role,
            },
            userAgent,
            role: "ind",
            message: "Login successful",
        });
        // Set HTTP-only cookies
        res.cookie("access_token", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie("refresh_token", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        // Send response
        res.status(200).json({
            status: "success",
            message: result.message,
            user: {
                id: user._id,
                email: user.email,
                phone_number: user.phone_number,
                role: user.role,
            },
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error logging in",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.individualUserLogin = individualUserLogin;
const verifyOrganizationEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Invalid or missing token",
            };
            return next(error);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const organization = yield organizationAuth_model_1.default.findOne({
            organization_email: decoded.organization_email,
        });
        if (!organization) {
            const error = {
                statusCode: 404,
                status: "fail",
                message: "Organization not found",
            };
            return next(error);
        }
        if (organization.email_verified) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Organization email already verified",
            };
            return next(error);
        }
        organization.email_verified = true;
        yield organization.save();
        yield (0, organizationEmail_utils_1.sendOrganizationWelcomeEmail)(organization.organization_email, organization.organization_name);
        res.status(200).json({
            status: "success",
            message: "Organization email verified successfully! You can now login to your account",
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: error instanceof jsonwebtoken_1.default.JsonWebTokenError ? 400 : 500,
            status: "fail",
            message: error instanceof jsonwebtoken_1.default.JsonWebTokenError
                ? "Invalid or expired token"
                : "Error verifying organization email",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.verifyOrganizationEmail = verifyOrganizationEmail;
const resendOrganizationVerificationEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organization_email } = req.body;
        if (!organization_email) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Organization email is required",
            };
            return next(error);
        }
        const organization = yield organizationAuth_model_1.default.findOne({
            organization_email,
        });
        if (!organization) {
            const error = {
                statusCode: 404,
                status: "fail",
                message: "Organization not found",
            };
            return next(error);
        }
        if (organization.email_verified) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Organization email is already verified",
            };
            return next(error);
        }
        const verificationToken = jsonwebtoken_1.default.sign({ organization_email: organization.organization_email }, process.env.JWT_SECRET, { expiresIn: "2h" });
        yield (0, organizationEmail_utils_1.sendOrganizationVerificationEmail)(organization_email, verificationToken, organization.organization_name);
        res.status(200).json({
            status: "success",
            message: "Organization verification email resent successfully. Please check your inbox",
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error resending organization verification email",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.resendOrganizationVerificationEmail = resendOrganizationVerificationEmail;
const forgotOrganizationPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organization_email } = req.body;
        if (!organization_email) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Organization email is required",
            };
            return next(error);
        }
        const organization = yield organizationAuth_model_1.default.findOne({
            organization_email,
        });
        if (!organization) {
            const error = {
                statusCode: 404,
                status: "fail",
                message: "Organization with this email does not exist",
            };
            return next(error);
        }
        const resetToken = organization.createPasswordResetToken();
        yield organization.save({ validateBeforeSave: false });
        yield (0, organizationEmail_utils_1.sendOrganizationPasswordResetEmail)(organization_email, resetToken, organization.organization_name);
        res.status(200).json({
            status: "success",
            message: "Password reset link sent to your organization email. Link expires in 10 minutes",
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error processing forgot password request",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.forgotOrganizationPassword = forgotOrganizationPassword;
const resetOrganizationPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        const { password, confirm_password } = req.body;
        if (!token || typeof token !== "string") {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Invalid or missing token",
            };
            return next(error);
        }
        if (!password || !confirm_password) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Password and confirm password are required",
            };
            return next(error);
        }
        if (password !== confirm_password) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Passwords do not match",
            };
            return next(error);
        }
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const organization = yield organizationAuth_model_1.default.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!organization) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Invalid or expired reset token",
            };
            return next(error);
        }
        organization.password = password;
        organization.passwordResetToken = undefined;
        organization.passwordResetExpires = undefined;
        organization.passwordChangedAt = new Date();
        yield organization.save();
        yield (0, organizationEmail_utils_1.sendOrganizationPasswordResetSuccessEmail)(organization.organization_email, organization.organization_name);
        res.status(200).json({
            status: "success",
            message: "Organization password reset successfully! You can now login with your new password",
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error resetting organization password",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.resetOrganizationPassword = resetOrganizationPassword;
