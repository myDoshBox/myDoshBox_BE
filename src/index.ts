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
import fileUpload from "express-fileupload";

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
import userProfileRouter from "./modules/profiles/userProfile.route";

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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("⚠️ CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Refresh-Token"],
  })
);

// file upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    createParentPath: true,
    parseNested: true,
  })
);

app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`🌐 [${req.method}] ${req.path}`);
  console.log("📦 Body immediately after parsing:", req.body);
  console.log("📋 Content-Type:", req.get("Content-Type"));
  next();
});

app.use(morgan("dev"));

app.use(deserializeUser);

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/", (req: Request, res: Response) => {
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

app.use("/auth/individual", individualUserAuthRouter);
app.use("/auth/organization", organizationUserAuthRouter);
app.use("/auth/admin", AdminUserRouter);

// User routes
app.use("/profile", userProfileRouter);
// app.use("/user", organizationUsersRoutes);
// app.use("/users", individualUsersRoutes);

// Transaction routes
app.use("/transactions", escrowProductTransactionRouter);

// Dispute routes
app.use("/disputes", escrowProductDisputeRouter);

// Admin routes
app.use("/admin", adminRouter);

// Mediator routes
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
    console.log("🔧 Environment:", process.env.NODE_ENV || "development");
    console.log("🌐 Frontend URL:", process.env.FRONTEND_URL);
    console.log("🍪 Cookie Domain:", process.env.COOKIE_DOMAIN || "not set");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error: any) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
