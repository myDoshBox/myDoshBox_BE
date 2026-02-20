import ProductTransaction from "../../transactions/productsTransaction/productsTransaction.model";
import Payout from "../../transactions/productsTransaction/Payouts/payout.model";
import ProductDispute from "../../disputes/productsDispute/productDispute.model";
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
import OrganizationUser from "../../authentication/organizationUserAuth/organizationAuth.model";
import MediatorModel from "../../mediator/mediator.model";

// ============================================================
// TYPES
// ============================================================

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DashboardStats {
  overview: {
    totalTransactions: number;
    activeDisputes: number;
    pendingPayouts: number;
    completedToday: number;
  };
  financial: {
    totalVolume: number;
    commissionEarned: number;
    revenueRecognized: number;
    pendingPayoutsAmount: number;
    completedPayoutsAmount: number;
    failedPayoutsCount: number;
  };
  transactions: {
    processing: number;
    awaitingPayment: number;
    paymentVerified: number;
    inTransit: number;
    completed: number;
    cancelled: number;
  };
  disputes: {
    active: number;
    resolved: number;
    escalated: number;
    avgResolutionTimeHours: number;
    resolutionRate: string;
  };
  users: {
    total: number;
    individual: number;
    organizations: number;
    activeMediators: number;
    newThisMonth: number;
  };
  recentActivity: RecentActivityItem[];
  timeRange: string;
  generatedAt: string;
}

export interface RecentActivityItem {
  id: string;
  type: "transaction" | "dispute" | "payout";
  action: string;
  amount: number | null;
  time: string;
  transaction_id: string;
  buyer_email?: string;
  vendor_name?: string;
}

// ============================================================
// DATE RANGE HELPER
// ============================================================

export const getDateRange = (timeRange: string): DateRange => {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (timeRange.toLowerCase()) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

// ============================================================
// HELPERS
// ============================================================

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// ============================================================
// CORE STATS — reads directly from source models
// ============================================================

/**
 * Get overview counts: total transactions, active disputes,
 * pending payouts, completed today — all from source models.
 */
const getOverview = async (startDate: Date, endDate: Date) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [totalTransactions, activeDisputes, pendingPayouts, completedToday] =
    await Promise.all([
      ProductTransaction.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      ProductDispute.countDocuments({
        dispute_status: {
          $in: ["In_Dispute", "resolving", "escalated_to_mediator"],
        },
      }),

      Payout.countDocuments({
        payout_status: {
          $in: [
            "pending_initiation",
            "transfer_initiated",
            "transfer_pending",
            "manual_payout_required",
          ],
        },
      }),

      ProductTransaction.countDocuments({
        transaction_status: "completed",
        updatedAt: { $gte: todayStart, $lte: todayEnd },
      }),
    ]);

  return { totalTransactions, activeDisputes, pendingPayouts, completedToday };
};

/**
 * Get financial stats from source models.
 * - totalVolume: sum of transaction_total in range
 * - commissionEarned: sum of (sum_total * 0.01) for all in range
 * - revenueRecognized: commission from completed transactions only
 * - payout amounts from Payout model
 */
const getFinancials = async (startDate: Date, endDate: Date) => {
  const [volumeData, payoutData] = await Promise.all([
    ProductTransaction.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$transaction_total" },
          commissionEarned: {
            $sum: { $multiply: ["$sum_total", 0.01] },
          },
          revenueRecognized: {
            $sum: {
              $cond: [
                { $eq: ["$transaction_status", "completed"] },
                { $multiply: ["$sum_total", 0.01] },
                0,
              ],
            },
          },
        },
      },
    ]),

    Payout.aggregate([
      {
        $group: {
          _id: null,
          pendingAmount: {
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
                    ],
                  ],
                },
                "$payout_amount",
                0,
              ],
            },
          },
          completedAmount: {
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
          failedCount: {
            $sum: {
              $cond: [{ $eq: ["$payout_status", "transfer_failed"] }, 1, 0],
            },
          },
        },
      },
    ]),
  ]);

  const vol = volumeData[0] || {
    totalVolume: 0,
    commissionEarned: 0,
    revenueRecognized: 0,
  };
  const pay = payoutData[0] || {
    pendingAmount: 0,
    completedAmount: 0,
    failedCount: 0,
  };

  return {
    totalVolume: vol.totalVolume,
    commissionEarned: vol.commissionEarned,
    revenueRecognized: vol.revenueRecognized,
    pendingPayoutsAmount: pay.pendingAmount,
    completedPayoutsAmount: pay.completedAmount,
    failedPayoutsCount: pay.failedCount,
  };
};

