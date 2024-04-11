"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleIndividualUserAuth_controller_1 = require("./googleIndividualUserAuth.controller");
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
//router.get("/auth/google", getGoogleUserDetail);
router.post("/oauth/google", googleIndividualUserAuth_controller_1.getGoogleUrl);
router.get("/oauth/google/callback", googleIndividualUserAuth_controller_1.getGoogleUserDetail);
//router.get("/auth/google", getGoogleUserDetail);
//router.post("/oauth/get-google-url", getGoogleUrl);
//router.get("/oauth/google", getGoogleUserDetail);
//router.post("/oauth/google/create-user", createGoogleUser);
exports.default = router;
