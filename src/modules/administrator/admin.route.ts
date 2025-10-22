import { Router } from "express";
import {
  onboardAMediator,
  getAllMediators,

  // buyerConProd,
} from "./admin.controller";
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";

const mediatorRouter = Router();

// we need a middleware that checks if you should be in here

mediatorRouter.route("/onboard-mediator").post(onboardAMediator);

mediatorRouter.route("/fetch-all-mediators").get(getAllMediators);

export default mediatorRouter;
