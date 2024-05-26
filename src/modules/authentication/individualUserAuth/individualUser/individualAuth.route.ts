import { Router } from "express";
import {
  individualUserRegistration,
  resetIndividualPassword,
} from "./individualUserAuth.controller";

const individualrouter = Router();

/**
 * @swagger
 * tags:
 *   name: IndividualUserAuth
 *   description: Api endpoint to manage individual auth
 */

/**
 * @swagger
 *   /auth/individual/signup:
 *     post:
 *       summary: Sign up an individual user
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

// /**
//  * @swagger
//  * /auth/individual/reset-password:
//  *   post:
//  *     summary: Reset a user's password
//  *     tags: [IndividualUserAuth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *           application/json:
//  *             schema:
//  *               $ref: "#/components/schemas/IndividualUserResetPassword"
//  *     responses:
//  *       "200":
//  *         description: User token
//  *       "400":
//  *         description: Bad request
//  *       "404":
//  *         description: Not found
//  *       "403":
//  *         description: Unauthorized request
//  *       "500":
//  *         description: Internal server error
//  */

// // individualrouter.route("/reset-password").post(resetIndividualPassword);

export default individualrouter;
