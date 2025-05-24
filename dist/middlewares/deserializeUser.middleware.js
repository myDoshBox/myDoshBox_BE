"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const signAndVerifyToken_util_1 = require("./../utilities/signAndVerifyToken.util");
const generateAccessAndRefreshToken_util_1 = require("../utilities/generateAccessAndRefreshToken.util");
const deserializeUser = async (req, res, next) => {
    var _a;
    const accessToken = (0, lodash_1.get)(req, "cookies.accessToken") ||
        ((_a = (0, lodash_1.get)(req, "headers.authorization", "")) === null || _a === void 0 ? void 0 : _a.replace(/^Bearer\s/, ""));
    const refreshToken = (0, lodash_1.get)(req, "cookies.refreshToken") || (0, lodash_1.get)(req, "headers.x-refresh");
    if (!accessToken) {
        return next();
    }
    const { decoded, expired } = (0, signAndVerifyToken_util_1.verifyJwt)(accessToken);
    if (decoded) {
        res.locals.user = decoded;
        return next();
    }
    if (expired && refreshToken) {
        const newAccessToken = await (0, generateAccessAndRefreshToken_util_1.reIssueAccessToken)({ refreshToken });
        if (newAccessToken) {
            res.setHeader("x-access-token", newAccessToken);
        }
        const result = (0, signAndVerifyToken_util_1.verifyJwt)(newAccessToken);
        res.locals.user = result.decoded;
        return next();
    }
    return next();
};
exports.default = deserializeUser;
