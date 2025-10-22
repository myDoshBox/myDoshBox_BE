import { Router } from "express";
import { asyncHandler } from "../../../middlewares/asyncHandler.middleware";
import {
  sellerConfirmsAnEscrowProductTransaction,
  sellerFillOutShippingDetails,
  buyerConfirmsProduct,
  getAllEscrowProductTransactionByUser,
  initiateEscrowProductTransaction,
  verifyEscrowProductTransactionPayment,
  getAllShippingDetails,
  getAllShippingDetailsWithAggregation,
  cancelEscrowProductTransaction,
} from "./productsTransaction.controller";
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";

const escrowProductTransactionRouter = Router();

// we need a middleware that checks if you should be in here

escrowProductTransactionRouter
  .route("/initiate-escrow-product-transaction")
  .post(asyncHandler(initiateEscrowProductTransaction));

escrowProductTransactionRouter
  .route("/seller-confirm-escrow-product-transaction")
  .post(asyncHandler(sellerConfirmsAnEscrowProductTransaction));

escrowProductTransactionRouter
  .route("/verify-escrow-product-transaction-payment")
  .put(asyncHandler(verifyEscrowProductTransactionPayment));

escrowProductTransactionRouter
  .route("/seller-fill-out-shipping-details")
  .post(asyncHandler(sellerFillOutShippingDetails));

escrowProductTransactionRouter
  .route("/get-all-escrow-product-transaction/:user_email")
  .get(asyncHandler(getAllEscrowProductTransactionByUser));

escrowProductTransactionRouter
  .route("/get-all-shipping-details/:user_email")
  .get(asyncHandler(getAllShippingDetails));

// GET ALL SHIPPING DETAILS WITH AGGREGATION
escrowProductTransactionRouter
  .route("/get-all-shipping-details-with-aggregation/:user_email")
  .get(asyncHandler(getAllShippingDetailsWithAggregation));

escrowProductTransactionRouter
  .route("/buyer-confirms-product")
  .put(asyncHandler(buyerConfirmsProduct));

escrowProductTransactionRouter
  .route("/cancel-transaction/:transaction_id")
  .put(asyncHandler(cancelEscrowProductTransaction));

export default escrowProductTransactionRouter;
