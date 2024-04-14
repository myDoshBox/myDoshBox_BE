import { Router } from "express";
import {
  individualUserLogin,
  individualUserRegistration,
  resetIndividualPassword,
  verifyIndividualUserEmail,
  refreshAccessToken,
} from "../individualUserAuth/individualUserAuth.controller";

const individualrouter = Router();

/**
 * @swagger
 * tags:
 *   name: IndividualUserAuth
 *   description: Api endpoint to manage individual auth
 */

/**
 * @swagger
 *   /api/individual/signup:
 *     post:
 *       summary: Sign up an organization user
 *       description: Sign up a new user for the organization.
 *       tags: [IndividualUserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/IndividualUserSignup"
 *       responses:
 *         '200':
 *           description: User successfully signed up
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/IndividualUserSignup"
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '401':
 *           $ref: "#/components/responses/401"
 *
 */

individualrouter.route("/signup").post(individualUserRegistration);

/**
 * @swagger
 * /api/individual/login:
 *   post:
 *     summary: Sign in a user
 *     tags:
 *       - Individual
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Registered user email
 *               password:
 *                 type: string
 *                 description: Registered user password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       "200":
 *         description: User token
 *       "400":
 *         description: Bad request
 *       "404":
 *         description: Not found
 *       "403":
 *         description: Unauthorized request
 *       "500":
 *         description: Internal server error
 */

// routes
individualrouter.route("/login").post(individualUserLogin);

/**
 * @swagger
 * /api/individual/reset-password:
 *   post:
 *     summary: Reset a user's password
 *     tags:
 *       - Individual
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's registered email
 *               password:
 *                 type: string
 *                 description: User's new password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       "200":
 *         description: User token
 *       "400":
 *         description: Bad request
 *       "404":
 *         description: Not found
 *       "403":
 *         description: Unauthorized request
 *       "500":
 *         description: Internal server error
 */

individualrouter.route("/reset-password").post(resetIndividualPassword);

/**
 * @swagger
 * /api/individual/verify-email:
 *   post:
 *     summary: Verify a user's email
 *     tags:
 *       - Individual
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                     email:
 *                      type: string
 *                      description: Registred user email
 *             required:
 *                  -email
 *     responses:
 *       "200":
 *         description: User token
 *       "400":
 *         description: Bad request
 *       "404":
 *         description: Not found
 *       "403":
 *         description: Unauthorized request
 *       "500":
 *         description: Internal server error
 */
individualrouter.route("/verify-email").get(verifyIndividualUserEmail);

/**
 * @swagger
 * /api/individual/refresh/token:
 *   post:
 *     summary: Refresh a user's access token
 *     tags:
 *       - Individual
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: User's refresh token
 *             required:
 *               - refreshToken
 *     responses:
 *       "200":
 *         description: User token
 *       "400":
 *         description: Bad request
 *       "404":
 *         description: Not found
 *       "403":
 *         description: Unauthorized request
 *       "500":
 *         description: Internal server error
 */
individualrouter.route("/refresh/token").post(refreshAccessToken);

export default individualrouter;
