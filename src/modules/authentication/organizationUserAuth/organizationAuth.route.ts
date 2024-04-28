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
 *   /organization/organizationUserSignup:
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
 *                 $ref: "#/components/schemas/OrganizationUserSignup"
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '401':
 *           $ref: "#/components/responses/401"
 */

/**
 * @swagger
 *   /organization/organizationUserLogin:
 *     post:
 *       summary: Sign up an organization user
 *       description: Sign up a new user for the organization.
 *       tags: [OrganizationUserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/OrganizationUserLogin"
 *       responses:
 *         '200':
 *           description: User successfully login
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/OrganizationUserLogin"
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '401':
 *           $ref: "#/components/responses/401"
 */
router.post("/signup", organizationController.organizationUserSignup);
router.post("/login", organizationController.organizationUserLogin);

/**
 * @swagger
 * tags:
 *  name: OrganizationUserAuth
 * description: To signup, login, and manage Organization user authentication
 */

/**
 * @swagger
 *   /organization/OrganizationUserForgotPassword:
 *     post:
 *       summary: Request a password reset link
 *       description: Request a password reset link for the organization user.
 *       tags: [OrganizationUserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/OrganizationUserForgotPassword"
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
 *   /organization/organizationUserResetPassword/{token}:
 *     patch:
 *       summary: Reset user's password
 *       description: Reset user's password using the provided reset token.
 *       tags: [OrganizationUserAuth]
 *       parameters:
 *         - in: path
 *           name: token
 *           required: true
 *           schema:
 *             type: string
 *             description: The reset token received by the user.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/OrganizationUserResetPassword"
 *       responses:
 *         '200':
 *           description: Password successfully reset
 *         '400':
 *           $ref: "#/components/responses/400"
 */

router.post(
  "/verify-email",
  organizationController.verifyOrganizationUserEmail
);
router.post(
  "/forgotpassword",
  organizationController.OrganizationUserForgotPassword
);
router.patch(
  "/resetPassword/:token",
  organizationController.organizationUserResetPassword
);

export default router;
