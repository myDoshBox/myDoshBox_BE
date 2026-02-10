import { Request, Response, NextFunction } from "express";
import { AdminStatsService } from "../AdminServices/adminStats.service";
import { createError } from "../../../utilities/errorHandler.util";

import TransactionAnalytics from "../Analytics/transactionAnalytics.model";
import { verifyAnalyticsIntegrity } from "../Analytics/analyticsSync.utils";
import { bulkSyncToAnalytics } from "../Analytics/analyticsSync.utils";

/**
 * Get dashboard overview statistics
 */
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { timeRange = "today" } = req.query;

    const statsService = new AdminStatsService();
    const stats = await statsService.getDashboardStats(timeRange.toString());

    res.status(200).json({
      status: "success",
      message: "Dashboard statistics fetched successfully",
      data: stats,
      timeRange,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return next(createError(500, "Failed to fetch dashboard statistics"));
  }
};

/**
 * Get transaction analytics over time
 */
export const getTransactionAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const statsService = new AdminStatsService();

    const analytics = await statsService.getTransactionAnalytics(
      new Date(startDate as string),
      new Date(endDate as string),
      groupBy as "day" | "week" | "month",
    );

    res.status(200).json({
      status: "success",
      message: "Transaction analytics fetched successfully",
      data: analytics,
    });
  } catch (error: any) {
    console.error("Error fetching transaction analytics:", error);
    return next(createError(500, "Failed to fetch transaction analytics"));
  }
};

/**
 * Get top performing vendors or mediators
 */
export const getTopPerforming = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { type = "vendors", limit = "10" } = req.query;

    const statsService = new AdminStatsService();
    const limitNumber = parseInt(limit as string);

    let topPerformers;
    if (type === "vendors") {
      topPerformers = await statsService.getTopVendors(limitNumber);
    } else if (type === "mediators") {
      topPerformers = await statsService.getTopMediators(limitNumber);
    } else {
      return next(
        createError(
          400,
          "Invalid type parameter. Must be 'vendors' or 'mediators'",
        ),
      );
    }

    res.status(200).json({
      status: "success",
      message: "Top performers fetched successfully",
      data: topPerformers,
      type,
      limit: limitNumber,
    });
  } catch (error: any) {
    console.error("Error fetching top performers:", error);
    return next(createError(500, "Failed to fetch top performers"));
  }
};

/**
 * Get revenue trends over time
 */
export const getRevenueTrends = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = "month" } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const statsService = new AdminStatsService();

    const trends = await statsService.getRevenueTrends(
      groupBy as "day" | "month" | "quarter",
      new Date(startDate as string),
      new Date(endDate as string),
    );

    res.status(200).json({
      status: "success",
      message: "Revenue trends fetched successfully",
      data: trends,
    });
  } catch (error: any) {
    console.error("Error fetching revenue trends:", error);
    return next(createError(500, "Failed to fetch revenue trends"));
  }
};

/**
 * Get financial summary
 */
export const getFinancialSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const summary = await TransactionAnalytics.getFinancialSummary(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    res.status(200).json({
      status: "success",
      message: "Financial summary fetched successfully",
      data: summary[0] || {},
    });
  } catch (error: any) {
    console.error("Error fetching financial summary:", error);
    return next(createError(500, "Failed to fetch financial summary"));
  }
};

/**
 * Get transaction breakdown by status
 */
export const getTransactionBreakdown = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const breakdown = await TransactionAnalytics.getStatusBreakdown(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    res.status(200).json({
      status: "success",
      message: "Transaction breakdown fetched successfully",
      data: breakdown,
    });
  } catch (error: any) {
    console.error("Error fetching transaction breakdown:", error);
    return next(createError(500, "Failed to fetch transaction breakdown"));
  }
};

/**
 * Get system health metrics
 */
export const getSystemHealth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const statsService = new AdminStatsService();
    const healthMetrics = await statsService.getSystemHealth();

    res.status(200).json({
      status: "success",
      message: "System health metrics fetched successfully",
      data: healthMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching system health:", error);
    return next(createError(500, "Failed to fetch system health metrics"));
  }
};

/**
 * Verify analytics data integrity
 * Admin utility endpoint to check if all transactions have analytics
 */
export const verifyAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    console.log(`Admin ${req.user?.email} is verifying analytics integrity`);

    const integrity = await verifyAnalyticsIntegrity();

    const status =
      integrity.missing_analytics.length === 0 &&
      integrity.orphaned_analytics.length === 0
        ? "healthy"
        : integrity.missing_analytics.length > 0
          ? "missing_data"
          : "has_orphans";

    res.status(200).json({
      status: "success",
      message: "Analytics integrity check completed",
      data: {
        status,
        total_transactions: integrity.total_transactions,
        total_analytics: integrity.total_analytics,
        missing_count: integrity.missing_analytics.length,
        orphaned_count: integrity.orphaned_analytics.length,
        missing_analytics:
          integrity.missing_analytics.length <= 10
            ? integrity.missing_analytics
            : [
                ...integrity.missing_analytics.slice(0, 10),
                `... and ${integrity.missing_analytics.length - 10} more`,
              ],
        orphaned_analytics:
          integrity.orphaned_analytics.length <= 10
            ? integrity.orphaned_analytics
            : [
                ...integrity.orphaned_analytics.slice(0, 10),
                `... and ${integrity.orphaned_analytics.length - 10} more`,
              ],
      },
    });
  } catch (error: any) {
    console.error("Error verifying analytics:", error);
    return next(createError(500, "Failed to verify analytics integrity"));
  }
};

/**
 * Manually trigger analytics sync
 * Admin utility endpoint to sync missing analytics
 */
export const syncAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    console.log(`Admin ${req.user?.email} is triggering analytics sync`);

    const results = await bulkSyncToAnalytics();

    res.status(200).json({
      status: "success",
      message: "Analytics sync completed",
      data: {
        success: results.success,
        failed: results.failed,
        skipped: results.skipped,
        total: results.success + results.failed + results.skipped,
      },
    });
  } catch (error: any) {
    console.error("Error syncing analytics:", error);
    return next(createError(500, "Failed to sync analytics"));
  }
};
