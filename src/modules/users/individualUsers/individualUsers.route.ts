import { Router } from "express";
import {
  getIndividualUser,
  getAllIndividualUsers,
  updateIndividualUser,
  deleteIndividualUser,
} from "./individualUsers.controller";

const router = Router();

router.get("/my-profile", getIndividualUser);
router.patch("/update-my-profile", updateIndividualUser);

export default router;
