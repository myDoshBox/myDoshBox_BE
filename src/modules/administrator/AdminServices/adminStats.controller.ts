// controllers/adminStats.controller.ts
import { AdminStatsService } from "../AdminServices/adminStats.service";
import { Request, Response, NextFunction } from "express";
import { createError } from "../../../utilities/errorHandler.util";
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
 * Get dispute analytics
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

    const statsService = new AdminStatsService();

    const analytics = await statsService.getTransactionAnalytics(
      new Date(startDate as string),
      new Date(endDate as string),
      "day",
    );

    // Since we're reusing transaction analytics for disputes in this example
    // In a real implementation, you'd have a separate method for dispute analytics
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
