import express, { Router } from "express";
import * as organizationController from "./organizationAuth.controller";
import * as userController from "../../userLoginAndResetPassword";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *  name: OrganizationUserAuth
 * description: To signup and login Organization user
 */

/**
 * @swagger
 *   /auth/organization/signup:
 *     post:
 *       summary: Sign up an organization user
 *       description: Sign up a new user for the organization. sub, email_verified, picture, and role are optional and are not needed to signup
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
router.post("/signup", organizationController.organizationUserSignup);

export default router;
