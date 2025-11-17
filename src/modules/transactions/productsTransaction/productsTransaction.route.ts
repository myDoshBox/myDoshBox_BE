// import { Router } from "express";
// import { asyncHandler } from "../../../middlewares/asyncHandler.middleware";
// import {
//   sellerConfirmsAnEscrowProductTransaction,
//   sellerFillOutShippingDetails,
//   buyerConfirmsProduct,
//   getAllEscrowProductTransactionByUser,
//   initiateEscrowProductTransaction,
//   verifyEscrowProductTransactionPayment,
//   getAllShippingDetails,
//   getAllShippingDetailsWithAggregation,
//   cancelEscrowProductTransaction,
// } from "./productsTransaction.controller";
// // import protectRoutes from "../../../middlewares/protectRoutes.middleware";

// const escrowProductTransactionRouter = Router();

// // we need a middleware that checks if you should be in here

// escrowProductTransactionRouter
//   .route("/initiate-escrow-product-transaction")
//   .post(asyncHandler(initiateEscrowProductTransaction));

// escrowProductTransactionRouter
//   .route("/seller-confirm-escrow-product-transaction")
//   .post(asyncHandler(sellerConfirmsAnEscrowProductTransaction));

// escrowProductTransactionRouter
//   .route("/verify-escrow-product-transaction-payment")
//   .put(asyncHandler(verifyEscrowProductTransactionPayment));

// escrowProductTransactionRouter
//   .route("/seller-fill-out-shipping-details")
//   .post(asyncHandler(sellerFillOutShippingDetails));

// escrowProductTransactionRouter
//   .route("/get-all-escrow-product-transaction/:user_email")
//   .get(asyncHandler(getAllEscrowProductTransactionByUser));

// escrowProductTransactionRouter
//   .route("/get-all-shipping-details/:user_email")
//   .get(asyncHandler(getAllShippingDetails));

// // GET ALL SHIPPING DETAILS WITH AGGREGATION
// escrowProductTransactionRouter
//   .route("/get-all-shipping-details-with-aggregation/:user_email")
//   .get(asyncHandler(getAllShippingDetailsWithAggregation));

// escrowProductTransactionRouter
//   .route("/buyer-confirms-product")
//   .put(asyncHandler(buyerConfirmsProduct));

// escrowProductTransactionRouter
//   .route("/cancel-transaction/:transaction_id")
//   .put(asyncHandler(cancelEscrowProductTransaction));

// export default escrowProductTransactionRouter;
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
import {
  verifyAuth,
  restrictTo,
} from "../../../middlewares/roleVerification.middleware";

const escrowProductTransactionRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Escrow Product Transactions
 *   description: Product transaction operations for individuals and organizations
 */

// All routes require authentication
escrowProductTransactionRouter.use(verifyAuth);

// Multi-role permission: Individual and Organization users only
// Allowed roles: 'ind', 'g-ind', 'org', 'g-org'
escrowProductTransactionRouter.use(restrictTo(["ind", "g-ind", "org"]));

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
  .post(asyncHandler(initiateEscrowProductTransaction));

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
  .route("/seller-confirm-escrow-product-transaction")
  .post(asyncHandler(sellerConfirmsAnEscrowProductTransaction));

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
  .put(asyncHandler(verifyEscrowProductTransactionPayment));

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
  .post(asyncHandler(sellerFillOutShippingDetails));

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
  .get(asyncHandler(getAllEscrowProductTransactionByUser));

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
  .get(asyncHandler(getAllShippingDetails));

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
  .get(asyncHandler(getAllShippingDetailsWithAggregation));

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
  .put(asyncHandler(buyerConfirmsProduct));

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
  .put(asyncHandler(cancelEscrowProductTransaction));

export default escrowProductTransactionRouter;
