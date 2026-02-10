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
exports.verifyAnalyticsIntegrity = exports.bulkSyncToAnalytics = exports.updateAnalyticsFromDispute = exports.updateAnalyticsFromPayout = exports.updateAnalyticsFromTransaction = exports.createAnalyticsFromTransaction = void 0;
const transactionAnalytics_model_1 = __importDefault(require("./transactionAnalytics.model"));
const productsTransaction_model_1 = __importDefault(require("../../transactions/productsTransaction/productsTransaction.model"));
const productDispute_model_1 = __importDefault(require("../../disputes/productsDispute/productDispute.model"));
const payout_model_1 = __importDefault(require("../../transactions/productsTransaction/Payouts/payout.model"));
const individualUserAuth_model1_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model1"));
const organizationAuth_model_1 = __importDefault(require("../../authentication/organizationUserAuth/organizationAuth.model"));
const getUserType = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const individual = yield individualUserAuth_model1_1.default.findOne({ email });
    if (individual)
        return "individual";
    const org = yield organizationAuth_model_1.default.findOne({
        $or: [{ organization_email: email }, { contact_email: email }],
    });
    if (org)
        return "organization";
    return undefined;
});
/**
 * Create analytics record from a transaction
 */
const createAnalyticsFromTransaction = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const transaction = yield productsTransaction_model_1.default.findOne({
            transaction_id: transactionId,
        });
        if (!transaction) {
            console.error(`Transaction not found: ${transactionId}`);
            return;
        }
        // Check if analytics already exists
        const existing = yield transactionAnalytics_model_1.default.findOne({
            transaction_id: transactionId,
        });
        if (existing) {
            console.log(`Analytics already exists for: ${transactionId}`);
            return;
        }
        // Get user types
        const buyerType = yield getUserType(transaction.buyer_email);
        const vendorType = yield getUserType(transaction.vendor_email);
        // Calculate commission
        const commissionPercentage = 1; // 1%
        const commissionAmount = transaction.transaction_total * (commissionPercentage / 100);
        // Create analytics record
        const analytics = new transactionAnalytics_model_1.default({
            transaction_id: transaction.transaction_id,
            transaction_ref: transaction._id,
            transaction_date: transaction.createdAt,
            transaction_status: transaction.transaction_status,
            transaction_type: transaction.transaction_type,
            buyer_email: transaction.buyer_email,
            buyer_type: buyerType,
            vendor_email: transaction.vendor_email,
            vendor_name: transaction.vendor_name,
            vendor_type: vendorType,
            sum_total: transaction.sum_total,
            commission_amount: commissionAmount,
            commission_percentage: commissionPercentage,
            transaction_total: transaction.transaction_total,
            product_count: ((_a = transaction.products) === null || _a === void 0 ? void 0 : _a.length) || 0,
            total_quantity: ((_b = transaction.products) === null || _b === void 0 ? void 0 : _b.reduce((sum, p) => sum + (p.quantity || 1), 0)) || 0,
            payment_initiated: !!transaction.payment_reference,
            payment_initiated_at: transaction.payment_initiated_at,
            payment_verified: transaction.verified_payment_status,
            payment_verified_at: transaction.payment_verified_at,
            payment_reference: transaction.payment_reference,
            shipping_submitted: transaction.shipping_submitted,
            buyer_confirmed: transaction.buyer_confirm_status,
            completed: transaction.transaction_status === "completed",
            completed_at: transaction.transaction_status === "completed"
                ? transaction.updatedAt
                : undefined,
            cancelled: transaction.transaction_status === "cancelled",
            cancelled_at: transaction.transaction_status === "cancelled"
                ? transaction.updatedAt
                : undefined,
        });
        yield analytics.save();
        console.log(`✅ Analytics created for transaction: ${transactionId}`);
    }
    catch (error) {
        console.error(`Error creating analytics for ${transactionId}:`, error);
        throw error;
    }
});
exports.createAnalyticsFromTransaction = createAnalyticsFromTransaction;
/**
 * Update analytics record when transaction status changes
 */
