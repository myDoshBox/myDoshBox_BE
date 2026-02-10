import {
  errorHandler,
  createError,
} from "./../../../../utilities/errorHandler.util";
import { NextFunction, Request, Response } from "express";
import Payout from "./payout.model";
import ProductTransaction from "../productsTransaction.model";
import {
  sendSuccessfulEscrowEmailToVendor,
  sendSuccessfulEscrowEmailToInitiator,
} from "../productTransaction.mail";

/**
 * Get all payouts with filtering and pagination
 * Admin endpoint
 */
export const getAllPayouts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const status = req.query.status as string;
    const method = req.query.method as string;
    const vendor_email = req.query.vendor_email as string;

    // Build filter
    const filter: any = {};
    if (status) filter.payout_status = status;
    if (method) filter.payout_method = method;
    if (vendor_email) filter.vendor_email = vendor_email;

    const total = await Payout.countDocuments(filter);

    const payouts = await Payout.find(filter)
      .populate({
        path: "transaction",
        select:
          "transaction_id buyer_email products sum_total transaction_total",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      status: "success",
      message: "Payouts fetched successfully",
      data: {
        payouts,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("getAllPayouts error:", error);
    return next(createError(500, "Server error"));
  }
};

/**
 * Get single payout details
 */
export const getSinglePayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { payout_id } = req.params;

    if (!payout_id) {
      return next(createError(400, "Payout ID is required"));
    }

    const payout = await Payout.findById(payout_id).populate({
      path: "transaction",
      select:
        "transaction_id buyer_email vendor_email products sum_total transaction_total delivery_address",
    });

    if (!payout) {
      return next(createError(404, "Payout not found"));
    }

    res.json({
      status: "success",
      message: "Payout details fetched successfully",
      data: payout,
    });
  } catch (error) {
    console.error("getSinglePayout error:", error);
    return next(createError(500, "Server error"));
  }
};

/**
 * Get payout by transaction ID
 */
export const getPayoutByTransactionId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { transaction_id } = req.params;

    if (!transaction_id) {
      return next(createError(400, "Transaction ID is required"));
    }

    const payout = await Payout.findOne({ transaction_id }).populate({
      path: "transaction",
      select:
        "transaction_id buyer_email vendor_email products sum_total transaction_total",
    });

    if (!payout) {
      return next(createError(404, "No payout found for this transaction"));
    }

    res.json({
      status: "success",
      message: "Payout details fetched successfully",
      data: payout,
    });
  } catch (error) {
    console.error("getPayoutByTransactionId error:", error);
    return next(createError(500, "Server error"));
  }
};

/**
 * Get payouts requiring manual intervention
 * Admin endpoint
 */
export const getPayoutsRequiringManualIntervention = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payouts = await Payout.find({
      payout_status: {
        $in: ["manual_payout_required", "transfer_failed"],
      },
    })
      .populate({
        path: "transaction",
        select: "transaction_id buyer_email products",
      })
      .sort({ manual_payout_requested_at: 1 });

    res.json({
      status: "success",
      message: "Manual intervention payouts fetched successfully",
      data: {
        count: payouts.length,
        payouts,
      },
    });
  } catch (error) {
    console.error("getPayoutsRequiringManualIntervention error:", error);
    return next(createError(500, "Server error"));
  }
};

/**
 * Mark manual payout as completed
 * Admin endpoint
 */
export const completeManualPayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { payout_id } = req.params;
    const { admin_email, proof, notes } = req.body;

    if (!payout_id || !admin_email) {
      return next(createError(400, "Payout ID and admin email are required"));
    }

    const payout = await Payout.findById(payout_id).populate("transaction");

    if (!payout) {
      return next(createError(404, "Payout not found"));
    }

    if (
      payout.payout_status !== "manual_payout_required" &&
      payout.payout_status !== "manual_payout_processing"
    ) {
      return next(
        createError(
          400,
          `Cannot complete payout with status: ${payout.payout_status}`,
        ),
      );
    }

    // Mark as completed
    await payout.markAsManualPayoutCompleted(admin_email, proof, notes);

    // Get transaction details
    const transaction = payout.transaction as any;

    // Send confirmation emails
    try {
      await Promise.all([
        sendSuccessfulEscrowEmailToVendor(
          payout.transaction_id,
          payout.vendor_name,
          payout.vendor_email,
          transaction?.products?.[0]?.name || "Product",
          payout.payout_amount.toString(),
        ),
        sendSuccessfulEscrowEmailToInitiator(
          payout.transaction_id,
          payout.vendor_name,
          transaction?.buyer_email || "",
          transaction?.products?.[0]?.name || "Product",
        ),
      ]);

      payout.vendor_notified = true;
      payout.vendor_notified_at = new Date();
      payout.buyer_notified = true;
      payout.buyer_notified_at = new Date();
      await payout.save();
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    res.json({
      status: "success",
      message: "Manual payout marked as completed",
      data: payout,
    });
  } catch (error) {
    console.error("completeManualPayout error:", error);
    return next(createError(500, "Server error"));
  }
};

