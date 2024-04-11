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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoogleUser = exports.getGoogleUserDetail = exports.getUserDetails = exports.getGoogleUrl = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleIndividualAuth_model_1 = require("../../users/individualUsers/googleIndividualAuth.model");
// import { signJwt } from "../../users/organizationUsers/organizationUsers.utils";
const createSession_util_1 = require("../../../utilities/createSession.util");
const generateAccessAndRefreshToken_util_1 = require("../../../utilities/generateAccessAndRefreshToken.util");
// import { createSession } from "./sessionsController.controller";
const getGoogleUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("here");
    // const stateOptions = req.body;
    // const encodedStateOptions = btoa(JSON.stringify(stateOptions));
    const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_IDS, process.env.GOOGLE_CLIENT_SECRETS, process.env.GOOGLE_REDIRECT_URI);
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: true,
        // state: encodedStateOptions,
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
const getGoogleUserDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.query;
        // const decodedState = JSON.parse(atob(state as string));
        const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_IDS, process.env.GOOGLE_CLIENT_SECRETS, process.env.GOOGLE_REDIRECT_URI);
        const response = yield oAuth2Client.getToken(code);
        yield oAuth2Client.setCredentials(response.tokens);
        const googleUser = oAuth2Client.credentials;
        const userDetails = yield (0, exports.getUserDetails)(googleUser.access_token);
        if (!userDetails.email_verified) {
            return res.status(400).json({
                status: false,
                message: "Google user not verified",
            });
        }
        console.log("hello");
        const googleUserExist = yield googleIndividualAuth_model_1.User.findOne({
            sub: userDetails.sub,
        });
        //
        if (!googleUserExist) {
            return res.status(200).json({
                status: true,
                data: {
                    name: userDetails.name,
                    email: userDetails.email,
                    email_verified: userDetails.email_verified,
                    picture: userDetails.picture,
                    sub: userDetails.sub,
                },
            });
        }
        const session = yield (0, createSession_util_1.createSession)(googleUserExist._id.toString(), req.get("user-agent") || "");
        const { accessToken, refreshToken } = (0, generateAccessAndRefreshToken_util_1.generateAccessAndRefreshToken)(googleUserExist, session._id);
        console.log("New Google User");
        console.log(googleUserExist);
        console.log(accessToken);
        console.log(refreshToken);
        return res.status(200).json({
            status: true,
            message: "Google user sucessfully logged in",
            user: googleUserExist,
            accessToken,
            refreshToken,
        });
    }
    catch (err) {
        console.log(err.stack);
        return res.json(err.stack);
    }
});
exports.getGoogleUserDetail = getGoogleUserDetail;
const createGoogleUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log(req.body);
        const { name, email, email_verified, picture, sub, } = req.body;
        if (!name ||
            !email ||
            !email_verified ||
            !picture ||
            !sub) {
            return res.status(400).json({
                status: false,
                message: "Please provide all the needed data for signup",
            });
        }
        const emailAlreadyExist = yield googleIndividualAuth_model_1.User.findOne({
            email,
        });
        //const emailAlreadyExist = await OtherUserModels.findOne({ email: userDetails.email });
        //const emailAlreadyExist = await OtherUserModels.findOne({ email: userDetails.email });
        if (emailAlreadyExist) {
            return res.status(400).json({
                status: false,
                message: "User with email already exist",
            });
        }
        const user = yield googleIndividualAuth_model_1.User.create({
            name,
            email,
            email_verified,
            picture,
            sub,
        });
        const session = yield (0, createSession_util_1.createSession)(user._id.toString(), req.get("user-agent") || "");
        const { accessToken, refreshToken } = (0, generateAccessAndRefreshToken_util_1.generateAccessAndRefreshToken)(user, session._id);
        console.log("Existing Google User");
        console.log(user);
        console.log(accessToken);
        console.log(refreshToken);
        return res.status(201).json({
            status: true,
            message: "google user sucessfully created",
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
