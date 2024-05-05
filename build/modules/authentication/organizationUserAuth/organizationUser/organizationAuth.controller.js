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
exports.verifyOrganizationUserEmail = exports.organizationUserResetPassword = exports.OrganizationUserForgotPassword = exports.organizationUserSignup = void 0;
const organizationAuth_model_1 = __importDefault(require("../organizationAuth.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const catchAsync_1 = __importDefault(require("../../../../utilities/catchAsync"));
const appError_1 = __importDefault(require("../../../../utilities/appError"));
const email_utils_1 = require("../../../../utilities/email.utils");
const blacklistedToken_model_1 = require("../../../blacklistedTokens/blacklistedToken.model");
const individualUserAuth_model_1 = __importDefault(require("../../individualUserAuth/individualUserAuth.model"));
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
const organizationUserSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                message: "Password do not match",
            });
        }
        const individualEmailAlreadyExist = yield individualUserAuth_model_1.default.findOne({
            email: organization_email,
        });
        const organizationEmailAlreadyExist = yield organizationAuth_model_1.default.findOne({
            organization_email,
        });
        console.log(individualEmailAlreadyExist, organizationEmailAlreadyExist);
        if (organizationEmailAlreadyExist || individualEmailAlreadyExist) {
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
            role: "org",
        });
        const verificationToken = jsonwebtoken_1.default.sign({
            email: org.organization_email,
        }, process.env.JWT_SECRET, {
            expiresIn: 60 * 60,
        });
        yield (0, email_utils_1.sendVerificationEmail)(org.organization_email, verificationToken);
        return res.status(201).json({
            status: "true",
            message: "Account successfully created. Verification email sent. Verify account to continue",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (err) {
        next(err);
    }
});
exports.organizationUserSignup = organizationUserSignup;
// export const organizationUserLogin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { organization_email, password } = req.body;
//     if (!organization_email || !password) {
//       res.status(401).json({
//         status: "fail",
//         message: "Password and organization email are required",
//       });
//     }
//     // 2) Check if user exists && password is correct
//     const loggedInUser = await OrganizationModel.findOne({
//       organization_email,
//     }).select("+password");
//     if (
//       !loggedInUser ||
//       !(await loggedInUser.correctPassword(password, loggedInUser.password))
//     ) {
//       return res.status(401).json({
//         status: "fail",
//         message: "Incorrect details",
//       });
//     }
//     if (!loggedInUser.email_verified) {
//       const verificationToken = jwt.sign(
//         {
//           email: loggedInUser.organization_email,
//         },
//         process.env.JWT_SECRET as string,
//         {
//           expiresIn: 60 * 60,
//         }
//       );
//       await sendVerificationEmail(
//         loggedInUser.organization_email,
//         verificationToken
//       );
//       // Send a response
//       return res.status(200).json({
//         status: "true",
//         message:
//           "Account is unverified! Verification email sent. Verify account to continue",
//       });
//     }
//     // 3) If everything ok, send token to client
//     const createSessionAndSendTokensOptions = {
//       user: loggedInUser.toObject(),
//       userAgent: req.get("user-agent") || "",
//       role: loggedInUser.role,
//       message: "Organization user sucessfully logged in",
//     };
//     const { status, message, user, accessToken, refreshToken } =
//       await createSessionAndSendTokens(createSessionAndSendTokensOptions);
//     return res.status(200).json({
//       status,
//       message,
//       user,
//       refreshToken,
//       accessToken,
//     });
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (err: any) {
//     next(err);
//   }
// };
exports.OrganizationUserForgotPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    const resetURL = `${req.protocol}://${req.get("host")}/auth/organization/resetPassword/${resetToken}`;
    try {
        (0, email_utils_1.sendURLEmail)(org.organization_email, resetURL);
        res.status(200).json({ message: "success" });
    }
    catch (err) {
        return next(new appError_1.default("There is an error sending the email.", 500));
    }
}));
exports.organizationUserResetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
const verifyOrganizationUserEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield organizationAuth_model_1.default.findOne({
            organization_email: email,
        });
        if (!user) {
            return res
                .status(400)
                .json({ message: "User with this email does not exist" });
        }
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
        return res.redirect("https://www.google.com");
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
exports.verifyOrganizationUserEmail = verifyOrganizationUserEmail;
