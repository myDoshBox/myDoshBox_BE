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
const dbconn_config_1 = __importDefault(require("./config/dbconn.config"));
const allowedOrigins_config_1 = __importDefault(require("./config/allowedOrigins.config"));
// Routes
const organizationAuth_route_1 = __importDefault(require("./modules/authentication/organizationUserAuth/organizationAuth.route"));
const individualAuth_route_1 = __importDefault(require("./modules/authentication/individualUserAuth/individualAuth.route"));
const adminAuth_route_1 = __importDefault(require("./modules/authentication/adminUserAuth/adminAuth.route"));
const individualUsers_route_1 = __importDefault(require("./modules/users/individualUsers/individualUsers.route"));
const getOrganizationUser_route_1 = __importDefault(require("./modules/users/organization/getOrganizationUser.route"));
const productsTransaction_route_1 = __importDefault(require("./modules/transactions/productsTransaction/productsTransaction.route"));
const productDispute_route_1 = __importDefault(require("./modules/disputes/productsDispute/productDispute.route"));
const admin_route_1 = __importDefault(require("./modules/administrator/admin.route"));
const mediator_route_1 = __importDefault(require("./modules/mediator/mediator.route"));
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
// CORS configuration
app.use((0, cors_1.default)({
    origin: allowedOrigins_config_1.default,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Body parsing middleware (ONLY ONCE!)
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 🔍 DEBUG: Check if body is parsed
app.use((req, res, next) => {
    console.log(`\n🌐 [${req.method}] ${req.path}`);
    console.log("📦 Body immediately after parsing:", req.body);
    console.log("📋 Content-Type:", req.headers["content-type"]);
    next();
});
// Logging middleware
app.use((0, morgan_1.default)("dev"));
// Custom authentication middleware
app.use(deserializeUser_middleware_1.default);
// ============================================
// ROUTES
// ============================================
// Health check
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Welcome to MyDoshBox API",
    });
});
// Authentication routes
app.use("/auth/organization", organizationAuth_route_1.default);
app.use("/auth/individual", individualAuth_route_1.default);
app.use("/auth/admin", adminAuth_route_1.default);
// User routes
app.use("/user", getOrganizationUser_route_1.default);
app.use("/users", individualUsers_route_1.default);
// Transaction routes
app.use("/transactions", productsTransaction_route_1.default);
// Dispute routes
app.use("/disputes", productDispute_route_1.default);
// Admin routes
app.use("/admin", admin_route_1.default);
// mediator Route
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
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
});
// Start the server
startServer();
// Export app for testing or serverless deployment (Vercel)
exports.default = app;
