// controllers/adminStats.controller.enhanced.ts
import { Request, Response, NextFunction } from "express";
import { EnhancedAdminStatsService } from "../AdminServices/adminStats.service";
import { createError } from "../../../utilities/errorHandler.util";

/**
 * Get dashboard overview statistics with advanced filtering
 */
export const getDashboardStatsEnhanced = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { type, value, startDate, endDate } = req.query;

    // Build filter configuration
    const filterConfig: any = {
      type: type || "preset",
    };

    if (type === "custom" && startDate && endDate) {
      filterConfig.startDate = startDate as string;
      filterConfig.endDate = endDate as string;
    } else {
      filterConfig.value = (value || "today") as string;
    }

    const statsService = new EnhancedAdminStatsService();
    const stats = await statsService.getDashboardStats(filterConfig);

    res.status(200).json({
      status: "success",
      message: "Dashboard statistics fetched successfully",
      data: stats,
      filter: filterConfig,
    });
  } catch (error: any) {
    console.error("Error fetching enhanced dashboard stats:", error);
    return next(createError(500, "Failed to fetch dashboard statistics"));
  }
};

/**
 * Get comparison analytics between two periods
 */
export const getComparisonAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { currentStart, currentEnd, previousStart, previousEnd } = req.query;

    if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
      return next(
        createError(
          400,
          "currentStart, currentEnd, previousStart, and previousEnd are required",
        ),
      );
    }

    const statsService = new EnhancedAdminStatsService();

    // Get stats for both periods
    const [currentStats, previousStats] = await Promise.all([
      statsService.getDashboardStats({
        type: "custom",
        startDate: currentStart as string,
        endDate: currentEnd as string,
      }),
      statsService.getDashboardStats({
        type: "custom",
        startDate: previousStart as string,
        endDate: previousEnd as string,
      }),
    ]);

    res.status(200).json({
      status: "success",
      message: "Comparison analytics fetched successfully",
      data: {
        current: currentStats,
        previous: previousStats,
        comparison: currentStats.comparison,
      },
    });
  } catch (error: any) {
    console.error("Error fetching comparison analytics:", error);
    return next(createError(500, "Failed to fetch comparison analytics"));
  }
};

/**
 * Get transaction funnel analytics
 */
export const getTransactionFunnel = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const statsService = new EnhancedAdminStatsService();
    const stats = await statsService.getDashboardStats({
      type: "custom",
      startDate: startDate as string,
      endDate: endDate as string,
    });

    // Calculate funnel metrics
    const total = stats.overview.totalTransactions;
    const funnel = {
      initiated: total,
      paymentVerified:
        stats.transactions.awaitingPayment +
        stats.transactions.inTransit +
        stats.transactions.completed,
      shipped: stats.transactions.inTransit + stats.transactions.completed,
      delivered: stats.transactions.completed,
      completed: stats.transactions.completed,
      dropOffRates: {
        paymentVerification:
          total > 0
            ? (
                ((total -
                  (stats.transactions.awaitingPayment +
                    stats.transactions.inTransit +
                    stats.transactions.completed)) /
                  total) *
                100
              ).toFixed(2) + "%"
            : "0%",
        shipping:
          total > 0
            ? ((stats.transactions.awaitingPayment / total) * 100).toFixed(2) +
              "%"
            : "0%",
        delivery:
          total > 0
            ? ((stats.transactions.inTransit / total) * 100).toFixed(2) + "%"
            : "0%",
      },
    };

    res.status(200).json({
      status: "success",
      message: "Transaction funnel analytics fetched successfully",
      data: funnel,
    });
  } catch (error: any) {
    console.error("Error fetching transaction funnel:", error);
    return next(createError(500, "Failed to fetch transaction funnel"));
  }
};

/**
 * Get revenue projection
 */
export const getRevenueProjection = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate, projectionDays = "30" } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const statsService = new EnhancedAdminStatsService();
    const stats = await statsService.getDashboardStats({
      type: "custom",
      startDate: startDate as string,
      endDate: endDate as string,
    });

    const daysInPeriod = Math.ceil(
      (new Date(endDate as string).getTime() -
        new Date(startDate as string).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const dailyAverage = stats.financial.commissionEarned / daysInPeriod;
    const projectedRevenue = dailyAverage * parseInt(projectionDays as string);

    res.status(200).json({
      status: "success",
      message: "Revenue projection calculated successfully",
      data: {
        currentRevenue: stats.financial.commissionEarned,
        daysInPeriod,
        dailyAverage,
        projectionDays: parseInt(projectionDays as string),
        projectedRevenue,
        projectionPeriod: `${projectionDays} days`,
      },
    });
  } catch (error: any) {
    console.error("Error calculating revenue projection:", error);
    return next(createError(500, "Failed to calculate revenue projection"));
  }
};

/**
 * Get peak performance times
 */
export const getPeakPerformanceTimes = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const statsService = new EnhancedAdminStatsService();
    const stats = await statsService.getDashboardStats({
      type: "custom",
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.status(200).json({
      status: "success",
      message: "Peak performance times fetched successfully",
      data: stats.timeAnalytics,
    });
  } catch (error: any) {
    console.error("Error fetching peak performance times:", error);
    return next(createError(500, "Failed to fetch peak performance times"));
  }
};

/**
 * Export dashboard data to CSV
 */
export const exportDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { type, value, startDate, endDate, format = "json" } = req.query;

    const filterConfig: any = {
      type: type || "preset",
    };

    if (type === "custom" && startDate && endDate) {
      filterConfig.startDate = startDate as string;
      filterConfig.endDate = endDate as string;
    } else {
      filterConfig.value = (value || "today") as string;
    }

    const statsService = new EnhancedAdminStatsService();
    const stats = await statsService.getDashboardStats(filterConfig);

    if (format === "csv") {
      // Convert to CSV format
      let csv = "Metric,Value\n";
      csv += `Total Transactions,${stats.overview.totalTransactions}\n`;
      csv += `Active Disputes,${stats.overview.activeDisputes}\n`;
      csv += `Total Volume,${stats.financial.totalVolume}\n`;
      csv += `Commission Earned,${stats.financial.commissionEarned}\n`;
      // Add more fields as needed

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=dashboard-export-${Date.now()}.csv`,
      );
      res.send(csv);
    } else {
      // Return as JSON
      res.status(200).json({
        status: "success",
        message: "Dashboard data exported successfully",
        data: stats,
        exportedAt: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error("Error exporting dashboard data:", error);
    return next(createError(500, "Failed to export dashboard data"));
  }
};

/**
 * Get transaction analytics over time (from original controller)
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

    const statsService = new EnhancedAdminStatsService();

    const analytics = await statsService.getTransactionAnalytics(
      new Date(startDate as string),
      new Date(endDate as string),
      groupBy as string,
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
 * Get dispute analytics (from original controller)
 */
export const getDisputeAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const statsService = new EnhancedAdminStatsService();

    const analytics = await statsService.getTransactionAnalytics(
      new Date(startDate as string),
      new Date(endDate as string),
      "day",
    );

    res.status(200).json({
      status: "success",
      message: "Dispute analytics fetched successfully",
      data: analytics,
    });
  } catch (error: any) {
    console.error("Error fetching dispute analytics:", error);
    return next(createError(500, "Failed to fetch dispute analytics"));
  }
};

/**
 * Get top performing vendors or mediators (from original controller)
 */
export const getTopPerforming = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { type = "vendors", limit = "10" } = req.query;

    const statsService = new EnhancedAdminStatsService();
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
 * Get system health metrics (from original controller)
 */
export const getSystemHealth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const statsService = new EnhancedAdminStatsService();
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
