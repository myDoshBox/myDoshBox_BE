import express from "express";
import {
  getDashboardStatsHandler,
  getTransactionAnalyticsHandler,
  getRevenueTrendsHandler,
  getTopPerformersHandler,
  getFinancialSummaryHandler,
  getSystemHealthHandler,
} from "./adminStats.controller";

const router = express.Router();

/**
 * @route   GET /admin/stats/dashboard
 * @desc    Full dashboard payload (overview, financial, transactions, disputes, users, activity)
 * @query   timeRange: "today" | "week" | "month" | "year"
 */
router.get("/dashboard", getDashboardStatsHandler);

/**
 * @route   GET /admin/stats/analytics
 * @desc    Time-series transaction data for charts
 * @query   startDate (required), endDate (required), groupBy: "day" | "week" | "month"
 */
router.get("/analytics", getTransactionAnalyticsHandler);

/**
 * @route   GET /admin/stats/revenue-trends
 * @desc    Revenue (commission) trends for charts
 * @query   startDate (required), endDate (required), groupBy: "day" | "month" | "quarter"
 */
router.get("/revenue-trends", getRevenueTrendsHandler);

/**
 * @route   GET /admin/stats/top-performers
 * @desc    Top vendors or mediators by volume
 * @query   type: "vendors" | "mediators", limit: number (default 10)
 */
router.get("/top-performers", getTopPerformersHandler);

/**
 * @route   GET /admin/stats/financial-summary
 * @desc    Detailed financial summary for a date range
 * @query   startDate (required), endDate (required)
 */
router.get("/financial-summary", getFinancialSummaryHandler);

/**
 * @route   GET /admin/stats/system-health
 * @desc    System health: transaction/payout/dispute counts by status
 */
router.get("/system-health", getSystemHealthHandler);

export default router;
