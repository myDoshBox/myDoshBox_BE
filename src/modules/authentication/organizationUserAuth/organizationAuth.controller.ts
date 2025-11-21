import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import OrganizationModel from "./organizationAuth.model";
import {
  sendOrganizationVerificationEmail,
  sendOrganizationWelcomeEmail,
  sendOrganizationPasswordResetEmail,
  sendOrganizationPasswordResetSuccessEmail,
} from "../../../utilities/organizationEmail.utils";
import IndividualUser from "../individualUserAuth/individualUserAuth.model1";
import bcrypt from "bcrypt";
import { createSessionAndSendTokens } from "../../../utilities/createSessionAndSendToken.util";
import { ErrorResponse } from "../../../utilities/errorHandler.util";
import crypto from "crypto";

export const organizationUserRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      organization_name,
      organization_email,
      contact_email,
      contact_number,
      password,
      confirm_password,
    } = req.body;

    if (
      !organization_name ||
      !organization_email ||
      !contact_email ||
      !contact_number ||
      !password ||
      !confirm_password
    ) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message:
          "All fields (organization_name, organization_email, contact_email, contact_number, password, confirm_password) are required",
      };
      return next(error);
    }

    if (password !== confirm_password) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Passwords do not match",
      };
      return next(error);
    }

    // Check if organization email already exists in both models
    const organizationEmailAlreadyExist = await OrganizationModel.findOne({
      organization_email,
    });
    const individualEmailAlreadyExist = await IndividualUser.findOne({
      email: organization_email,
    });

    if (organizationEmailAlreadyExist) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Organization email exists, please proceed to login",
      };
      return next(error);
    }

    const newOrganization = new OrganizationModel({
      organization_name,
      organization_email,
      contact_email,
      contact_number,
      password,
      role: "org",
    });

    await newOrganization.save();

    const verificationToken = jwt.sign(
      { organization_email: newOrganization.organization_email },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" }
    );

    await sendOrganizationVerificationEmail(
      organization_email,
      verificationToken,
      organization_name
    );

    res.status(201).json({
      status: "success",
      message:
        "Organization account created successfully! Verification email sent. Please verify your account to continue. Note that token expires in 2 hours",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error registering the organization",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const organizationUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organization_email, password } = req.body;

    if (!organization_email || !password) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Organization email and password are required",
      };
      return next(error);
    }

    const organization = await OrganizationModel.findOne({
      organization_email,
    }).select("+password");

    if (!organization) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "Organization not found",
      };
      return next(error);
    }

    if (!organization.email_verified) {
      const error: ErrorResponse = {
        statusCode: 403,
        status: "fail",
        message: "Please verify your organization email before logging in",
      };
      return next(error);
    }

    // Get user agent from request
    const userAgent = req.get("User-Agent") || "unknown";

    // Use the session utility to create session and send tokens
    const result = await createSessionAndSendTokens({
      user: {
        _id: organization._id,
        email: organization.organization_email,
        phone_number: organization.contact_number,
        role: organization.role,
      },
      userAgent: userAgent,
      role: "org",
      message: "Organization login successful",
    });

    // Set cookies for access and refresh tokens
    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      message: result.message,
      organization: {
        id: organization._id,
        organization_name: organization.organization_name,
        organization_email: organization.organization_email,
        contact_email: organization.contact_email,
        contact_number: organization.contact_number,
        role: organization.role,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error logging in organization",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const individualUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Email and password are required",
      };
      return next(error);
    }

    // Find user and include password field
    const user = await IndividualUser.findOne({ email }).select("+password");

    if (!user) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "Invalid email or password",
      };
      return next(error);
    }

    // Check if email is verified
    if (!user.email_verified) {
      const error: ErrorResponse = {
        statusCode: 403,
        status: "fail",
        message: "Please verify your email before logging in",
      };
      return next(error);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error: ErrorResponse = {
        statusCode: 401,
        status: "fail",
        message: "Invalid email or password",
      };
      return next(error);
    }

    // Get user agent from request headers
    const userAgent = req.get("User-Agent") || "unknown";

    // Create session and generate tokens
    const result = await createSessionAndSendTokens({
      user: {
        _id: user._id as mongoose.Types.ObjectId,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
      },
      userAgent,
      role: "ind",
      message: "Login successful",
    });

    // Set HTTP-only cookies
    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Send response
    res.status(200).json({
      status: "success",
      message: result.message,
      user: {
        id: user._id,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error logging in",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const verifyOrganizationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid or missing token",
      };
      return next(error);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      organization_email: string;
    };

    const organization = await OrganizationModel.findOne({
      organization_email: decoded.organization_email,
    });

    if (!organization) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "Organization not found",
      };
      return next(error);
    }

    if (organization.email_verified) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Organization email already verified",
      };
      return next(error);
    }

    organization.email_verified = true;
    await organization.save();

    await sendOrganizationWelcomeEmail(
      organization.organization_email,
      organization.organization_name
    );

    res.status(200).json({
      status: "success",
      message:
        "Organization email verified successfully! You can now login to your account",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: error instanceof jwt.JsonWebTokenError ? 400 : 500,
      status: "fail",
      message:
        error instanceof jwt.JsonWebTokenError
          ? "Invalid or expired token"
          : "Error verifying organization email",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const resendOrganizationVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organization_email } = req.body;

    if (!organization_email) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Organization email is required",
      };
      return next(error);
    }

    const organization = await OrganizationModel.findOne({
      organization_email,
    });

    if (!organization) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "Organization not found",
      };
      return next(error);
    }

    if (organization.email_verified) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Organization email is already verified",
      };
      return next(error);
    }

    const verificationToken = jwt.sign(
      { organization_email: organization.organization_email },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" }
    );

    await sendOrganizationVerificationEmail(
      organization_email,
      verificationToken,
      organization.organization_name
    );

    res.status(200).json({
      status: "success",
      message:
        "Organization verification email resent successfully. Please check your inbox",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error resending organization verification email",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const forgotOrganizationPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organization_email } = req.body;

    if (!organization_email) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Organization email is required",
      };
      return next(error);
    }

    const organization = await OrganizationModel.findOne({
      organization_email,
    });

    if (!organization) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "Organization with this email does not exist",
      };
      return next(error);
    }

    const resetToken = organization.createPasswordResetToken();
    await organization.save({ validateBeforeSave: false });

    await sendOrganizationPasswordResetEmail(
      organization_email,
      resetToken,
      organization.organization_name
    );

    res.status(200).json({
      status: "success",
      message:
        "Password reset link sent to your organization email. Link expires in 10 minutes",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error processing forgot password request",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const resetOrganizationPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;
    const { password, confirm_password } = req.body;

    if (!token || typeof token !== "string") {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid or missing token",
      };
      return next(error);
    }

    if (!password || !confirm_password) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Password and confirm password are required",
      };
      return next(error);
    }

    if (password !== confirm_password) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Passwords do not match",
      };
      return next(error);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const organization = await OrganizationModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!organization) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid or expired reset token",
      };
      return next(error);
    }

    organization.password = password;
    organization.passwordResetToken = undefined;
    organization.passwordResetExpires = undefined;
    organization.passwordChangedAt = new Date();

    await organization.save();

    await sendOrganizationPasswordResetSuccessEmail(
      organization.organization_email,
      organization.organization_name
    );

    res.status(200).json({
      status: "success",
      message:
        "Organization password reset successfully! You can now login with your new password",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error resetting organization password",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};
