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
 *   /api/auth/org/oauth/google:
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
router.post("/oauth/google", getGoogleUrl);
router.get("/oauth/google/callback", getGoogleUserDetail);

/**
 * @swagger
 *   /api/auth/org/oauth/google/create-user:
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
router.post("/oauth/google/create-user", createGoogleUser);

export default router;
