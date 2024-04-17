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
exports.resetPassword = exports.forgotPassword = exports.login = exports.signup = void 0;
const organizationAuth_model_1 = __importDefault(require("./organizationAuth.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const appError_1 = __importDefault(require("../../../utils/appError"));
const email_utils_1 = require("../../../utils/email.utils");
const createSessionAndSendToken_util_1 = require("../../../utilities/createSessionAndSendToken.util");
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
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organization_name, organization_email, contact_email, contact_number, password, password_confirmation, } = req.body;
        if (password !== password_confirmation) {
            res.status(401).json({
                status: "fail",
                message: "Password do not match",
            });
        }
        const emailAlreadyExist = yield organizationAuth_model_1.default.findOne({
            organization_email,
        });
        if (emailAlreadyExist) {
            return res.status(409).json({
                status: "failed",
                message: "User with email already exist",
            });
        }
        const org = yield organizationAuth_model_1.default.create({
            organization_name,
            organization_email,
            contact_email,
            contact_number,
            password,
            userKind: "org",
        });
        const createSessionAndSendTokensOptions = {
            user: org.toObject(),
            userAgent: req.get("user-agent") || "",
            userKind: org.userKind,
            message: "Organization user sucessfully created and logged in",
        };
        const { status, message, user, accessToken, refreshToken } = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)(createSessionAndSendTokensOptions);
        return res.status(201).json({
            status,
            message,
            user,
            refreshToken,
            accessToken,
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.signup = signup;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organization_email, password } = req.body;
        if (!organization_email || !password) {
            res.status(401).json({
                status: "fail",
                message: "Password do not match",
            });
        }
        // 2) Check if user exists && password is correct
        const loggedInUser = yield organizationAuth_model_1.default.findOne({
            organization_email,
        }).select("+password");
        if (!loggedInUser ||
            !(yield loggedInUser.correctPassword(password, loggedInUser.password))) {
            return res.status(401).json({
                status: "fail",
                message: "Incorrect details",
            });
        }
        // 3) If everything ok, send token to client
        const createSessionAndSendTokensOptions = {
            user: loggedInUser.toObject(),
            userAgent: req.get("user-agent") || "",
            userKind: loggedInUser.userKind,
            message: "Organization user sucessfully logged in",
        };
        const { status, message, user, accessToken, refreshToken } = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)(createSessionAndSendTokensOptions);
        return res.status(200).json({
            status,
            message,
            user,
            refreshToken,
            accessToken,
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.login = login;
exports.forgotPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on POSTed email
    const org = yield organizationAuth_model_1.default.findOne({
        email: req.body.email,
    });
    if (!org) {
        return next(new appError_1.default("There is no user with email address.", 404));
    }
    // 2) Generate the random reset token
    const resetToken = org.createPasswordResetToken();
    yield org.save({ validateBeforeSave: false });
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/api/organization/resetPassword/${resetToken}`;
    try {
        (0, email_utils_1.sendURLEmail)(org.organization_email, resetURL);
        res.status(200).json({ message: "success" });
    }
    catch (err) {
        return next(new appError_1.default("There is an error sending the email.", 500));
    }
}));
exports.resetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on the token
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const org = yield organizationAuth_model_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    // 2) If token has not expired, and there is org, set the new password
    if (!org) {
        return next(new appError_1.default("Token is invalid or has expired", 400));
    }
    org.password = req.body.password;
    org.passwordResetToken = undefined;
    org.passwordResetExpires = undefined;
    yield org.save();
    // 3) Update changedPasswordAt property for the org
    // 4) Log the org in, send JWT
    createSendToken(org, 200, res);
}));
