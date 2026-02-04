// services/adminStats.service.ts - CORRECTED VERSION
import { Request } from "express";
import mongoose from "mongoose";
import MediatorModel, { IMediator } from "../../mediator/mediator.model";
import ProductTransaction, {
  IProductTransaction,
} from "../../transactions/productsTransaction/productsTransaction.model";
import ProductDispute, {
  IProductDispute,
} from "../../disputes/productsDispute/productDispute.model";
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
import OrganizationUser from "../../authentication/organizationUserAuth/organizationAuth.model";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface TransactionStats {
  count: number;
  inProgress: number;
  awaitingPayment: number;
  inTransit: number;
  completed: number;
  cancelled: number;
  totalAmount: number;
}

interface FinancialStats {
  totalVolume: number;
  commissionEarned: number;
  pendingTransfers: number;
  releasedToday: number;
}

interface DisputeStats {
  active: number;
  resolved: number;
  escalated: number;
  avgResolutionTime: string;
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
  type: "transaction" | "dispute" | "payment" | "user" | "mediator";
  action: string;
  amount: number | null;
  time: string;
  timestamp: Date; // ✅ ADDED: For proper sorting
  transaction_id?: string;
}

interface DashboardStats {
  overview: {
    totalTransactions: number;
    activeDisputes: number;
    pendingPayments: number;
    completedToday: number;
  };
  financial: FinancialStats;
  transactions: {
    inProgress: number;
    awaitingPayment: number;
    inTransit: number;
    completed: number;
    cancelled: number;
  };
  disputes: DisputeStats;
  users: UserStats;
  recentActivity: RecentActivity[];
}

export class AdminStatsService {
  private ProductTransaction: mongoose.Model<IProductTransaction>;
  private ProductDispute: mongoose.Model<IProductDispute>;
  private Mediator: mongoose.Model<IMediator>;
  private IndividualUser: mongoose.Model<any>;
  private OrganizationUser: mongoose.Model<any>;

  constructor() {
    this.ProductTransaction = ProductTransaction;
    this.ProductDispute = ProductDispute;
    this.Mediator = MediatorModel;
    this.IndividualUser = IndividualUser;
    this.OrganizationUser = OrganizationUser;
  }

  /**
   * Get dashboard overview statistics
   */
  async getDashboardStats(
    timeRange: string = "today",
  ): Promise<DashboardStats> {
    try {
      // Calculate date ranges
      const { startDate, endDate } = this.getDateRange(timeRange);

      // Run all queries in parallel
      const [
        transactionStats,
        financialStats,
        activeDisputes,
        pendingPayments,
        completedToday,
        userStats,
        disputeStats,
        recentActivity,
      ] = await Promise.all([
        this.getTransactionStats(startDate, endDate),
        this.getFinancialStats(startDate, endDate),
        this.getActiveDisputes(),
        this.getPendingPayments(),
        this.getCompletedTransactionsToday(),
        this.getUserStats(startDate, endDate),
        this.getDisputeStats(startDate, endDate),
        this.getRecentActivity(startDate, endDate),
      ]);

      return {
        overview: {
          totalTransactions: transactionStats.count,
          activeDisputes: activeDisputes.count,
          pendingPayments: pendingPayments.count,
          completedToday: completedToday.count,
        },
        financial: financialStats,
        transactions: {
          inProgress: transactionStats.inProgress,
          awaitingPayment: transactionStats.awaitingPayment,
          inTransit: transactionStats.inTransit,
          completed: transactionStats.completed,
          cancelled: transactionStats.cancelled,
        },
        disputes: disputeStats,
        users: userStats,
        recentActivity,
      };
    } catch (error: any) {
      console.error("Error calculating dashboard stats:", error);
      throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
    }
  }

