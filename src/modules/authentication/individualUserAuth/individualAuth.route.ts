import { Router } from "express";
import { individualUserRegistration } from "../individualUserAuth/individualUserAuth.controller";

const router = Router();

// routes
router.route("/register").post(individualUserRegistration);

export default router;
