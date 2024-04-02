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
const email_utils_1 = __importDefault(require("../../../utils/email.utils"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const appError_1 = __importDefault(require("../../../utils/appError"));
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
    const org = yield organizationAuth_model_1.default.create({
        name: req.body.name,
        email: req.body.email,
        orgEmail: req.body.orgEmail,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation,
    });
    createSendToken(org, 201, res);
}));
exports.login = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default("Please provide email and password!", 400));
    }
    // 2) Check if user exists && password is correct
    const user = yield organizationAuth_model_1.default.findOne({ email }).select("+password");
    if (!user || !(yield user.correctPassword(password, user.password))) {
        return next(new appError_1.default("Incorrect email or password", 401));
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
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    try {
        // sendEmail function needs to be implemented separately
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
        return next(new appError_1.default("There was an error sending the email. Try again later!", 500));
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
    org.passwordConfirmation = req.body.passwordConfirm;
    org.passwordResetToken = undefined;
    org.passwordResetExpires = undefined;
    yield org.save();
    // 3) Update changedPasswordAt property for the org
    // 4) Log the org in, send JWT
    createSendToken(org, 200, res);
}));
// export const signup = async (req: Request, res: Response) => {
//   try {
//     const { passwordConfirmation, ...userData } = req.body;
//     if (userData.password !== passwordConfirmation) {
//       return res.status(400).json({
//         status: "fail",
//         message: "Passwords do not match",
//       });
//     }
//     const newUser = await OrganizationModel.create(userData);
//     const token = signToken(newUser._id);
//     res.status(201).json({
//       status: "success",
//       token,
//       data: {
//         user: newUser,
//       },
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };
// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({
//         status: "fail",
//         message: " please provide email and password",
//       });
//     }
//     const user = await OrganizationModel.findOne({ email }).select("+password");
//     if (!user || !(await user?.correctPassword(password, user.password))) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Incorrect email or password",
//       });
//     }
//     const token = signToken(user._id);
//     res.status(200).json({
//       status: "success",
//       token,
//     });
//   } catch (err: any) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };
// export const forgotPassword = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     // Check if organization exists with provided email
//     const org = await OrganizationModel.findOne({ email });
//     if (!org) {
//       return res.status(404).json({
//         status: "fail",
//         message: "There is no user with this email address",
//       });
//     }
//     // Generate password reset token and save it to organization document
//     const resetToken = org.createPasswordResetToken();
//     await org.save({ validateBeforeSave: false });
//     // Construct reset URL
//     const resetURL = `${req.protocol}://${req.get(
//       "host"
//     )}/api/organization/resetpassword/${resetToken}`;
//     // Compose email message
//     const message = `Forgot your password? Submit a PATCH request with your new password and password Confirmation to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
//     try {
//       // Send password reset email
//       await sendEmail({
//         email: org.email,
//         subject: "Your password reset token (valid for 10 min)",
//         message,
//       });
//       // Respond with success message
//       return res.status(200).json({
//         status: "success",
//         message: "Token sent to email!",
//       });
//     } catch (err) {
//       // Handle email sending error
//       org.passwordResetToken = undefined;
//       org.passwordResetExpires = undefined;
//       await org.save({ validateBeforeSave: false });
//       return res.status(500).json({
//         status: "fail",
//         message: "There was an error sending the email. Try again later!",
//       });
//     }
//   } catch (err: any) {
//     // Handle other errors
//     return res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };
// export const forgotPassword = async (req: Request, res: Response) => {
//   try {
//     const org = await OrganizationModel.findOne({ email: req.body.email });
//     if (!org) {
//       return res.status(404).json({
//         status: "fail",
//         Message: "There is no user with this email address",
//       });
//     }
//     const resetToken = org.createPasswordResetToken();
//     await org.save({ validateBeforeSave: false });
//     const resetURL = `${req.protocol}://${req.get(
//       "host"
//     )}//api/organization/resetpassword/${resetToken}`;
//     const message = `Forgot your password? Submit a PATCH request with your new password and password Confirmation to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
//     try {
//       await sendEmail({
//         email: org.email,
//         subject: "Your password reset token (valid for 10 min)",
//         message,
//       });
//       res.status(200).json({
//         status: "success",
//         message: "Token sent to email!",
//       });
//     } catch (err) {
//       org.passwordResetToken = undefined;
//       org.passwordResetExpires = undefined;
//       await org.save({ validateBeforeSave: false });
//       return res.status(500).json({
//         status: "fail",
//         message: "There was an error sending the email. Try again later!",
//       });
//     }
//   } catch (err: any) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };
// export const resetPassword = async (req: Request, res: Response) => {};
