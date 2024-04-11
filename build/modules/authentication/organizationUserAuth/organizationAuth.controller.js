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
// import sendEmail from "../../../utils/email.utils";
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const appError_1 = __importDefault(require("../../../utils/appError"));
const email_utils_1 = require("../../../utils/email.utils");
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
exports.signup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, orgEmail, password, passwordConfirmation } = req.body;
    if (password !== passwordConfirmation) {
        res.status(401).json({
            status: "fail",
            message: "Password do not match",
        });
    }
    const org = yield organizationAuth_model_1.default.create({
        name,
        email,
        orgEmail,
        password,
        passwordConfirmation,
    });
    createSendToken(org, 201, res);
}));
exports.login = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(401).json({
            status: "fail",
            message: "Password do not match",
        });
    }
    // 2) Check if user exists && password is correct
    const user = yield organizationAuth_model_1.default.findOne({ email }).select("+password");
    if (!user || !(yield user.correctPassword(password, user.password))) {
        // return next(new AppError("Incorrect email or password", 401));
        res.status(401).json({
            status: "fail",
            message: "Password do not match",
        });
    }
    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
}));
exports.forgotPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on POSTed email
    const org = yield organizationAuth_model_1.default.findOne({ email: req.body.email });
    if (!org) {
        return next(new appError_1.default("There is no user with email address.", 404));
    }
    // 2) Generate the random reset token
    const resetToken = org.createPasswordResetToken();
    yield org.save({ validateBeforeSave: false });
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/api/organization/resetPassword/${resetToken}`;
    // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    // try {
    //   // sendEmail function needs to be implemented separately
    //   await sendEmail({
    //     email: org.email,
    //     subject: "Your password reset token (valid for 10 min)",
    //     message,
    //   });
    //   res.status(200).json({
    //     status: "success",
    //     message: "Token sent to email!",
    //   });
    // } catch (err) {
    //   org.passwordResetToken = undefined;
    //   org.passwordResetExpires = undefined;
    //   await org.save({ validateBeforeSave: false });
    //   return next(
    //     new AppError(
    //       "There was an error sending the email. Try again later!",
    //       500
    //     )
    //   );
    // }
    (0, email_utils_1.sendURLEmail)(org.email, resetURL);
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
    org.passwordConfirmation = req.body.passwordConfirm;
    org.passwordResetToken = undefined;
    org.passwordResetExpires = undefined;
    yield org.save();
    // 3) Update changedPasswordAt property for the org
    // 4) Log the org in, send JWT
    createSendToken(org, 200, res);
}));
