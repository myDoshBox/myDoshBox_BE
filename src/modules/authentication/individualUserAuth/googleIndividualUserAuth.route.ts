import express from "express";
import {
  createGoogleUser,
  getGoogleUrl,
  getGoogleUserDetail,
} from "./googleIndividualUserAuth.controller";

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

//router.get("/auth/google", getGoogleUserDetail);
router.post("/oauth/google", getGoogleUrl);

router.get("/oauth/google/callback", getGoogleUserDetail);
//router.get("/auth/google", getGoogleUserDetail);

//router.post("/oauth/get-google-url", getGoogleUrl);
//router.get("/oauth/google", getGoogleUserDetail);
//router.post("/oauth/google/create-user", createGoogleUser);

export default router;