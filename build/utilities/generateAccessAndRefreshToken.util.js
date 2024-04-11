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
exports.reIssueAccessToken = exports.generateAccessAndRefreshToken = void 0;
const lodash_1 = require("lodash");
const signAndVerifyToken_util_1 = require("./signAndVerifyToken.util");
const session_model_1 = require("../modules/sessions/session.model");
const OrganizationUser_model_1 = require("../modules/users/organizationUsers/OrganizationUser.model");
function generateAccessAndRefreshToken(userObject, sessionId) {
    const accessToken = (0, signAndVerifyToken_util_1.signJwt)({ userData: userObject, session: sessionId }, { expiresIn: `${process.env.ACCESS_TOKEN_TTL}` });
    const refreshToken = (0, signAndVerifyToken_util_1.signJwt)({ userData: userObject, session: sessionId }, { expiresIn: `${process.env.REFRESH_TOKEN_TTL}` });
    return { accessToken, refreshToken };
}
exports.generateAccessAndRefreshToken = generateAccessAndRefreshToken;
function reIssueAccessToken(_a) {
    return __awaiter(this, arguments, void 0, function* ({ refreshToken, }) {
        const { decoded } = (0, signAndVerifyToken_util_1.verifyJwt)(refreshToken);
        if (!decoded || !(0, lodash_1.get)(decoded, "session"))
            return false;
        const session = yield session_model_1.Session.findById((0, lodash_1.get)(decoded, "session"));
        if (!session || !session.valid)
            return false;
        const user = yield OrganizationUser_model_1.User.findById({ _id: session.user });
        if (!user)
            return false;
        const accessToken = (0, signAndVerifyToken_util_1.signJwt)({ userData: user, session: session._id }, { expiresIn: process.env.ACCESS_TOKEN_TTL });
        return accessToken;
    });
}
exports.reIssueAccessToken = reIssueAccessToken;
