import { Request, Response, NextFunction } from "express";
import { createError } from "../../../utilities/errorHandler.util";
import {
  getDashboardStats,
  getTransactionAnalytics,
  getRevenueTrends,
  getTopVendors,
  getTopMediators,
  getFinancialSummary,
  getSystemHealth,
  getDateRange,
} from "./adminStats.service";

/**
 * GET /admin/stats/dashboard?timeRange=today|week|month|year
 *
 * Returns the full dashboard payload:
 * overview, financial, transactions, disputes, users, recentActivity
 */
export const getDashboardStatsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const timeRange = (req.query.timeRange as string) || "today";
    const stats = await getDashboardStats(timeRange);

    res.status(200).json({
      status: "success",
      message: "Dashboard statistics fetched successfully",
      data: stats,
    });
  } catch (error: any) {
    console.error("getDashboardStats error:", error);
    return next(createError(500, "Failed to fetch dashboard statistics"));
  }
};

/**
 * GET /admin/stats/analytics?startDate=&endDate=&groupBy=day|week|month
 *
 * Returns time-series transaction data for charts.
 */
export const getTransactionAnalyticsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const data = await getTransactionAnalytics(
      new Date(startDate as string),
      new Date(endDate as string),
      groupBy as "day" | "week" | "month",
    );

    res.status(200).json({
      status: "success",
      message: "Transaction analytics fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("getTransactionAnalytics error:", error);
    return next(createError(500, "Failed to fetch transaction analytics"));
  }
};

/**
 * GET /admin/stats/revenue-trends?startDate=&endDate=&groupBy=day|month|quarter
 *
 * Returns revenue (commission) trends for charts.
 */
export const getRevenueTrendsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = "month" } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const data = await getRevenueTrends(
      new Date(startDate as string),
      new Date(endDate as string),
      groupBy as "day" | "month" | "quarter",
    );

    res.status(200).json({
      status: "success",
      message: "Revenue trends fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("getRevenueTrends error:", error);
    return next(createError(500, "Failed to fetch revenue trends"));
  }
};

/**
 * GET /admin/stats/top-performers?type=vendors|mediators&limit=10
 *
 * Returns top vendors or mediators.
 */
export const getTopPerformersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { type = "vendors", limit = "10" } = req.query;
    const limitNum = parseInt(limit as string);

    if (!["vendors", "mediators"].includes(type as string)) {
      return next(
        createError(400, "Invalid type. Must be 'vendors' or 'mediators'"),
      );
    }

    const data =
      type === "vendors"
        ? await getTopVendors(limitNum)
        : await getTopMediators(limitNum);

    res.status(200).json({
      status: "success",
      message: `Top ${type} fetched successfully`,
      data,
      type,
      limit: limitNum,
    });
  } catch (error: any) {
    console.error("getTopPerformers error:", error);
    return next(createError(500, "Failed to fetch top performers"));
  }
};

/**
 * GET /admin/stats/financial-summary?startDate=&endDate=
 *
 * Returns detailed financial summary for a date range.
 */
export const getFinancialSummaryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, "startDate and endDate are required"));
    }

    const data = await getFinancialSummary(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    res.status(200).json({
      status: "success",
      message: "Financial summary fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("getFinancialSummary error:", error);
    return next(createError(500, "Failed to fetch financial summary"));
  }
};

/**
 * GET /admin/stats/system-health
 *
 * Returns counts by status from all source models + recent payout failures.
 */
export const getSystemHealthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await getSystemHealth();

    res.status(200).json({
      status: "success",
      message: "System health fetched successfully",
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("getSystemHealth error:", error);
    return next(createError(500, "Failed to fetch system health"));
  }
};
