import { Router } from "express";
import {
  generateOTP,
  individualUserLogin,
  individualUserRegistration,
  resetIndividualPassword,
  verifyIndividualUserEmail,
  verifyOTP,
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
 * tags:
 *   name: Otp
 *   description: Api endpoint to manage Otp
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
 * /api/individual/register:
 *   post:
 *     summary: Generate otp for password reset
 *     tags:
 *       - Individual
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Individual'
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

individualrouter.route("/register").post(individualUserRegistration);

/**
 * @swagger
 * /api/individual/generate/otp:
 *   post:
 *     summary: Generate Otp for password reset
 *     tags:
 *       - Otp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *             required:
 *               - email
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

individualrouter.route("/generate/otp").post(generateOTP);

/**
 * @swagger
 * /api/individual/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags:
 *       - Otp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: '#/components/schemas/OTP'
 *
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

individualrouter.route("/verify-otp").post(verifyOTP);

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
 * /api/individual/verify-individual-email:
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
individualrouter
  .route("/verify-email")
  .get(verifyIndividualUserEmail);

export default individualrouter;
