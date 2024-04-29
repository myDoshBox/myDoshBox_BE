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
exports.resetIndividualPassword = exports.individualUserLogin = exports.verifyIndividualUserEmail = exports.individualUserRegistration = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const individualUserAuth_model_1 = __importDefault(require("../individualUserAuth.model"));
const individualAuthPasswordToken_1 = __importDefault(require("./individualAuthPasswordToken"));
const email_utils_1 = require("../../../../utilities/email.utils");
const createSessionAndSendToken_util_1 = require("../../../../utilities/createSessionAndSendToken.util");
const blacklistedToken_model_1 = require("../../../blacklistedTokens/blacklistedToken.model");
const organizationAuth_model_1 = __importDefault(require("../../organizationUserAuth/organizationAuth.model"));
const individualUserRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone_number, password, confirm_password } = req.body;
        console.log(name, email, phone_number, password, confirm_password);
        if (!name || !email || !phone_number || !password || !confirm_password) {
            return res
                .status(400)
                .json({ message: "Please provide all required fields" });
        }
        // Check if the user already exists
        const individualEmailAlreadyExist = yield individualUserAuth_model_1.default.findOne({
            email,
        });
        const organizationEmailAlreadyExist = yield organizationAuth_model_1.default.findOne({
            organization_email: email,
        });
        if (individualEmailAlreadyExist || organizationEmailAlreadyExist) {
            return res.status(400).json({
                status: "false",
                message: "User already exists",
            });
        }
        // Check if password and confirmPassword match
        if (password !== confirm_password) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }
        // Create a new user
        const newUser = new individualUserAuth_model_1.default({
            name,
            email,
            phone_number,
            password,
            role: "ind",
        });
        // Save the user to the database
        yield newUser.save();
        const verificationToken = jsonwebtoken_1.default.sign({
            email: newUser.email,
        }, process.env.JWT_SECRET, {
            expiresIn: 60 * 60,
        });
        yield (0, email_utils_1.sendVerificationEmail)(email, verificationToken);
        // Send a response
        return res.status(201).json({
            status: "true",
            message: "Account successfully created. Verification email sent. Verify account to continue",
        });
    }
    catch (error) {
        console.error("Error registering the user:", error);
        res.status(500).json({ message: "Error registering the user" });
    }
});
exports.individualUserRegistration = individualUserRegistration;
const verifyIndividualUserEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        const blackListedToken = yield blacklistedToken_model_1.BlacklistedToken.findOne({
            token,
        });
        if (blackListedToken) {
            return res.status(400).json({
                status: false,
                message: "Link has already been used. Kindly regenerate confirm email link!",
            });
        }
        const { email } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if the user exists and is verified
        const user = yield individualUserAuth_model_1.default.findOne({
            email,
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
                message: "Your token has expired. Please try to generate link and confirm email again", //expired token
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
exports.verifyIndividualUserEmail = verifyIndividualUserEmail;
//export const individualUserLogin = async (req: Request, res: Response) => {};
const individualUserLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const userToLogin = yield individualUserAuth_model_1.default.findOne({ email }).select("+password");
        if (!userToLogin)
            return res.status(400).json({ message: "Email/Password mismatch!" });
        const isMatch = yield userToLogin.comparePassword(password);
        if (!isMatch)
            return res.status(400).json({ message: "Email/Password mismatch!" });
        if (!userToLogin.email_verified) {
            const verificationToken = jsonwebtoken_1.default.sign({
                email: userToLogin.email,
            }, process.env.JWT_SECRET, {
                expiresIn: 60 * 60,
            });
            yield (0, email_utils_1.sendVerificationEmail)(email, verificationToken);
            // Send a response
            return res.status(200).json({
                status: "true",
                message: "Account is unverified! Verification email sent. Verify account to continue",
            });
        }
        const createSessionAndSendTokensOptions = {
            user: userToLogin.toObject(),
            userAgent: req.get("user-agent") || "",
            role: userToLogin.role,
            message: "Individual user successfully logged in",
        };
        const { status, message, user, accessToken, refreshToken } = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)(createSessionAndSendTokensOptions);
        user.password = "";
        return res.status(200).json({
            status,
            message,
            user,
            refreshToken,
            accessToken,
        });
    }
    catch (error) {
        console.error("Error Loggin in user:", error);
        res.status(500).json({ message: "Error Loggin in user" });
    }
});
exports.individualUserLogin = individualUserLogin;
const resetIndividualPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = yield individualUserAuth_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }
        // Update the user's password
        user.password = password;
        yield user.save();
        // Find the user ID
        const userId = user._id;
        // Delete the password reset token
        yield individualAuthPasswordToken_1.default.findOneAndDelete({ owner: userId });
        res.json({ message: "Password reset successfully!" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Error resetting password" });
    }
});
exports.resetIndividualPassword = resetIndividualPassword;
// export const logout = async (req: Request, res: Response) => {};
