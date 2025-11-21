/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from "express";
import cors from "cors";
import swaggerJSDOC from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/dbconn.config";
import allowedOrigins from "./config/allowedOrigins.config";

// Routes
import organizationUserAuthRouter from "./modules/authentication/organizationUserAuth/organizationAuth.route";
import individualUserAuthRouter from "./modules/authentication/individualUserAuth/individualAuth.route";
import AdminUserRouter from "./modules/authentication/adminUserAuth/adminAuth.route";
import individualUsersRoutes from "./modules/users/individualUsers/individualUsers.route";
import organizationUsersRoutes from "./modules/users/organization/getOrganizationUser.route";
import escrowProductTransactionRouter from "./modules/transactions/productsTransaction/productsTransaction.route";
import escrowProductDisputeRouter from "./modules/disputes/productsDispute/productDispute.route";
import adminRouter from "./modules/administrator/admin.route";
import mediatorRouter from "./modules/mediator/mediator.route";

// Middleware
import deserializeUser from "./middlewares/deserializeUser.middleware";
import { errorHandlingMiddleware } from "./middlewares/errorHandling.middleware";

// Swagger config
import { options as prodOptions } from "./prodSwagger";
import { options as devOptions } from "./devSwagger";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware (ONLY ONCE!)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔍 DEBUG: Check if body is parsed
app.use((req, res, next) => {
  console.log(`\n🌐 [${req.method}] ${req.path}`);
  console.log("📦 Body immediately after parsing:", req.body);
  console.log("📋 Content-Type:", req.headers["content-type"]);
  next();
});

// Logging middleware
app.use(morgan("dev"));

// Custom authentication middleware
app.use(deserializeUser);

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "Welcome to MyDoshBox API",
  });
});

// Authentication routes
app.use("/auth/individual", individualUserAuthRouter);
app.use("/auth/organization", organizationUserAuthRouter);
app.use("/auth/admin", AdminUserRouter);

// User routes
app.use("/user", organizationUsersRoutes);
app.use("/users", individualUsersRoutes);

// Transaction routes
app.use("/transactions", escrowProductTransactionRouter);

// Dispute routes
app.use("/disputes", escrowProductDisputeRouter);

// Admin routes
app.use("/admin", adminRouter);
// mediator Route
app.use("/mediators", mediatorRouter);

// ============================================
// SWAGGER/API DOCUMENTATION
// ============================================

const devSpec = swaggerJSDOC(devOptions);
const prodSpec = swaggerJSDOC(prodOptions);

app.use("/dev-api-docs", swaggerUi.serve, swaggerUi.setup(devSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(prodSpec));

// ============================================
// ERROR HANDLING (Must be LAST!)
// ============================================

app.use(errorHandlingMiddleware);

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error: any) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export app for testing or serverless deployment (Vercel)
export default app;
