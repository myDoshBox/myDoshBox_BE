"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminStats_controller_1 = require("./adminStats.controller");
const router = express_1.default.Router();
/**
 * Admin Stats Routes
 * All routes require admin authentication
 */
// Dashboard Overview
router.get("/dashboard", adminStats_controller_1.getDashboardStats);
// Transaction Analytics
router.get("/analytics/transactions", adminStats_controller_1.getTransactionAnalytics);
// Top Performers (vendors/mediators)
router.get("/top-performers", adminStats_controller_1.getTopPerforming);
// Revenue Trends
router.get("/revenue-trends", adminStats_controller_1.getRevenueTrends);
// Financial Summary
router.get("/financial-summary", adminStats_controller_1.getFinancialSummary);
// Transaction Breakdown
router.get("/transaction-breakdown", adminStats_controller_1.getTransactionBreakdown);
// System Health
router.get("/system-health", adminStats_controller_1.getSystemHealth);
// Analytics Verification (check data integrity)
router.get("/verify-analytics", adminStats_controller_1.verifyAnalytics);
// Manual Analytics Sync (for admin use)
router.post("/sync-analytics", adminStats_controller_1.syncAnalytics);
exports.default = router;
