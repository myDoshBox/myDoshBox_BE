import { Request, Response, NextFunction } from "express";
import ProductTransaction from "../../transactions/productsTransaction/productsTransaction.model";
import Payout from "../../transactions/productsTransaction/Payouts/payout.model";
import { createError } from "../../../utilities/errorHandler.util";
import TransactionAnalytics from "../adminAnalytics/transactionAnalytics.model";

/**
 * Get all transactions with filters, search, and pagination
 */
export const getAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      status,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    console.log(
      `Admin ${req.user?.email} is fetching transactions with filters`,
    );

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    // Status filter
    if (status && status !== "") {
      filter.transaction_status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
      }
    }

    // Search filter (transaction_id, buyer_email, vendor_email, vendor_name)
    if (search && search !== "") {
      filter.$or = [
        { transaction_id: { $regex: search, $options: "i" } },
        { buyer_email: { $regex: search, $options: "i" } },
        { vendor_email: { $regex: search, $options: "i" } },
        { vendor_name: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    // Fetch total count for pagination
    const total = await ProductTransaction.countDocuments(filter);

    // Fetch transactions
    const transactions = await ProductTransaction.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(limitNum)
      .select(
        "transaction_id buyer_email vendor_email vendor_name transaction_type transaction_status transaction_total sum_total products createdAt updatedAt payment_verified_at buyer_confirm_status seller_confirmed verified_payment_status",
      )
      .lean();

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      status: "success",
      message: "Transactions fetched successfully",
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return next(createError(500, "Failed to fetch transactions"));
  }
};

/**
 * Get single transaction by ID with full details
 */
export const getTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return next(createError(400, "Transaction ID is required"));
    }

    const transaction = await ProductTransaction.findOne({
      transaction_id: transactionId,
    })
      .populate({
        path: "shipping",
        model: "ShippingDetails",
        select:
          "shipping_company delivery_person_name delivery_person_number delivery_person_email delivery_date pick_up_address createdAt",
      })
      .lean();

    if (!transaction) {
      return next(createError(404, "Transaction not found"));
    }

    // Fetch related payout if exists
    const payout = await Payout.findOne({ transaction_id: transactionId })
      .select(
        "payout_status payout_method payout_amount transfer_reference created_at updated_at payout_failed payout_failure_reason manual_payout_reason",
      )
      .lean();

    // Fetch analytics if exists
    const analytics = await TransactionAnalytics.findOne({
      transaction_id: transactionId,
    })
      .select(
        "commission_amount revenue_recognized time_to_completion_hours dispute_resolution_time_hours",
      )
      .lean();

    res.status(200).json({
      status: "success",
      message: "Transaction details fetched successfully",
      data: {
        transaction,
        payout,
        analytics,
      },
    });
  } catch (error: any) {
    console.error("Error fetching transaction details:", error);
    return next(createError(500, "Failed to fetch transaction details"));
  }
};

/**
 * Get all payouts with filters and pagination
 */
export const getAllPayouts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      status,
      search,
      startDate,
      endDate,
    } = req.query;

    console.log(`Admin ${req.user?.email} is fetching payouts with filters`);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    // Status filter
    if (status && status !== "") {
      filter.payout_status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) {
        filter.created_at.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.created_at.$lte = new Date(endDate as string);
      }
    }

    // Search filter (transaction_id, vendor_email, vendor_name)
    if (search && search !== "") {
      filter.$or = [
        { transaction_id: { $regex: search, $options: "i" } },
        { vendor_email: { $regex: search, $options: "i" } },
        { vendor_name: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch total count for pagination
    const total = await Payout.countDocuments(filter);

    // Fetch payouts
    const payouts = await Payout.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: "transaction",
        select: "transaction_id buyer_email vendor_name transaction_total",
      })
      .lean();

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      status: "success",
      message: "Payouts fetched successfully",
      payouts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching payouts:", error);
    return next(createError(500, "Failed to fetch payouts"));
  }
};

/**
 * Get single payout by ID
 */
export const getPayoutById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { payoutId } = req.params;

    if (!payoutId) {
      return next(createError(400, "Payout ID is required"));
    }

    console.log(`Admin ${req.user?.email} is fetching payout: ${payoutId}`);

    const payout = await Payout.findById(payoutId)
      .populate({
        path: "transaction",
        select: "transaction_id buyer_email vendor_name transaction_total",
      })
      .lean();

    if (!payout) {
      return next(createError(404, "Payout not found"));
    }

    res.status(200).json({
      status: "success",
      message: "Payout details fetched successfully",
      data: payout,
    });
  } catch (error: any) {
    console.error("Error fetching payout details:", error);
    return next(createError(500, "Failed to fetch payout details"));
  }
};

