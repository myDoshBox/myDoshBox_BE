import express, { Router } from "express";
import { individualUserRegistration } from "./individualUserAuth.controller";

const router: Router = express.Router();

router.post("/register", individualUserRegistration);
// router.post("/login", login);

// router.post("/forgotPassword", forgotPassword);
// router.patch("/resetPassword/:token", resetPassword);

export default router;
