import express from "express";
import {
  createGoogleUser,
  getGoogleUrl,
  getGoogleUserDetail,
} from "./googleOrganizationUserAuth.controller";

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

const router = express.Router();

router.post("/oauth/google", getGoogleUrl);
router.get("/oauth/google/callback", getGoogleUserDetail);
router.post("/oauth/google/create-user", createGoogleUser);

export default router;
