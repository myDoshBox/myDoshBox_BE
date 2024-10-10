import { Router } from "express";
import {
  BuyerConfirmEscrowProductTransaction,
  getAllEscrowProductTransactionByUser,
  getSingleEscrowProductTransaction,
  initiateEscrowProductTransaction,
  verifyEscrowProductTransactionPayment,
} from "./productsTransaction.controller";
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";

const escrowProductTransactionRouter = Router();

// we need a middleware that checks if you should be in here

escrowProductTransactionRouter
  .route("/initiate-escrow-product-transaction")
  .post(initiateEscrowProductTransaction);

// escrowProductTransactionRouter
//   .route("/initiate-escrow-product-transaction")
//   .post(protectRoutes, initiateEscrowProductTransaction);

escrowProductTransactionRouter
  .route("/verify-escrow-product-transaction-payment")
  .put(verifyEscrowProductTransactionPayment);

escrowProductTransactionRouter
  .route("/get-single-escrow-product-transaction/:transaction_id")
  .get(getSingleEscrowProductTransaction);

escrowProductTransactionRouter
  .route("/get-all-escrow-product-transaction/:buyer_email")
  .get(getAllEscrowProductTransactionByUser);

escrowProductTransactionRouter
  .route("/confirm-escrow-product-transaction")
  .post(BuyerConfirmEscrowProductTransaction);

// escrowProductTransactionRouter
//   .route("/pay-for-escrow-product-transaction")
//   .post(confirmEscrowProductTransaction);

export default escrowProductTransactionRouter;