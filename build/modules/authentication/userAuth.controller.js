"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationUserUpdatePassword = exports.organizationUserResetPassword = exports.OrganizationUserForgotPassword = exports.UserLogin = exports.verifyUserEmail = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_utils_1 = require("../../utilities/email.utils");
const createSessionAndSendToken_util_1 = require("../../utilities/createSessionAndSendToken.util");
const appError_1 = __importDefault(require("../../utilities/appError"));
const catchAsync_1 = __importDefault(require("../../utilities/catchAsync"));
const blacklistedToken_model_1 = require("../blacklistedTokens/blacklistedToken.model");
const individualUserAuth_model_1 = __importDefault(require("./individualUserAuth/individualUserAuth.model"));
const organizationAuth_model_1 = __importDefault(require("./organizationUserAuth/organizationAuth.model"));
const crypto = __importStar(require("crypto"));
const signToken = (id) => {
    const payload = { id };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};
const verifyUserEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        const checkIfBlacklistedToken = yield blacklistedToken_model_1.BlacklistedToken.findOne({
            token,
        });
        if (checkIfBlacklistedToken) {
            return res.status(400).json({
                status: false,
                message: "Link has already been used. Kindly attempt login to regenerate confirm email link!",
            });
        }
        const { email } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if the user exists and is verified
        const user = yield checkIfUserExist(email);
        if (!user)
            return res
                .status(400)
                .json({ message: "User with this email does not exist" });
        if (user.email_verified) {
            return res.status(400).json({ message: "User is already verified." });
        }
        yield blacklistedToken_model_1.BlacklistedToken.create({
            token,
        });
        // Update user's verification status
        user.email_verified = true;
        yield user.save();
        // Respond with success message
        return res.status(200).json({
            message: "Email verified successfully. Kindly go ahead to login",
            status: "true",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        console.error("Error verifying email:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({
                status: false,
                message: "Your token has expired. Kindly attempt login to regenerate confirm email link!", //expired token
            });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({
                status: false,
                message: "Invalid Token!!", // invalid token
            });
        }
        res.status(500).json({ message: "Error verifying email" });
    }
});
exports.verifyUserEmail = verifyUserEmail;
const UserLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, user_password } = req.body;
    if (!email || !user_password) {
        res.status(400).json({
            message: "Invalid Email or Password. Please provide a valid email or password",
        });
        return;
    }
    try {
        const individualUserToLogin = yield individualUserAuth_model_1.default.findOne({
            email,
        }).select("+password");
        if (individualUserToLogin) {
            if (individualUserToLogin.role === "g-ind") {
                res.status(400).json({
                    message: "Your account was created with Google. Kindly login Google.",
                });
            }
            if (!individualUserToLogin.email_verified) {
                const verificationToken = jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
                yield (0, email_utils_1.sendVerificationEmail)(email, verificationToken);
                return res.status(200).json({
                    status: "true",
                    message: "Account is unverified! Verfication email sent. verify account to continue",
                });
            }
            const passwordMatch = yield individualUserToLogin.comparePassword(user_password);
            if (!passwordMatch) {
                return res.status(422).json({ error: "Incorrect Password" });
            }
            const userWithoutPassword = __rest(individualUserToLogin.toObject(), []);
            const { status, message, user: userWithoutPasswordForSession, accessToken, refreshToken, } = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)({
                user: userWithoutPassword,
                userAgent: req.get("user-agent") || "",
                role: individualUserToLogin.role,
                message: "Individual user successfully logged in",
            });
            return res.status(200).json({
                status,
                message,
                user: userWithoutPasswordForSession,
                refreshToken,
                accessToken,
            });
        }
        const organizationUserToLogin = yield organizationAuth_model_1.default.findOne({
            organization_email: email,
        }).select("+password");
        if (organizationUserToLogin) {
            if (organizationUserToLogin.role === "g-org") {
                return res.status(400).json({
                    message: "Your account was created with Google. Kindly login Google.",
                });
            }
            if (!organizationUserToLogin.email_verified) {
                const verificationToken = jsonwebtoken_1.default.sign({ email: organizationUserToLogin.organization_email }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
                yield (0, email_utils_1.sendVerificationEmail)(organizationUserToLogin.organization_email, verificationToken);
                return res.status(200).json({
                    status: "true",
                    message: "Account is unverified! Verification email sent. Verify account to continue",
                });
            }
            const passwordMatch = yield organizationUserToLogin.correctPassword(user_password, organizationUserToLogin.password);
            if (!passwordMatch) {
                return res.status(422).json({ error: "Incorrect Password" });
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _a = organizationUserToLogin.toObject(), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
            const { status, message, user: userWithoutPasswordForSession, accessToken, refreshToken, } = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)({
                user: userWithoutPassword,
                userAgent: req.get("user-agent") || "",
                role: organizationUserToLogin.role,
                message: "Organization user successfully logged in",
            });
            return res.status(200).json({
                status,
                message,
                user: userWithoutPasswordForSession,
                refreshToken,
                accessToken,
            });
        }
        return res.status(400).json({
            message: "Invalid email or password",
        });
    }
    catch (error) {
        console.error("Error Logging in user:", error);
        res.status(500).json({ message: "Error Logging in user" });
    }
});
exports.UserLogin = UserLogin;
exports.OrganizationUserForgotPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on POSTed email
    const { email } = req.body;
    try {
        // Check if the user exists in the organization model
        const org = yield organizationAuth_model_1.default.findOne({
            organization_email: email,
        });
        // Check if the user exists in the individual model
        const user = yield individualUserAuth_model_1.default.findOne({
            email,
        });
        // If neither organization nor individual user is found, throw an error
        if (!org && !user) {
            throw new appError_1.default("There is no user with this email address.", 404);
        }
        // Generate the random reset token based on whether org or user is defined
        const resetToken = org
            ? org.createPasswordResetToken()
            : user.createPasswordResetToken();
        // Save the organization or user based on which one is found
        yield (org
            ? org.save({ validateBeforeSave: false })
            : user.save({ validateBeforeSave: false }));
        // Send reset email to the user's email
        const resetURL = `${req.protocol}://${req.get("host")}/auth/organization/resetPassword/${resetToken}`;
        // sendURLEmail([org?.organization_email, user?.email].filter(Boolean), resetURL);
        const validEmails = [org === null || org === void 0 ? void 0 : org.organization_email, user === null || user === void 0 ? void 0 : user.email].filter((email) => typeof email === "string");
        (0, email_utils_1.sendURLEmail)(validEmails, resetURL);
        res.status(200).json({ message: "success" });
    }
    catch (error) {
        return next(new appError_1.default("There is an error processing the request.", 500));
    }
}));
exports.organizationUserResetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on the token
    // const token = req.params.token;
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const org = yield organizationAuth_model_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    const user = yield individualUserAuth_model_1.default.findOne({
        passwordResetToken: hashedToken,
        // passwordResetExpires: { $gt: Date.now() },
    });
    // 2) If token has not expired, and there is a user, set the new password
    if (!org && !user) {
        return next(new appError_1.default("Token is invalid or has expired", 400));
    }
    if (org) {
        org.password = req.body.password;
        org.passwordResetToken = undefined;
        org.passwordResetExpires = undefined;
        yield org.save();
    }
    if (user) {
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        yield user.save();
    }
    // 3) Update changedPasswordAt property for the user/organization
    // [Update this part according to your implementation]
    // 4) Log the user/organization in and send JWT
    if (org) {
        createSendToken(org, 200, res);
    }
    else if (user) {
        createSendToken(user, 200, res);
    }
}));
exports.organizationUserUpdatePassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password } = req.body;
    try {
        const org = yield organizationAuth_model_1.default.findOne({
            passwordResetToken: req.params.token,
            passwordResetExpires: { $gt: Date.now() },
        });
        const user = yield individualUserAuth_model_1.default.findOne({
            passwordResetToken: req.params.token,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!org && !user) {
            return next(new appError_1.default("Token is invalid or has expired", 400));
        }
    }
    catch (error) {
        console.log(error);
    }
}));
const checkIfUserExist = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const individualUser = yield individualUserAuth_model_1.default.findOne({
        email,
    });
    if (individualUser)
        return individualUser;
    const organizationUser = yield organizationAuth_model_1.default.findOne({
        organization_email: email,
    });
    if (organizationUser)
        return organizationUser;
    return null;
});
