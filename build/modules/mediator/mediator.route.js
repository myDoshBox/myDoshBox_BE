"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mediator_controller_1 = require("./mediator.controller");
const roleVerification_middleware_1 = require("../../middlewares/roleVerification.middleware");
const asyncHandler_middleware_1 = require("../../middlewares/asyncHandler.middleware");
const mediatorRouter = (0, express_1.Router)();
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
mediatorRouter.route("/mediator-login").post((0, asyncHandler_middleware_1.asyncHandler)(mediator_controller_1.mediatorLogin));
// All routes below require authentication
mediatorRouter.use(roleVerification_middleware_1.verifyAuth);
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
    .post((0, roleVerification_middleware_1.restrictTo)(["ind", "g-ind", "org", "g-org"]), mediator_controller_1.involveAMediator);
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
    .post(roleVerification_middleware_1.mediatorOnly, mediator_controller_1.mediatorResolveDispute);
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
    .get(roleVerification_middleware_1.mediatorOnly, mediator_controller_1.getAllDisputeForAMediator);
exports.default = mediatorRouter;
