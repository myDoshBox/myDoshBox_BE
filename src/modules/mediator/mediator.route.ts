import { Router } from "express";
import {
  onboardAMediator,
  mediatorLogin,
  getAllMediators,
  involveAMediator,
  getAllDisputeForAMediator,
  resolveDispute,
  // buyerConProd,
} from "./mediator.controller";
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";

const mediatorRouter = Router();

// we need a middleware that checks if you should be in here

mediatorRouter.route("/onboard-mediator").post(onboardAMediator);

mediatorRouter.route("/mediator-login").post(mediatorLogin);

mediatorRouter.route("/fetch-all-mediators").get(getAllMediators);

mediatorRouter
  .route("/involve-a-mediator/:transaction_id")
  .post(involveAMediator);

mediatorRouter.route("/resolve-dispute/:transaction_id").post(resolveDispute);

mediatorRouter
  .route("/fetch-all-mediator-dispute/:mediator_email")
  .get(getAllDisputeForAMediator);

export default mediatorRouter;