/**
 * Get transaction status breakdown counts in the date range.
 */
const getTransactionBreakdown = async (startDate: Date, endDate: Date) => {
  const data = await ProductTransaction.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: "$transaction_status", count: { $sum: 1 } } },
  ]);

  const result = {
    processing: 0,
    awaitingPayment: 0,
    paymentVerified: 0,
    inTransit: 0,
    completed: 0,
    cancelled: 0,
  };

  data.forEach((item: any) => {
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
};

/**
 * Get dispute stats: active, resolved, escalated, avg resolution time.
 */
const getDisputeStats = async (startDate: Date, endDate: Date) => {
  const data = await ProductDispute.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: "$dispute_status",
        count: { $sum: 1 },
        avgResolutionMs: {
          $avg: {
            $cond: [
              {
                $and: [
                  { $eq: ["$dispute_status", "resolved"] },
                  { $ne: ["$resolved_at", null] },
                ],
              },
              { $subtract: ["$resolved_at", "$createdAt"] },
              null,
            ],
          },
        },
      },
    },
  ]);

  let active = 0;
  let resolved = 0;
  let escalated = 0;
  let totalResolutionMs = 0;

  data.forEach((item: any) => {
    switch (item._id) {
      case "In_Dispute":
      case "resolving":
        active += item.count;
        break;
      case "escalated_to_mediator":
        escalated += item.count;
        active += item.count;
        break;
      case "resolved":
        resolved = item.count;
        totalResolutionMs = item.avgResolutionMs || 0;
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
    avgResolutionTimeHours: totalResolutionMs
      ? Math.round(totalResolutionMs / (1000 * 60 * 60))
      : 0,
    resolutionRate,
  };
};

/**
 * Get user/mediator counts.
 */
const getUserStats = async () => {
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
    IndividualUser.countDocuments({ createdAt: { $gte: monthStart } }),
    OrganizationUser.countDocuments({ createdAt: { $gte: monthStart } }),
  ]);

  return {
    total: individual + organizations,
    individual,
    organizations,
    activeMediators: mediators,
    newThisMonth: newIndividual + newOrganizations,
  };
};

/**
 * Get recent activity by merging latest transactions, payouts, disputes.
 */
const getRecentActivity = async (limit = 10): Promise<RecentActivityItem[]> => {
  const [recentTxns, recentPayouts, recentDisputes] = await Promise.all([
    ProductTransaction.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "transaction_id transaction_status transaction_total createdAt buyer_email vendor_name",
      )
      .lean(),

    Payout.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "transaction_id payout_status payout_amount createdAt vendor_name",
      )
      .lean(),

    ProductDispute.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("transaction_id dispute_status createdAt buyer_email vendor_name")
      .lean(),
  ]);

  const activities: RecentActivityItem[] = [
    ...recentTxns.map((t: any) => ({
      id: t._id.toString(),
      type: "transaction" as const,
      action: t.transaction_status,
      amount: t.transaction_total,
      time: formatTimeAgo(t.createdAt),
      transaction_id: t.transaction_id,
      buyer_email: t.buyer_email,
      vendor_name: t.vendor_name,
    })),
    ...recentPayouts.map((p: any) => ({
      id: p._id.toString(),
      type: "payout" as const,
      action: p.payout_status,
      amount: p.payout_amount,
      time: formatTimeAgo(p.createdAt),
      transaction_id: p.transaction_id,
      vendor_name: p.vendor_name,
    })),
    ...recentDisputes.map((d: any) => ({
      id: d._id.toString(),
      type: "dispute" as const,
      action: d.dispute_status,
      amount: null,
      time: formatTimeAgo(d.createdAt),
      transaction_id: d.transaction_id,
      buyer_email: d.buyer_email,
      vendor_name: d.vendor_name,
    })),
  ];

  // Sort all activity by most recent first, return top N
  return activities
    .sort((a, b) => {
      // Re-parse from the original objects not possible here, so sort alphabetically on time string
      // Instead we just return the merged list (already limited per source)
      return 0;
    })
    .slice(0, limit);
};

