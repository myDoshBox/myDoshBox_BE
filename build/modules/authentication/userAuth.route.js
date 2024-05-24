"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_controller_1 = require("./userAuth.controller");
const userController = __importStar(require("./userAuth.controller"));
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
/**
 * @swagger
 *   /auth/verify-email:
 *     post:
 *       summary: Verify user email
 *       description: confirm user email and verify user so user can continue to login to application.
 *       tags: [UserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ConfirmEmail"
 *       responses:
 *         '200':
 *           description: User email successfully verified
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/ConfirmEmail"
 */
router.post("/verify-email", userAuth_controller_1.verifyUserEmail);
/**
 * @swagger
 *   /auth/ForgotPassword:
 *     post:
 *       summary: Request a password reset link
 *       description: Request a password reset link for the organization user.
 *       tags: [OrganizationUserAuth]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/OrganizationUserForgotPassword"
 *       responses:
 *         '200':
 *           description: Password reset link sent successfully
 *         '400':
 *           $ref: "#/components/responses/400"
 *         '404':
 *           $ref: "#/components/responses/404"
 */
/**
 * @swagger
 *   /auth/ResetPassword/{token}:
 *     patch:
 *       summary: Reset user's password
 *       description: Reset user's password using the provided reset token.
 *       tags: [OrganizationUserAuth]
 *       parameters:
 *         - in: path
 *           name: token
 *           required: true
 *           schema:
 *             type: string
 *             description: The reset token received by the user.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/OrganizationUserResetPassword"
 *       responses:
 *         '200':
 *           description: Password successfully reset
 *         '400':
 *           $ref: "#/components/responses/400"
 */
router.post("/forgotpassword", userController.OrganizationUserForgotPassword);
router.patch("/resetPassword/:token", userController.organizationUserResetPassword);
exports.default = router;
