"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleOrganizationUserAuth_controller_1 = require("./googleOrganizationUserAuth.controller");
const router = express_1.default.Router();
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
 *       tag: [GoogleOrganizationUserAuth]
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
router.post("/oauth/google", googleOrganizationUserAuth_controller_1.getGoogleUrl);
router.get("/oauth/google/callback", googleOrganizationUserAuth_controller_1.getGoogleUserDetail);
/**
 * @swagger
 *   /api/auth/org/oauth/google/create-user:
 *     post:
 *       summary: Create google organization user
 *       tag: [GoogleOrganizationUserAuth]
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
router.post("/oauth/google/create-user", googleOrganizationUserAuth_controller_1.createGoogleUser);
exports.default = router;