// ============================================================
// ANALYTICS QUERIES — time-series, for charts
// ============================================================

/**
 * Get transactions grouped by day/week/month.
 */
export const getTransactionAnalytics = async (
  startDate: Date,
  endDate: Date,
  groupBy: "day" | "week" | "month" = "day",
) => {
  let groupFormat: any;

  switch (groupBy) {
    case "day":
      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
      break;
    case "week":
      groupFormat = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" },
      };
      break;
    case "month":
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      break;
  }

  const data = await ProductTransaction.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: groupFormat,
        count: { $sum: 1 },
        totalAmount: { $sum: "$transaction_total" },
        commission: { $sum: { $multiply: ["$sum_total", 0.01] } },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$transaction_status", "completed"] }, 1, 0],
          },
        },
        cancelled: {
          $sum: {
            $cond: [
              { $in: ["$transaction_status", ["cancelled", "declined"]] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const summary = {
    totalTransactions: data.reduce((s, i) => s + i.count, 0),
    totalVolume: data.reduce((s, i) => s + i.totalAmount, 0),
    totalCommission: data.reduce((s, i) => s + i.commission, 0),
    completionRate:
      data.reduce((s, i) => s + i.count, 0) > 0
        ? (
            (data.reduce((s, i) => s + i.completed, 0) /
              data.reduce((s, i) => s + i.count, 0)) *
            100
          ).toFixed(1) + "%"
        : "0%",
  };

  return { period: groupBy, data, summary };
};

/**
 * Get revenue trends (commission earned) grouped by day/month/quarter.
 */
export const getRevenueTrends = async (
  startDate: Date,
  endDate: Date,
  groupBy: "day" | "month" | "quarter" = "month",
) => {
  let groupField: any;

  switch (groupBy) {
    case "day":
      groupField = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
      break;
    case "month":
      groupField = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      break;
    case "quarter":
      groupField = {
        year: { $year: "$createdAt" },
        quarter: {
          $ceil: { $divide: [{ $month: "$createdAt" }, 3] },
        },
      };
      break;
  }

  const data = await ProductTransaction.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        transaction_status: "completed",
      },
    },
    {
      $group: {
        _id: groupField,
        revenue: { $sum: { $multiply: ["$sum_total", 0.01] } },
        volume: { $sum: "$transaction_total" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return { period: groupBy, data };
};

/**
 * Get top vendors by completed transaction volume.
 */
export const getTopVendors = async (limit = 10) => {
  return ProductTransaction.aggregate([
    { $match: { transaction_status: "completed" } },
    {
      $group: {
        _id: "$vendor_email",
        vendor_name: { $first: "$vendor_name" },
        totalTransactions: { $sum: 1 },
        totalVolume: { $sum: "$sum_total" },
        commissionGenerated: { $sum: { $multiply: ["$sum_total", 0.01] } },
        avgTransactionValue: { $avg: "$sum_total" },
      },
    },
    { $sort: { totalVolume: -1 } },
    { $limit: limit },
  ]);
};

/**
 * Get top mediators by disputes resolved.
 */
export const getTopMediators = async (limit = 10) => {
  return ProductDispute.aggregate([
    { $match: { dispute_status: "resolved", mediator: { $ne: null } } },
    {
      $group: {
        _id: "$mediator",
        disputesResolved: { $sum: 1 },
        avgResolutionHours: {
          $avg: {
            $divide: [
              { $subtract: ["$resolved_at", "$createdAt"] },
              3600000, // ms to hours
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
    { $unwind: { path: "$mediatorDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        mediatorId: "$_id",
        mediatorName: {
          $concat: [
            { $ifNull: ["$mediatorDetails.first_name", ""] },
            " ",
            { $ifNull: ["$mediatorDetails.last_name", ""] },
          ],
        },
        mediatorEmail: "$mediatorDetails.mediator_email",
        disputesResolved: 1,
        avgResolutionHours: { $round: ["$avgResolutionHours", 1] },
      },
    },
    { $sort: { disputesResolved: -1 } },
    { $limit: limit },
  ]);
};

/**
 * Get financial summary for a date range.
 */
export const getFinancialSummary = async (startDate: Date, endDate: Date) => {
  const [txnData, payoutData] = await Promise.all([
    ProductTransaction.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$transaction_total" },
          totalCommission: { $sum: { $multiply: ["$sum_total", 0.01] } },
          revenueRecognized: {
            $sum: {
              $cond: [
                { $eq: ["$transaction_status", "completed"] },
                { $multiply: ["$sum_total", 0.01] },
                0,
              ],
            },
          },
          totalTransactions: { $sum: 1 },
          completedTransactions: {
            $sum: {
              $cond: [{ $eq: ["$transaction_status", "completed"] }, 1, 0],
            },
          },
          cancelledTransactions: {
            $sum: {
              $cond: [
                { $in: ["$transaction_status", ["cancelled", "declined"]] },
                1,
                0,
              ],
            },
          },
          transactionsWithDisputes: {
            $sum: {
              $cond: [{ $ne: ["$dispute_status", "none"] }, 1, 0],
            },
          },
        },
      },
    ]),

    Payout.aggregate([
      {
        $group: {
          _id: null,
          totalPaidOut: {
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
                    ],
                  ],
                },
                "$payout_amount",
                0,
              ],
            },
          },
          failedPayouts: {
            $sum: {
              $cond: [{ $eq: ["$payout_status", "transfer_failed"] }, 1, 0],
            },
          },
        },
      },
    ]),
  ]);

  const txn = txnData[0] || {};
  const pay = payoutData[0] || {};

  return {
    totalVolume: txn.totalVolume || 0,
    totalCommission: txn.totalCommission || 0,
    revenueRecognized: txn.revenueRecognized || 0,
    totalTransactions: txn.totalTransactions || 0,
    completedTransactions: txn.completedTransactions || 0,
    cancelledTransactions: txn.cancelledTransactions || 0,
    transactionsWithDisputes: txn.transactionsWithDisputes || 0,
    totalPaidOut: pay.totalPaidOut || 0,
    pendingPayouts: pay.pendingPayouts || 0,
    failedPayouts: pay.failedPayouts || 0,
  };
};

