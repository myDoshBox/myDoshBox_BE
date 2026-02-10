import express from "express";
import {
  getDashboardStats,
  getTransactionAnalytics,
  getTopPerforming,
  getSystemHealth,
  getRevenueTrends,
  getFinancialSummary,
  getTransactionBreakdown,
  verifyAnalytics,
  syncAnalytics,
} from "./adminStats.controller";

const router = express.Router();

/**
 * Admin Stats Routes
 * All routes require admin authentication
 */

// Dashboard Overview
router.get("/dashboard", getDashboardStats);

// Transaction Analytics
router.get("/analytics/transactions", getTransactionAnalytics);

// Top Performers (vendors/mediators)
router.get("/top-performers", getTopPerforming);

// Revenue Trends
router.get("/revenue-trends", getRevenueTrends);

// Financial Summary
router.get("/financial-summary", getFinancialSummary);

// Transaction Breakdown
router.get("/transaction-breakdown", getTransactionBreakdown);

// System Health
router.get("/system-health", getSystemHealth);

// Analytics Verification (check data integrity)
router.get("/verify-analytics", verifyAnalytics);

// Manual Analytics Sync (for admin use)
router.post("/sync-analytics", syncAnalytics);

export default router;
