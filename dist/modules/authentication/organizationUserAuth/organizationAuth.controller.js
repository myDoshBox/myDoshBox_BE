"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationUserResetPassword = exports.organizationUserSignup = void 0;
const organizationAuth_model_1 = __importDefault(require("./organizationAuth.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const catchAsync_1 = __importDefault(require("../../../utilities/catchAsync"));
const appError_1 = __importDefault(require("../../../utilities/appError"));
const email_utils_1 = require("../../../utilities/email.utils");
const individualUserAuth_model1_1 = __importDefault(require("../individualUserAuth/individualUserAuth.model1"));
const signToken = (id) => {
    const payload = { id };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
const organizationUserSignup = async (req, res) => {
    try {
        const { organization_name, organization_email, contact_email, contact_number, password, password_confirmation, } = req.body;
        if (!organization_name) {
            return res.status(400).json({
                status: "fail",
                message: "Organization name is required",
            });
        }
        else if (!organization_email) {
            return res.status(400).json({
                status: "fail",
                message: "Organization email is required",
            });
        }
        else if (!contact_email) {
            return res.status(400).json({
                status: "fail",
                message: "Contact email is required",
            });
        }
        else if (!contact_number) {
            return res.status(400).json({
                status: "fail",
                message: "Contact number is required",
            });
        }
        else if (!password) {
            return res.status(400).json({
                status: "fail",
                message: "Password is required",
            });
        }
        else if (!password_confirmation) {
            return res.status(400).json({
                status: "fail",
                message: "Password confirmation  is required",
            });
        }
        if (password !== password_confirmation) {
            return res.status(401).json({
                status: "fail",
                message: "Passwords do not match",
            });
        }
        const individualEmailAlreadyExist = await individualUserAuth_model1_1.default.findOne({
            email: organization_email,
        });
        const organizationEmailAlreadyExist = await organizationAuth_model_1.default.findOne({
            organization_email,
        });
        if (organizationEmailAlreadyExist || individualEmailAlreadyExist) {
            return res.status(409).json({
                status: "failed",
                message: "User with email already exist",
            });
        }
        // Create a new user
        const newUser = new organizationAuth_model_1.default({
            organization_name,
            organization_email,
            contact_email,
            contact_number,
            password,
            role: "org",
        });
        // Save the user to the database
        await newUser.save();
        const verificationToken = jsonwebtoken_1.default.sign({
            email: newUser.organization_email,
        }, process.env.JWT_SECRET, {
            expiresIn: 60 * 60,
        });
        await (0, email_utils_1.sendVerificationEmail)(organization_email, verificationToken);
        return res.status(201).json({
            status: "true",
            message: "Account is unverified! Verification email sent. Verify account to continue. Please note that token expires in an hour",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        console.error("Error registering the user:", error);
        return res
            .status(500)
            .json({ message: "Error registering the user", error });
    }
};
exports.organizationUserSignup = organizationUserSignup;
exports.organizationUserResetPassword = (0, catchAsync_1.default)(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const org = await organizationAuth_model_1.default.findOne({
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
    await org.save();
    // 3) Update changedPasswordAt property for the org
    // 4) Log the org in, send JWT
    createSendToken(org, 200, res);
});
