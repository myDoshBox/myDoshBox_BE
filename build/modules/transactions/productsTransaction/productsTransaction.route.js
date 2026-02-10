"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_middleware_1 = require("../../../middlewares/asyncHandler.middleware");
const productsTransaction_controller_1 = require("./productsTransaction.controller");
const roleVerification_middleware_1 = require("../../../middlewares/roleVerification.middleware");
const escrowProductTransactionRouter = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Escrow Product Transactions
 *   description: Product transaction operations for individuals and organizations
 */
// All routes require authentication
escrowProductTransactionRouter.use(roleVerification_middleware_1.verifyAuth);
// Multi-role permission: Individual and Organization users only
// Allowed roles: 'ind', 'g-ind', 'org', 'g-org'
escrowProductTransactionRouter.use((0, roleVerification_middleware_1.restrictTo)(["ind", "g-ind", "org"]));
/**
 * @swagger
 *   /escrow-product-transaction/initiate-escrow-product-transaction:
 *     post:
 *       summary: Initiate a new escrow product transaction
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/initiate-escrow-product-transaction")
    .post((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.initiateEscrowProductTransaction));
/**
 * @swagger
 *   /escrow-product-transaction/seller-confirm-escrow-product-transaction:
 *     post:
 *       summary: Seller confirms the escrow product transaction
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/edit-escrow-product-transaction/:transaction_id")
    .put((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.editEscrowProductTransaction));
/**
 * @swagger
 *   /edit-escrow-product-transaction/:transaction_id
 *     put:
 *       summary: Buyer edits escrow product transaction
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/seller-confirm-escrow-product-transaction")
    .post((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.sellerConfirmsAnEscrowProductTransaction));
/**
 * @swagger
 *   /escrow-product-transaction/verify-escrow-product-transaction-payment:
 *     put:
 *       summary: Verify payment for escrow product transaction
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/verify-escrow-product-transaction-payment")
    .put((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.verifyEscrowProductTransactionPayment));
/**
 * @swagger
 *   /escrow-product-transaction/seller-fill-out-shipping-details:
 *     post:
 *       summary: Seller fills out shipping details
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/seller-fill-out-shipping-details")
    .post((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.sellerFillOutShippingDetails));
/**
 * @swagger
 *   /escrow-product-transaction/get-all-escrow-product-transaction/{user_email}:
 *     get:
 *       summary: Get all escrow product transactions for a user
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/get-all-escrow-product-transaction/:user_email")
    .get((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.getAllEscrowProductTransactionByUser));
/**
 * @swagger
 *   /get-single-escrow-product-transaction/:transaction_id}:
 *     get:
 *       summary: Get all escrow product transactions for a user
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/get-single-escrow-product-transaction/:transaction_id")
    .get((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.getSingleEscrowProductTransaction));
/**
 * @swagger
 *   /escrow-product-transaction/get-all-shipping-details/{user_email}:
 *     get:
 *       summary: Get all shipping details for a user
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/get-all-shipping-details/:user_email")
    .get((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.getAllShippingDetails));
/**
 * @swagger
 *   /escrow-product-transaction/get-all-shipping-details-with-aggregation/{user_email}:
 *     get:
 *       summary: Get all shipping details with aggregation for a user
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/get-all-shipping-details-with-aggregation/:user_email")
    .get((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.getAllShippingDetailsWithAggregation));
/**
 * @swagger
 *   /get-payment-status/transaction_id:
 *     get:
 *       summary: Get payments status and details for a particular transaction
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/get-payment-status/:transaction_id")
    .get((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.getPaymentStatus));
/**
 * @swagger
 *   /escrow-product-transaction/buyer-confirms-product:
 *     put:
 *       summary: Buyer confirms receipt of product
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/buyer-confirms-product")
    .put((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.buyerConfirmsProduct));
/**
 * @swagger
 *   /escrow-product-transaction/cancel-transaction/{transaction_id}:
 *     put:
 *       summary: Cancel an escrow product transaction
 *       tags: [Escrow Product Transactions]
 *       security:
 *         - bearerAuth: []
 */
escrowProductTransactionRouter
    .route("/cancel-transaction/:transaction_id")
    .put((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.cancelEscrowProductTransaction));
exports.default = escrowProductTransactionRouter;
