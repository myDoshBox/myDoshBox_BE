import { Router } from "express";
import {
  individualUserRegistration,
  individualUserRegistrationGoogle,
  resetIndividualPassword,
} from "../individualUserAuth/individualUserAuth.controller";

import {
  getGoogleUrl,
  getGoogleUserDetail,
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

/**
 * @swagger
 *   /auth/individual/googleauth:
 *     post:
 *       summary: Google signup/login
 *       description: Sign up a new user using google.
 *       tags: [IndividualUserGoogleAuth]
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
 *                 $ref: "#/components/schemas/IndividualUserGoogleAuth"
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '401':
 *           $ref: "#/components/responses/401"
 *
 */

individualrouter.route("/googleauth").post(individualUserRegistrationGoogle);

/**
 * @swagger
 * /auth/individual/reset-password:
 *   post:
 *     summary: Reset a user's password
 *     tags: [IndividualUserAuth]
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/IndividualUserResetPassword"
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
 *   /auth/individual/oauth:
 *     post:
 *       summary: Get google authorized url; navigate to google consent page; and give google user access
 *       tags: [GoogleIndividualUserAuth]
 *       responses:
 *         '200':
 *           description: Google AuthorizedUrl successful gotten
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/GoogleOrganizationAccess"
 *         '401':
 *           $ref: "#/components/responses/401"
 */

individualrouter.get("/oauth", getGoogleUrl);
individualrouter.post("/oauth/callback", getGoogleUserDetail);

export default individualrouter;
