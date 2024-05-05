import express from "express";
import {
  getGoogleUrl,
  getGoogleUserDetail,
} from "./googleIndividualUserAuth.controller";

const router = express.Router();
/**
 * @swagger
 * tags:
 *  name: GoogleIndividualUserAuth
 * description: To signup and login google individual user
 */

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

router.post("/oauth", getGoogleUrl);
router.get("/oauth/callback", getGoogleUserDetail);

export default router;
