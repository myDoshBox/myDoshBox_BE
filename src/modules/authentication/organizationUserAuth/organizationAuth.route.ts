import express, { Router } from "express";
import * as organizationController from "./organizationAuth.controller";

const router: Router = express.Router();

router.post("/login", organizationController.login);

router.post("/forgotPassword", organizationController.forgotPassword);
router.patch("/resetPassword/:token", organizationController.resetPassword);

export default router;
