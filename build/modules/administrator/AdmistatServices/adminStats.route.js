"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminStats_controller_1 = require("./adminStats.controller");
const router = express_1.default.Router();
/**
 * @route   GET /admin/stats/dashboard
 * @desc    Full dashboard payload (overview, financial, transactions, disputes, users, activity)
 * @query   timeRange: "today" | "week" | "month" | "year"
 */
router.get("/dashboard", adminStats_controller_1.getDashboardStatsHandler);
/**
 * @route   GET /admin/stats/analytics
 * @desc    Time-series transaction data for charts
 * @query   startDate (required), endDate (required), groupBy: "day" | "week" | "month"
 */
router.get("/analytics", adminStats_controller_1.getTransactionAnalyticsHandler);
/**
 * @route   GET /admin/stats/revenue-trends
 * @desc    Revenue (commission) trends for charts
 * @query   startDate (required), endDate (required), groupBy: "day" | "month" | "quarter"
 */
router.get("/revenue-trends", adminStats_controller_1.getRevenueTrendsHandler);
/**
 * @route   GET /admin/stats/top-performers
 * @desc    Top vendors or mediators by volume
 * @query   type: "vendors" | "mediators", limit: number (default 10)
 */
router.get("/top-performers", adminStats_controller_1.getTopPerformersHandler);
/**
 * @route   GET /admin/stats/financial-summary
 * @desc    Detailed financial summary for a date range
 * @query   startDate (required), endDate (required)
 */
router.get("/financial-summary", adminStats_controller_1.getFinancialSummaryHandler);
/**
 * @route   GET /admin/stats/system-health
 * @desc    System health: transaction/payout/dispute counts by status
 */
router.get("/system-health", adminStats_controller_1.getSystemHealthHandler);
exports.default = router;
