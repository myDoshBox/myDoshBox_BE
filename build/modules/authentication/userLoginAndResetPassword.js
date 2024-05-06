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
exports.organizationUserResetPassword = exports.OrganizationUserForgotPassword = exports.UserLogin = void 0;
const organizationAuth_model_1 = __importDefault(require("./organizationUserAuth/organizationAuth.model"));
const individualUserAuth_model_1 = __importDefault(require("./individualUserAuth/individualUserAuth.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_utils_1 = require("../../utilities/email.utils");
const createSessionAndSendToken_util_1 = require("../../utilities/createSessionAndSendToken.util");
const appError_1 = __importDefault(require("../../utilities/appError"));
const catchAsync_1 = __importDefault(require("../../utilities/catchAsync"));
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
const UserLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, user_password } = req.body;
    if (!email || !user_password) {
        res.status(400).json({ message: "Please provide email and password" });
        return;
    }
    try {
        const individualUserToLogin = yield individualUserAuth_model_1.default.findOne({
            email,
        }).select("+password");
        if (individualUserToLogin) {
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
                return res.status(422).json({ error: "Password is not correct" });
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
                return res.status(422).json({ error: "Invalid email or password" });
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
    }
    catch (error) {
        console.error("Error Logging in user:", error);
        res.status(500).json({ message: "Error Logging in user" });
    }
});
exports.UserLogin = UserLogin;
// export const OrganizationUserForgotPassword = catchAsync(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     // 1) Get user based on POSTed email
//     const { email } = req.body;
//     const org = await OrganizationModel.findOne({
//       organization_email: email, // Use email directly, assuming it's the organization's email
//     });
//     const user = await IndividualUser.findOne({
//       email: email, // Use email directly
//     });
//     console.log(user);
//     if (!org && !user) { // Check if neither organization nor individual user found
//       return next(new AppError("There is no user with the provided email address.", 404));
//     }
//     // 2) Generate the random reset token
//     const resetToken = org ? org.createPasswordResetToken() : user.createPasswordResetToken();
//     // Since we're not sure whether org or user is defined, check before saving
//     if (org) await org.save({ validateBeforeSave: false });
//     if (user) await user.save({ validateBeforeSave: false });
//     // 3) Send it to user's email
//     const resetURL = `${req.protocol}://${req.get(
//       "host"
//     )}/auth/organization/resetPassword/${resetToken}`;
//     try {
//          sendURLEmail([org.organization_email, user.email], resetURL);
//       // Filter out undefined emails
//       res.status(200).json({ message: "success" });
//     } catch (err) {
//       return next(new AppError("There is an error sending the email.", 500));
//     }
//   }
// );
// export const organizationUserResetPassword = catchAsync(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     // 1) Get user based on the token
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(req.params.token)
//       .digest("hex");
//     const org = await OrganizationModel.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() },
//     });
//     const user = await IndividualUser.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() },
//     });
//     // 2) If token has not expired, and there is a user, set the new password
//     if (!org && !user) {
//       return next(new AppError("Token is invalid or has expired", 400));
//     }
//     if (org) {
//       org.password = req.body.password;
//       org.passwordResetToken = undefined;
//       org.passwordResetExpires = undefined;
//       await org.save();
//     }
//     if (user) {
//       user.password = req.body.password;
//       user.passwordResetToken = undefined;
//       user.passwordResetExpires = undefined;
//       await user.save();
//     }
//     // 3) Update changedPasswordAt property for the user/organization
//     // [Update this part according to your implementation]
//     // 4) Log the user/organization in and send JWT
//     if (org) {
//       createSendToken(org, 200, res);
//     } else if (user) {
//       createSendToken(user, 200, res);
//     }
//   }
// );
exports.OrganizationUserForgotPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on POSTed email
    const { email } = req.body;
    console.log(email);
    const org = yield organizationAuth_model_1.default.findOne({
        organization_email: email,
    });
    const user = yield individualUserAuth_model_1.default.findOne({
        email,
    });
    console.log(user);
    if (!org || !user) {
        return next(new appError_1.default("There is no user with email address.", 404));
    }
    // 2) Generate the random reset token
    // const resetToken = org.createPasswordResetToken();
    // await org.save({ validateBeforeSave: false });
    // await user.save({ validateBeforeSave: false });
    const resetToken = org ? org.createPasswordResetToken() : user.createPasswordResetToken();
    yield (org ? org.save({ validateBeforeSave: false }) : user.save({ validateBeforeSave: false }));
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/auth/organization/resetPassword/${resetToken}`;
    try {
        sendURLEmail([org.organization_email, user.email], resetURL);
        res.status(200).json({ message: "success" });
    }
    catch (err) {
        return next(new appError_1.default("There is an error sending the email.", 500));
    }
}));
exports.organizationUserResetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on the token
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
        passwordResetExpires: { $gt: Date.now() },
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
