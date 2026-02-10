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
exports.superAdminOnly = exports.mediatorOnly = exports.organizationOnly = exports.individualOnly = exports.adminOnly = exports.restrictTo = exports.verifyAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Middleware to verify user is authenticated and has valid tokens
 */
const verifyAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Get token from cookies or headers
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token) ||
            ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
        if (!token) {
            const error = {
                statusCode: 401,
                status: "fail",
                message: "Authentication required. Please log in to continue.",
            };
            return next(error);
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Attach user info to request
        req.user = decoded;
        next();
    }
    catch (error) {
        const errResponse = {
            statusCode: 401,
            status: "fail",
            message: error instanceof jsonwebtoken_1.default.TokenExpiredError
                ? "Token expired. Please log in again."
                : "Invalid authentication token.",
        };
        next(errResponse);
    }
});
exports.verifyAuth = verifyAuth;
/**
 * Middleware factory to restrict access to specific roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 *
 */
const restrictTo = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const error = {
                statusCode: 401,
                status: "fail",
                message: "Authentication required.",
            };
            return next(error);
        }
        if (!allowedRoles.includes(req.user.role)) {
            const error = {
                statusCode: 403,
                status: "fail",
                message: `Access denied. This action is restricted to: ${allowedRoles.join(", ")} users only.`,
            };
            return next(error);
        }
        next();
    };
};
exports.restrictTo = restrictTo;
/**
 * Middleware to verify only admin users can access
 */
const adminOnly = (req, res, next) => {
    if (!req.user) {
        const error = {
            statusCode: 401,
            status: "fail",
            message: "Authentication required.",
        };
        return next(error);
    }
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
        const error = {
            statusCode: 403,
            status: "fail",
            message: "Access denied. Admin privileges required.",
        };
        return next(error);
    }
    next();
};
exports.adminOnly = adminOnly;
/**
 * Middleware to verify only individual users can access
 */
const individualOnly = (req, res, next) => {
    if (!req.user) {
        const error = {
            statusCode: 401,
            status: "fail",
            message: "Authentication required.",
        };
        return next(error);
    }
    if (req.user.role !== "ind" && req.user.role !== "g-ind") {
        const error = {
            statusCode: 403,
            status: "fail",
            message: "Access denied. Individual user account required.",
        };
        return next(error);
    }
    next();
};
exports.individualOnly = individualOnly;
/**
 * Middleware to verify only organization users can access
 */
const organizationOnly = (req, res, next) => {
    if (!req.user) {
        const error = {
            statusCode: 401,
            status: "fail",
            message: "Authentication required.",
        };
        return next(error);
    }
    if (req.user.role !== "org" && req.user.role !== "g-org") {
        const error = {
            statusCode: 403,
            status: "fail",
            message: "Access denied. Organization account required.",
        };
        return next(error);
    }
    next();
};
exports.organizationOnly = organizationOnly;
/**
 * Middleware to verify only mediator users can access
 */
const mediatorOnly = (req, res, next) => {
    if (!req.user) {
        const error = {
            statusCode: 401,
            status: "fail",
            message: "Authentication required.",
        };
        return next(error);
    }
    if (req.user.role !== "mediator") {
        const error = {
            statusCode: 403,
            status: "fail",
            message: "Access denied. Mediator account required.",
        };
        return next(error);
    }
    next();
};
exports.mediatorOnly = mediatorOnly;
/**
 * Middleware to verify super admin only
 */
const superAdminOnly = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            const error = {
                statusCode: 401,
                status: "fail",
                message: "Authentication required.",
            };
            return next(error);
        }
        if (req.user.role !== "super-admin") {
            const error = {
                statusCode: 403,
                status: "fail",
                message: "Access denied. Super admin privileges required.",
            };
            return next(error);
        }
        next();
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error verifying super admin status",
        };
        next(errResponse);
    }
});
exports.superAdminOnly = superAdminOnly;