/**
 * Process manual payout (admin action)
 */
export const processManualPayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { payoutId } = req.params;
    const { notes } = req.body;

    if (!payoutId) {
      console.log(`Admin is processing manual payout`);
      console.log(
        `${req.user?.id}, "checking the value of req user???????????"`,
      );
      return next(createError(400, "Payout ID is required"));
    }

    // Check if admin user ID exists
    if (!req.user?.id) {
      return next(createError(401, "Admin user not authenticated"));
    }

    console.log(
      `Admin ${req.user.email} is processing manual payout???????????: ${payoutId}`,
    );

    const payout = await Payout.findById(payoutId);

    if (!payout) {
      return next(createError(404, "Payout not found"));
    }

    if (payout.payout_status !== "manual_payout_required") {
      return next(
        createError(
          400,
          `Cannot process payout with status: ${payout.payout_status}`,
        ),
      );
    }

    // Update to processing
    payout.payout_status = "manual_payout_processing";
    // @ts-ignore - Type might not have this field yet
    payout.manual_payout_processed_by = req.user.id;

    if (notes) {
      payout.manual_payout_notes = notes;
    }

    await payout.save();

    // TODO: Here you would integrate with actual payment processing
    // For now, we'll mark it as completed

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update to completed
    payout.payout_status = "manual_payout_completed";
    payout.manual_payout_processed_at = new Date();
    await payout.save();

    res.status(200).json({
      status: "success",
      message: "Manual payout processed successfully",
      data: {
        payout_id: payout._id,
        transaction_id: payout.transaction_id,
        payout_status: payout.payout_status,
        payout_amount: payout.payout_amount,
      },
    });
  } catch (error: any) {
    console.error("Error processing manual payout:", error);
    return next(createError(500, "Failed to process manual payout"));
  }
};

/**
 * Update transaction status (admin action)
 */
export const updateTransactionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const { status, notes } = req.body;

    if (!transactionId || !status) {
      return next(createError(400, "Transaction ID and status are required"));
    }

    console.log(
      `Admin ${req.user?.email} is updating transaction ${transactionId} status to ${status}`,
    );

    const transaction = await ProductTransaction.findOne({
      transaction_id: transactionId,
    });

    if (!transaction) {
      return next(createError(404, "Transaction not found"));
    }

    const validStatuses = [
      "processing",
      "awaiting_payment",
      "payment_verified",
      "awaiting_shipping",
      "in_transit",
      "completed",
      "cancelled",
      "declined",
    ];

    if (!validStatuses.includes(status)) {
      return next(createError(400, `Invalid status: ${status}`));
    }

    transaction.transaction_status = status;

    // Add admin note if provided
    if (notes) {
      // @ts-ignore - assuming you have an admin_notes field
      transaction.admin_notes = transaction.admin_notes || [];
      // @ts-ignore
      transaction.admin_notes.push({
        admin_email: req.user?.email,
        note: notes,
        timestamp: new Date(),
      });
    }

    await transaction.save();

    res.status(200).json({
      status: "success",
      message: "Transaction status updated successfully",
      data: {
        transaction_id: transaction.transaction_id,
        transaction_status: transaction.transaction_status,
        updated_by: req.user?.email,
      },
    });
  } catch (error: any) {
    console.error("Error updating transaction status:", error);
    return next(createError(500, "Failed to update transaction status"));
  }
};

/**
 * Get transaction statistics summary
 */
export const getTransactionsSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
      }
    }

    const [statusCounts, totals] = await Promise.all([
      // Count by status
      ProductTransaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$transaction_status",
            count: { $sum: 1 },
            total_amount: { $sum: "$transaction_total" },
          },
        },
      ]),

      // Overall totals
      ProductTransaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total_transactions: { $sum: 1 },
            total_volume: { $sum: "$transaction_total" },
            avg_transaction: { $avg: "$transaction_total" },
          },
        },
      ]),
    ]);

    const summary = {
      by_status: statusCounts.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          total_amount: item.total_amount,
        };
        return acc;
      }, {}),
      totals: totals[0] || {
        total_transactions: 0,
        total_volume: 0,
        avg_transaction: 0,
      },
    };

    res.status(200).json({
      status: "success",
      message: "Transaction summary fetched successfully",
      data: summary,
    });
  } catch (error: any) {
    console.error("Error fetching transaction summary:", error);
    return next(createError(500, "Failed to fetch transaction summary"));
  }
};
