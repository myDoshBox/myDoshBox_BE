import express from "express";
import {
  getAllTransactions,
  getTransactionById,
  getAllPayouts,
  getPayoutById,
  processManualPayout,
  updateTransactionStatus,
  getTransactionsSummary,
} from "./Admintransactions.controller";
import {
  adminOnly,
  verifyAuth,
} from "../../../middlewares/roleVerification.middleware";

const router = express.Router();

/**
 * @route   GET /admin/transactions
 * @desc    Get all transactions with filters and pagination
 * @access  Admin only
 */
router.get("/transactions", getAllTransactions);

/**
 * @route   GET /admin/transactions/summary
 * @desc    Get transactions statistics summary
 * @access  Admin only
 */
router.get("/transactions/summary", getTransactionsSummary);

/**
 * @route   GET /admin/transactions/:transactionId
 * @desc    Get single transaction details with related data
 * @access  Admin only
 */
router.get("/transactions/:transactionId", getTransactionById);

/**
 * @route   PATCH /admin/transactions/:transactionId/status
 * @desc    Update transaction status (admin action)
 * @access  Admin only
 */
router.patch("/transactions/:transactionId/status", updateTransactionStatus);

// ============================================
// PAYOUT ROUTES
// ============================================

/**
 * @route   GET /admin/payouts
 * @desc    Get all payouts with filters and pagination
 * @access  Admin only
 */
router.get("/payouts", verifyAuth, getAllPayouts);

/**
 * @route   GET /admin/payouts/:payoutId
 * @desc    Get single payout details
 * @access  Admin only
 */
router.get("/payouts/:payoutId", verifyAuth, getPayoutById);

/**
 * @route   POST /admin/payouts/:payoutId/process-manual
 * @desc    Process manual payout (admin action)
 * @access  Admin only
 */
router.post(
  "/payouts/:payoutId/process-manual",
  verifyAuth,
  processManualPayout,
);

/**
 * @route   POST /admin/transactions/payouts/:payoutId/process-manual
 * @desc    Process manual payout (admin action) - Alternative path
 * @access  Admin only
 */
router.post(
  "/transactions/payouts/:payoutId/process-manual",
  verifyAuth,
  processManualPayout,
);

export default router;
