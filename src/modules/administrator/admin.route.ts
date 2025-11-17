import { Router } from "express";
import express from "express";
import {
  onboardAMediator,
  getAllMediators,
  getMediatorById,
  deleteMediator,
  updateMediator,
} from "./admin.controller";
import {
  verifyAuth,
  adminOnly,
  superAdminOnly,
  restrictTo,
} from "../../middlewares/roleVerification.middleware";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

const adminRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only operations
 */

adminRouter.use(express.json());
adminRouter.use(express.urlencoded({ extended: true }));

// All routes require authentication + admin role
adminRouter.use(verifyAuth, adminOnly);

/**
 * @swagger
 *   /admin/onboard-mediator:
 *     post:
 *       summary: Onboard a new mediator (Admin only)
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 */
adminRouter.route("/onboard-mediator").post(asyncHandler(onboardAMediator));

/**
 * @swagger
 *   /admin/fetch-all-mediators:
 *     get:
 *       summary: Get all mediators (Admin only)
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 */
adminRouter.route("/fetch-all-mediators").get(asyncHandler(getAllMediators));

/**
 * @swagger
 *   /admin/getMediator-ById:
 *     get:
 *       summary: Get mediator by ID (Admin only)
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 */
adminRouter
  .route("/getMediator-ById/:mediatorId")
  .get(asyncHandler(getMediatorById));

/**
 * @swagger
 *   /admin/deleteMediator:
 *     delete:
 *       summary: Delete Mediator (Admin only)
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 */
adminRouter
  .route("/delete-Mediator/:mediatorId")
  .delete(asyncHandler(deleteMediator));

/**
 * @swagger
 *   /admin/update-Mediator:
 *     put:
 *       summary: Update Mediator (Admin only)
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 */
adminRouter
  .route("/update-Mediator/:mediatorId")
  .put(asyncHandler(updateMediator));

export default adminRouter;
