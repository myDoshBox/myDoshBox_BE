"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_controller_1 = require("./userAuth.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *  name: UserAuth
 * description: Includes endpoints to log user in and to verify user email
 */
/**
 * @swagger
 *   /auth/login:
 *     post:
 *       summary: User sign in
 *       description: Sign in a an existing individual or organization user with email and user_password as request body.
 *       tags: [UserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserLogin"
 *       responses:
 *         '200':
 *           description: User successfully login
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/UserLogin"
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '401':
 *           $ref: "#/components/responses/401"
 */
router.post("/login", userAuth_controller_1.UserLogin);
router.post("/verify-email", userAuth_controller_1.verifyUserEmail);
exports.default = router;
