"use strict";
// import { Types } from "mongoose";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSessionAndSendTokens = void 0;
const createSession_util_1 = require("./createSession.util");
const generateAccessAndRefreshToken_util_1 = require("./generateAccessAndRefreshToken.util");
const createSessionAndSendTokens = async (options) => {
    // const { user, userAgent, role, message } = options;
    const { user, userAgent, role, message } = options;
    const session = await (0, createSession_util_1.createSession)(user._id.toString(), userAgent, role);
    const { accessToken, refreshToken } = (0, generateAccessAndRefreshToken_util_1.generateAccessAndRefreshToken)(user, session._id, role);
    return {
        status: "success",
        message,
        user,
        accessToken,
        refreshToken,
    };
};
exports.createSessionAndSendTokens = createSessionAndSendTokens;
