"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleIndividualUserAuth_controller_1 = require("./googleIndividualUserAuth.controller");
const router = express_1.default.Router();
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
router.post("/oauth/google", googleIndividualUserAuth_controller_1.getGoogleUrl);
router.get("/oauth/google/callback", googleIndividualUserAuth_controller_1.getGoogleUserDetail);
exports.default = router;
