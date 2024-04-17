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
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const individualUserAuth_model_1 = __importDefault(require("../individualUserAuth/individualUserAuth.model"));
const generateToken_1 = require("../../../utils/generateToken");
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided." });
    }
    const token = authHeader.split(" ")[1]; // Extract token from Authorization header
    try {
        const userId = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield individualUserAuth_model_1.default.findOne({ _id: userId });
        req.user = user; // Attach decoded user information to the request object
        const { exp } = jsonwebtoken_1.default.decode(token); // Get expiry time of the access token
        const now = Date.now() / 1000; // Current time in seconds
        // Check if the access token is about to expire (within 1 minute)
        if (exp - now < 60) {
            // Issue a new access token
            const accessToken = (0, generateToken_1.generateAccessToken)(userId);
            res.setHeader("Authorization", `Bearer ${accessToken}`);
        }
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid token." });
        }
        return res.status(401).json({ message: "Failed to authenticate token." });
    }
});
exports.authenticate = authenticate;