/**
 * Retry failed automatic payout
 * Admin endpoint
 */
export const retryFailedPayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { payout_id } = req.params;

    if (!payout_id) {
      return next(createError(400, "Payout ID is required"));
    }

    const payout = await Payout.findById(payout_id);

    if (!payout) {
      return next(createError(404, "Payout not found"));
    }

    if (payout.payout_status !== "transfer_failed") {
      return next(
        createError(400, "Can only retry failed automatic transfers"),
      );
    }

    if (!payout.can_retry) {
      return next(
        createError(
          400,
          `Maximum retry attempts (${payout.max_retries}) exceeded. Manual payout required.`,
        ),
      );
    }

    // Reset status to pending to trigger retry
    payout.payout_status = "pending_initiation";
    await payout.save();

    // TODO: Implement retry logic here
    // This would trigger the same transfer initiation logic from buyerConfirmsProduct

    res.json({
      status: "success",
      message: "Payout retry initiated",
      data: {
        payout_id: payout._id,
        retry_count: payout.retry_count,
        max_retries: payout.max_retries,
      },
    });
  } catch (error) {
    console.error("retryFailedPayout error:", error);
    return next(createError(500, "Server error"));
  }
};

/**
 * Get payout statistics
 * Admin endpoint
 */
export const getPayoutStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await Payout.aggregate([
      {
        $group: {
          _id: "$payout_status",
          count: { $sum: 1 },
          total_amount: { $sum: "$payout_amount" },
        },
      },
    ]);

    const methodStats = await Payout.aggregate([
      {
        $group: {
          _id: "$payout_method",
          count: { $sum: 1 },
          total_amount: { $sum: "$payout_amount" },
        },
      },
    ]);

    const totalPayouts = await Payout.countDocuments();
    const totalAmount = await Payout.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$payout_amount" },
        },
      },
    ]);

    const pendingCount = await Payout.countDocuments({
      payout_status: {
        $in: [
          "pending_initiation",
          "transfer_initiated",
          "transfer_pending",
          "manual_payout_processing",
        ],
      },
    });

    const completedCount = await Payout.countDocuments({
      payout_status: {
        $in: ["transfer_success", "manual_payout_completed"],
      },
    });

    const failedCount = await Payout.countDocuments({
      payout_status: {
        $in: ["transfer_failed", "manual_payout_required"],
      },
    });

    res.json({
      status: "success",
      message: "Payout statistics fetched successfully",
      data: {
        total_payouts: totalPayouts,
        total_amount: totalAmount[0]?.total || 0,
        pending_count: pendingCount,
        completed_count: completedCount,
        failed_count: failedCount,
        status_breakdown: stats,
        method_breakdown: methodStats,
      },
    });
  } catch (error) {
    console.error("getPayoutStats error:", error);
    return next(createError(500, "Server error"));
  }
};

/**
 * Get vendor's payout history
 */
export const getVendorPayoutHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { vendor_email } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!vendor_email) {
      return next(createError(400, "Vendor email is required"));
    }

    const total = await Payout.countDocuments({ vendor_email });

    const payouts = await Payout.find({ vendor_email })
      .populate({
        path: "transaction",
        select: "transaction_id products buyer_email",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    // Calculate total earned
    const totalEarned = await Payout.aggregate([
      {
        $match: {
          vendor_email,
          payout_status: {
            $in: ["transfer_success", "manual_payout_completed"],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$payout_amount" },
        },
      },
    ]);

    res.json({
      status: "success",
      message: "Vendor payout history fetched successfully",
      data: {
        vendor_email,
        total_earned: totalEarned[0]?.total || 0,
        payouts,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("getVendorPayoutHistory error:", error);
    return next(createError(500, "Server error"));
  }
};
