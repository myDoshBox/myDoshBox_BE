import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * TransactionAnalytics Model
 *
 * This model stores denormalized transaction data optimized for analytics and reporting.
 * It's updated via hooks and migrations to ensure data consistency.
 *
 * Benefits:
 * - Fast queries without complex joins
 * - Historical data preservation
 * - Simplified analytics calculations
 * - Audit trail for financial reporting
 */

export interface ITransactionAnalytics extends Document {
  // Core Transaction Info
  transaction_id: string;
  transaction_ref: mongoose.Schema.Types.ObjectId; // Reference to ProductTransaction
  transaction_date: Date;
  transaction_status: string;
  transaction_type: string;

  // Parties Involved
  buyer_email: string;
  buyer_name?: string;
  buyer_type: "individual" | "organization";
  vendor_email: string;
  vendor_name: string;
  vendor_type: "individual" | "organization";

  // Financial Breakdown
  sum_total: number; // Total product cost (what vendor receives)
  commission_amount: number; // Platform commission
  commission_percentage: number; // Commission rate (e.g., 1 for 1%)
  transaction_total: number; // Total charged to buyer (sum_total + commission)

  // Product Details
  product_count: number;
  product_categories?: string[];
  total_quantity: number;

  // Payment Tracking
  payment_initiated: boolean;
  payment_initiated_at?: Date;
  payment_verified: boolean;
  payment_verified_at?: Date;
  payment_method?: string;
  payment_reference?: string;

  // Payout Tracking
  payout_id?: mongoose.Schema.Types.ObjectId;
  payout_status?: string;
  payout_method?: "automatic" | "manual";
  payout_amount?: number; // Amount paid to vendor
  payout_initiated_at?: Date;
  payout_completed_at?: Date;
  payout_failed: boolean;
  payout_failure_reason?: string;

  // Dispute Tracking
  has_dispute: boolean;
  dispute_id?: mongoose.Schema.Types.ObjectId;
  dispute_status?: string;
  dispute_created_at?: Date;
  dispute_resolved_at?: Date;
  dispute_resolution_time_hours?: number;
  mediator_involved: boolean;
  mediator_id?: mongoose.Schema.Types.ObjectId;

  // Shipping Tracking
  shipping_submitted: boolean;
  shipping_submitted_at?: Date;
  shipping_company?: string;
  delivery_date?: Date;
  in_transit_at?: Date;

  // Completion Tracking
  buyer_confirmed: boolean;
  buyer_confirmed_at?: Date;
  completed: boolean;
  completed_at?: Date;
  cancelled: boolean;
  cancelled_at?: Date;
  cancellation_reason?: string;

  // Time Metrics (for analytics)
  time_to_payment_hours?: number; // Time from creation to payment
  time_to_shipping_hours?: number; // Time from payment to shipping
  time_to_delivery_hours?: number; // Time from shipping to delivery
  time_to_completion_hours?: number; // Total transaction time

  // Revenue Recognition
  revenue_recognized: boolean; // Commission recognized as revenue
  revenue_recognized_at?: Date;
  revenue_period: string; // e.g., "2024-01", "2024-Q1"

  // Metadata
  created_at: Date;
  updated_at: Date;
  last_status_change: Date;

  // Aggregation Helpers (for faster queries)
  date_only: Date; // Date without time for daily aggregations
  year: number;
  month: number;
  quarter: number;
  week: number;
  day_of_week: number;
}

export interface ITransactionAnalyticsModel extends Model<ITransactionAnalytics> {
  getFinancialSummary(
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      _id: null;
      total_volume: number;
      total_commission: number;
      total_payouts: number;
      pending_payouts: number;
      failed_payouts: number;
      total_transactions: number;
      completed_transactions: number;
      cancelled_transactions: number;
      transactions_with_disputes: number;
    }>
  >;

  getStatusBreakdown(
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      _id: string;
      count: number;
      total_amount: number;
    }>
  >;

