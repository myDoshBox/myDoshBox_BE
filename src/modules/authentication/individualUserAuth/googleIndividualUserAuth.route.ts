import express from "express";
import {
  getGoogleUrl,
  getGoogleUserDetail,
} from "./googleIndividualUserAuth.controller";

const router = express.Router();

router.post("/oauth/google", getGoogleUrl);
router.get("/oauth/google/callback", getGoogleUserDetail);

export default router;
