/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from "express";
import cors from "cors";
import swaggerJSDOC from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import morgan from "morgan";
import dotenv from "dotenv";

import connectDB from "./config/dbconn.config";
import allowedOrigins from "./config/allowedOrigins.config";

// Routes
import organizationUserAuthRouter from "./modules/authentication/organizationUserAuth/organizationAuth.route";
import individualUserAuthRouter from "./modules/authentication/individualUserAuth/individualAuth.route";
import authRouter from "./modules/authentication/userAuth.route";
import individualUsersRoutes from "./modules/users/individualUsers/individualUsers.route";
import organizationUsersRoutes from "./modules/users/organization/getOrganizationUser.route";
import escrowProductTransactionRouter from "./modules/transactions/productsTransaction/productsTransaction.route";
import escrowProductDisputeRouter from "./modules/disputes/productsDispute/productDispute.route";
import adminRouter from "./modules/administrator/admin.route";

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

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware (ONLY ONCE!)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    message: "Welcome to DoshBox API",
    version: "1.0.0",
  });
});

// Authentication routes
app.use("/auth/organization", organizationUserAuthRouter);
app.use("/auth/individual", individualUserAuthRouter);
app.use("/auth", authRouter);

// User routes
app.use("/user", organizationUsersRoutes);
app.use("/users", individualUsersRoutes);

// Transaction routes
app.use("/transactions", escrowProductTransactionRouter);

// Dispute routes
app.use("/disputes", escrowProductDisputeRouter);

// Admin routes
app.use("/admin", adminRouter);

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
