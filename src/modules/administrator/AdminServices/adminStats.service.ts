// services/adminStats.service.ts - NEW VERSION USING TransactionAnalytics
import TransactionAnalytics from "../Analytics/transactionAnalytics.model";
import MediatorModel from "../../mediator/mediator.model";
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
import OrganizationUser from "../../authentication/organizationUserAuth/organizationAuth.model";
import Payout from "../../transactions/productsTransaction/Payouts/payout.model";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DashboardOverview {
  totalTransactions: number;
  activeDisputes: number;
  pendingPayouts: number;
  completedToday: number;
}

interface FinancialStats {
  totalVolume: number;
  commissionEarned: number;
  pendingPayouts: number;
  completedPayouts: number;
  failedPayouts: number;
  revenueRecognized: number;
}

interface TransactionBreakdown {
  processing: number;
  awaitingPayment: number;
  paymentVerified: number;
  inTransit: number;
  completed: number;
  cancelled: number;
}

interface DisputeStats {
  active: number;
  resolved: number;
  escalated: number;
  avgResolutionTimeHours: number;
  resolutionRate: string;
}

interface UserStats {
  total: number;
  individual: number;
  organizations: number;
  activeMediators: number;
  newThisMonth: number;
}

interface RecentActivity {
  id: string;
  type: "transaction" | "dispute" | "payout" | "user";
  action: string;
  amount: number | null;
  time: string;
  transaction_id?: string;
}

interface DashboardStats {
  overview: DashboardOverview;
  financial: FinancialStats;
  transactions: TransactionBreakdown;
  disputes: DisputeStats;
  users: UserStats;
  recentActivity: RecentActivity[];
}

export class AdminStatsService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(
    timeRange: string = "today",
  ): Promise<DashboardStats> {
    try {
      const { startDate, endDate } = this.getDateRange(timeRange);

      // Run queries in parallel for better performance
      const [
        overview,
        financial,
        transactions,
        disputes,
        users,
        recentActivity,
      ] = await Promise.all([
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
    } catch (error: any) {
      console.error("Error in getDashboardStats:", error);
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  }

  /**
   * Get overview statistics
   */
  private async getOverviewStats(
    startDate: Date,
    endDate: Date,
  ): Promise<DashboardOverview> {
    const [totalTransactions, activeDisputes, pendingPayouts, completedToday] =
      await Promise.all([
        // Total transactions in range
        TransactionAnalytics.countDocuments({
          transaction_date: { $gte: startDate, $lte: endDate },
        }),

        // Active disputes
        TransactionAnalytics.countDocuments({
          has_dispute: true,
          dispute_status: {
            $in: ["In_Dispute", "escalated_to_mediator", "resolving"],
          },
        }),

        // Pending payouts
        Payout.countDocuments({
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
        (async () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          return TransactionAnalytics.countDocuments({
            completed: true,
            completed_at: { $gte: today, $lt: tomorrow },
          });
        })(),
      ]);

    return {
      totalTransactions,
      activeDisputes,
      pendingPayouts,
      completedToday,
    };
  }

  /**
   * Get financial statistics
   */
  private async getFinancialStats(
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialStats> {
    // Get financial summary from analytics
    const financialSummary = await TransactionAnalytics.aggregate([
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
    const payoutStats = await Payout.aggregate([
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
  }

  /**
   * Get transaction breakdown by status
   */
  private async getTransactionBreakdown(
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionBreakdown> {
    const breakdown = await TransactionAnalytics.aggregate([
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

    const result: TransactionBreakdown = {
      processing: 0,
      awaitingPayment: 0,
      paymentVerified: 0,
      inTransit: 0,
      completed: 0,
      cancelled: 0,
    };

    breakdown.forEach((item: any) => {
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
  }

  /**
   * Get dispute statistics
   */
  private async getDisputeStats(
    startDate: Date,
    endDate: Date,
  ): Promise<DisputeStats> {
    const disputeData = await TransactionAnalytics.aggregate([
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

    disputeData.forEach((item: any) => {
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
    const resolutionRate =
      totalActionable > 0
        ? `${Math.round((resolved / totalActionable) * 100)}%`
        : "0%";

    return {
      active,
      resolved,
      escalated,
      avgResolutionTimeHours: totalResolutionTime,
      resolutionRate,
    };
  }

  /**
   * Get user statistics
   */
  private async getUserStats(): Promise<UserStats> {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      individual,
      organizations,
      mediators,
      newIndividual,
      newOrganizations,
    ] = await Promise.all([
      IndividualUser.countDocuments({}),
      OrganizationUser.countDocuments({}),
      MediatorModel.countDocuments({}),
      IndividualUser.countDocuments({
        createdAt: { $gte: monthStart },
      }),
      OrganizationUser.countDocuments({
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
  }

  /**
   * Get recent activity from analytics
   */
  private async getRecentActivity(
    limit: number = 10,
  ): Promise<RecentActivity[]> {
    const recentTransactions = await TransactionAnalytics.find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .select(
        "transaction_id transaction_status transaction_total created_at has_dispute payout_status",
      );

    return recentTransactions.map((t: any) => ({
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
  }

  /**
   * Get transaction analytics over time
   */
  async getTransactionAnalytics(
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day",
  ): Promise<any> {
    let groupFormat: any;

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

    const analytics = await TransactionAnalytics.aggregate([
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
      totalCommission: analytics.reduce(
        (sum, item) => sum + item.commission,
        0,
      ),
      completionRate:
        analytics.length > 0
          ? (
              (analytics.reduce((sum, item) => sum + item.completed, 0) /
                analytics.reduce((sum, item) => sum + item.count, 0)) *
              100
            ).toFixed(1) + "%"
          : "0%",
    };

    return {
      period: groupBy,
      data: analytics,
      summary,
    };
  }

  /**
   * Get top performing vendors
   */
  async getTopVendors(limit: number = 10): Promise<any[]> {
    return TransactionAnalytics.getTopVendors(limit);
  }

  /**
   * Get top performing mediators
   */
  async getTopMediators(limit: number = 10): Promise<any[]> {
    const topMediators = await TransactionAnalytics.aggregate([
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
  }

  /**
   * Get revenue trends
   */
  async getRevenueTrends(
    groupBy: "day" | "month" | "quarter",
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    return TransactionAnalytics.getRevenueTrends(groupBy, startDate, endDate);
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<any> {
    const [transactionHealth, payoutHealth, disputeHealth, userCount] =
      await Promise.all([
        // Transaction health
        TransactionAnalytics.aggregate([
          {
            $group: {
              _id: "$transaction_status",
              count: { $sum: 1 },
            },
          },
        ]),

        // Payout health
        Payout.aggregate([
          {
            $group: {
              _id: "$payout_status",
              count: { $sum: 1 },
            },
          },
        ]),

        // Dispute health
        TransactionAnalytics.aggregate([
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
        (async () => {
          const [individual, organization] = await Promise.all([
            IndividualUser.countDocuments({}),
            OrganizationUser.countDocuments({}),
          ]);
          return individual + organization;
        })(),
      ]);

    // Get recent failures (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentFailures = await Payout.countDocuments({
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
  }

  /**
   * Helper: Get date range based on filter
   */
  private getDateRange(timeRange: string): DateRange {
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
  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000,
    );

    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }
}
