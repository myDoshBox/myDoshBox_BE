import { Request, Response, NextFunction } from "express";
import { createError } from "../utilities/errorHandler.util";
import jwt from "jsonwebtoken";
import IndividualUser from "../modules/authentication/individualUserAuth/individualUserAuth.model1";
import OrganizationUser from "../modules/authentication/organizationUserAuth/organizationAuth.model";
import { errorHandler } from "./errorHandling.middleware";

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        sessionId?: string;
      };
    }
  }
}

/**
 * Middleware to verify user is authenticated and has valid tokens
 */

interface ErrorResponse {
  statusCode: number;
  status: string;
  message: string;
}

/**
 * FIXED: verifyAuth middleware that handles missing email in token
 * Now fetches email from database when not present in token
 */
export const verifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("=== VERIFY AUTH DEBUG ===");
    console.log(
      "Cookies:",
      req.cookies ? Object.keys(req.cookies) : "No cookies",
    );
    console.log(
      "Authorization header:",
      req.headers.authorization ? "Present" : "Missing",
    );

    // Try multiple possible token locations
    const tokenFromCookie = req.cookies?.access_token || req.cookies?.token;
    const tokenFromHeader = req.headers.authorization?.replace("Bearer ", "");

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      console.log("❌ No token found anywhere");
      const error: ErrorResponse = {
        statusCode: 401,
        status: "fail",
        message: "Authentication required. Please log in to continue.",
      };
      return next(error);
    }

    console.log("✅ Token found, attempting verification");

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

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

    let userId: string | undefined;
    let userEmail: string | undefined;
    let userRole: string | undefined;
    let sessionId: string | undefined;

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
        const individualUser =
          await IndividualUser.findById(userId).select("email");

        if (individualUser?.email) {
          userEmail = individualUser.email;
          console.log("✅ Email found in IndividualUser DB:", userEmail);
        } else {
          // Try OrganizationUser
          const orgUser = await OrganizationUser.findById(userId).select(
            "organization_email contact_email email",
          );

          if (orgUser) {
            userEmail =
              (orgUser as any).organization_email ||
              (orgUser as any).contact_email ||
              (orgUser as any).email;
            console.log("✅ Email found in OrganizationUser DB:", userEmail);
          }
        }
      } catch (dbError) {
        console.error("❌ Error fetching email from database:", dbError);
      }
    }

    // Set user data on request
    req.user = {
      id: userId!,
      email: userEmail || "unknown",
      role: userRole!,
      sessionId: sessionId,
    };

    // Validate that we have required user data
    if (!req.user.id) {
      console.log("❌ Token missing required user ID");
      const error: ErrorResponse = {
        statusCode: 401,
        status: "fail",
        message: "Invalid token structure - missing user ID",
      };
      return next(error);
    }

    // ✅ IMPORTANT: Warn if email is still missing (but don't block request)
    if (req.user.email === "unknown") {
      console.warn(
        "⚠️ WARNING: Could not retrieve user email from token or database",
      );
      console.warn("⚠️ User ID:", req.user.id);
      console.warn("⚠️ Some features may not work correctly");
    }

    console.log(
      "✅ User authenticated:",
      req.user.email,
      "Role:",
      req.user.role,
    );

    next();
  } catch (error) {
    console.log(
      "❌ Token verification failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    const errResponse: ErrorResponse = {
      statusCode: 401,
      status: "fail",
      message:
        error instanceof jwt.TokenExpiredError
          ? "Your session has expired. Please log in again."
          : error instanceof jwt.JsonWebTokenError
            ? "Invalid authentication token. Please log in again."
            : "Authentication failed. Please try again.",
    };
    next(errResponse);
  }
};

/**
 * Middleware factory to restrict access to specific roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const restrictTo = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const error: ErrorResponse = {
        statusCode: 401,
        status: "fail",
        message: "Authentication required. Please log in to continue.",
      };
      return next(error);
    }

    console.log(
      `Role check: User ${req.user.email} has role "${req.user.role}", required: ${allowedRoles.join(", ")}`,
    );

    if (!allowedRoles.includes(req.user.role)) {
      const error: ErrorResponse = {
        statusCode: 403,
        status: "fail",
        message: `Access denied. This action requires one of these roles: ${allowedRoles.join(
          ", ",
        )}. Your role: ${req.user.role}`,
      };
      return next(error);
    }

    next();
  };
};

/**
 * Middleware to verify only admin users can access
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    const error: ErrorResponse = {
      statusCode: 401,
      status: "fail",
      message: "Authentication required. Please log in to continue.",
    };
    return next(error);
  }

  console.log(
    `Admin check: User ${req.user.email} has role "${req.user.role}"`,
  );

  if (req.user.role !== "admin" && req.user.role !== "super-admin") {
    const error: ErrorResponse = {
      statusCode: 403,
      status: "fail",
      message: "Access denied. Admin privileges required.",
    };
    return next(error);
  }

  next();
};

/**
 * Middleware to verify only individual users can access
 */
export const individualOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    const error: ErrorResponse = {
      statusCode: 401,
      status: "fail",
      message: "Authentication required. Please log in to continue.",
    };
    return next(error);
  }

  if (req.user.role !== "ind" && req.user.role !== "g-ind") {
    const error: ErrorResponse = {
      statusCode: 403,
      status: "fail",
      message: "Access denied. Individual user account required.",
    };
    return next(error);
  }

  next();
};

/**
 * Middleware to verify only organization users can access
 */
export const organizationOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    const error: ErrorResponse = {
      statusCode: 401,
      status: "fail",
      message: "Authentication required. Please log in to continue.",
    };
    return next(error);
  }

  if (req.user.role !== "org" && req.user.role !== "g-org") {
    const error: ErrorResponse = {
      statusCode: 403,
      status: "fail",
      message: "Access denied. Organization account required.",
    };
    return next(error);
  }

  next();
};

/**
 * Middleware to verify only mediator users can access
 */
export const mediatorOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    const error: ErrorResponse = {
      statusCode: 401,
      status: "fail",
      message: "Authentication required. Please log in to continue.",
    };
    return next(error);
  }

  if (req.user.role !== "mediator") {
    const error: ErrorResponse = {
      statusCode: 403,
      status: "fail",
      message: "Access denied. Mediator account required.",
    };
    return next(error);
  }

  next();
};

/**
 * Middleware to verify super admin only
 */
export const superAdminOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      const error: ErrorResponse = {
        statusCode: 401,
        status: "fail",
        message: "Authentication required. Please log in to continue.",
      };
      return next(error);
    }

    if (req.user.role !== "super-admin") {
      const error: ErrorResponse = {
        statusCode: 403,
        status: "fail",
        message: "Access denied. Super admin privileges required.",
      };
      return next(error);
    }

    next();
  } catch (error) {
    console.error("Error in superAdminOnly middleware:", error);
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error verifying super admin status",
    };
    next(errResponse);
  }
};
