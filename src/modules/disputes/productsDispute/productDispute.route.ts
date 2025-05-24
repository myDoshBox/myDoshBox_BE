import { Router } from "express";
import {
  raiseDispute,
  // buyerConProd,
} from "./productDispute.controller";
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";

const escrowProductDisputeRouter = Router();

// we need a middleware that checks if you should be in here

escrowProductDisputeRouter
  .route("/raise-dispute/:transaction_id")
  .get(raiseDispute);

export default escrowProductDisputeRouter;
