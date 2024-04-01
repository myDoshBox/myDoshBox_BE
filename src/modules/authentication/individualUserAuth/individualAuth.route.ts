import { Router } from "express";
import { individualUserLogin, individualUserRegistration } from "../individualUserAuth/individualUserAuth.controller";

const router = Router();

// routes
router.route("/register").post(individualUserRegistration);
router.post('/signin', individualUserLogin) 

export default router;
