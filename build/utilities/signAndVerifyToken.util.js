"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function signJwt(object, options) {
    return jsonwebtoken_1.default.sign(object, process.env.JWT_SECRET, Object.assign({}, (options && options)));
}
function verifyJwt(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return {
            valid: true,
            expired: false,
            decoded,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        return {
            valid: false,
            expired: e.message === "jwt expired",
            decoded: null,
        };
    }
}
