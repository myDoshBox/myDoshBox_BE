"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHealthHandler = exports.getFinancialSummaryHandler = exports.getTopPerformersHandler = exports.getRevenueTrendsHandler = exports.getTransactionAnalyticsHandler = exports.getDashboardStatsHandler = void 0;
const errorHandler_util_1 = require("../../../utilities/errorHandler.util");
const adminStats_service_1 = require("./adminStats.service");
/**
 * GET /admin/stats/dashboard?timeRange=today|week|month|year
 *
 * Returns the full dashboard payload:
 * overview, financial, transactions, disputes, users, recentActivity
 */
const getDashboardStatsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timeRange = req.query.timeRange || "today";
        const stats = yield (0, adminStats_service_1.getDashboardStats)(timeRange);
        res.status(200).json({
            status: "success",
            message: "Dashboard statistics fetched successfully",
            data: stats,
        });
    }
    catch (error) {
        console.error("getDashboardStats error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch dashboard statistics"));
    }
});
exports.getDashboardStatsHandler = getDashboardStatsHandler;
/**
 * GET /admin/stats/analytics?startDate=&endDate=&groupBy=day|week|month
 *
 * Returns time-series transaction data for charts.
 */
const getTransactionAnalyticsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, groupBy = "day" } = req.query;
        if (!startDate || !endDate) {
            return next((0, errorHandler_util_1.createError)(400, "startDate and endDate are required"));
        }
        const data = yield (0, adminStats_service_1.getTransactionAnalytics)(new Date(startDate), new Date(endDate), groupBy);
        res.status(200).json({
            status: "success",
            message: "Transaction analytics fetched successfully",
            data,
        });
    }
    catch (error) {
        console.error("getTransactionAnalytics error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch transaction analytics"));
    }
});
exports.getTransactionAnalyticsHandler = getTransactionAnalyticsHandler;
/**
 * GET /admin/stats/revenue-trends?startDate=&endDate=&groupBy=day|month|quarter
 *
 * Returns revenue (commission) trends for charts.
 */
const getRevenueTrendsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, groupBy = "month" } = req.query;
        if (!startDate || !endDate) {
            return next((0, errorHandler_util_1.createError)(400, "startDate and endDate are required"));
        }
        const data = yield (0, adminStats_service_1.getRevenueTrends)(new Date(startDate), new Date(endDate), groupBy);
        res.status(200).json({
            status: "success",
            message: "Revenue trends fetched successfully",
            data,
        });
    }
    catch (error) {
        console.error("getRevenueTrends error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch revenue trends"));
    }
});
exports.getRevenueTrendsHandler = getRevenueTrendsHandler;
/**
 * GET /admin/stats/top-performers?type=vendors|mediators&limit=10
 *
 * Returns top vendors or mediators.
 */
const getTopPerformersHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type = "vendors", limit = "10" } = req.query;
        const limitNum = parseInt(limit);
        if (!["vendors", "mediators"].includes(type)) {
            return next((0, errorHandler_util_1.createError)(400, "Invalid type. Must be 'vendors' or 'mediators'"));
        }
        const data = type === "vendors"
            ? yield (0, adminStats_service_1.getTopVendors)(limitNum)
            : yield (0, adminStats_service_1.getTopMediators)(limitNum);
        res.status(200).json({
            status: "success",
            message: `Top ${type} fetched successfully`,
            data,
            type,
            limit: limitNum,
        });
    }
    catch (error) {
        console.error("getTopPerformers error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch top performers"));
    }
});
exports.getTopPerformersHandler = getTopPerformersHandler;
/**
 * GET /admin/stats/financial-summary?startDate=&endDate=
 *
 * Returns detailed financial summary for a date range.
 */
const getFinancialSummaryHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return next((0, errorHandler_util_1.createError)(400, "startDate and endDate are required"));
        }
        const data = yield (0, adminStats_service_1.getFinancialSummary)(new Date(startDate), new Date(endDate));
        res.status(200).json({
            status: "success",
            message: "Financial summary fetched successfully",
            data,
        });
    }
    catch (error) {
        console.error("getFinancialSummary error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch financial summary"));
    }
});
exports.getFinancialSummaryHandler = getFinancialSummaryHandler;
/**
 * GET /admin/stats/system-health
 *
 * Returns counts by status from all source models + recent payout failures.
 */
const getSystemHealthHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, adminStats_service_1.getSystemHealth)();
        res.status(200).json({
            status: "success",
            message: "System health fetched successfully",
            data,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("getSystemHealth error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch system health"));
    }
});
exports.getSystemHealthHandler = getSystemHealthHandler;
