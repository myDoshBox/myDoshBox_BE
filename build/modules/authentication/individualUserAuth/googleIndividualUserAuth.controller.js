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
exports.getGoogleUserDetail = exports.getUserDetails = exports.getGoogleUrl = void 0;
const google_auth_library_1 = require("google-auth-library");
const createSessionAndSendToken_util_1 = require("../../../utilities/createSessionAndSendToken.util");
const individualUserAuth_model_1 = __importDefault(require("./individualUserAuth.model"));
const getGoogleUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_IDS, process.env.GOOGLE_CLIENT_SECRETS, process.env.GOOGLE_REDIRECT_URI);
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: true,
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    });
    return res.json({ authorizeUrl });
});
exports.getGoogleUrl = getGoogleUrl;
const getUserDetails = (access_token) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    const data = yield response.json();
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
        const { code } = req.query;
        const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_IDS, process.env.GOOGLE_CLIENT_SECRETS, process.env.GOOGLE_REDIRECT_URI);
        const response = yield oAuth2Client.getToken(code);
        yield oAuth2Client.setCredentials(response.tokens);
        const googleUser = oAuth2Client.credentials;
        const userDetails = yield (0, exports.getUserDetails)(googleUser.access_token);
        const { name, email, email_verified, picture, sub } = userDetails;
        if (!userDetails.email_verified) {
            return res.status(401).json({
                status: "failed",
                message: "Google user not verified",
            });
        }
        const googleUserExist = yield individualUserAuth_model_1.default.findOne({
            sub: userDetails.sub,
        });
        if (!googleUserExist) {
            const newUser = yield individualUserAuth_model_1.default.create({
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
                message: "Individual google user successfully created",
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
            user: googleUserExist.toObject(),
            userAgent: req.get("user-agent") || "",
            role: "g-ind",
            message: "Individual google user successfully logged in",
        };
        const { status, message, user, accessToken, refreshToken } = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)(createSessionAndSendTokensOptions);
        return res.status(200).json({
            status,
            message,
            user,
            accessToken,
            refreshToken,
        });
    }
    catch (err) {
        // console.log(err.stack);
        next(err);
    }
});
exports.getGoogleUserDetail = getGoogleUserDetail;
