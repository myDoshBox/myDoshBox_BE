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
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbconn_config_1 = __importDefault(require("./config/dbconn.config"));
const allowedOrigins_config_1 = __importDefault(require("./config/allowedOrigins.config"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
// Routes
const organizationAuth_route_1 = __importDefault(require("./modules/authentication/organizationUserAuth/organizationAuth.route"));
const individualAuth_route_1 = __importDefault(require("./modules/authentication/individualUserAuth/individualAuth.route"));
const adminAuth_route_1 = __importDefault(require("./modules/authentication/adminUserAuth/adminAuth.route"));
const productsTransaction_route_1 = __importDefault(require("./modules/transactions/productsTransaction/productsTransaction.route"));
const productDispute_route_1 = __importDefault(require("./modules/disputes/productsDispute/productDispute.route"));
const admin_route_1 = __importDefault(require("./modules/administrator/admin.route"));
const mediator_route_1 = __importDefault(require("./modules/mediator/mediator.route"));
const userProfile_route_1 = __importDefault(require("./modules/profiles/userProfile.route"));
// In your main app.ts or server.ts
const adminStats_route_1 = __importDefault(require("./modules/administrator/AdmistatServices/adminStats.route"));
const Admintransactions_routes_1 = __importDefault(require("./modules/administrator/AdminTransactions/Admintransactions.routes"));
// Middleware
const deserializeUser_middleware_1 = __importDefault(require("./middlewares/deserializeUser.middleware"));
const errorHandling_middleware_1 = require("./middlewares/errorHandling.middleware");
// Swagger config
const prodSwagger_1 = require("./prodSwagger");
const devSwagger_1 = require("./devSwagger");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins_config_1.default.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log("⚠️ CORS blocked origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Refresh-Token"],
}));
// file upload middleware
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    createParentPath: true,
    parseNested: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`🌐 [${req.method}] ${req.path}`);
    console.log("📦 Body immediately after parsing:", req.body);
    console.log("📋 Content-Type:", req.get("Content-Type"));
    next();
});
app.use((0, morgan_1.default)("dev"));
app.use(deserializeUser_middleware_1.default);
// ============================================
// ROUTES
// ============================================
// Health check
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Welcome to MyDoshBox API",
        timestamp: new Date().toISOString(),
    });
});
// Test cookie endpoint - BEFORE other routes for easy access
// app.get("/test-cookie", (req: Request, res: Response) => {
//   console.log("🍪 Test cookie endpoint hit");
//   // Set a test cookie
//   res.cookie("test_cookie", "hello_from_backend", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//     maxAge: 60000, // 1 minute
//     path: "/",
//   });
//   res.json({
//     status: "success",
//     message: "Test cookie set successfully",
//     cookieConfig: {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       maxAge: 60000,
//     },
//     receivedCookies: req.cookies,
//     headers: {
//       origin: req.get("Origin"),
//       referer: req.get("Referer"),
//       userAgent: req.get("User-Agent"),
//     },
//   });
// });
// Authentication routes
app.use("/auth/individual", individualAuth_route_1.default);
app.use("/auth/organization", organizationAuth_route_1.default);
app.use("/auth/admin", adminAuth_route_1.default);
app.use("/admin/stats", adminStats_route_1.default);
app.use("/admin/transactions", Admintransactions_routes_1.default);
// User routes
app.use("/profile", userProfile_route_1.default);
// app.use("/user", organizationUsersRoutes);
// app.use("/users", individualUsersRoutes);
// Transaction routes
app.use("/transactions", productsTransaction_route_1.default);
// Dispute routes
app.use("/disputes", productDispute_route_1.default);
// Admin routes
app.use("/admin", admin_route_1.default);
// Mediator routes
app.use("/mediators", mediator_route_1.default);
// ============================================
// SWAGGER/API DOCUMENTATION
// ============================================
const devSpec = (0, swagger_jsdoc_1.default)(devSwagger_1.options);
const prodSpec = (0, swagger_jsdoc_1.default)(prodSwagger_1.options);
app.use("/dev-api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(devSpec));
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(prodSpec));
// ============================================
// ERROR HANDLING (Must be LAST!)
// ============================================
app.use(errorHandling_middleware_1.errorHandlingMiddleware);
// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, dbconn_config_1.default)();
        console.log("✅ Connected to MongoDB");
        console.log("🔧 Environment:", process.env.NODE_ENV || "development");
        console.log("🌐 Frontend URL:", process.env.FRONTEND_URL);
        console.log("🍪 Cookie Domain:", process.env.COOKIE_DOMAIN || "not set");
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
});
startServer();
exports.default = app;
