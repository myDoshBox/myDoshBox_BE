import jwt from "jsonwebtoken";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import IndividualUser from "./individualUserAuth.model1";
import individualAuthPasswordToken from "./individualAuthPasswordToken";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} from "../../../utilities/email.utils";
import OrganizationModel from "../organizationUserAuth/organizationAuth.model";
import bcrypt from "bcrypt";
import { signJwt } from "../../../utilities/signAndVerifyToken.util";
import { OAuth2Client } from "google-auth-library";
import { createSessionAndSendTokens } from "../../../utilities/createSessionAndSendToken.util";
import { ErrorResponse } from "../../../utilities/errorHandler.util";
import crypto from "crypto";
import { getCookieOptions } from "../../../utilities/cookieConfig.util";

export const individualUserRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, phone_number, password, confirm_password } = req.body;

    if (!email || !phone_number || !password || !confirm_password) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message:
          "All fields (email, phone_number, password, confirm_password) are required",
      };
      return next(error);
    }

    if (password !== confirm_password) {
      const error: ErrorResponse = {
        statusCode: 401,
        status: "fail",
        message: "Password do not match",
      };
      return next(error);
    }

    const individualEmailAlreadyExist = await IndividualUser.findOne({ email });
    const organizationEmailAlreadyExist = await OrganizationModel.findOne({
      email,
    });

    if (individualEmailAlreadyExist || organizationEmailAlreadyExist) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "User already exists, please proceed to login",
      };
      return next(error);
    }

    const newUser = new IndividualUser({
      email,
      phone_number,
      password,
      role: "ind",
    });

    await newUser.save();

    const verificationToken = jwt.sign(
      { email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" },
    );

    // Create verification URL and send email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Fix: Check your email utility function signature
    // Option 1: If it expects email and token separately
    await sendVerificationEmail(email, verificationToken);

    // Option 2: If it expects email and URL
    // await sendVerificationEmail(email, verificationUrl);

    // Option 3: If it expects an object
    // await sendVerificationEmail({ email, token: verificationToken });

    res.status(201).json({
      status: "success",
      message:
        "Account created successfully! Verification email sent. Please verify your account to continue. Note that token expires in 2 hours",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error registering the user",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const individualUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("🔐 Login attempt started:", {
      email: req.body.email,
      hasPassword: !!req.body.password,
      userAgent: req.get("User-Agent"),
      origin: req.get("origin"),
      NODE_ENV: process.env.NODE_ENV,
    });

    const { email, password } = req.body;

    if (!email || !password) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Email and password are required",
      };
      return next(error);
    }

    const user = await IndividualUser.findOne({ email }).select("+password");

    if (!user) {
      console.log("❌ User not found:", email);
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "Invalid email or password",
      };
      return next(error);
    }

    if (!user.email_verified) {
      console.log("⚠️ Email not verified:", email);
      const error: ErrorResponse = {
        statusCode: 403,
        status: "fail",
        message: "Please verify your email before logging in",
      };
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      const error: ErrorResponse = {
        statusCode: 401,
        status: "fail",
        message: "Invalid email or password",
      };
      return next(error);
    }

    const userAgent = req.get("User-Agent") || "unknown";

    console.log("🎫 Creating session for user:", user._id);

    const result = await createSessionAndSendTokens({
      user: {
        _id: user._id,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role || "ind",
      },
      userAgent,
      role: user.role || "ind",
      message: "Login successful",
    });

    console.log("✅ Session created:", {
      userId: user._id,
      hasAccessToken: !!result.accessToken,
      hasRefreshToken: !!result.refreshToken,
    });

    // Set cookies with logging
    const accessCookieOptions = getCookieOptions(15 * 60 * 1000);
    const refreshCookieOptions = getCookieOptions(30 * 24 * 60 * 60 * 1000);

    console.log("🍪 Setting cookies:", {
      access: accessCookieOptions,
      refresh: refreshCookieOptions,
    });

    res.cookie("access_token", result.accessToken, accessCookieOptions);
    res.cookie("refresh_token", result.refreshToken, refreshCookieOptions);

    console.log("✅ Login successful for:", email);

    res.status(200).json({
      status: "success",
      message: result.message,
      user: {
        id: user._id,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
      },
      token: result.accessToken,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error("❌ Login error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      email: req.body.email,
    });

    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error logging in",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
      email: string;
    };
    const user = await IndividualUser.findOne({ email: decoded.email });

    if (!user) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "User not found",
      };
      return next(error);
    }

    if (user.email_verified) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Email already verified",
      };
      return next(error);
    }

    user.email_verified = true;
    await user.save();

    // Send welcome email after successful verification
    await sendWelcomeEmail(user.email);

    res.status(200).json({
      status: "success",
      message: "Email verified successfully! You can now login to your account",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: error instanceof jwt.JsonWebTokenError ? 400 : 500,
      status: "fail",
      message:
        error instanceof jwt.JsonWebTokenError
          ? "Invalid or expired token"
          : "Error verifying email",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};
export const completeEmailVerificationWithBankDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.query;
    const { account_number, bank_name, account_name, bank_code } = req.body;

    // ============================================
    // STEP 1: Validate Token
    // ============================================
    if (!token || typeof token !== "string") {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid or missing verification token",
      };
      return next(error);
    }

    // ============================================
    // STEP 2: Validate Bank Details (ALL REQUIRED)
    // ============================================
    if (!account_number || !bank_name || !account_name || !bank_code) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "All bank details are required)",
      };
      return next(error);
    }

    // Validate account number format
    if (!/^\d{10}$/.test(account_number)) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Account number must be exactly 10 digits",
      };
      return next(error);
    }

    // ============================================
    // STEP 3: Verify JWT Token
    // ============================================
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        email: string;
      };
    } catch (err) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid or expired verification token",
      };
      return next(error);
    }

    // ============================================
    // STEP 4: Find User
    // ============================================
    const user = await IndividualUser.findOne({ email: decoded.email });

    if (!user) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "User not found",
      };
      return next(error);
    }

    // Check if already verified
    if (user.email_verified) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message:
          "Email already verified. You can update bank details in your profile settings.",
      };
      return next(error);
    }

    // ============================================
    // STEP 5: Verify Bank Account with Paystack (Optional but Recommended)
    // ============================================
    try {
      const paystackResponse = await axios.get(
        `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      // Check if account name matches
      const paystackAccountName =
        paystackResponse.data.data?.account_name?.toLowerCase();
      const providedAccountName = account_name.toLowerCase();

      // Log for debugging
      console.log("🏦 Bank verification:", {
        provided: account_name,
        paystack: paystackResponse.data.data?.account_name,
      });

      // Optional: Enforce exact match
      // if (paystackAccountName !== providedAccountName) {
      //   const error: ErrorResponse = {
      //     statusCode: 400,
      //     status: "fail",
      //     message: `Account name mismatch. Paystack returned: ${paystackResponse.data.data?.account_name}`,
      //   };
      //   return next(error);
      // }
    } catch (paystackError) {
      console.error("❌ Paystack verification failed:", paystackError);

      // Decide: Fail hard or allow anyway?
      // Option 1: Fail hard (recommended)
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message:
          "Unable to verify bank account. Please check your account number and bank.",
      };
      return next(error);

      // Option 2: Log warning and continue (less secure)
      // console.warn("⚠️ Proceeding without Paystack verification");
    }

    // ============================================
    // STEP 6: Update User (Email + Bank Details Together)
    // ============================================
    user.email_verified = true;
    user.bank_details = {
      account_number,
      bank_name,
      account_name,
      bank_code,
    };

    await user.save();

    console.log(`✅ User verified and bank details saved: ${user.email}`);

    // ============================================
    // STEP 7: Send Welcome Email
    // ============================================
    try {
      await sendWelcomeEmail(user.email);
      console.log(`📧 Welcome email sent to: ${user.email}`);
    } catch (emailError) {
      console.error("⚠️ Failed to send welcome email:", emailError);
      // Don't fail the request if email fails
    }

    // ============================================
    // STEP 8: Return Success
    // ============================================
    res.status(200).json({
      status: "success",
      message:
        "Email verified and bank details saved successfully! You can now sign in.",
      data: {
        email: user.email,
        email_verified: true,
        bank_details_added: true,
      },
    });
  } catch (error) {
    console.error("❌ Email verification with bank details error:", error);

    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error completing verification",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

// ============================================
// HELPER: Verify Bank Account Endpoint (for frontend pre-validation)
// ============================================

/**
 * Separate endpoint to verify account before submission
 * This is called when user clicks "Verify" button
 */
export const verifyBankAccountOnly = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { account_number, bank_code } = req.body;

    console.log("🔍 Verification request received:", {
      account_number,
      bank_code,
      hasPaystackKey: !!process.env.PAYSTACK_SECRET_KEY,
      paystackKeyPrefix:
        process.env.PAYSTACK_SECRET_KEY?.substring(0, 10) + "...",
    });

    if (!account_number || !bank_code) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Account number and bank code are required",
      };
      return next(error);
    }

    if (!/^\d{10}$/.test(account_number)) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Account number must be 10 digits",
      };
      return next(error);
    }

    console.log(
      `🌐 Calling Paystack API: account=${account_number}, bank=${bank_code}`,
    );

    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    console.log("✅ Paystack response:", {
      status: response.data.status,
      accountName: response.data.data?.account_name,
    });

    if (response.data.status && response.data.data) {
      res.status(200).json({
        status: "success",
        message: "Account verified successfully",
        data: {
          account_name: response.data.data.account_name,
          account_number: response.data.data.account_number,
        },
      });
    } else {
      console.log("❌ Paystack verification failed:", response.data);
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: response.data.message || "Unable to verify account details",
      };
      return next(error);
    }
  } catch (error) {
    console.error("❌ Account verification error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error)
        ? {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
          }
        : null,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (axios.isAxiosError(error) && error.response) {
      const errorResponse: ErrorResponse = {
        statusCode: error.response.status || 400,
        status: "fail",
        message: error.response.data?.message || "Invalid account details",
      };
      return next(errorResponse);
    }

    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error verifying account",
    };
    next(errResponse);
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    if (!email) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Email is required",
      };
      return next(error);
    }

    const user = await IndividualUser.findOne({ email });

    if (!user) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "User not found",
      };
      return next(error);
    }

    if (user.email_verified) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Email is already verified",
      };
      return next(error);
    }

    const verificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" },
    );

    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      status: "success",
      message:
        "Verification email resent successfully. Please check your inbox",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error resending verification email",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

// FIXED forgotPassword function
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    if (!email) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Email is required",
      };
      return next(error);
    }

    const user = await IndividualUser.findOne({ email });

    if (!user) {
      const error: ErrorResponse = {
        statusCode: 404,
        status: "fail",
        message: "User with this email does not exist",
      };
      return next(error);
    }

    // This returns the UNHASHED token to send via email
    const resetToken = user.createPasswordResetToken();

    // Save the user with the hashed token and expiry
    await user.save({ validateBeforeSave: false });

    // Send reset email with the UNHASHED token
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      status: "success",
      message:
        "Password reset link sent to your email. Link expires in 10 minutes",
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

// FIXED resetIndividualPassword function
export const resetIndividualPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.query;
    const { password, confirm_password } = req.body;

    // Validation Checks
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

    // Hash the incoming token the same way it was stored
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching hashed token and unexpired date
    const user = await IndividualUser.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid or expired reset token",
      };
      return next(error);
    }

    // Update password and clear token fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();

    await user.save();

    // Send success email
    await sendPasswordResetSuccessEmail(user.email);

    res.status(200).json({
      status: "success",
      message:
        "Password reset successfully! You can now login with your new password",
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Error resetting password",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};
