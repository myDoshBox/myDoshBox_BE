"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://mydoshbox.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
].filter(Boolean);
exports.default = allowedOrigins;
