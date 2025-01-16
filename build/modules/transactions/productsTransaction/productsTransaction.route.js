"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productsTransaction_controller_1 = require("./productsTransaction.controller");
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";
const escrowProductTransactionRouter = (0, express_1.Router)();
// we need a middleware that checks if you should be in here
escrowProductTransactionRouter
    .route("/initiate-escrow-product-transaction")
    .post(productsTransaction_controller_1.initiateEscrowProductTransaction);
// escrowProductTransactionRouter
//   .route("/initiate-escrow-product-transaction")
//   .post(protectRoutes, initiateEscrowProductTransaction);
escrowProductTransactionRouter
    .route("/verify-escrow-product-transaction-payment")
    .put(productsTransaction_controller_1.verifyEscrowProductTransactionPayment);
escrowProductTransactionRouter
    .route("/get-single-escrow-product-transaction/:transaction_id")
    .get(productsTransaction_controller_1.getSingleEscrowProductTransaction);
escrowProductTransactionRouter
    .route("/get-all-escrow-product-transaction/:user_email")
    .get(productsTransaction_controller_1.getAllEscrowProductTransactionByUser);
escrowProductTransactionRouter
    .route("/seller-confirm-escrow-product-transaction")
    .post(productsTransaction_controller_1.sellerConfirmsEscrowProductTransaction);
escrowProductTransactionRouter
    .route("/seller-fill-out-shipping-details")
    .post(productsTransaction_controller_1.sellerFillOutShippingDetails);
escrowProductTransactionRouter
    .route("/get-all-shipping-details/buyer/:user_email")
    .get(productsTransaction_controller_1.getAllShippingDetailsForBuyer);
escrowProductTransactionRouter
    .route("/get-all-shipping-details/vendor/:vendor_email")
    .get(productsTransaction_controller_1.getAllShippingDetailsForVendor);
// escrowProductTransactionRouter
//   .route("/get-all-shipping-details/:buyer_email?/:vendor_email")
//   .get(getAllShippingDetails);
escrowProductTransactionRouter
    .route("/get-all-shipping-details/:buyer_email")
    .get(productsTransaction_controller_1.getAllShippingDetails);
escrowProductTransactionRouter
    .route("/buyer-confirms-product")
    .put(productsTransaction_controller_1.buyerConfirmsProduct);
// escrowProductTransactionRouter
//   .route("/pay-for-escrow-product-transaction")
//   .post(confirmEscrowProductTransaction);
exports.default = escrowProductTransactionRouter;
