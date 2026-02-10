"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const admin_controller_1 = require("./admin.controller");
const roleVerification_middleware_1 = require("../../middlewares/roleVerification.middleware");
const asyncHandler_middleware_1 = require("../../middlewares/asyncHandler.middleware");
const adminRouter = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only operations
 */
adminRouter.use(express_2.default.json());
adminRouter.use(express_2.default.urlencoded({ extended: true }));
// All routes require authentication + admin role
adminRouter.use(roleVerification_middleware_1.verifyAuth, roleVerification_middleware_1.adminOnly);
/**
 * @swagger
 *   /admin/onboard-mediator:
 *     post:
 *       summary: Onboard a new mediator (Admin only)
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 */
adminRouter.route("/onboard-mediator").post((0, asyncHandler_middleware_1.asyncHandler)(admin_controller_1.onboardAMediator));
/**
 * @swagger
 *   /admin/fetch-all-mediators:
 *     get:
 *       summary: Get all mediators (Admin only)
 *       tags: [Admin]
 *       security:
 *         - bearerAuth: []
 */
adminRouter.route("/fetch-all-mediators").get((0, asyncHandler_middleware_1.asyncHandler)(admin_controller_1.getAllMediators));
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
    .get((0, asyncHandler_middleware_1.asyncHandler)(admin_controller_1.getMediatorById));
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
    .delete((0, asyncHandler_middleware_1.asyncHandler)(admin_controller_1.deleteMediator));
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
    .put((0, asyncHandler_middleware_1.asyncHandler)(admin_controller_1.updateMediator));
exports.default = adminRouter;
