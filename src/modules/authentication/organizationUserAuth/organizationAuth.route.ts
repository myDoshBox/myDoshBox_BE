import { Router } from "express";
import {
  organizationUserRegistration,
  organizationUserLogin,
  verifyOrganizationEmail,
  resendOrganizationVerificationEmail,
  forgotOrganizationPassword,
  resetOrganizationPassword,
} from "./organizationAuth.controller";
import { asyncHandler } from "../../../middlewares/asyncHandler.middleware";

const organizationRouter = Router();

/**
 * @swagger
 * tags:
 *   name: OrganizationAuth
 *   description: API endpoints to manage organization authentication
 */

/**
 * @swagger
 *   /auth/organization/signup:
 *     post:
 *       summary: Sign up an organization
 *       description: Register a new organization account
 *       tags: [OrganizationAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organization_name:
 *                   type: string
 *                   example: "Acme Corporation"
 *                 organization_email:
 *                   type: string
 *                   format: email
 *                   example: "admin@acmecorp.com"
 *                 contact_email:
 *                   type: string
 *                   format: email
 *                   example: "contact@acmecorp.com"
 *                 contact_number:
 *                   type: string
 *                   example: "+1234567890"
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "SecurePass123!"
 *                 confirm_password:
 *                   type: string
 *                   format: password
 *                   example: "SecurePass123!"
 *               required:
 *                 - organization_name
 *                 - organization_email
 *                 - contact_email
 *                 - contact_number
 *                 - password
 *                 - confirm_password
 *       responses:
 *         '201':
 *           description: Organization successfully registered
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     example: "success"
 *                   message:
 *                     type: string
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '500':
 *           $ref: "#/components/responses/500"
 */
organizationRouter
  .route("/signup")
  .post(asyncHandler(organizationUserRegistration));

/**
 * @swagger
 *   /auth/organization/login:
 *     post:
 *       summary: Log in an organization
 *       description: Authenticate an organization with email and password
 *       tags: [OrganizationAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organization_email:
 *                   type: string
 *                   format: email
 *                   example: "admin@acmecorp.com"
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "SecurePass123!"
 *               required:
 *                 - organization_email
 *                 - password
 *       responses:
 *         '200':
 *           description: Organization successfully logged in
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   message:
 *                     type: string
 *                   organization:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       organization_name:
 *                         type: string
 *                       organization_email:
 *                         type: string
 *                       contact_email:
 *                         type: string
 *                       contact_number:
 *                         type: string
 *                       role:
 *                         type: string
 *                   accessToken:
 *                     type: string
 *                   refreshToken:
 *                     type: string
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '401':
 *           description: Invalid credentials
 *         '403':
 *           description: Email not verified
 *         '404':
 *           description: Organization not found
 */
organizationRouter.route("/login").post(asyncHandler(organizationUserLogin));

/**
 * @swagger
 *   /auth/organization/verify-email:
 *     get:
 *       summary: Verify organization email
 *       description: Verify an organization's email using the provided token
 *       tags: [OrganizationAuth]
 *       parameters:
 *         - in: query
 *           name: token
 *           schema:
 *             type: string
 *           required: true
 *           description: The JWT token sent via email for verification
 *       responses:
 *         '200':
 *           description: Organization email verified successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   message:
 *                     type: string
 *         '400':
 *           description: Invalid or expired token, or email already verified
 *         '404':
 *           description: Organization not found
 *         '500':
 *           description: Internal server error
 */
organizationRouter.get("/verify-email", verifyOrganizationEmail);

/**
 * @swagger
 *   /auth/organization/resend-verification:
 *     post:
 *       summary: Resend organization verification email
 *       description: Resend email verification link to the organization's email address
 *       tags: [OrganizationAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organization_email:
 *                   type: string
 *                   format: email
 *                   example: "admin@acmecorp.com"
 *               required:
 *                 - organization_email
 *       responses:
 *         '200':
 *           description: Verification email sent successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   message:
 *                     type: string
 *         '400':
 *           description: Organization email is required or already verified
 *         '404':
 *           description: Organization not found
 *         '500':
 *           description: Internal server error
 */
organizationRouter
  .route("/resend-verification")
  .post(asyncHandler(resendOrganizationVerificationEmail));

/**
 * @swagger
 *   /auth/organization/forgot-password:
 *     post:
 *       summary: Request organization password reset
 *       description: Send a password reset link to the organization's email address
 *       tags: [OrganizationAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organization_email:
 *                   type: string
 *                   format: email
 *                   example: "admin@acmecorp.com"
 *               required:
 *                 - organization_email
 *       responses:
 *         '200':
 *           description: Password reset link sent successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   message:
 *                     type: string
 *         '400':
 *           description: Organization email is required
 *         '404':
 *           description: Organization not found
 *         '500':
 *           description: Internal server error
 */
organizationRouter
  .route("/forgot-password")
  .post(asyncHandler(forgotOrganizationPassword));

/**
 * @swagger
 *   /auth/organization/reset-password:
 *     post:
 *       summary: Reset organization password
 *       description: Reset organization password using the token from email
 *       tags: [OrganizationAuth]
 *       parameters:
 *         - in: query
 *           name: token
 *           schema:
 *             type: string
 *           required: true
 *           description: The password reset token sent via email
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "NewSecurePass123!"
 *                 confirm_password:
 *                   type: string
 *                   format: password
 *                   example: "NewSecurePass123!"
 *               required:
 *                 - password
 *                 - confirm_password
 *       responses:
 *         '200':
 *           description: Organization password reset successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   message:
 *                     type: string
 *         '400':
 *           description: Invalid token, missing fields, or passwords don't match
 *         '404':
 *           description: Organization not found
 *         '500':
 *           description: Internal server error
 */
organizationRouter
  .route("/reset-password")
  .post(asyncHandler(resetOrganizationPassword));

export default organizationRouter;
