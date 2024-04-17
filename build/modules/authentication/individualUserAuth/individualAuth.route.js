"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const individualUserAuth_controller_1 = require("../individualUserAuth/individualUserAuth.controller");
const individualrouter = (0, express_1.Router)();
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
 * /api/individual/login:
 *   post:
 *     summary: Sign in a user
 *     tags: [IndividualUserAuth]
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/IndividualUserLogin"
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
individualrouter.route("/login").post(individualUserAuth_controller_1.individualUserLogin);
/**
 * @swagger
 * /api/individual/reset-password:
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
 * /api/individual/verify-email:
 *   get:
 *     summary: Verify a user's email
 *     tags: [IndividualUserAuth]
 *     parameters:
 *       - in: query
 *         name: token
 *         description: Token to verify user email
 *         required: true
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
individualrouter.route("/verify-email").get(individualUserAuth_controller_1.verifyIndividualUserEmail);
/**
 * @swagger
 * /api/individual/refresh/token:
 *   post:
 *     summary: Refresh a user's access token
 *     tags: [IndividualUserAuth]
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/IndividualUserRefreshAccessToken"
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
individualrouter.route("/refresh/token").post(individualUserAuth_controller_1.refreshAccessToken);
exports.default = individualrouter;