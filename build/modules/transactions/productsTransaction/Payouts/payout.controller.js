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
exports.getVendorPayoutHistory = exports.getPayoutStats = exports.retryFailedPayout = exports.completeManualPayout = exports.getPayoutsRequiringManualIntervention = exports.getPayoutByTransactionId = exports.getSinglePayout = exports.getAllPayouts = void 0;
const errorHandler_util_1 = require("./../../../../utilities/errorHandler.util");
const payout_model_1 = __importDefault(require("./payout.model"));
const productTransaction_mail_1 = require("../productTransaction.mail");
/**
 * Get all payouts with filtering and pagination
 * Admin endpoint
 */
const getAllPayouts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const method = req.query.method;
        const vendor_email = req.query.vendor_email;
        // Build filter
        const filter = {};
        if (status)
            filter.payout_status = status;
        if (method)
            filter.payout_method = method;
        if (vendor_email)
            filter.vendor_email = vendor_email;
        const total = yield payout_model_1.default.countDocuments(filter);
        const payouts = yield payout_model_1.default.find(filter)
            .populate({
            path: "transaction",
            select: "transaction_id buyer_email products sum_total transaction_total",
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
    }
    catch (error) {
        console.error("getAllPayouts error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Server error"));
    }
});
exports.getAllPayouts = getAllPayouts;
/**
 * Get single payout details
 */
const getSinglePayout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { payout_id } = req.params;
        if (!payout_id) {
            return next((0, errorHandler_util_1.createError)(400, "Payout ID is required"));
        }
        const payout = yield payout_model_1.default.findById(payout_id).populate({
            path: "transaction",
            select: "transaction_id buyer_email vendor_email products sum_total transaction_total delivery_address",
        });
        if (!payout) {
            return next((0, errorHandler_util_1.createError)(404, "Payout not found"));
        }
        res.json({
            status: "success",
            message: "Payout details fetched successfully",
            data: payout,
        });
    }
    catch (error) {
        console.error("getSinglePayout error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Server error"));
    }
});
exports.getSinglePayout = getSinglePayout;
/**
 * Get payout by transaction ID
 */
const getPayoutByTransactionId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transaction_id } = req.params;
        if (!transaction_id) {
            return next((0, errorHandler_util_1.createError)(400, "Transaction ID is required"));
        }
        const payout = yield payout_model_1.default.findOne({ transaction_id }).populate({
            path: "transaction",
            select: "transaction_id buyer_email vendor_email products sum_total transaction_total",
        });
        if (!payout) {
            return next((0, errorHandler_util_1.createError)(404, "No payout found for this transaction"));
        }
        res.json({
            status: "success",
            message: "Payout details fetched successfully",
            data: payout,
        });
    }
    catch (error) {
        console.error("getPayoutByTransactionId error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Server error"));
    }
});
exports.getPayoutByTransactionId = getPayoutByTransactionId;
/**
 * Get payouts requiring manual intervention
 * Admin endpoint
 */
const getPayoutsRequiringManualIntervention = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payouts = yield payout_model_1.default.find({
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
    }
    catch (error) {
        console.error("getPayoutsRequiringManualIntervention error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Server error"));
    }
});
exports.getPayoutsRequiringManualIntervention = getPayoutsRequiringManualIntervention;
/**
 * Mark manual payout as completed
 * Admin endpoint
 */
const completeManualPayout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { payout_id } = req.params;
        const { admin_email, proof, notes } = req.body;
        if (!payout_id || !admin_email) {
            return next((0, errorHandler_util_1.createError)(400, "Payout ID and admin email are required"));
        }
        const payout = yield payout_model_1.default.findById(payout_id).populate("transaction");
        if (!payout) {
            return next((0, errorHandler_util_1.createError)(404, "Payout not found"));
        }
        if (payout.payout_status !== "manual_payout_required" &&
            payout.payout_status !== "manual_payout_processing") {
            return next((0, errorHandler_util_1.createError)(400, `Cannot complete payout with status: ${payout.payout_status}`));
        }
        // Mark as completed
        yield payout.markAsManualPayoutCompleted(admin_email, proof, notes);
        // Get transaction details
        const transaction = payout.transaction;
        // Send confirmation emails
        try {
            yield Promise.all([
                (0, productTransaction_mail_1.sendSuccessfulEscrowEmailToVendor)(payout.transaction_id, payout.vendor_name, payout.vendor_email, ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.products) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.name) || "Product", payout.payout_amount.toString()),
                (0, productTransaction_mail_1.sendSuccessfulEscrowEmailToInitiator)(payout.transaction_id, payout.vendor_name, (transaction === null || transaction === void 0 ? void 0 : transaction.buyer_email) || "", ((_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.products) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.name) || "Product"),
            ]);
            payout.vendor_notified = true;
            payout.vendor_notified_at = new Date();
            payout.buyer_notified = true;
            payout.buyer_notified_at = new Date();
            yield payout.save();
        }
        catch (emailError) {
            console.error("Email notification failed:", emailError);
        }
        res.json({
            status: "success",
            message: "Manual payout marked as completed",
            data: payout,
        });
    }
    catch (error) {
        console.error("completeManualPayout error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Server error"));
    }
});
exports.completeManualPayout = completeManualPayout;
/**
 * Retry failed automatic payout
 * Admin endpoint
 */
