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
exports.getGoogleUserDetail = exports.getUserDetails = exports.getGoogleUrl = exports.resetIndividualPassword = exports.individualUserRegistrationGoogle = exports.individualUserRegistration = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const individualUserAuth_model1_1 = __importDefault(require("./individualUserAuth.model1"));
const individualAuthPasswordToken_1 = __importDefault(require("./individualAuthPasswordToken"));
const email_utils_1 = require("../../../utilities/email.utils");
const organizationAuth_model_1 = __importDefault(require("../organizationUserAuth/organizationAuth.model"));
// import { createSessionAndSendTokens } from "../../../../utilities/createSessionAndSendToken.util";
const bcrypt_1 = __importDefault(require("bcrypt"));
const signAndVerifyToken_util_1 = require("../../../utilities/signAndVerifyToken.util");
const google_auth_library_1 = require("google-auth-library");
const createSessionAndSendToken_util_1 = require("../../../utilities/createSessionAndSendToken.util");
const individualUserRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone_number, password, confirm_password } = req.body;
        if (!email) {
            return res.status(400).json({
                status: "fail",
                message: "Email is required",
            });
        }
        else if (!phone_number) {
            return res.status(400).json({
                status: "fail",
                message: "Phone number is required",
            });
        }
        else if (!password) {
            return res.status(400).json({
                status: "fail",
                message: "Password is required",
            });
        }
        else if (!confirm_password) {
            return res.status(400).json({
                status: "fail",
                message: "Confirm password is required",
            });
        }
        if (password !== confirm_password) {
            return res.status(401).json({
                status: "fail",
                message: "Password do not match",
            });
        }
        // Check if the user already exists
        const individualEmailAlreadyExist = yield individualUserAuth_model1_1.default.findOne({
            email,
        });
        const organizationEmailAlreadyExist = yield organizationAuth_model_1.default.findOne({
            email,
        });
        if (individualEmailAlreadyExist || organizationEmailAlreadyExist) {
            return res.status(400).json({
                status: "false",
                message: "User already exists, please proceed to login",
            });
        }
        // Create a new user
        const newUser = new individualUserAuth_model1_1.default({
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
            expiresIn: 2 * 60,
        });
        yield (0, email_utils_1.sendVerificationEmail)(email, verificationToken);
        // Send a response
        return res.status(201).json({
            status: "true",
            message: "Account is unverified! Verification email sent. Verify account to continue. Please note that token expires in an hour",
        });
    }
    catch (error) {
        console.error("Error registering the user:", error);
        return res
            .status(500)
            .json({ message: "Error registering the user", error });
    }
});
exports.individualUserRegistration = individualUserRegistration;
const individualUserRegistrationGoogle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phone_number } = req.body;
    try {
        const individualUserToLogin = yield individualUserAuth_model1_1.default.findOne({
            email,
        }).select("+password");
        if (individualUserToLogin) {
            const token = signAndVerifyToken_util_1.signJwt.toString();
            // const token = signJwt();
            res.cookie("access_token", token, { httpOnly: true }).status(200).json();
        }
        else {
            const generatedPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = bcrypt_1.default.hashSync(generatedPassword, 10);
            // Create a new user
            const newUser = new individualUserAuth_model1_1.default({
                email,
                phone_number,
                password: hashedPassword,
                role: "ind",
                email_verified: true,
            });
            yield newUser.save();
            const token = signAndVerifyToken_util_1.signJwt.toString();
            res.cookie("access_token", token, { httpOnly: true }).status(200).json();
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
exports.individualUserRegistrationGoogle = individualUserRegistrationGoogle;
const resetIndividualPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = yield individualUserAuth_model1_1.default.findOne({ email });
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
const getGoogleUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CLIENT_SECRET, process.env.GOOGLE_OAUTH_REDIRECT_URL_INDIVIDUAL);
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ],
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL_INDIVIDUAL,
    });
    return res.json({ authorizeUrl });
});
exports.getGoogleUrl = getGoogleUrl;
const getUserDetails = (access_token) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    if (!response.ok) {
        throw new Error();
    }
    const data = response.json();
    return data;
});
exports.getUserDetails = getUserDetails;
/**
 * Retrieves the details of a Google user using the provided authorization code.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */
const getGoogleUserDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: "Missing authorization code" });
        }
        const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CLIENT_SECRET, process.env.GOOGLE_OAUTH_REDIRECT_URL_INDIVIDUAL);
        const { tokens } = yield oAuth2Client.getToken({
            code,
            redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL_INDIVIDUAL,
        });
        oAuth2Client.setCredentials(tokens);
        const userDetails = yield (0, exports.getUserDetails)(tokens.access_token);
        if (!userDetails.email_verified) {
            return res.status(401).json({
                status: "failed",
                message: "Google user not verified",
            });
        }
        const { name, email, email_verified, picture, sub } = userDetails;
        // Check if the user already exists
        const individualEmailAlreadyExist = yield individualUserAuth_model1_1.default.findOne({
            email,
        });
        const organizationEmailAlreadyExist = yield organizationAuth_model_1.default.findOne({
            organization_email: email,
        });
        if (individualEmailAlreadyExist &&
            individualEmailAlreadyExist.role === "ind") {
            return res.status(400).json({
                status: "false",
                message: "Kindly login with your email and password as account was not registered with google",
            });
        }
        if (organizationEmailAlreadyExist) {
            return res.status(400).json({
                status: "false",
                message: "User already exist as an organization. Kindly login as an organization to continue",
            });
        }
        const googleUserExist = individualEmailAlreadyExist === null || individualEmailAlreadyExist === void 0 ? void 0 : individualEmailAlreadyExist.sub;
        if (!googleUserExist) {
            const newUser = yield individualUserAuth_model1_1.default.create({
                name,
                email,
                email_verified,
                picture,
                sub,
                role: "g-ind",
            });
            const createSessionAndSendTokensOptions = {
                user: newUser.toObject(),
                userAgent: req.get("user-agent") || "",
                role: newUser.role,
                message: "Individual Google user successfully created",
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
        const createSessionAndSendTokensOptions = {
            user: individualEmailAlreadyExist.toObject(),
            userAgent: req.get("user-agent") || "",
            role: "g-ind",
            message: "Individual Google user successfully logged in",
        };
        const { status, message, user, accessToken, refreshToken } = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)(createSessionAndSendTokensOptions);
        return res.status(200).json({
            status,
            message,
            user,
            accessToken,
            refreshToken,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (err) {
        next(err);
    }
});
exports.getGoogleUserDetail = getGoogleUserDetail;
