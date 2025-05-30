"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const individualUserAuth_controller_1 = require("../individualUserAuth/individualUserAuth.controller");
const individualUserAuth_controller_2 = require("../individualUserAuth/individualUserAuth.controller");
const individualrouter = express_1.Router();
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
individualrouter.route("/signup").post(individualUserAuth_controller_1.individualUserRegistration);
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
individualrouter.route("/googleauth").post(individualUserAuth_controller_1.individualUserRegistrationGoogle);
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
individualrouter.route("/reset-password").post(individualUserAuth_controller_1.resetIndividualPassword);
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
individualrouter.get("/oauth", individualUserAuth_controller_2.getGoogleUrl);
individualrouter.post("/oauth/callback", individualUserAuth_controller_2.getGoogleUserDetail);
exports.default = individualrouter;
