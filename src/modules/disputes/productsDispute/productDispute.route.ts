import { Router } from "express";
import {
  raiseDispute,
  getAllDisputesByUser,
  buyerResolveDispute,
  sellerResolveDispute,
  // buyerConProd,
} from "./productDispute.controller";
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";

const escrowProductDisputeRouter = Router();

// we need a middleware that checks if you should be in here

escrowProductDisputeRouter
  .route("/raise-dispute/:transaction_id")
  .post(raiseDispute);

escrowProductDisputeRouter
  .route("/fetch-all-dispute/:user_email")
  .get(getAllDisputesByUser);

escrowProductDisputeRouter
  .route("/buyer-resolve-conflict/:transaction_id")
  .put(buyerResolveDispute);

escrowProductDisputeRouter
  .route("/seller-resolve-conflict/:transaction_id")
  .put(sellerResolveDispute);

export default escrowProductDisputeRouter;
