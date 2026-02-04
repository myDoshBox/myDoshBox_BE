// routes/adminStats.route.ts
import { Router } from "express";
import express from "express";
import {
  getDashboardStats,
  getTransactionAnalytics,
  getDisputeAnalytics,
  getTopPerforming,
  getSystemHealth,
} from "../AdminServices/adminStats.controller";
import {
  verifyAuth,
  adminOnly,
} from "../../../middlewares/roleVerification.middleware";
import { asyncHandler } from "../../../middlewares/asyncHandler.middleware";

const adminStatsRouter = Router();

// Middleware
adminStatsRouter.use(express.json());
adminStatsRouter.use(express.urlencoded({ extended: true }));

// All routes require authentication + admin role
adminStatsRouter.use(verifyAuth, adminOnly);

/**
 * @swagger
 * tags:
 *   name: Admin Statistics
 *   description: Admin dashboard statistics and analytics
 */

/**
 * @swagger
 * /admin/stats/dashboard:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *           default: today
 *         description: Time range for statistics
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Dashboard statistics fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalTransactions:
 *                           type: number
 *                           example: 1256
 *                         activeDisputes:
 *                           type: number
 *                           example: 12
 *                         pendingPayments:
 *                           type: number
 *                           example: 45
 *                         completedToday:
 *                           type: number
 *                           example: 23
 *                     financial:
 *                       type: object
 *                       properties:
 *                         totalVolume:
 *                           type: number
 *                           example: 4256087.50
 *                         commissionEarned:
 *                           type: number
 *                           example: 42560.88
 *                         pendingTransfers:
 *                           type: number
 *                           example: 125430.00
 *                         releasedToday:
 *                           type: number
 *                           example: 85000.00
 *                 timeRange:
 *                   type: string
 *                   example: today
 */
adminStatsRouter.route("/dashboard").get(asyncHandler(getDashboardStats));

/**
 * @swagger
 * /admin/stats/transactions/analytics:
 *   get:
 *     summary: Get transaction analytics over time
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *         description: Group results by
 *     responses:
 *       200:
 *         description: Transaction analytics retrieved successfully
 */
adminStatsRouter
  .route("/transactions/analytics")
  .get(asyncHandler(getTransactionAnalytics));

/**
 * @swagger
 * /admin/stats/disputes/analytics:
 *   get:
 *     summary: Get dispute analytics
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Dispute analytics retrieved successfully
 */
adminStatsRouter
  .route("/disputes/analytics")
  .get(asyncHandler(getDisputeAnalytics));

/**
 * @swagger
 * /admin/stats/top-performing:
 *   get:
 *     summary: Get top performers (vendors or mediators)
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [vendors, mediators]
 *           default: vendors
 *         description: Type of top performers
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Top performers retrieved successfully
 */
adminStatsRouter.route("/top-performing").get(asyncHandler(getTopPerforming));

/**
 * @swagger
 * /admin/stats/system-health:
 *   get:
 *     summary: Get system health metrics
 *     tags: [Admin Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health metrics retrieved successfully
 */
adminStatsRouter.route("/system-health").get(asyncHandler(getSystemHealth));

export default adminStatsRouter;
