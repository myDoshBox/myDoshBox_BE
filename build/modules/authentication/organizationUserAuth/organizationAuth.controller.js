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
exports.resetOrganizationPassword = exports.forgotOrganizationPassword = exports.resendOrganizationVerificationEmail = exports.verifyOrganizationEmail = exports.organizationUserLogin = exports.organizationUserRegistration = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const organizationAuth_model_1 = __importDefault(require("./organizationAuth.model"));
const organizationEmail_utils_1 = require("../../../utilities/organizationEmail.utils");
const individualUserAuth_model1_1 = __importDefault(require("../individualUserAuth/individualUserAuth.model1"));
const createSessionAndSendToken_util_1 = require("../../../utilities/createSessionAndSendToken.util");
const crypto_1 = __importDefault(require("crypto"));
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
            // might check for individual later// individualEmailAlreadyExist
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
        // Get user agent from request
        const userAgent = req.get("User-Agent") || "unknown";
        // Use the session utility to create session and send tokens
        const result = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)({
            user: organization.toObject(),
            userAgent: userAgent,
            role: "org", // Organization role
            message: "Organization login successful",
        });
        // Set cookies for access and refresh tokens
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
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
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
        // Send welcome email after successful verification
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
        // This returns the UNHASHED token to send via email
        const resetToken = organization.createPasswordResetToken();
        // Save the organization with the hashed token and expiry
        yield organization.save({ validateBeforeSave: false });
        // Send reset email with the UNHASHED token
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
        // Validation Checks
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
        // Hash the incoming token the same way it was stored
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        // Find organization with matching hashed token and unexpired date
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
        // Update password and clear token fields
        organization.password = password;
        organization.passwordResetToken = undefined;
        organization.passwordResetExpires = undefined;
        organization.passwordChangedAt = new Date();
        yield organization.save();
        // Send success email
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
