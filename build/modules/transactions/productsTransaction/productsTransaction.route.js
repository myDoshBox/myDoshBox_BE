"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productsTransaction_controller_1 = require("./productsTransaction.controller");
const escrowProductTransactionRouter = (0, express_1.Router)();
escrowProductTransactionRouter
    .route("/initiate-escrow-product-transaction")
    .post(productsTransaction_controller_1.initiateEscrowProductTransaction);
escrowProductTransactionRouter
    .route("/confirm-escrow-product-transaction")
    .post(productsTransaction_controller_1.confirmEscrowProductTransaction);
escrowProductTransactionRouter
    .route("/pay-for-escrow-product-transaction")
    .post(productsTransaction_controller_1.confirmEscrowProductTransaction);
exports.default = escrowProductTransactionRouter;
