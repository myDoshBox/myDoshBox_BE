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
exports.createGoogleUser = exports.getGoogleUserDetail = exports.getUserDetails = exports.getGoogleUrl = void 0;
const google_auth_library_1 = require("google-auth-library");
// import GoogleOrganizationUser from "./googleOrganizationUserAuth.model";
const organizationAuth_model_1 = __importDefault(require("../organizationAuth.model"));
const createSessionAndSendToken_util_1 = require("../../../../utilities/createSessionAndSendToken.util");
const getGoogleUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID_ORGANIZATION, process.env.GOOGLE_CLIENT_SECRET_ORGANIZATION, process.env.GOOGLE_OAUTH_REDIRECT_URL_ORGANIZATION);
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
const getGoogleUserDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.query;
        const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID_ORGANIZATION, process.env.GOOGLE_CLIENT_SECRET_ORGANIZATION, process.env.GOOGLE_OAUTH_REDIRECT_URL_ORGANIZATION);
        const response = yield oAuth2Client.getToken(code);
        yield oAuth2Client.setCredentials(response.tokens);
        const googleUser = oAuth2Client.credentials;
        const userDetails = yield (0, exports.getUserDetails)(googleUser.access_token);
        if (!userDetails.email_verified) {
            return res.status(401).json({
                status: "failed",
                message: "Google user not verified",
            });
        }
        const googleUserExist = yield organizationAuth_model_1.default.findOne({
            sub: userDetails.sub,
        });
        if (!googleUserExist) {
            return res.status(200).json({
                status: "success",
                data: {
                    organization_name: userDetails.name,
                    organization_email: userDetails.email,
                    email_verified: userDetails.email_verified,
                    picture: userDetails.picture,
                    sub: userDetails.sub,
                },
            });
        }
        const createSessionAndSendTokensOptions = {
            user: googleUserExist.toObject(),
            userAgent: req.get("user-agent") || "",
            role: "g-org",
            message: "Google user sucessfully logged in",
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
        // console.log("errorrrrrrrrrrr", err);
        next(err);
    }
});
exports.getGoogleUserDetail = getGoogleUserDetail;
const createGoogleUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organization_name, organization_email, email_verified, picture, sub, contact_email, contact_number, } = req.body;
        if (!organization_name ||
            !organization_email ||
            !email_verified ||
            !picture ||
            !sub ||
            !contact_email ||
            !contact_number) {
            return res.status(400).json({
                status: "failed",
                message: "Please provide the all the needed data for signup",
            });
        }
        const emailAlreadyExist = yield organizationAuth_model_1.default.findOne({
            organization_email,
        });
        //const emailAlreadyExist = await OtherUserModels.findOne({ email: userDetails.email });
        //const emailAlreadyExist = await OtherUserModels.findOne({ email: userDetails.email });
        if (emailAlreadyExist) {
            return res.status(409).json({
                status: "failed",
                message: "User with email already exist",
            });
        }
        const newUser = yield organizationAuth_model_1.default.create({
            organization_name,
            organization_email,
            email_verified,
            picture,
            sub,
            contact_email,
            contact_number,
            role: "g-org",
            //g-org, g-ind, org, ind
        });
        const createSessionAndSendTokensOptions = {
            user: newUser.toObject(),
            userAgent: req.get("user-agent") || "",
            role: newUser.role,
            message: "Google user sucessfully created and logged in",
        };
        const { status, message, user, accessToken, refreshToken } = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)(createSessionAndSendTokensOptions);
        return res.status(201).json({
            status,
            message,
            user,
            refreshToken,
            accessToken,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (err) {
        console.log(err.stack);
        return res.json(err);
    }
});
exports.createGoogleUser = createGoogleUser;
