"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Admintransactions_controller_1 = require("./Admintransactions.controller");
const roleVerification_middleware_1 = require("../../../middlewares/roleVerification.middleware");
const router = express_1.default.Router();
/**
 * @route   GET /admin/transactions
 * @desc    Get all transactions with filters and pagination
 * @access  Admin only
 */
router.get("/transactions", Admintransactions_controller_1.getAllTransactions);
/**
 * @route   GET /admin/transactions/summary
 * @desc    Get transactions statistics summary
 * @access  Admin only
 */
router.get("/transactions/summary", Admintransactions_controller_1.getTransactionsSummary);
/**
 * @route   GET /admin/transactions/:transactionId
 * @desc    Get single transaction details with related data
 * @access  Admin only
 */
router.get("/transactions/:transactionId", Admintransactions_controller_1.getTransactionById);
/**
 * @route   PATCH /admin/transactions/:transactionId/status
 * @desc    Update transaction status (admin action)
 * @access  Admin only
 */
router.patch("/transactions/:transactionId/status", Admintransactions_controller_1.updateTransactionStatus);
// ============================================
// PAYOUT ROUTES
// ============================================
/**
 * @route   GET /admin/payouts
 * @desc    Get all payouts with filters and pagination
 * @access  Admin only
 */
router.get("/payouts", roleVerification_middleware_1.verifyAuth, Admintransactions_controller_1.getAllPayouts);
/**
 * @route   GET /admin/payouts/:payoutId
 * @desc    Get single payout details
 * @access  Admin only
 */
router.get("/payouts/:payoutId", roleVerification_middleware_1.verifyAuth, Admintransactions_controller_1.getPayoutById);
/**
 * @route   POST /admin/payouts/:payoutId/process-manual
 * @desc    Process manual payout (admin action)
 * @access  Admin only
 */
router.post("/payouts/:payoutId/process-manual", roleVerification_middleware_1.verifyAuth, Admintransactions_controller_1.processManualPayout);
/**
 * @route   POST /admin/transactions/payouts/:payoutId/process-manual
 * @desc    Process manual payout (admin action) - Alternative path
 * @access  Admin only
 */
router.post("/transactions/payouts/:payoutId/process-manual", roleVerification_middleware_1.verifyAuth, Admintransactions_controller_1.processManualPayout);
exports.default = router;
