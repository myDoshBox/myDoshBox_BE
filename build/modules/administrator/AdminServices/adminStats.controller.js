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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncAnalytics = exports.verifyAnalytics = exports.getSystemHealth = exports.getTransactionBreakdown = exports.getFinancialSummary = exports.getRevenueTrends = exports.getTopPerforming = exports.getTransactionAnalytics = exports.getDashboardStats = void 0;
const adminStats_service_1 = require("../AdminServices/adminStats.service");
const errorHandler_util_1 = require("../../../utilities/errorHandler.util");
const transactionAnalytics_model_1 = __importDefault(require("../Analytics/transactionAnalytics.model"));
const analyticsSync_utils_1 = require("../Analytics/analyticsSync.utils");
const analyticsSync_utils_2 = require("../Analytics/analyticsSync.utils");
/**
 * Get dashboard overview statistics
 */
const getDashboardStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { timeRange = "today" } = req.query;
        const statsService = new adminStats_service_1.AdminStatsService();
        const stats = yield statsService.getDashboardStats(timeRange.toString());
        res.status(200).json({
            status: "success",
            message: "Dashboard statistics fetched successfully",
            data: stats,
            timeRange,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch dashboard statistics"));
    }
});
exports.getDashboardStats = getDashboardStats;
/**
 * Get transaction analytics over time
 */
const getTransactionAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, groupBy = "day" } = req.query;
        if (!startDate || !endDate) {
            return next((0, errorHandler_util_1.createError)(400, "startDate and endDate are required"));
        }
        const statsService = new adminStats_service_1.AdminStatsService();
        const analytics = yield statsService.getTransactionAnalytics(new Date(startDate), new Date(endDate), groupBy);
        res.status(200).json({
            status: "success",
            message: "Transaction analytics fetched successfully",
            data: analytics,
        });
    }
    catch (error) {
        console.error("Error fetching transaction analytics:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch transaction analytics"));
    }
});
exports.getTransactionAnalytics = getTransactionAnalytics;
/**
 * Get top performing vendors or mediators
 */
const getTopPerforming = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type = "vendors", limit = "10" } = req.query;
        const statsService = new adminStats_service_1.AdminStatsService();
        const limitNumber = parseInt(limit);
        let topPerformers;
        if (type === "vendors") {
            topPerformers = yield statsService.getTopVendors(limitNumber);
        }
        else if (type === "mediators") {
            topPerformers = yield statsService.getTopMediators(limitNumber);
        }
        else {
            return next((0, errorHandler_util_1.createError)(400, "Invalid type parameter. Must be 'vendors' or 'mediators'"));
        }
        res.status(200).json({
            status: "success",
            message: "Top performers fetched successfully",
            data: topPerformers,
            type,
            limit: limitNumber,
        });
    }
    catch (error) {
        console.error("Error fetching top performers:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch top performers"));
    }
});
exports.getTopPerforming = getTopPerforming;
/**
 * Get revenue trends over time
 */
const getRevenueTrends = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, groupBy = "month" } = req.query;
        if (!startDate || !endDate) {
            return next((0, errorHandler_util_1.createError)(400, "startDate and endDate are required"));
        }
        const statsService = new adminStats_service_1.AdminStatsService();
        const trends = yield statsService.getRevenueTrends(groupBy, new Date(startDate), new Date(endDate));
        res.status(200).json({
            status: "success",
            message: "Revenue trends fetched successfully",
            data: trends,
        });
    }
    catch (error) {
        console.error("Error fetching revenue trends:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch revenue trends"));
    }
});
exports.getRevenueTrends = getRevenueTrends;
/**
 * Get financial summary
 */
const getFinancialSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return next((0, errorHandler_util_1.createError)(400, "startDate and endDate are required"));
        }
        const summary = yield transactionAnalytics_model_1.default.getFinancialSummary(new Date(startDate), new Date(endDate));
        res.status(200).json({
            status: "success",
            message: "Financial summary fetched successfully",
            data: summary[0] || {},
        });
    }
    catch (error) {
        console.error("Error fetching financial summary:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch financial summary"));
    }
});
exports.getFinancialSummary = getFinancialSummary;
/**
 * Get transaction breakdown by status
 */
const getTransactionBreakdown = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return next((0, errorHandler_util_1.createError)(400, "startDate and endDate are required"));
        }
        const breakdown = yield transactionAnalytics_model_1.default.getStatusBreakdown(new Date(startDate), new Date(endDate));
        res.status(200).json({
            status: "success",
            message: "Transaction breakdown fetched successfully",
            data: breakdown,
        });
    }
    catch (error) {
        console.error("Error fetching transaction breakdown:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch transaction breakdown"));
    }
});
exports.getTransactionBreakdown = getTransactionBreakdown;
/**
 * Get system health metrics
 */
const getSystemHealth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const statsService = new adminStats_service_1.AdminStatsService();
        const healthMetrics = yield statsService.getSystemHealth();
        res.status(200).json({
            status: "success",
            message: "System health metrics fetched successfully",
            data: healthMetrics,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Error fetching system health:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to fetch system health metrics"));
    }
});
exports.getSystemHealth = getSystemHealth;
/**
 * Verify analytics data integrity
 * Admin utility endpoint to check if all transactions have analytics
 */
const verifyAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(`Admin ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email} is verifying analytics integrity`);
        const integrity = yield (0, analyticsSync_utils_1.verifyAnalyticsIntegrity)();
        const status = integrity.missing_analytics.length === 0 &&
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
                missing_analytics: integrity.missing_analytics.length <= 10
                    ? integrity.missing_analytics
                    : [
                        ...integrity.missing_analytics.slice(0, 10),
                        `... and ${integrity.missing_analytics.length - 10} more`,
                    ],
                orphaned_analytics: integrity.orphaned_analytics.length <= 10
                    ? integrity.orphaned_analytics
                    : [
                        ...integrity.orphaned_analytics.slice(0, 10),
                        `... and ${integrity.orphaned_analytics.length - 10} more`,
                    ],
            },
        });
    }
    catch (error) {
        console.error("Error verifying analytics:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to verify analytics integrity"));
    }
});
exports.verifyAnalytics = verifyAnalytics;
/**
 * Manually trigger analytics sync
 * Admin utility endpoint to sync missing analytics
 */
const syncAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(`Admin ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email} is triggering analytics sync`);
        const results = yield (0, analyticsSync_utils_2.bulkSyncToAnalytics)();
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
    }
    catch (error) {
        console.error("Error syncing analytics:", error);
        return next((0, errorHandler_util_1.createError)(500, "Failed to sync analytics"));
    }
});
exports.syncAnalytics = syncAnalytics;
