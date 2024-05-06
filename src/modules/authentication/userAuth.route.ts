import express, { Router } from "express";
import { UserLogin, verifyUserEmail } from "./userAuth.controller";

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
router.post("/login", UserLogin);

router.post("/verify-email", verifyUserEmail);

export default router;
