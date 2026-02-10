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
exports.AdminStatsService = void 0;
// services/adminStats.service.ts - NEW VERSION USING TransactionAnalytics
const transactionAnalytics_model_1 = __importDefault(require("../Analytics/transactionAnalytics.model"));
const mediator_model_1 = __importDefault(require("../../mediator/mediator.model"));
const individualUserAuth_model1_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model1"));
const organizationAuth_model_1 = __importDefault(require("../../authentication/organizationUserAuth/organizationAuth.model"));
const payout_model_1 = __importDefault(require("../../transactions/productsTransaction/Payouts/payout.model"));
class AdminStatsService {
    /**
     * Get comprehensive dashboard statistics
     */
    getDashboardStats() {
        return __awaiter(this, arguments, void 0, function* (timeRange = "today") {
            try {
                const { startDate, endDate } = this.getDateRange(timeRange);
                // Run queries in parallel for better performance
                const [overview, financial, transactions, disputes, users, recentActivity,] = yield Promise.all([
                    this.getOverviewStats(startDate, endDate),
                    this.getFinancialStats(startDate, endDate),
                    this.getTransactionBreakdown(startDate, endDate),
                    this.getDisputeStats(startDate, endDate),
                    this.getUserStats(),
                    this.getRecentActivity(10),
                ]);
                return {
                    overview,
                    financial,
                    transactions,
                    disputes,
                    users,
                    recentActivity,
                };
            }
            catch (error) {
                console.error("Error in getDashboardStats:", error);
                throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
            }
        });
    }
    /**
     * Get overview statistics
     */
    getOverviewStats(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalTransactions, activeDisputes, pendingPayouts, completedToday] = yield Promise.all([
                // Total transactions in range
                transactionAnalytics_model_1.default.countDocuments({
                    transaction_date: { $gte: startDate, $lte: endDate },
                }),
                // Active disputes
                transactionAnalytics_model_1.default.countDocuments({
                    has_dispute: true,
                    dispute_status: {
                        $in: ["In_Dispute", "escalated_to_mediator", "resolving"],
                    },
                }),
                // Pending payouts
                payout_model_1.default.countDocuments({
                    payout_status: {
                        $in: [
                            "pending_initiation",
                            "transfer_initiated",
                            "transfer_pending",
                            "manual_payout_required",
                            "pending_manual_payout",
                        ],
                    },
                }),
                // Completed today
                (() => __awaiter(this, void 0, void 0, function* () {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return transactionAnalytics_model_1.default.countDocuments({
                        completed: true,
                        completed_at: { $gte: today, $lt: tomorrow },
                    });
                }))(),
            ]);
            return {
                totalTransactions,
                activeDisputes,
                pendingPayouts,
                completedToday,
            };
        });
    }
    /**
     * Get financial statistics
     */
    getFinancialStats(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get financial summary from analytics
            const financialSummary = yield transactionAnalytics_model_1.default.aggregate([
                {
                    $match: {
                        transaction_date: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalVolume: { $sum: "$transaction_total" },
                        commissionEarned: { $sum: "$commission_amount" },
                        revenueRecognized: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$transaction_status", "completed"] },
                                    "$commission_amount",
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]);
            // Get payout statistics
            const payoutStats = yield payout_model_1.default.aggregate([
                {
                    $group: {
                        _id: null,
                        pendingPayouts: {
                            $sum: {
                                $cond: [
                                    {
                                        $in: [
                                            "$payout_status",
                                            [
                                                "pending_initiation",
                                                "transfer_initiated",
                                                "transfer_pending",
                                                "manual_payout_required",
                                                "pending_manual_payout",
                                            ],
                                        ],
                                    },
                                    "$payout_amount",
                                    0,
                                ],
                            },
                        },
                        completedPayouts: {
                            $sum: {
                                $cond: [
                                    {
                                        $in: [
                                            "$payout_status",
                                            ["transfer_success", "manual_payout_completed"],
                                        ],
                                    },
                                    "$payout_amount",
                                    0,
                                ],
                            },
                        },
                        failedPayouts: {
                            $sum: {
                                $cond: [{ $in: ["$payout_status", ["transfer_failed"]] }, 1, 0],
                            },
                        },
                    },
                },
            ]);
            const financial = financialSummary[0] || {
                totalVolume: 0,
                commissionEarned: 0,
                revenueRecognized: 0,
            };
            const payouts = payoutStats[0] || {
                pendingPayouts: 0,
                completedPayouts: 0,
                failedPayouts: 0,
            };
            return {
                totalVolume: financial.totalVolume || 0,
                commissionEarned: financial.commissionEarned || 0,
                revenueRecognized: financial.revenueRecognized || 0,
                pendingPayouts: payouts.pendingPayouts || 0,
                completedPayouts: payouts.completedPayouts || 0,
                failedPayouts: payouts.failedPayouts || 0,
            };
        });
    }
    /**
     * Get transaction breakdown by status
     */
    getTransactionBreakdown(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const breakdown = yield transactionAnalytics_model_1.default.aggregate([
                {
                    $match: {
                        transaction_date: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: "$transaction_status",
                        count: { $sum: 1 },
                    },
                },
            ]);
            const result = {
                processing: 0,
                awaitingPayment: 0,
                paymentVerified: 0,
                inTransit: 0,
                completed: 0,
                cancelled: 0,
            };
            breakdown.forEach((item) => {
                switch (item._id) {
                    case "processing":
                        result.processing = item.count;
                        break;
                    case "awaiting_payment":
                        result.awaitingPayment = item.count;
                        break;
                    case "payment_verified":
                    case "awaiting_shipping":
                        result.paymentVerified += item.count;
                        break;
                    case "in_transit":
                        result.inTransit = item.count;
                        break;
                    case "completed":
                        result.completed = item.count;
                        break;
                    case "cancelled":
                    case "declined":
                        result.cancelled += item.count;
                        break;
                }
            });
            return result;
        });
    }
    /**
     * Get dispute statistics
     */
    getDisputeStats(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const disputeData = yield transactionAnalytics_model_1.default.aggregate([
                {
                    $match: {
                        has_dispute: true,
                        dispute_created_at: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: "$dispute_status",
                        count: { $sum: 1 },
                        avgResolutionTime: { $avg: "$dispute_resolution_time_hours" },
                    },
                },
            ]);
            let active = 0;
            let resolved = 0;
            let escalated = 0;
            let totalResolutionTime = 0;
            let resolvedCount = 0;
            disputeData.forEach((item) => {
                switch (item._id) {
                    case "resolved":
                        resolved = item.count;
                        resolvedCount = item.count;
                        totalResolutionTime = item.avgResolutionTime || 0;
                        break;
                    case "escalated_to_mediator":
                        escalated = item.count;
                        active += item.count;
                        break;
                    case "In_Dispute":
                    case "resolving":
                        active += item.count;
                        break;
                }
            });
            const totalActionable = active + resolved;
            const resolutionRate = totalActionable > 0
                ? `${Math.round((resolved / totalActionable) * 100)}%`
                : "0%";
            return {
                active,
                resolved,
                escalated,
                avgResolutionTimeHours: totalResolutionTime,
                resolutionRate,
            };
        });
    }
    /**
     * Get user statistics
     */
    getUserStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);
            const [individual, organizations, mediators, newIndividual, newOrganizations,] = yield Promise.all([
                individualUserAuth_model1_1.default.countDocuments({}),
                organizationAuth_model_1.default.countDocuments({}),
                mediator_model_1.default.countDocuments({}),
                individualUserAuth_model1_1.default.countDocuments({
                    createdAt: { $gte: monthStart },
                }),
                organizationAuth_model_1.default.countDocuments({
                    createdAt: { $gte: monthStart },
                }),
            ]);
            return {
                total: individual + organizations,
                individual,
                organizations,
                activeMediators: mediators,
                newThisMonth: newIndividual + newOrganizations,
            };
        });
    }
    /**
     * Get recent activity from analytics
     */
    getRecentActivity() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            const recentTransactions = yield transactionAnalytics_model_1.default.find({})
                .sort({ created_at: -1 })
                .limit(limit)
                .select("transaction_id transaction_status transaction_total created_at has_dispute payout_status");
            return recentTransactions.map((t) => ({
                id: t._id.toString(),
                type: t.has_dispute
                    ? "dispute"
                    : t.payout_status
                        ? "payout"
                        : "transaction",
                action: t.payout_status || t.transaction_status,
                amount: t.transaction_total,
                time: this.formatTimeAgo(t.created_at),
                transaction_id: t.transaction_id,
            }));
        });
    }
    /**
     * Get transaction analytics over time
     */
    getTransactionAnalytics(startDate_1, endDate_1) {
        return __awaiter(this, arguments, void 0, function* (startDate, endDate, groupBy = "day") {
            let groupFormat;
            switch (groupBy) {
                case "day":
                    groupFormat = {
                        $dateToString: { format: "%Y-%m-%d", date: "$date_only" },
                    };
                    break;
                case "week":
                    groupFormat = { year: "$year", week: "$week" };
                    break;
                case "month":
                    groupFormat = { year: "$year", month: "$month" };
                    break;
            }
            const analytics = yield transactionAnalytics_model_1.default.aggregate([
                {
                    $match: {
                        transaction_date: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: groupFormat,
                        count: { $sum: 1 },
                        totalAmount: { $sum: "$transaction_total" },
                        commission: { $sum: "$commission_amount" },
                        completed: {
                            $sum: { $cond: ["$completed", 1, 0] },
                        },
                        cancelled: {
                            $sum: { $cond: ["$cancelled", 1, 0] },
                        },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ]);
            const summary = {
                totalTransactions: analytics.reduce((sum, item) => sum + item.count, 0),
                totalVolume: analytics.reduce((sum, item) => sum + item.totalAmount, 0),
                totalCommission: analytics.reduce((sum, item) => sum + item.commission, 0),
                completionRate: analytics.length > 0
                    ? ((analytics.reduce((sum, item) => sum + item.completed, 0) /
                        analytics.reduce((sum, item) => sum + item.count, 0)) *
                        100).toFixed(1) + "%"
                    : "0%",
            };
            return {
                period: groupBy,
                data: analytics,
                summary,
            };
        });
    }
    /**
     * Get top performing vendors
     */
    getTopVendors() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            return transactionAnalytics_model_1.default.getTopVendors(limit);
        });
    }
    /**
     * Get top performing mediators
     */
    getTopMediators() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            const topMediators = yield transactionAnalytics_model_1.default.aggregate([
                {
                    $match: {
                        mediator_involved: true,
                        dispute_status: "resolved",
                    },
                },
                {
                    $group: {
                        _id: "$mediator_id",
                        disputesResolved: { $sum: 1 },
                        avgResolutionTime: { $avg: "$dispute_resolution_time_hours" },
                    },
                },
                {
                    $lookup: {
                        from: "mediators",
                        localField: "_id",
                        foreignField: "_id",
                        as: "mediatorDetails",
                    },
                },
                {
                    $unwind: "$mediatorDetails",
                },
                {
                    $project: {
                        mediatorId: "$_id",
                        mediatorName: {
                            $concat: [
                                "$mediatorDetails.first_name",
                                " ",
                                "$mediatorDetails.last_name",
                            ],
                        },
                        mediatorEmail: "$mediatorDetails.mediator_email",
                        disputesResolved: 1,
                        avgResolutionTime: { $round: ["$avgResolutionTime", 1] },
                    },
                },
                {
                    $sort: { disputesResolved: -1 },
                },
                {
                    $limit: limit,
                },
            ]);
            return topMediators;
        });
    }
    /**
     * Get revenue trends
     */
    getRevenueTrends(groupBy, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return transactionAnalytics_model_1.default.getRevenueTrends(groupBy, startDate, endDate);
        });
    }
    /**
     * Get system health metrics
     */
    getSystemHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            const [transactionHealth, payoutHealth, disputeHealth, userCount] = yield Promise.all([
                // Transaction health
                transactionAnalytics_model_1.default.aggregate([
                    {
                        $group: {
                            _id: "$transaction_status",
                            count: { $sum: 1 },
                        },
                    },
                ]),
                // Payout health
                payout_model_1.default.aggregate([
                    {
                        $group: {
                            _id: "$payout_status",
                            count: { $sum: 1 },
                        },
                    },
                ]),
                // Dispute health
                transactionAnalytics_model_1.default.aggregate([
                    {
                        $match: { has_dispute: true },
                    },
                    {
                        $group: {
                            _id: "$dispute_status",
                            count: { $sum: 1 },
                        },
                    },
                ]),
                // User count
                (() => __awaiter(this, void 0, void 0, function* () {
                    const [individual, organization] = yield Promise.all([
                        individualUserAuth_model1_1.default.countDocuments({}),
                        organizationAuth_model_1.default.countDocuments({}),
                    ]);
                    return individual + organization;
                }))(),
            ]);
            // Get recent failures (last 24 hours)
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentFailures = yield payout_model_1.default.countDocuments({
                payout_status: "transfer_failed",
                created_at: { $gte: yesterday },
            });
            return {
                uptime: process.uptime(),
                transactions: {
                    total: transactionHealth.reduce((sum, item) => sum + item.count, 0),
                    byStatus: transactionHealth,
                },
                payouts: {
                    total: payoutHealth.reduce((sum, item) => sum + item.count, 0),
                    byStatus: payoutHealth,
                    recentFailures,
                },
                disputes: {
                    total: disputeHealth.reduce((sum, item) => sum + item.count, 0),
                    byStatus: disputeHealth,
                },
                users: {
                    total: userCount,
                },
            };
        });
    }
    /**
     * Helper: Get date range based on filter
     */
    getDateRange(timeRange) {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();
        switch (timeRange.toLowerCase()) {
            case "today":
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case "week":
                startDate.setDate(now.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(now.getMonth() - 1);
                break;
            case "year":
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
        }
        return { startDate, endDate };
    }
    /**
     * Helper: Format time ago
     */
    formatTimeAgo(date) {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60)
            return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60)
            return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24)
            return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    }
}
exports.AdminStatsService = AdminStatsService;
