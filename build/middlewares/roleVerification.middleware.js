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
const individualUserAuth_model1_1 = __importDefault(require("../modules/authentication/individualUserAuth/individualUserAuth.model1"));
const organizationAuth_model_1 = __importDefault(require("../modules/authentication/organizationUserAuth/organizationAuth.model"));
/**
 * FIXED: verifyAuth middleware that handles missing email in token
 * Now fetches email from database when not present in token
 */
const verifyAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        console.log("=== VERIFY AUTH DEBUG ===");
        console.log("Cookies:", req.cookies ? Object.keys(req.cookies) : "No cookies");
        console.log("Authorization header:", req.headers.authorization ? "Present" : "Missing");
        // Try multiple possible token locations
        const tokenFromCookie = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token) || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.token);
        const tokenFromHeader = (_c = req.headers.authorization) === null || _c === void 0 ? void 0 : _c.replace("Bearer ", "");
        const token = tokenFromCookie || tokenFromHeader;
        if (!token) {
            console.log("❌ No token found anywhere");
            const error = {
                statusCode: 401,
                status: "fail",
                message: "Authentication required. Please log in to continue.",
            };
            return next(error);
        }
        console.log("✅ Token found, attempting verification");
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token structure:", {
            keys: Object.keys(decoded),
            hasUserData: !!decoded.userData,
            rootLevel: {
                id: decoded.id,
                _id: decoded._id,
                email: decoded.email,
                role: decoded.role,
                session: decoded.session,
            },
            userDataLevel: decoded.userData
                ? {
                    id: decoded.userData.id,
                    _id: decoded.userData._id,
                    email: decoded.userData.email,
                    role: decoded.userData.role,
                }
                : null,
        });
        let userId;
        let userEmail;
        let userRole;
        let sessionId;
        // Handle token structure with userData (your current structure)
        if (decoded.userData) {
            userId = decoded.userData._id || decoded.userData.id;
            userEmail = decoded.userData.email;
            userRole = decoded.userData.role || decoded.role || "user";
            sessionId = decoded.session;
        }
        // Handle flat token structure (alternative format)
        else {
            userId = decoded.id || decoded._id;
            userEmail = decoded.email;
            userRole = decoded.role || "user";
            sessionId = decoded.sessionId || decoded.session;
        }
        // ✅ FIX: If email is missing from token, fetch from database
        if (!userEmail && userId) {
            console.log("⚠️ Email missing from token, fetching from database...");
            try {
                // Try IndividualUser first
                const individualUser = yield individualUserAuth_model1_1.default.findById(userId).select("email");
                if (individualUser === null || individualUser === void 0 ? void 0 : individualUser.email) {
                    userEmail = individualUser.email;
                    console.log("✅ Email found in IndividualUser DB:", userEmail);
                }
                else {
                    // Try OrganizationUser
                    const orgUser = yield organizationAuth_model_1.default.findById(userId).select("organization_email contact_email email");
                    if (orgUser) {
                        userEmail =
                            orgUser.organization_email ||
                                orgUser.contact_email ||
                                orgUser.email;
                        console.log("✅ Email found in OrganizationUser DB:", userEmail);
                    }
                }
            }
            catch (dbError) {
                console.error("❌ Error fetching email from database:", dbError);
            }
        }
        // Set user data on request
        req.user = {
            id: userId,
            email: userEmail || "unknown",
            role: userRole,
            sessionId: sessionId,
        };
        // Validate that we have required user data
        if (!req.user.id) {
            console.log("❌ Token missing required user ID");
            const error = {
                statusCode: 401,
                status: "fail",
                message: "Invalid token structure - missing user ID",
            };
            return next(error);
        }
        // ✅ IMPORTANT: Warn if email is still missing (but don't block request)
        if (req.user.email === "unknown") {
            console.warn("⚠️ WARNING: Could not retrieve user email from token or database");
            console.warn("⚠️ User ID:", req.user.id);
            console.warn("⚠️ Some features may not work correctly");
        }
        console.log("✅ User authenticated:", req.user.email, "Role:", req.user.role);
        next();
    }
    catch (error) {
        console.log("❌ Token verification failed:", error instanceof Error ? error.message : "Unknown error");
        const errResponse = {
            statusCode: 401,
            status: "fail",
            message: error instanceof jsonwebtoken_1.default.TokenExpiredError
                ? "Your session has expired. Please log in again."
                : error instanceof jsonwebtoken_1.default.JsonWebTokenError
                    ? "Invalid authentication token. Please log in again."
                    : "Authentication failed. Please try again.",
        };
        next(errResponse);
    }
});
exports.verifyAuth = verifyAuth;
/**
 * Middleware factory to restrict access to specific roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
const restrictTo = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const error = {
                statusCode: 401,
                status: "fail",
                message: "Authentication required. Please log in to continue.",
            };
            return next(error);
        }
        console.log(`Role check: User ${req.user.email} has role "${req.user.role}", required: ${allowedRoles.join(", ")}`);
        if (!allowedRoles.includes(req.user.role)) {
            const error = {
                statusCode: 403,
                status: "fail",
                message: `Access denied. This action requires one of these roles: ${allowedRoles.join(", ")}. Your role: ${req.user.role}`,
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
            message: "Authentication required. Please log in to continue.",
        };
        return next(error);
    }
    console.log(`Admin check: User ${req.user.email} has role "${req.user.role}"`);
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
            message: "Authentication required. Please log in to continue.",
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
            message: "Authentication required. Please log in to continue.",
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
            message: "Authentication required. Please log in to continue.",
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
const superAdminOnly = (req, res, next) => {
    try {
        if (!req.user) {
            const error = {
                statusCode: 401,
                status: "fail",
                message: "Authentication required. Please log in to continue.",
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
        console.error("Error in superAdminOnly middleware:", error);
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error verifying super admin status",
        };
        next(errResponse);
    }
};
exports.superAdminOnly = superAdminOnly;
