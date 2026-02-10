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
exports.sendURLEmail = exports.sendOtpEmail = exports.sendPasswordResetSuccessEmail = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendVerificationEmail = exports.generateMailTransporter = exports.regenerateTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ============================================
// OPTIMIZED EMAIL TRANSPORT SYSTEM
// ============================================
let transporter = null;
/**
 * Creates and verifies email transporter with multiple fallback configurations
 * Tries different SMTP configurations until one succeeds
 */
function createTransporter() {
    return __awaiter(this, void 0, void 0, function* () {
        const emailService = process.env.EMAIL_SERVICE || "gmail";
        const configs = {
            gmail: [
                {
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                },
                {
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                    connectionTimeout: 30000,
                    greetingTimeout: 30000,
                    socketTimeout: 30000,
                },
                {
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                    connectionTimeout: 30000,
                    greetingTimeout: 30000,
                    socketTimeout: 30000,
                },
            ],
            outlook: [
                {
                    service: "hotmail",
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                },
            ],
            custom: [
                {
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
                    secure: process.env.SMTP_SECURE === "true",
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                },
            ],
        };
        const serviceConfigs = configs[emailService] || configs.gmail;
        for (let i = 0; i < serviceConfigs.length; i++) {
            try {
                console.log(`Attempting email connection ${i + 1}/${serviceConfigs.length}...`);
                const newTransporter = nodemailer_1.default.createTransport(serviceConfigs[i]);
                const verifyPromise = newTransporter.verify();
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Connection timeout")), 15000);
                });
                yield Promise.race([verifyPromise, timeoutPromise]);
                console.log(`✅ Email service connected successfully (attempt ${i + 1})`);
                return newTransporter;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                console.warn(`⚠️ Connection attempt ${i + 1} failed:`, errorMessage);
                if (i === serviceConfigs.length - 1) {
                    console.error("❌ All email connection attempts failed");
                    throw error;
                }
            }
        }
        // This line should never be reached due to the loop logic, but TypeScript needs it
        throw new Error("Failed to create email transporter");
    });
}
/**
 * Initialize transporter on module load
 */
function initializeTransporter() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            transporter = yield createTransporter();
            console.log("📧 Email transporter initialized successfully");
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("❌ Failed to initialize email transporter:", errorMessage);
            console.error("⚠️ Email functionality may not work. Check your email credentials.");
        }
    });
}
// Initialize on startup
initializeTransporter();
/**
 * Ensures transporter is available, creates new one if needed
 */
function ensureTransporter() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!transporter) {
            console.log("🔄 Transporter not initialized, creating new one...");
            transporter = yield createTransporter();
        }
        return transporter;
    });
}
/**
 * Regenerate transporter - useful after credential updates
 */
const regenerateTransporter = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔄 Regenerating email transporter...");
    transporter = null;
    return yield ensureTransporter();
});
exports.regenerateTransporter = regenerateTransporter;
/**
 * Generate mail transporter (compatibility with existing code)
 */
