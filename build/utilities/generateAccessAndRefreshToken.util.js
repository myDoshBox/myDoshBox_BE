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
exports.reIssueAccessToken = exports.generateAccessAndRefreshToken = void 0;
const lodash_1 = require("lodash");
const signAndVerifyToken_util_1 = require("./signAndVerifyToken.util");
const session_model_1 = require("../modules/sessions/session.model");
const organizationAuth_model_1 = __importDefault(require("../modules/authentication/organizationUserAuth/organizationAuth.model"));
const individualUserAuth_model1_1 = __importDefault(require("../modules/authentication/individualUserAuth/individualUserAuth.model1"));
function generateAccessAndRefreshToken(userObject, sessionId, role) {
    const accessToken = signAndVerifyToken_util_1.signJwt({ userData: userObject, session: sessionId, role }, { expiresIn: `${process.env.ACCESS_TOKEN_TTL}` });
    const refreshToken = signAndVerifyToken_util_1.signJwt({ userData: userObject, session: sessionId, role }, { expiresIn: `${process.env.REFRESH_TOKEN_TTL}` });
    return { accessToken, refreshToken };
}
exports.generateAccessAndRefreshToken = generateAccessAndRefreshToken;
function reIssueAccessToken({ refreshToken, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { decoded } = signAndVerifyToken_util_1.verifyJwt(refreshToken);
        if (!decoded || !lodash_1.get(decoded, "session"))
            return false;
        const session = yield session_model_1.Session.findById(lodash_1.get(decoded, "session"));
        if (!session || !session.valid)
            return false;
        let user;
        if (session.role === "org" || session.role === "g-org") {
            user = (yield organizationAuth_model_1.default.findById({
                _id: session.user,
            }));
        }
        else if (session.role === "ind" || session.role === "g-ind") {
            user = (yield individualUserAuth_model1_1.default.findById({
                _id: session.user,
            }));
        }
        else {
            user = undefined;
        }
        if (!user)
            return false;
        const accessToken = signAndVerifyToken_util_1.signJwt({ userData: user, session: session._id, role: session.role }, { expiresIn: process.env.ACCESS_TOKEN_TTL });
        return accessToken;
    });
}
exports.reIssueAccessToken = reIssueAccessToken;
