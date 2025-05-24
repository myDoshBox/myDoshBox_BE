import express, { Router } from "express";
// import { UserLogin, verifyUserEmail } from "./userAuth.controller";
import * as userController from "./userAuth.controller1";
// import { UserLogin } from "./userAuth.controller";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: UserAuth
 * description: Includes endpoints to log user in and to verify user email
 */

/**
 * @swagger
 *   /auth/login:
 *     post:
 *       summary: User sign in
 *       description: Sign in a an existing individual or organization user with email and user_password as request body.
 *       tags: [UserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserLogin"
 *       responses:
 *         '200':
 *           description: User successfully login
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/UserLogin"
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '401':
 *           $ref: "#/components/responses/401"
 */
router.post("/login", userController.UserLogin);

/**
 * @swagger
 *   /auth/verify-email:
 *     post:
 *       summary: Verify user email
 *       description: confirm user email and verify user so user can continue to login to application.
 *       tags: [UserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ConfirmEmail"
 *       responses:
 *         '200':
 *           description: User email successfully verified
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/ConfirmEmail"
 */
router.post("/verify-email", userController.verifyUserEmail);
// router.post("/logout", userController.logoutUser);

/**
 * @swagger
 *   /auth/ForgotPassword:
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
 *   /auth/ResetPassword/{token}:
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

router.post("/forgotpassword", userController.OrganizationUserForgotPassword);
router.patch(
  "/resetPassword/:token",
  userController.organizationUserResetPassword
);

export default router;
