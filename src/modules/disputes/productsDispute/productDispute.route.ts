// import { Router } from "express";
// import {
//   raiseDispute,
//   getAllDisputesByUser,
//   buyerResolveDispute,
//   sellerResolveDispute,
//   // buyerConProd,
// } from "./productDispute.controller";
// // import protectRoutes from "../../../middlewares/protectRoutes.middleware";

// const escrowProductDisputeRouter = Router();

// // we need a middleware that checks if you should be in here

// escrowProductDisputeRouter
//   .route("/raise-dispute/:transaction_id")
//   .post(raiseDispute);

// escrowProductDisputeRouter
//   .route("/fetch-all-dispute/:user_email")
//   .get(getAllDisputesByUser);

// escrowProductDisputeRouter
//   .route("/buyer-resolve-conflict/:transaction_id")
//   .put(buyerResolveDispute);

// escrowProductDisputeRouter
//   .route("/seller-resolve-conflict/:transaction_id")
//   .put(sellerResolveDispute);

// export default escrowProductDisputeRouter;

import { Router } from "express";
import {
  raiseDispute,
  getAllDisputesByUser,
  getDisputeDetails,
  proposeResolution,
  respondToResolution,
  requestMediator,
  cancelDispute,
} from "./productDispute.controller";
import { verifyAuth } from "../../../middlewares/roleVerification.middleware";
import { asyncHandler } from "../../../middlewares/asyncHandler.middleware";

const escrowProductDisputeRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Product Disputes
 *   description: Enhanced dispute resolution with proposal tracking
 */

/**
 * @swagger
 * /disputes/raise-dispute/{transaction_id}:
 *   post:
 *     summary: Raise a new dispute for a transaction
 *     tags: [Product Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_email
 *               - buyer_email
 *               - vendor_email
 *               - reason_for_dispute
 *               - dispute_description
 *             properties:
 *               user_email:
 *                 type: string
 *               buyer_email:
 *                 type: string
 *               vendor_name:
 *                 type: string
 *               vendor_email:
 *                 type: string
 *               vendor_phone_number:
 *                 type: string
 *               product_name:
 *                 type: string
 *               product_image:
 *                 type: string
 *               disputed_products:
 *                 type: array
 *                 items:
 *                   type: object
 *               reason_for_dispute:
 *                 type: string
 *               dispute_description:
 *                 type: string
 */
escrowProductDisputeRouter
  .route("/raise-dispute/:transaction_id")
  .post(verifyAuth, asyncHandler(raiseDispute));

/**
 * @swagger
 * /disputes/propose-resolution/{transaction_id}:
 *   post:
 *     summary: Propose a resolution (buyer or seller)
 *     tags: [Product Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolution_description:
 *                 type: string
 *                 description: Description of the proposed resolution
 *               vendor_name:
 *                 type: string
 *               vendor_phone_number:
 *                 type: string
 *               vendor_email:
 *                 type: string
 *               transaction_type:
 *                 type: string
 *               updated_products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     image:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *                     description:
 *                       type: string
 *               transaction_total:
 *                 type: number
 *               signed_escrow_doc:
 *                 type: string
 *               delivery_address:
 *                 type: string
 */
escrowProductDisputeRouter
  .route("/propose-resolution/:transaction_id")
  .post(verifyAuth, asyncHandler(proposeResolution));

/**
 * @swagger
 * /disputes/respond-resolution/{transaction_id}:
 *   post:
 *     summary: Accept or reject a proposed resolution
 *     tags: [Product Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *               rejection_reason:
 *                 type: string
 *                 description: Required if action is 'reject'
 */
escrowProductDisputeRouter
  .route("/respond-resolution/:transaction_id")
  .post(verifyAuth, asyncHandler(respondToResolution));

/**
 * @swagger
 * /disputes/request-mediator/{transaction_id}:
 *   post:
 *     summary: Request mediator involvement at any time
 *     tags: [Product Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 */
escrowProductDisputeRouter
  .route("/request-mediator/:transaction_id")
  .post(verifyAuth, asyncHandler(requestMediator));

/**
 * @swagger
 * /disputes/cancel-dispute/{transaction_id}:
 *   post:
 *     summary: Cancel dispute (mutual agreement)
 *     tags: [Product Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 */
escrowProductDisputeRouter
  .route("/cancel-dispute/:transaction_id")
  .post(verifyAuth, asyncHandler(cancelDispute));

/**
 * @swagger
 * /disputes/fetch-all-dispute/{user_email}:
 *   get:
 *     summary: Get all disputes for a user
 *     tags: [Product Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_email
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 */
escrowProductDisputeRouter
  .route("/fetch-all-dispute/:user_email")
  .get(verifyAuth, asyncHandler(getAllDisputesByUser));

/**
 * @swagger
 * /disputes/details/{transaction_id}:
 *   get:
 *     summary: Get detailed dispute information with resolution history
 *     tags: [Product Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transaction_id
 *         required: true
 *         schema:
 *           type: string
 */
escrowProductDisputeRouter
  .route("/details/:transaction_id")
  .get(verifyAuth, asyncHandler(getDisputeDetails));

export default escrowProductDisputeRouter;