const updateAnalyticsFromTransaction = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = yield productsTransaction_model_1.default.findOne({
            transaction_id: transactionId,
        });
        if (!transaction) {
            console.error(`Transaction not found: ${transactionId}`);
            return;
        }
        const updateData = {
            transaction_status: transaction.transaction_status,
            last_status_change: new Date(),
            payment_initiated: !!transaction.payment_reference,
            payment_initiated_at: transaction.payment_initiated_at,
            payment_verified: transaction.verified_payment_status,
            payment_verified_at: transaction.payment_verified_at,
            payment_reference: transaction.payment_reference,
            shipping_submitted: transaction.shipping_submitted,
            buyer_confirmed: transaction.buyer_confirm_status,
            completed: transaction.transaction_status === "completed",
            cancelled: transaction.transaction_status === "cancelled",
        };
        if (transaction.transaction_status === "completed") {
            updateData.completed_at = transaction.updatedAt;
        }
        if (transaction.transaction_status === "cancelled") {
            updateData.cancelled_at = transaction.updatedAt;
        }
        if (transaction.transaction_status === "in_transit") {
            updateData.in_transit_at = transaction.updatedAt;
            updateData.shipping_submitted_at = transaction.updatedAt;
        }
        if (transaction.buyer_confirm_status) {
            updateData.buyer_confirmed_at = transaction.updatedAt;
        }
        const result = yield transactionAnalytics_model_1.default.findOneAndUpdate({ transaction_id: transactionId }, updateData, { new: true, upsert: false });
        if (result) {
            console.log(`✅ Analytics updated for transaction: ${transactionId}`);
        }
        else {
            console.log(`⚠️  Analytics not found for transaction: ${transactionId}`);
            // Create it if it doesn't exist
            yield (0, exports.createAnalyticsFromTransaction)(transactionId);
        }
    }
    catch (error) {
        console.error(`Error updating analytics for ${transactionId}:`, error);
        throw error;
    }
});
exports.updateAnalyticsFromTransaction = updateAnalyticsFromTransaction;
/**
 * Update analytics when payout is created or updated
 */
const updateAnalyticsFromPayout = (payoutId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payout = yield payout_model_1.default.findById(payoutId);
        if (!payout) {
            console.error(`Payout not found: ${payoutId}`);
            return;
        }
        const updateData = {
            payout_id: payout._id,
            payout_status: payout.payout_status,
            payout_method: payout.payout_method,
            payout_amount: payout.payout_amount,
            payout_failed: payout.payout_status === "transfer_failed",
        };
        if (payout.transfer_initiated_at) {
            updateData.payout_initiated_at = payout.transfer_initiated_at;
        }
        if (payout.payout_status === "transfer_success" ||
            payout.payout_status === "manual_payout_completed") {
            updateData.payout_completed_at =
                payout.transfer_completed_at || payout.manual_payout_processed_at;
        }
        if (payout.transfer_failure_reason) {
            updateData.payout_failure_reason = payout.transfer_failure_reason;
        }
        const result = yield transactionAnalytics_model_1.default.findOneAndUpdate({ transaction_id: payout.transaction_id }, updateData, { new: true });
        if (result) {
            console.log(`✅ Analytics updated with payout for transaction: ${payout.transaction_id}`);
        }
        else {
            console.log(`⚠️  Analytics not found for payout transaction: ${payout.transaction_id}`);
        }
    }
    catch (error) {
        console.error(`Error updating analytics from payout ${payoutId}:`, error);
        throw error;
    }
});
exports.updateAnalyticsFromPayout = updateAnalyticsFromPayout;
/**
 * Update analytics when dispute is created or updated
 */
const updateAnalyticsFromDispute = (disputeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dispute = yield productDispute_model_1.default.findById(disputeId).populate("mediator");
        if (!dispute) {
            console.error(`Dispute not found: ${disputeId}`);
            return;
        }
        const updateData = {
            has_dispute: true,
            dispute_id: dispute._id,
            dispute_status: dispute.dispute_status,
            dispute_created_at: dispute.createdAt,
        };
        if (dispute.mediator) {
            updateData.mediator_involved = true;
            updateData.mediator_id = dispute.mediator;
        }
        if (dispute.dispute_status === "resolved" && dispute.resolved_at) {
            updateData.dispute_resolved_at = dispute.resolved_at;
        }
        const result = yield transactionAnalytics_model_1.default.findOneAndUpdate({ transaction_id: dispute.transaction_id }, updateData, { new: true });
        if (result) {
            console.log(`✅ Analytics updated with dispute for transaction: ${dispute.transaction_id}`);
        }
        else {
            console.log(`⚠️  Analytics not found for dispute transaction: ${dispute.transaction_id}`);
        }
    }
    catch (error) {
        console.error(`Error updating analytics from dispute ${disputeId}:`, error);
        throw error;
    }
});
exports.updateAnalyticsFromDispute = updateAnalyticsFromDispute;
/**
 * Bulk sync all existing transactions to analytics
 * (Use for initial migration)
 */
