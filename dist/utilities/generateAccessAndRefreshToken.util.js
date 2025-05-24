"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reIssueAccessToken = exports.generateAccessAndRefreshToken = void 0;
const lodash_1 = require("lodash");
const signAndVerifyToken_util_1 = require("./signAndVerifyToken.util");
const session_model_1 = require("../modules/sessions/session.model");
const organizationAuth_model_1 = __importDefault(require("../modules/authentication/organizationUserAuth/organizationAuth.model"));
const individualUserAuth_model1_1 = __importDefault(require("../modules/authentication/individualUserAuth/individualUserAuth.model1"));
function generateAccessAndRefreshToken(userObject, sessionId, role) {
    const accessToken = (0, signAndVerifyToken_util_1.signJwt)({ userData: userObject, session: sessionId, role }, { expiresIn: `${process.env.ACCESS_TOKEN_TTL}` });
    const refreshToken = (0, signAndVerifyToken_util_1.signJwt)({ userData: userObject, session: sessionId, role }, { expiresIn: `${process.env.REFRESH_TOKEN_TTL}` });
    return { accessToken, refreshToken };
}
exports.generateAccessAndRefreshToken = generateAccessAndRefreshToken;
async function reIssueAccessToken({ refreshToken, }) {
    const { decoded } = (0, signAndVerifyToken_util_1.verifyJwt)(refreshToken);
    if (!decoded || !(0, lodash_1.get)(decoded, "session"))
        return false;
    const session = await session_model_1.Session.findById((0, lodash_1.get)(decoded, "session"));
    if (!session || !session.valid)
        return false;
    let user;
    if (session.role === "org" || session.role === "g-org") {
        user = (await organizationAuth_model_1.default.findById({
            _id: session.user,
        }));
    }
    else if (session.role === "ind" || session.role === "g-ind") {
        user = (await individualUserAuth_model1_1.default.findById({
            _id: session.user,
        }));
    }
    else {
        user = undefined;
    }
    if (!user)
        return false;
    const accessToken = (0, signAndVerifyToken_util_1.signJwt)({ userData: user, session: session._id, role: session.role }, { expiresIn: process.env.ACCESS_TOKEN_TTL });
    return accessToken;
}
exports.reIssueAccessToken = reIssueAccessToken;
