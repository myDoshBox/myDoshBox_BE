import express from "express";
import {
  createGoogleUser,
  getGoogleUrl,
  getGoogleUserDetail,
} from "./googleOrganizationUserAuth.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: GoogleOrganizationUserAuth
 *   description: To signup and login google organization/company user
 */

/**
 * @swagger
 *   /auth/organization/oauth:
 *     post:
 *       summary: Get google authorized url; navigate to google consent page; and give google user access
 *       tags: [GoogleOrganizationUserAuth]
 *       responses:
 *         '200':
 *           description: User successfully signed in or new user data successfully received
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/GoogleOrganizationAccess"
 *         '401':
 *           $ref: "#/components/responses/401"
 */
router.post("/oauth", getGoogleUrl);
router.get("/oauth/callback", getGoogleUserDetail);

/**
 * @swagger
 *   /auth/organization/oauth/create-user:
 *     post:
 *       summary: Create google organization user
 *       tags: [GoogleOrganizationUserAuth]
 *       responses:
 *         '201':
 *           description: google user sucessfully created
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/GoogleOrganizationUser"
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '409':
 *           $ref: "#/components/responses/409"
 */
router.post("/oauth/create-user", createGoogleUser);

export default router;
