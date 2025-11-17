import { Router } from "express";
import {
  mediatorLogin,
  involveAMediator,
  getAllDisputeForAMediator,
  mediatorResolveDispute,
} from "./mediator.controller";
import {
  verifyAuth,
  mediatorOnly,
  restrictTo,
} from "../../middlewares/roleVerification.middleware";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

const mediatorRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Mediator
 *   description: Mediator operations for dispute resolution
 */

/**
 * @swagger
 *   /mediator/mediator-login:
 *     post:
 *       summary: Mediator login
 *       tags: [Mediator]
 */
mediatorRouter.route("/mediator-login").post(asyncHandler(mediatorLogin));

// All routes below require authentication
mediatorRouter.use(verifyAuth);

/**
 * @swagger
 *   /mediator/involve-a-mediator/{transaction_id}:
 *     post:
 *       summary: Involve a mediator in a dispute (Individual/Organization only)
 *       tags: [Mediator]
 *       security:
 *         - bearerAuth: []
 */
mediatorRouter
  .route("/involve-a-mediator/:transaction_id")
  .post(restrictTo(["ind", "g-ind", "org", "g-org"]), involveAMediator);

/**
 * @swagger
 *   /mediator/resolve-dispute/{transaction_id}:
 *     post:
 *       summary: Resolve a dispute (Mediator only)
 *       tags: [Mediator]
 *       security:
 *         - bearerAuth: []
 */
mediatorRouter
  .route("/resolve-dispute/:transaction_id")
  .post(mediatorOnly, mediatorResolveDispute);

/**
 * @swagger
 *   /mediator/fetch-all-mediator-dispute/{mediator_email}:
 *     get:
 *       summary: Get all disputes for a mediator (Mediator only)
 *       tags: [Mediator]
 *       security:
 *         - bearerAuth: []
 */
mediatorRouter
  .route("/fetch-all-mediator-dispute/:mediator_email")
  .get(mediatorOnly, getAllDisputeForAMediator);

export default mediatorRouter;