  /**
   * Get date range based on time filter
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
   * ✅ FIXED: Get transaction statistics with correct status categorization
   */
  private async getTransactionStats(
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionStats> {
    const transactions = await this.ProductTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$transaction_status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$transaction_total" },
        },
      },
    ]);

    const result: TransactionStats = {
      count: 0,
      inProgress: 0,
      awaitingPayment: 0,
      inTransit: 0,
      completed: 0,
      cancelled: 0,
      totalAmount: 0,
    };

    transactions.forEach((stat: any) => {
      result.count += stat.count;
      result.totalAmount += stat.totalAmount;

      // ✅ FIXED: Correct status categorization
      switch (stat._id) {
        case "processing":
          result.inProgress += stat.count;
          break;
        case "awaiting_payment":
          result.awaitingPayment += stat.count;
          break;
        case "payment_verified":
        case "awaiting_shipping":
          // These are technically awaiting next step (shipping)
          result.awaitingPayment += stat.count;
          break;
        case "in_transit":
          result.inTransit += stat.count;
          break;
        case "completed":
          result.completed += stat.count;
          break;
        case "cancelled":
        case "declined":
          result.cancelled += stat.count;
          break;
      }
    });

    return result;
  }

  /**
   * ✅ FIXED: Get financial statistics with clarified commission calculation
   */
  private async getFinancialStats(
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialStats> {
    const completedTransactions = await this.ProductTransaction.find({
      transaction_status: "completed",
      createdAt: { $gte: startDate, $lte: endDate },
    }).select("sum_total transaction_total");

    const total = completedTransactions.reduce(
      (sum: number, t: any) => sum + (t.transaction_total || 0),
      0,
    );

    // ✅ FIXED: Clearer commission calculation
    // Commission = transaction_total - sum_total (already built into prices)
    const commission = completedTransactions.reduce(
      (sum: number, t: any) =>
        sum + ((t.transaction_total || 0) - (t.sum_total || 0)),
      0,
    );

    // Get today's released payments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const releasedTodayResult = await this.ProductTransaction.aggregate([
      {
        $match: {
          payment_released: true,
          payment_released_at: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$transfer_amount" },
        },
      },
    ]);

    const pendingTransfers = await this.ProductTransaction.aggregate([
      {
        $match: {
          transaction_status: "completed",
          payment_released: false,
          verified_payment_status: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$sum_total" }, // ✅ Correct - what vendors will receive
        },
      },
    ]);

    return {
      totalVolume: total,
      commissionEarned: commission,
      pendingTransfers: pendingTransfers[0]?.total || 0,
      releasedToday: releasedTodayResult[0]?.total || 0,
    };
  }

  /**
   * Get active disputes
   */
  private async getActiveDisputes(): Promise<{ count: number }> {
    const active = await this.ProductDispute.find({
      dispute_status: {
        $in: ["In_Dispute", "escalated_to_mediator", "resolving"],
      },
    });

    return {
      count: active.length,
    };
  }

  /**
   * Get pending payments
   */
  private async getPendingPayments(): Promise<{
    count: number;
    totalAmount: number;
  }> {
    const pending = await this.ProductTransaction.find({
      transaction_status: "awaiting_payment",
      verified_payment_status: false,
    }).select("transaction_total");

    const totalAmount = pending.reduce(
      (sum: number, t: any) => sum + (t.transaction_total || 0),
      0,
    );

    return {
      count: pending.length,
      totalAmount,
    };
  }

  /**
   * Get completed transactions for today
   */
  private async getCompletedTransactionsToday(): Promise<{ count: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.ProductTransaction.countDocuments({
      transaction_status: "completed",
      createdAt: { $gte: today, $lt: tomorrow },
    });

    return { count };
  }

  /**
   * Get user statistics
   */
  private async getUserStats(
    startDate: Date,
    endDate: Date,
  ): Promise<UserStats> {
    const [individual, organizations, mediators] = await Promise.all([
      this.IndividualUser.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      this.OrganizationUser.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      this.Mediator.countDocuments({}),
    ]);

    // Get new users this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const newThisMonth =
      (await this.IndividualUser.countDocuments({
        createdAt: { $gte: monthStart, $lte: new Date() },
      })) +
      (await this.OrganizationUser.countDocuments({
        createdAt: { $gte: monthStart, $lte: new Date() },
      }));

    return {
      total: individual + organizations,
      individual,
      organizations,
      activeMediators: mediators,
      newThisMonth,
    };
  }

  /**
   * ✅ FIXED: Get dispute statistics with improved resolution time calculation
   */
  private async getDisputeStats(
    startDate: Date,
    endDate: Date,
  ): Promise<DisputeStats> {
    const disputes = await this.ProductDispute.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$dispute_status",
                count: { $sum: 1 },
              },
            },
          ],
          // ✅ FIXED: Separate calculation for resolution time
          resolutionTime: [
            {
              $match: {
                dispute_status: "resolved",
                resolved_at: { $exists: true },
              },
            },
            {
              $project: {
                resolutionDays: {
                  $divide: [
                    { $subtract: ["$resolved_at", "$createdAt"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgResolutionTime: { $avg: "$resolutionDays" },
              },
            },
          ],
        },
      },
    ]);

    const result: DisputeStats = {
      active: 0,
      resolved: 0,
      escalated: 0,
      avgResolutionTime: "0 days",
      resolutionRate: "0%",
    };

    let totalActionable = 0; // ✅ FIXED: Exclude cancelled from total
    let resolved = 0;

    const statusGroups = disputes[0]?.byStatus || [];
    statusGroups.forEach((stat: any) => {
      // ✅ FIXED: Don't count cancelled disputes in resolution rate
      if (stat._id !== "cancelled") {
        totalActionable += stat.count;
      }

      if (stat._id === "resolved") {
        resolved = stat.count;
        result.resolved = stat.count;
      } else if (stat._id === "escalated_to_mediator") {
        result.escalated = stat.count;
      } else if (stat._id === "In_Dispute" || stat._id === "resolving") {
        result.active = (result.active || 0) + stat.count;
      }
    });

    // ✅ FIXED: Use the facet result for average resolution time
    const avgTime = disputes[0]?.resolutionTime[0]?.avgResolutionTime || 0;
    result.avgResolutionTime = `${avgTime.toFixed(1)} days`;
    result.resolutionRate =
      totalActionable > 0
        ? `${Math.round((resolved / totalActionable) * 100)}%`
        : "0%";

    return result;
  }

  /**
   * ✅ FIXED: Get recent system activity with proper sorting
   */
  private async getRecentActivity(
    startDate: Date,
    endDate: Date,
  ): Promise<RecentActivity[]> {
    // Get recent transactions
    const recentTransactions = await this.ProductTransaction.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("transaction_id transaction_status transaction_total createdAt");

    // Get recent disputes
    const recentDisputes = await this.ProductDispute.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("transaction_id dispute_status product_name createdAt");

    // Get recent mediator assignments
    const recentMediators = await this.Mediator.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("first_name last_name mediator_email createdAt");

    // ✅ FIXED: Add timestamp field for proper sorting
    const activity: RecentActivity[] = [
      ...recentTransactions.map((t: any) => ({
        id: t._id.toString(),
        type: "transaction" as const,
        action: t.transaction_status,
        amount: t.transaction_total,
        time: this.formatTimeAgo(t.createdAt),
        timestamp: t.createdAt, // ✅ Added for sorting
        transaction_id: t.transaction_id,
      })),
      ...recentDisputes.map((d: any) => ({
        id: d._id.toString(),
        type: "dispute" as const,
        action: d.dispute_status,
        amount: null,
        time: this.formatTimeAgo(d.createdAt),
        timestamp: d.createdAt, // ✅ Added for sorting
        transaction_id: d.transaction_id,
      })),
      ...recentMediators.map((m: any) => ({
        id: m._id.toString(),
        type: "mediator" as const,
        action: "onboarded",
        amount: null,
        time: this.formatTimeAgo(m.createdAt),
        timestamp: m.createdAt, // ✅ Added for sorting
      })),
    ];

    // ✅ FIXED: Sort using timestamp field
    return activity
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
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

  /**
   * Get transaction analytics over time
   */
  async getTransactionAnalytics(
    startDate: Date,
    endDate: Date,
    groupBy: string = "day",
  ): Promise<any> {
    let groupFormat: any;

    switch (groupBy) {
      case "day":
        groupFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        break;
      case "week":
        groupFormat = { $week: "$createdAt" };
        break;
      case "month":
        groupFormat = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        break;
      default:
        groupFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
    }

    const analytics = await this.ProductTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          totalAmount: { $sum: "$transaction_total" },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$transaction_status", "completed"] }, 1, 0],
            },
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ["$transaction_status", "cancelled"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return {
      period: groupBy,
      data: analytics,
      summary: {
        totalTransactions: analytics.reduce((sum, item) => sum + item.count, 0),
        totalVolume: analytics.reduce((sum, item) => sum + item.totalAmount, 0),
        completionRate:
          analytics.length > 0
            ? (
                (analytics.reduce((sum, item) => sum + item.completed, 0) /
                  analytics.reduce((sum, item) => sum + item.count, 0)) *
                100
              ).toFixed(1) + "%"
            : "0%",
      },
    };
  }

  /**
   * Get top performing vendors
   */
  async getTopVendors(limit: number = 10): Promise<any[]> {
    const topVendors = await this.ProductTransaction.aggregate([
      {
        $match: {
          transaction_status: "completed",
        },
      },
      {
        $group: {
          _id: "$vendor_email",
          vendorName: { $first: "$vendor_name" },
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: "$transaction_total" },
          avgTransactionValue: { $avg: "$transaction_total" },
        },
      },
      {
        $sort: { totalVolume: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    return topVendors;
  }

  /**
   * Get top performing mediators
   */
  async getTopMediators(limit: number = 10): Promise<any[]> {
    const topMediators = await this.ProductDispute.aggregate([
      {
        $match: {
          dispute_status: "resolved",
          mediator: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$mediator",
          disputesResolved: { $sum: 1 },
          avgResolutionTime: {
            $avg: {
              $divide: [
                { $subtract: ["$resolved_at", "$createdAt"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
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
   * Get system health metrics
   */
  async getSystemHealth(): Promise<any> {
    const [transactionStats, disputeStats, userStats, recentErrors] =
      await Promise.all([
        this.ProductTransaction.aggregate([
          {
            $facet: {
              byStatus: [
                {
                  $group: {
                    _id: "$transaction_status",
                    count: { $sum: 1 },
                  },
                },
              ],
              recentFailures: [
                {
                  $match: {
                    transaction_status: "cancelled",
                    createdAt: {
                      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                  },
                },
                {
                  $count: "count",
                },
              ],
            },
          },
        ]),
        this.ProductDispute.aggregate([
          {
            $group: {
              _id: "$dispute_status",
              count: { $sum: 1 },
            },
          },
        ]),
        this.IndividualUser.countDocuments({}),
        this.ProductTransaction.find({
          transaction_status: "cancelled",
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        })
          .limit(5)
          .select("transaction_id buyer_email vendor_email reason"),
      ]);

    return {
      uptime: process.uptime(),
      transactions: {
        total:
          transactionStats[0]?.byStatus?.reduce(
            (sum: number, item: any) => sum + item.count,
            0,
          ) || 0,
        byStatus: transactionStats[0]?.byStatus || [],
        recentFailures: transactionStats[0]?.recentFailures?.[0]?.count || 0,
      },
      disputes: {
        total: disputeStats.reduce(
          (sum: number, item: any) => sum + item.count,
          0,
        ),
        byStatus: disputeStats,
      },
      users: {
        total: userStats,
      },
      recentErrors: recentErrors,
    };
  }
}