const retryFailedPayout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { payout_id } = req.params;
        if (!payout_id) {
            return next((0, errorHandler_util_1.createError)(400, "Payout ID is required"));
        }
        const payout = yield payout_model_1.default.findById(payout_id);
        if (!payout) {
            return next((0, errorHandler_util_1.createError)(404, "Payout not found"));
        }
        if (payout.payout_status !== "transfer_failed") {
            return next((0, errorHandler_util_1.createError)(400, "Can only retry failed automatic transfers"));
        }
        if (!payout.can_retry) {
            return next((0, errorHandler_util_1.createError)(400, `Maximum retry attempts (${payout.max_retries}) exceeded. Manual payout required.`));
        }
        // Reset status to pending to trigger retry
        payout.payout_status = "pending_initiation";
        yield payout.save();
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
    }
    catch (error) {
        console.error("retryFailedPayout error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Server error"));
    }
});
exports.retryFailedPayout = retryFailedPayout;
/**
 * Get payout statistics
 * Admin endpoint
 */
const getPayoutStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const stats = yield payout_model_1.default.aggregate([
            {
                $group: {
                    _id: "$payout_status",
                    count: { $sum: 1 },
                    total_amount: { $sum: "$payout_amount" },
                },
            },
        ]);
        const methodStats = yield payout_model_1.default.aggregate([
            {
                $group: {
                    _id: "$payout_method",
                    count: { $sum: 1 },
                    total_amount: { $sum: "$payout_amount" },
                },
            },
        ]);
        const totalPayouts = yield payout_model_1.default.countDocuments();
        const totalAmount = yield payout_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$payout_amount" },
                },
            },
        ]);
        const pendingCount = yield payout_model_1.default.countDocuments({
            payout_status: {
                $in: [
                    "pending_initiation",
                    "transfer_initiated",
                    "transfer_pending",
                    "manual_payout_processing",
                ],
            },
        });
        const completedCount = yield payout_model_1.default.countDocuments({
            payout_status: {
                $in: ["transfer_success", "manual_payout_completed"],
            },
        });
        const failedCount = yield payout_model_1.default.countDocuments({
            payout_status: {
                $in: ["transfer_failed", "manual_payout_required"],
            },
        });
        res.json({
            status: "success",
            message: "Payout statistics fetched successfully",
            data: {
                total_payouts: totalPayouts,
                total_amount: ((_a = totalAmount[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
                pending_count: pendingCount,
                completed_count: completedCount,
                failed_count: failedCount,
                status_breakdown: stats,
                method_breakdown: methodStats,
            },
        });
    }
    catch (error) {
        console.error("getPayoutStats error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Server error"));
    }
});
exports.getPayoutStats = getPayoutStats;
/**
 * Get vendor's payout history
 */
const getVendorPayoutHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { vendor_email } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!vendor_email) {
            return next((0, errorHandler_util_1.createError)(400, "Vendor email is required"));
        }
        const total = yield payout_model_1.default.countDocuments({ vendor_email });
        const payouts = yield payout_model_1.default.find({ vendor_email })
            .populate({
            path: "transaction",
            select: "transaction_id products buyer_email",
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalPages = Math.ceil(total / limit);
        // Calculate total earned
        const totalEarned = yield payout_model_1.default.aggregate([
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
                total_earned: ((_a = totalEarned[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
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
    }
    catch (error) {
        console.error("getVendorPayoutHistory error:", error);
        return next((0, errorHandler_util_1.createError)(500, "Server error"));
    }
});
exports.getVendorPayoutHistory = getVendorPayoutHistory;
