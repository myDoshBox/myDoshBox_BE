"use strict";
// import { Types } from "mongoose";
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
exports.createSessionAndSendTokens = void 0;
const createSession_util_1 = require("./createSession.util");
const generateAccessAndRefreshToken_util_1 = require("./generateAccessAndRefreshToken.util");
const createSessionAndSendTokens = (options) => __awaiter(void 0, void 0, void 0, function* () {
    // const { user, userAgent, role, message } = options;
    const { user, userAgent, role, message } = options;
    const session = yield createSession_util_1.createSession(user._id.toString(), userAgent, role);
    const { accessToken, refreshToken } = generateAccessAndRefreshToken_util_1.generateAccessAndRefreshToken(user, session._id, role);
    return {
        status: "success",
        message,
        user,
        accessToken,
        refreshToken,
    };
});
exports.createSessionAndSendTokens = createSessionAndSendTokens;
