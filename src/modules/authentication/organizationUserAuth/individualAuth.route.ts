import Router from "express";
import { organizationRegister } from "./individualUserAuth.controller";

const router = Router();

router.post("/register", organizationRegister)

export default router; 