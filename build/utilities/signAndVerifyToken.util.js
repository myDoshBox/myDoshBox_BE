"use strict";
// import jwt from "jsonwebtoken";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
// export function signJwt(object: object, options?: jwt.SignOptions | undefined) {
//   return jwt.sign(object, process.env.JWT_SECRET as string, {
//     ...(options && options),
//   });
// }
// export function verifyJwt(token: string) {
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
//     return {
//       valid: true,
//       expired: false,
//       decoded,
//     };
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (e: any) {
//     return {
//       valid: false,
//       expired: e.message === "jwt expired",
//       decoded: null,
//     };
//   }
// }
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Properly type the signJwt function
function signJwt(payload, options) {
    const privateKey = process.env.JWT_SECRET;
    if (!privateKey) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign(payload, privateKey, Object.assign({}, (options && options)));
}
// Properly type the verifyJwt function
function verifyJwt(token) {
    const publicKey = process.env.JWT_SECRET;
    if (!publicKey) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, publicKey);
        return {
            valid: true,
            expired: false,
            decoded,
        };
    }
    catch (error) {
        return {
            valid: false,
            expired: error.message === "jwt expired",
            decoded: null,
        };
    }
}