const generateMailTransporter = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield ensureTransporter();
});
exports.generateMailTransporter = generateMailTransporter;
// ============================================
// EMAIL CONFIGURATION CONSTANTS
// ============================================
const supportEmail = "mydoshbox@gmail.com";
const appName = "MyDoshbox";
// ============================================
// EMAIL SENDING TEMPLATES
// ============================================
const sendVerificationEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = yield ensureTransporter();
        const verificationURL = `${process.env.DEPLOYED_FRONTEND_BASE_URL}/auth/verify-email?token=${token}`;
        const emailMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for registering with <strong>${appName}</strong>! We're excited to have you on board.</p>
          <p>To complete your registration and ensure the security of your account, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationURL}" class="button">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${verificationURL}</p>
          <p><strong>Note:</strong> This verification link will expire in 2 hours for security purposes.</p>
          <p>If you didn't create an account with ${appName}, please ignore this email.</p>
          <p>If you have any questions or need assistance, feel free to contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
        const info = yield transport.sendMail({
            to: email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `Verify Your ${appName} Email Address`,
            html: emailMessage,
        });
        console.log("✅ Verification email sent - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
        return info;
    }
    catch (err) {
        const error = err instanceof Error
            ? err
            : new Error("Unknown error sending verification email");
        console.error("❌ Error sending verification email:", error);
        throw error;
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendWelcomeEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = yield ensureTransporter();
        const emailMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${appName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${appName}! 🎉</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Your email has been successfully verified! Welcome to the ${appName} community.</p>
          <p>You now have full access to all our features and services. Here's what you can do next:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Explore our platform features</li>
            <li>Connect with other users</li>
            <li>Start using our services</li>
          </ul>
          <div style="text-align: center;">
            <a href="${process.env.DEPLOYED_FRONTEND_BASE_URL}/login" class="button">Login to Your Account</a>
          </div>
          <p>If you have any questions or need help getting started, our support team is here to assist you at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          <p>Thank you for choosing ${appName}. We look forward to serving you!</p>
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
        const info = yield transport.sendMail({
            to: email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `Welcome to ${appName}!`,
            html: emailMessage,
        });
        console.log("✅ Welcome email sent - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
        return info;
    }
    catch (err) {
        const error = err instanceof Error
            ? err
            : new Error("Unknown error sending welcome email");
        console.error("❌ Error sending welcome email:", error);
        throw error;
    }
});
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = (email, resetToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = yield ensureTransporter();
        const resetURL = `${process.env.DEPLOYED_FRONTEND_BASE_URL}/auth/reset-password?token=${resetToken}`;
        const emailMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset the password for your ${appName} account.</p>
          <p>If you made this request, click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetURL}" class="button">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; color: #dc3545;">${resetURL}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security purposes.
          </div>
          <p><strong>If you didn't request a password reset:</strong></p>
          <ul>
            <li>Please ignore this email</li>
            <li>Your password will remain unchanged</li>
            <li>Consider changing your password if you're concerned about account security</li>
          </ul>
          <p>For security reasons, we never ask for your password via email.</p>
          <p>If you need assistance, contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
        const info = yield transport.sendMail({
            to: email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `Password Reset Request - ${appName}`,
            html: emailMessage,
        });
        console.log("✅ Password reset email sent - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
        return info;
    }
    catch (err) {
        const error = err instanceof Error
            ? err
            : new Error("Unknown error sending password reset email");
        console.error("❌ Error sending password reset email:", error);
        throw error;
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordResetSuccessEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = yield ensureTransporter();
        const emailMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .info-box { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 10px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Successful ✓</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Your ${appName} account password has been successfully reset.</p>
          <p>You can now login to your account using your new password.</p>
          <div style="text-align: center;">
            <a href="${process.env.DEPLOYED_FRONTEND_BASE_URL}/login" class="button">Login to Your Account</a>
          </div>
          <div class="info-box">
            <strong>ℹ️ Security Tip:</strong> Make sure to use a strong, unique password that you don't use for other accounts.
          </div>
          <p><strong>If you didn't make this change:</strong></p>
          <ul>
            <li>Someone may have accessed your account</li>
            <li>Contact our support team immediately at <a href="mailto:${supportEmail}">${supportEmail}</a></li>
            <li>We'll help secure your account</li>
          </ul>
          <p>Thank you for keeping your account secure!</p>
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
        const info = yield transport.sendMail({
            to: email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `Password Reset Successful - ${appName}`,
            html: emailMessage,
        });
        console.log("✅ Password reset success email sent - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
        return info;
    }
    catch (err) {
        const error = err instanceof Error
            ? err
            : new Error("Unknown error sending password reset success email");
        console.error("❌ Error sending password reset success email:", error);
        throw error;
    }
});
exports.sendPasswordResetSuccessEmail = sendPasswordResetSuccessEmail;
const sendOtpEmail = (otp, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = yield ensureTransporter();
        const emailMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .otp-box { background-color: #fff; border: 2px dashed #007bff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>OTP Verification</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request for password reset. Use the following OTP to create your new password:</p>
          <div class="otp-box">${otp}</div>
          <p><strong>Important:</strong> This OTP is valid for 10 minutes only.</p>
          <p>If you didn't request this OTP, please ignore this email or contact our support team.</p>
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
        const info = yield transport.sendMail({
            to: email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `Your ${appName} OTP Code`,
            html: emailMessage,
        });
        console.log("✅ OTP email sent - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
        return info;
    }
    catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error sending OTP email");
        console.error("❌ Error sending OTP email:", error);
        throw error;
    }
});
exports.sendOtpEmail = sendOtpEmail;
const sendURLEmail = (email, resetURL) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = yield ensureTransporter();
        const emailMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:</p>
          <p style="word-break: break-all; background-color: #fff; padding: 15px; border-left: 4px solid #007bff;">${resetURL}</p>
          <p>If you didn't forget your password, please ignore this email!</p>
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
        const info = yield transport.sendMail({
            to: email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `Password Reset - ${appName}`,
            html: emailMessage,
        });
        console.log("✅ Reset URL email sent - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
        return info;
    }
    catch (err) {
        const error = err instanceof Error
            ? err
            : new Error("Unknown error sending reset URL email");
        console.error("❌ Error sending reset URL email:", error);
        throw error;
    }
});
exports.sendURLEmail = sendURLEmail;
