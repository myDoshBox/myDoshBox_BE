import express, { Router } from "express";
import * as organizationController from "./organizationAuth.controller";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: OrganizationUserAuth
 * description: To signup and login Organization user
 */

/**
 * @swagger
 *   /api/organization/signup
 *     post:
 *       summary: Sign up an organization user
 *       description: Sign up a new user for the organization.
 *       tags: [OrganizationUserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/OrganizationUserSignup"
 *       responses:
 *         '200':
 *           description: User successfully signed up
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/OrganizationUser"
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '401':
 *           $ref: "#/components/responses/401"
 */

/**
 * @swagger
 *   /api/organization/login:
 *     post:
 *       summary: Login as an organization user
 *       description: Log in an existing organization user.
 *       tags: [OrganizationUserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LoginRequest"
 *       responses:
 *         '200':
 *           description: User successfully logged in
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/LoginResponse"
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '401':
 *           $ref: "#/components/responses/401"
 */

router.post("/signup", organizationController.signup);
router.post("/login", organizationController.login);

/**
 * @swagger
 * tags:
 *  name: OrganizationUserAuth
 * description: To signup, login, and manage Organization user authentication
 */

/**
 * @swagger
 *   /api/organization/forgotpassword:
 *     post:
 *       summary: Request a password reset link
 *       description: Request a password reset link for the organization user.
 *       tags: [OrganizationUserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ForgotPasswordRequest"
 *       responses:
 *         '200':
 *           description: Password reset link sent successfully
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '404':
 *           $ref: "#/components/responses/404"
 */

/**
 * @swagger
 *   /api/organization/resetPassword/{resetToken}:
 *     post:
 *       summary: Reset user's password
 *       description: Reset user's password using the provided reset token.
 *       tags: [OrganizationUserAuth]
 *       parameters:
 *         - in: path
 *           name: resetToken
 *           required: true
 *           schema:
 *             type: string
 *             description: The reset token received by the user.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ResetPasswordRequest"
 *       responses:
 *         '200':
 *           description: Password successfully reset
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '404':
 *           $ref: "#/components/responses/404"
 */

router.post("/forgotPassword", organizationController.forgotPassword);
router.patch("/resetPassword/:token", organizationController.resetPassword);

export default router;
