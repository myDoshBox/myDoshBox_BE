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
exports.resetPassword = exports.forgotPassword = exports.login = void 0;
const organizationAuth_model_1 = __importDefault(require("./organizationAuth.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_utils_1 = __importDefault(require("../../../utils/email.utils"));
const signToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: " please provide email and password",
            });
        }
        const org = yield organizationAuth_model_1.default.findOne({ email }).select("+password");
        if (!org || !(yield (org === null || org === void 0 ? void 0 : org.correctPassword(password, org.password)))) {
            return res.status(401).json({
                status: "fail",
                message: "Incorrect email or password",
            });
        }
        const token = signToken(org._id);
        res.status(200).json({
            status: "success",
            token,
        });
    }
    catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
});
exports.login = login;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const org = yield organizationAuth_model_1.default.findOne({ email: req.body.email });
        if (!org) {
            return res.status(404).json({
                status: "fail",
                Message: "There is no user with this email address",
            });
        }
        const resetToken = org.createPasswordResetToken();
        yield org.save({ validateBeforeSave: false });
        const resetURL = `${req.protocol}://${req.get("host")}//api/organization/resetpassword/${resetToken}`;
        const message = `Forgot ypur password? Submit a PATCH request with your new password and password Confirmation to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
        try {
            yield (0, email_utils_1.default)({
                email: org.email,
                subject: "Your password reset token (valid for 10 min)",
                message,
            });
            res.status(200).json({
                status: "success",
                message: "Token sent to email!",
            });
        }
        catch (err) {
            org.passwordResetToken = undefined;
            org.passwordResetExpires = undefined;
            yield org.save({ validateBeforeSave: false });
            return res.status(500).json({
                status: "fail",
                message: "There was an error sending the email. Try again later!",
            });
        }
    }
    catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => { };
exports.resetPassword = resetPassword;
