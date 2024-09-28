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
    .route("/confirm-escrow-product-transaction")
    .post(productsTransaction_controller_1.confirmEscrowProductTransaction);
escrowProductTransactionRouter
    .route("/pay-for-escrow-product-transaction")
    .post(productsTransaction_controller_1.confirmEscrowProductTransaction);
exports.default = escrowProductTransactionRouter;