const bulkSyncToAnalytics = () => __awaiter(void 0, void 0, void 0, function* () {
    const results = {
        success: 0,
        failed: 0,
        skipped: 0,
    };
    try {
        const transactions = yield productsTransaction_model_1.default.find({});
        console.log(`📊 Found ${transactions.length} transactions to sync`);
        for (const transaction of transactions) {
            try {
                // Check if already exists
                const existing = yield transactionAnalytics_model_1.default.findOne({
                    transaction_id: transaction.transaction_id,
                });
                if (existing) {
                    console.log(`⏭️  Skipping existing: ${transaction.transaction_id}`);
                    results.skipped++;
                    continue;
                }
                yield (0, exports.createAnalyticsFromTransaction)(transaction.transaction_id);
                // Also sync payout if exists - use transaction_id to find
                const payout = yield payout_model_1.default.findOne({
                    transaction_id: transaction.transaction_id,
                });
                if (payout) {
                    // Pass the entire payout object to the function
                    const updateData = {
                        payout_id: payout._id,
                        payout_status: payout.payout_status,
                        payout_method: payout.payout_method,
                        payout_amount: payout.payout_amount,
                        payout_failed: payout.payout_status === "transfer_failed",
                    };
                    if (payout.transfer_initiated_at) {
                        updateData.payout_initiated_at = payout.transfer_initiated_at;
                    }
                    if (payout.payout_status === "transfer_success" ||
                        payout.payout_status === "manual_payout_completed") {
                        updateData.payout_completed_at =
                            payout.transfer_completed_at || payout.manual_payout_processed_at;
                    }
                    yield transactionAnalytics_model_1.default.findOneAndUpdate({ transaction_id: transaction.transaction_id }, updateData, { new: true });
                }
                // Also sync dispute if exists - use transaction_id to find
                const dispute = yield productDispute_model_1.default.findOne({
                    transaction_id: transaction.transaction_id,
                }).populate("mediator");
                if (dispute) {
                    const updateData = {
                        has_dispute: true,
                        dispute_id: dispute._id,
                        dispute_status: dispute.dispute_status,
                        dispute_created_at: dispute.createdAt,
                    };
                    if (dispute.mediator) {
                        updateData.mediator_involved = true;
                        updateData.mediator_id = dispute.mediator;
                    }
                    yield transactionAnalytics_model_1.default.findOneAndUpdate({ transaction_id: transaction.transaction_id }, updateData, { new: true });
                }
                results.success++;
                console.log(`✅ Synced ${results.success}/${transactions.length}: ${transaction.transaction_id}`);
            }
            catch (error) {
                console.error(`❌ Failed to sync ${transaction.transaction_id}:`, error);
                results.failed++;
            }
        }
        return results;
    }
    catch (error) {
        console.error("Error in bulk sync:", error);
        throw error;
    }
});
exports.bulkSyncToAnalytics = bulkSyncToAnalytics;
/**
 * Verify analytics data integrity
 */
const verifyAnalyticsIntegrity = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield productsTransaction_model_1.default.find({}).select("transaction_id");
        const analytics = yield transactionAnalytics_model_1.default.find({}).select("transaction_id");
        const transactionIds = new Set(transactions.map((t) => t.transaction_id));
        const analyticsIds = new Set(analytics.map((a) => a.transaction_id));
        const missing_analytics = transactions
            .filter((t) => !analyticsIds.has(t.transaction_id))
            .map((t) => t.transaction_id);
        const orphaned_analytics = analytics
            .filter((a) => !transactionIds.has(a.transaction_id))
            .map((a) => a.transaction_id);
        console.log(`
🔍 Analytics Integrity Check:
   📝 Total Transactions: ${transactions.length}
   📊 Total Analytics: ${analytics.length}
   ⚠️  Missing Analytics: ${missing_analytics.length}
   🗑️  Orphaned Analytics: ${orphaned_analytics.length}
    `);
        if (missing_analytics.length > 0) {
            console.log(`Missing analytics for: ${missing_analytics.slice(0, 10).join(", ")}${missing_analytics.length > 10 ? "..." : ""}`);
        }
        if (orphaned_analytics.length > 0) {
            console.log(`Orphaned analytics: ${orphaned_analytics.slice(0, 10).join(", ")}${orphaned_analytics.length > 10 ? "..." : ""}`);
        }
        return {
            total_transactions: transactions.length,
            total_analytics: analytics.length,
            missing_analytics,
            orphaned_analytics,
        };
    }
    catch (error) {
        console.error("Error verifying analytics integrity:", error);
        throw error;
    }
});
exports.verifyAnalyticsIntegrity = verifyAnalyticsIntegrity;
