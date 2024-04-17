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
exports.resetIndividualPassword = exports.individualUserLogin = exports.refreshAccessToken = exports.verifyIndividualUserEmail = exports.individualUserRegistration = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
//import IndividualUser from "./individualUserAuth.model"
//import Jwt from "jsonwebtoken";
const individualUserAuth_model_1 = __importDefault(require("./individualUserAuth.model"));
const individualAuthPasswordToken_1 = __importDefault(require("./individualAuthPasswordToken"));
const email_utils_1 = require("../../../utils/email.utils");
const generateToken_1 = require("../../../utils/generateToken");
const createSessionAndSendToken_util_1 = require("../../../utilities/createSessionAndSendToken.util");
const individualUserRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phoneNumber, password, confirmPassword } = req.body;
        if (!email || !phoneNumber || !password || !confirmPassword) {
            return res
                .status(400)
                .json({ message: "Please provide all required fields" });
        }
        // Check if the user already exists
        const userExists = yield individualUserAuth_model_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }
        // Generate a verification token
        const verificationToken = crypto_1.default.randomBytes(64).toString("hex");
        // Create a new user
        const newUser = new individualUserAuth_model_1.default({
            email,
            phoneNumber,
            password,
            verificationToken,
        });
        // Save the user to the database
        yield newUser.save();
        const { user, message, status, accessToken, refreshToken } = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)({
            user: newUser,
            userAgent: req.get("user-agent") || "",
            userKind: "ind",
            message: "Individual user successfully created",
        });
        yield (0, email_utils_1.sendVerificationEmail)(email, verificationToken);
        // Send a response
        return res.status(201).json({
            message,
            status,
            user,
            accessToken,
            refreshToken,
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
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: "Invalid token" });
        }
        // Check if the user exists and is verified
        const user = yield individualUserAuth_model_1.default.findOne({
            verificationToken: token,
        }).select("verificationToken verified");
        if (!user) {
            return res.status(400).json({ message: "Invalid token" });
        }
        if (user.verified) {
            return res.status(400).json({ message: "User is already verified." });
        }
        // Update user's verification status
        user.verified = true;
        yield user.save();
        // Respond with success message
        res.status(200).json({ message: "Email verified successfully." });
    }
    catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ message: "Error verifying email" });
    }
});
exports.verifyIndividualUserEmail = verifyIndividualUserEmail;
//export const individualUserLogin = async (req: Request, res: Response) => {};
const refreshAccessToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        //export const resetPassword = async (req: Request, res: Response) => {};   
        // Generate a new access token
        const accessToken = (0, generateToken_1.generateAccessToken)(decoded);
        res.json({ accessToken });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid refresh token." });
        }
        return res.status(401).json({ message: "Failed to refresh access token." });
    }
};
exports.refreshAccessToken = refreshAccessToken;
const individualUserLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield individualUserAuth_model_1.default.findOne({ email }).select("+password");
        if (!user)
            return res.status(400).json({ message: "Email/Password mismatch!" });
        const isMatch = yield user.comparePassword(password);
        if (!isMatch)
            return res.status(400).json({ message: "Email/Password mismatch!" });
        const { accessToken, refreshToken } = (0, generateToken_1.generateAccessAndRefreshToken)(user._id);
        user.password = "";
        res.status(200).json({
            message: "Login successful",
            user,
            accessToken,
            refreshToken,
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