  getTopVendors(
    limit?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    Array<{
      _id: string;
      vendor_name: string;
      total_transactions: number;
      total_volume: number;
      total_commission_generated: number;
      avg_transaction_value: number;
    }>
  >;

  getRevenueTrends(
    groupBy: "day" | "month" | "quarter",
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      _id: any; // Could be Date, {year, month}, or {year, quarter}
      total_revenue: number;
      total_volume: number;
      transaction_count: number;
    }>
  >;
}

// Fixed: Added the second generic type parameter
const transactionAnalyticsSchema = new Schema<
  ITransactionAnalytics,
  ITransactionAnalyticsModel
>(
  {
    // Core Transaction Info
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    transaction_ref: {
      type: Schema.Types.ObjectId,
      ref: "ProductTransaction",
      required: true,
      index: true,
    },

    transaction_date: {
      type: Date,
      required: true,
      index: true,
    },

    transaction_status: {
      type: String,
      required: true,
      index: true,
      enum: [
        "processing",
        "awaiting_payment",
        "payment_verified",
        "awaiting_shipping",
        "in_transit",
        "completed",
        "cancelled",
        "declined",
        "pending_manual_payout",
        "manual_payout_processing",
      ],
    },

    transaction_type: {
      type: String,
      required: true,
      enum: ["goods", "services", "digital", "escrow"],
    },

    // Parties
    buyer_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    buyer_name: {
      type: String,
      trim: true,
    },

    buyer_type: {
      type: String,
      enum: ["individual", "organization"],
      index: true,
    },

    vendor_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    vendor_name: {
      type: String,
      required: true,
      trim: true,
    },

    vendor_type: {
      type: String,
      enum: ["individual", "organization"],
      index: true,
    },

    // Financial
    sum_total: {
      type: Number,
      required: true,
      min: 0,
    },

    commission_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    commission_percentage: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
      max: 100,
    },

    transaction_total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Products
    product_count: {
      type: Number,
      required: true,
      min: 1,
    },

    product_categories: [
      {
        type: String,
        trim: true,
      },
    ],

    total_quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Payment
    payment_initiated: {
      type: Boolean,
      default: false,
      index: true,
    },

    payment_initiated_at: {
      type: Date,
    },

    payment_verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    payment_verified_at: {
      type: Date,
    },

    payment_method: {
      type: String,
    },

    payment_reference: {
      type: String,
      sparse: true,
      index: true,
    },

    // Payout
    payout_id: {
      type: Schema.Types.ObjectId,
      ref: "Payout",
      sparse: true,
      index: true,
    },

    payout_status: {
      type: String,
      enum: [
        "pending_initiation",
        "transfer_initiated",
        "transfer_pending",
        "transfer_success",
        "transfer_failed",
        "manual_payout_required",
        "manual_payout_processing",
        "manual_payout_completed",
        "reversed",
        "cancelled",
      ],
      index: true,
    },

    payout_method: {
      type: String,
      enum: ["automatic", "manual"],
      index: true,
    },

    payout_amount: {
      type: Number,
      min: 0,
    },

    payout_initiated_at: {
      type: Date,
    },

    payout_completed_at: {
      type: Date,
    },

    payout_failed: {
      type: Boolean,
      default: false,
      index: true,
    },

    payout_failure_reason: {
      type: String,
    },

    // Dispute
    has_dispute: {
      type: Boolean,
      default: false,
      index: true,
    },

    dispute_id: {
      type: Schema.Types.ObjectId,
      ref: "ProductDispute",
      sparse: true,
    },

    dispute_status: {
      type: String,
      enum: [
        "In_Dispute",
        "escalated_to_mediator",
        "resolving",
        "resolved",
        "cancelled",
      ],
    },

    dispute_created_at: {
      type: Date,
    },

    dispute_resolved_at: {
      type: Date,
    },

    dispute_resolution_time_hours: {
      type: Number,
      min: 0,
    },

    mediator_involved: {
      type: Boolean,
      default: false,
      index: true,
    },

    mediator_id: {
      type: Schema.Types.ObjectId,
      ref: "Mediator",
      sparse: true,
    },

    // Shipping
    shipping_submitted: {
      type: Boolean,
      default: false,
    },

    shipping_submitted_at: {
      type: Date,
    },

    shipping_company: {
      type: String,
    },

    delivery_date: {
      type: Date,
    },

    in_transit_at: {
      type: Date,
    },

    // Completion
    buyer_confirmed: {
      type: Boolean,
      default: false,
    },

    buyer_confirmed_at: {
      type: Date,
    },

    completed: {
      type: Boolean,
      default: false,
      index: true,
    },

    completed_at: {
      type: Date,
    },

    cancelled: {
      type: Boolean,
      default: false,
      index: true,
    },

    cancelled_at: {
      type: Date,
    },

    cancellation_reason: {
      type: String,
    },

    // Time Metrics
    time_to_payment_hours: {
      type: Number,
      min: 0,
    },

    time_to_shipping_hours: {
      type: Number,
      min: 0,
    },

    time_to_delivery_hours: {
      type: Number,
      min: 0,
    },

    time_to_completion_hours: {
      type: Number,
      min: 0,
    },

    // Revenue
    revenue_recognized: {
      type: Boolean,
      default: false,
      index: true,
    },

    revenue_recognized_at: {
      type: Date,
    },

    revenue_period: {
      type: String,
      index: true,
    },

    // Metadata
    last_status_change: {
      type: Date,
      default: Date.now,
    },

    // Aggregation Helpers
    date_only: {
      type: Date,
      index: true,
    },

    year: {
      type: Number,
      index: true,
    },

    month: {
      type: Number,
      min: 1,
      max: 12,
      index: true,
    },

    quarter: {
      type: Number,
      min: 1,
      max: 4,
      index: true,
    },

    week: {
      type: Number,
      min: 1,
      max: 53,
    },

    day_of_week: {
      type: Number,
      min: 0,
      max: 6,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ========== COMPOUND INDEXES ==========
transactionAnalyticsSchema.index({ transaction_status: 1, created_at: -1 });
transactionAnalyticsSchema.index({ completed: 1, completed_at: -1 });
transactionAnalyticsSchema.index({ vendor_email: 1, completed: 1 });
transactionAnalyticsSchema.index({ buyer_email: 1, created_at: -1 });
transactionAnalyticsSchema.index({ year: 1, month: 1, completed: 1 });
transactionAnalyticsSchema.index({ revenue_period: 1, revenue_recognized: 1 });
transactionAnalyticsSchema.index({ payout_status: 1, payout_completed_at: -1 });
transactionAnalyticsSchema.index({ has_dispute: 1, dispute_status: 1 });
transactionAnalyticsSchema.index({ date_only: 1, completed: 1 });

// ========== MIDDLEWARE ==========
transactionAnalyticsSchema.pre("save", function (next) {
  const doc = this as ITransactionAnalytics;

  // Set date_only (date without time)
  const date = new Date(doc.transaction_date);
  doc.date_only = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Set year, month, quarter, week, day_of_week
  doc.year = date.getFullYear();
  doc.month = date.getMonth() + 1;
  doc.quarter = Math.floor(date.getMonth() / 3) + 1;
  doc.day_of_week = date.getDay();

  // Calculate week number
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  doc.week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  // Set revenue period (YYYY-MM format)
  doc.revenue_period = `${doc.year}-${String(doc.month).padStart(2, "0")}`;

  // Calculate time metrics
  if (doc.payment_verified_at && doc.transaction_date) {
    doc.time_to_payment_hours =
      (doc.payment_verified_at.getTime() - doc.transaction_date.getTime()) /
      (1000 * 60 * 60);
  }

  if (doc.shipping_submitted_at && doc.payment_verified_at) {
    doc.time_to_shipping_hours =
      (doc.shipping_submitted_at.getTime() -
        doc.payment_verified_at.getTime()) /
      (1000 * 60 * 60);
  }

  if (doc.buyer_confirmed_at && doc.in_transit_at) {
    doc.time_to_delivery_hours =
      (doc.buyer_confirmed_at.getTime() - doc.in_transit_at.getTime()) /
      (1000 * 60 * 60);
  }

  if (doc.completed_at && doc.transaction_date) {
    doc.time_to_completion_hours =
      (doc.completed_at.getTime() - doc.transaction_date.getTime()) /
      (1000 * 60 * 60);
  }

  // Calculate dispute resolution time
  if (doc.dispute_resolved_at && doc.dispute_created_at) {
    doc.dispute_resolution_time_hours =
      (doc.dispute_resolved_at.getTime() - doc.dispute_created_at.getTime()) /
      (1000 * 60 * 60);
  }

  // Auto-recognize revenue when payout is completed
  if (
    doc.payout_status === "transfer_success" ||
    doc.payout_status === "manual_payout_completed"
  ) {
    if (!doc.revenue_recognized) {
      doc.revenue_recognized = true;
      doc.revenue_recognized_at = new Date();
    }
  }

  next();
});

// ========== STATIC METHODS ==========

/**
 * Get financial summary for a date range
 */
transactionAnalyticsSchema.statics.getFinancialSummary = async function (
  startDate: Date,
  endDate: Date,
) {
  return this.aggregate([
    {
      $match: {
        transaction_date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total_volume: { $sum: "$transaction_total" },
        total_commission: { $sum: "$commission_amount" },
        total_payouts: {
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
        pending_payouts: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$payout_status",
                  [
                    "pending_initiation",
                    "transfer_initiated",
                    "transfer_pending",
                  ],
                ],
              },
              "$payout_amount",
              0,
            ],
          },
        },
        failed_payouts: {
          $sum: {
            $cond: [{ $eq: ["$payout_failed", true] }, 1, 0],
          },
        },
        total_transactions: { $sum: 1 },
        completed_transactions: {
          $sum: { $cond: ["$completed", 1, 0] },
        },
        cancelled_transactions: {
          $sum: { $cond: ["$cancelled", 1, 0] },
        },
        transactions_with_disputes: {
          $sum: { $cond: ["$has_dispute", 1, 0] },
        },
      },
    },
  ]);
};

