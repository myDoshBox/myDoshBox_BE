"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleOrganizationUserAuth_controller_1 = require("./googleOrganizationUserAuth.controller");
// import {
//   confirmEmailActivateAccount,
//   userSignup,
//   sendConfirmEmail,
//   userSignin,
// } from "./../controllers/userAuthController.controller";
// import protectRoutes from "./../middlewares/protectRoutes.middleware";
// import {
//   getGoogleUrl,
//   getGoogleUserDetail,
// } from "./../controllers/googleAuthController.controller";
const router = express_1.default.Router();
router.post("/oauth/get-google-url", googleOrganizationUserAuth_controller_1.getGoogleUrl);
router.get("/oauth/google", googleOrganizationUserAuth_controller_1.getGoogleUserDetail);
router.post("/oauth/google/create-user", googleOrganizationUserAuth_controller_1.createGoogleUser);
exports.default = router;
