import { Router } from "express";
import {
  // sellerConfirmsAnEscrowProductTransaction,
  // sellerConfirmsAnEscrowProductTransaction,
  sellerFillOutShippingDetails,
  buyerConfirmsProduct,
  getAllEscrowProductTransactionByUser,
  // getSingleEscrowProductTransaction,
  initiateEscrowProductTransaction,
  verifyEscrowProductTransactionPayment,
  getAllShippingDetails,
  cancelEscrowProductTransaction,
  // getAllShippingDetailsForBuyer,
  // getAllShippingDetailsForVendor,
  // buyerConProd,
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

// escrowProductTransactionRouter
//   .route("/get-single-escrow-product-transaction/:transaction_id")
//   .get(getSingleEscrowProductTransaction);

escrowProductTransactionRouter
  .route("/get-all-escrow-product-transaction/:user_email")
  .get(getAllEscrowProductTransactionByUser);

// escrowProductTransactionRouter
//   .route("/seller-confirm-escrow-product-transaction")
//   .post(sellerConfirmsAnEscrowProductTransaction);

// escrowProductTransactionRouter
//   .route("/get-all-escrow-product-transaction/:user_email")
//   .get(sellerConfirmsAnEscrowProductTransaction);

escrowProductTransactionRouter
  .route("/seller-fill-out-shipping-details")
  .post(sellerFillOutShippingDetails);

// escrowProductTransactionRouter
//   .route("/seller-fill-out-shipping-details")
//   .post(sellerFillOutShippingDetails);

// escrowProductTransactionRouter
//   .route("/get-all-shipping-details/buyer/:buyer_email")
//   .get(getAllShippingDetailsForBuyer);

// escrowProductTransactionRouter
//   .route("/get-all-shipping-details/vendor/:vendor_email")
//   .get(getAllShippingDetailsForVendor);

// escrowProductTransactionRouter
//   .route("/get-all-shipping-details/:buyer_email?/:vendor_email")
//   .get(getAllShippingDetails);

escrowProductTransactionRouter
  .route("/get-all-shipping-details/:user_email")
  .get(getAllShippingDetails);

escrowProductTransactionRouter
  .route("/buyer-confirms-product")
  .put(buyerConfirmsProduct);

// escrowProductTransactionRouter
//   .route("/buyer-confirms-product/:transaction_id")
//   .put(buyerConfirmsProduct);

// escrowProductTransactionRouter
//   .route("/pay-for-escrow-product-transaction")
//   .post(confirmEscrowProductTransaction);
escrowProductTransactionRouter
  .route("/cancel-transaction/:transaction_id")
  .post(cancelEscrowProductTransaction);

export default escrowProductTransactionRouter;