/**
 * Get transaction breakdown by status
 */
transactionAnalyticsSchema.statics.getStatusBreakdown = async function (
  startDate: Date,
  endDate: Date,
) {
  return this.aggregate([
    {
      $match: {
        transaction_date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$transaction_status",
        count: { $sum: 1 },
        total_amount: { $sum: "$transaction_total" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

/**
 * Get top vendors by volume
 */
transactionAnalyticsSchema.statics.getTopVendors = async function (
  limit: number = 10,
  startDate?: Date,
  endDate?: Date,
) {
  const matchStage: any = { completed: true };
  if (startDate && endDate) {
    matchStage.completed_at = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$vendor_email",
        vendor_name: { $first: "$vendor_name" },
        total_transactions: { $sum: 1 },
        total_volume: { $sum: "$sum_total" },
        total_commission_generated: { $sum: "$commission_amount" },
        avg_transaction_value: { $avg: "$sum_total" },
      },
    },
    { $sort: { total_volume: -1 } },
    { $limit: limit },
  ]);
};

/**
 * Get daily/monthly revenue trends
 */
transactionAnalyticsSchema.statics.getRevenueTrends = async function (
  groupBy: "day" | "month" | "quarter",
  startDate: Date,
  endDate: Date,
) {
  let groupField: any;

  if (groupBy === "day") {
    groupField = "$date_only";
  } else if (groupBy === "month") {
    groupField = { year: "$year", month: "$month" };
  } else {
    groupField = { year: "$year", quarter: "$quarter" };
  }

  return this.aggregate([
    {
      $match: {
        transaction_date: { $gte: startDate, $lte: endDate },
        revenue_recognized: true,
      },
    },
    {
      $group: {
        _id: groupField,
        total_revenue: { $sum: "$commission_amount" },
        total_volume: { $sum: "$transaction_total" },
        transaction_count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// ========== CREATE MODEL ==========
const TransactionAnalytics = mongoose.model<
  ITransactionAnalytics,
  ITransactionAnalyticsModel
>("TransactionAnalytics", transactionAnalyticsSchema);

export default TransactionAnalytics;
