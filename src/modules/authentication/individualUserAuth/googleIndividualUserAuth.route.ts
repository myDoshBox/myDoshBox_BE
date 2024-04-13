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
 *   /api/auth/ind/oauth/google:
 *     post:
 *       summary: Get google authorized url; navigate to google consent page; and give google user access
 *       tags: [GoogleIndividualUserAuth]
 *       responses:
 *         '200':
 *           description: Google AuthorizedUrl successful gotten
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/GoogleAuthorizedurl"
 *         '401':
 *           $ref: "#/components/responses/401"
 */

router.post("/oauth/google", getGoogleUrl);
router.get("/oauth/google/callback", getGoogleUserDetail);

export default router;