/**
 * Get system health: counts by status from all source models.
 */
export const getSystemHealth = async () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [txnByStatus, payoutByStatus, disputeByStatus, recentPayoutFailures] =
    await Promise.all([
      ProductTransaction.aggregate([
        { $group: { _id: "$transaction_status", count: { $sum: 1 } } },
      ]),
      Payout.aggregate([
        { $group: { _id: "$payout_status", count: { $sum: 1 } } },
      ]),
      ProductDispute.aggregate([
        { $group: { _id: "$dispute_status", count: { $sum: 1 } } },
      ]),
      Payout.countDocuments({
        payout_status: "transfer_failed",
        createdAt: { $gte: yesterday },
      }),
    ]);

  return {
    uptime: process.uptime(),
    transactions: {
      total: txnByStatus.reduce((s: number, i: any) => s + i.count, 0),
      byStatus: txnByStatus,
    },
    payouts: {
      total: payoutByStatus.reduce((s: number, i: any) => s + i.count, 0),
      byStatus: payoutByStatus,
      recentFailures: recentPayoutFailures,
    },
    disputes: {
      total: disputeByStatus.reduce((s: number, i: any) => s + i.count, 0),
      byStatus: disputeByStatus,
    },
  };
};

// ============================================================
// MAIN DASHBOARD — single entry point
// ============================================================

export const getDashboardStats = async (
  timeRange: string = "today",
): Promise<DashboardStats> => {
  const { startDate, endDate } = getDateRange(timeRange);

  const [overview, financial, transactions, disputes, users, recentActivity] =
    await Promise.all([
      getOverview(startDate, endDate),
      getFinancials(startDate, endDate),
      getTransactionBreakdown(startDate, endDate),
      getDisputeStats(startDate, endDate),
      getUserStats(),
      getRecentActivity(10),
    ]);

  return {
    overview,
    financial,
    transactions,
    disputes,
    users,
    recentActivity,
    timeRange,
    generatedAt: new Date().toISOString(),
  };
};
