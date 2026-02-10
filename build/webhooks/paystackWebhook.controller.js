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
exports.paystackTransferWebhook = exports.paystackUnifiedWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const productsTransaction_model_1 = __importDefault(require("../modules/transactions/productsTransaction/productsTransaction.model"));
const payout_model_1 = __importDefault(require("../modules/transactions/productsTransaction/Payouts/payout.model"));
const productTransaction_mail_1 = require("../modules/transactions/productsTransaction/productTransaction.mail");
const ManualPayment_mail_1 = require("../modules/transactions/productsTransaction/Payouts/ManualPayment.mail");
//  Main webhook endpoint for all Paystack events
//  Handles both payment and transfer events
const paystackUnifiedWebhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //  VERIFY WEBHOOK SIGNATURE
        const hash = crypto_1.default
            .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest("hex");
        const paystackSignature = req.headers["x-paystack-signature"];
        if (hash !== paystackSignature) {
            console.error("❌ Invalid webhook signature");
            return res.status(400).send("Invalid signature");
        }
        console.log("✅ Webhook signature verified");
        // PARSE WEBHOOK EVENT
        const event = req.body;
        const { event: eventType, data } = event;
        console.log(`📬 Webhook event received: ${eventType}`, {
            reference: data === null || data === void 0 ? void 0 : data.reference,
            status: data === null || data === void 0 ? void 0 : data.status,
        });
        switch (eventType) {
            // ========== PAYMENT EVENTS ==========
            case "charge.success":
                yield handleChargeSuccess(data);
                break;
            //TRANSFER EVENTS (Now update Payout model)
            case "transfer.success":
                yield handleTransferSuccess(data);
                break;
            case "transfer.failed":
                yield handleTransferFailed(data);
                break;
            case "transfer.reversed":
                yield handleTransferReversed(data);
                break;
            default:
                console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
        }
        // Always respond with 200 to acknowledge receipt
        res.status(200).send("Webhook received");
    }
    catch (error) {
        console.error("❌ Webhook processing error:", error);
        // Still return 200 to prevent Paystack from retrying
        res.status(200).send("Webhook processing failed");
    }
});
exports.paystackUnifiedWebhook = paystackUnifiedWebhook;
/**
 * Handle successful charge (payment from buyer)
 * This marks payment as verified and allows vendor to ship
 */
function handleChargeSuccess(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { reference, amount, status } = data;
            console.log(`💳 Processing charge.success:`, {
                reference,
                amount: amount / 100, // Convert kobo to naira
                status,
            });
            // Find transaction by payment reference
            const transaction = yield productsTransaction_model_1.default.findOne({
                payment_reference: reference,
            });
            if (!transaction) {
                console.error(`❌ Transaction not found for reference: ${reference}`);
                return;
            }
            // ✅ IDEMPOTENCY CHECK
            if (transaction.verified_payment_status) {
                console.log(`⚠️ Payment already verified for transaction: ${transaction.transaction_id}`);
                return;
            }
            // Validate amount matches
            const expectedAmount = Number(transaction.transaction_total) * 100; // Convert to kobo
            if (amount !== expectedAmount) {
                console.error(`❌ Amount mismatch for ${reference}: Expected ${expectedAmount}, got ${amount}`);
                return;
            }
            if (status !== "success") {
                console.error(`❌ Payment status is not success: ${status}`);
                return;
            }
            // ============================================
            // UPDATE TRANSACTION
            // ============================================
            const updatedTransaction = yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, {
                verified_payment_status: true,
                transaction_status: "payment_verified",
                payment_verified_at: new Date(),
            }, { new: true });
            if (!updatedTransaction) {
                console.error(`❌ Failed to update transaction for reference: ${reference}`);
                return;
            }
            console.log(`✅ Payment verified for transaction: ${transaction.transaction_id}`);
            // ============================================
            // SEND NOTIFICATION EMAILS
            // ============================================
            try {
                yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToVendor)(transaction.transaction_id, transaction.vendor_name, transaction.vendor_email, transaction.products, transaction.sum_total, transaction.transaction_total);
                console.log(`✅ Vendor notification email sent`);
            }
            catch (emailError) {
                console.error("⚠️ Failed to send vendor email:", emailError);
                // Non-critical error, continue
            }
        }
        catch (error) {
            console.error("❌ Error handling charge success:", error);
        }
    });
}
/**
 * Handle successful transfer (payout to vendor)
 * Updates Payout model - does NOT change transaction status
 */
function handleTransferSuccess(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { reference, amount, status, recipient } = data;
            console.log(`💸 Processing transfer.success:`, {
                reference,
                amount: amount / 100, // Convert kobo to naira
                status,
            });
            //  FIND PAYOUT BY TRANSFER REFERENCE
            const payout = yield payout_model_1.default.findOne({
                transfer_reference: reference,
            }).populate("transaction");
            if (!payout) {
                console.error(`❌ Payout not found for reference: ${reference}`);
                return;
            }
            // ✅ IDEMPOTENCY CHECK
            if (payout.payout_status === "transfer_success") {
                console.log(`⚠️ Transfer already processed for payout: ${payout.transaction_id}`);
                return;
            }
            // Validate amount matches
            const expectedAmount = Math.round(payout.payout_amount * 100); // Convert to kobo
            if (Math.abs(amount - expectedAmount) > 1) {
                // Allow 1 kobo difference for rounding
                console.error(`❌ Amount mismatch for ${reference}: Expected ${expectedAmount}, got ${amount}`);
                // Log but don't fail - continue with the update
            }
            // ============================================
            // UPDATE PAYOUT TO SUCCESS
            // ============================================
            yield payout.markAsTransferSuccess(data);
            console.log(`✅ Payout completed successfully: ${payout.transaction_id} - Transfer reference: ${reference}`);
            // ============================================
            // SEND SUCCESS NOTIFICATIONS (if not already sent)
            // ============================================
            if (!payout.vendor_notified || !payout.buyer_notified) {
                try {
                    const transaction = payout.transaction;
                    const product_name = ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.products) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.name) || "Product";
                    const emailPromises = [];
                    if (!payout.vendor_notified) {
                        emailPromises.push((0, productTransaction_mail_1.sendTransferSuccessEmailToVendor)(payout.vendor_email, payout.vendor_name, payout.payout_amount, payout.transaction_id));
                    }
                    if (!payout.buyer_notified && transaction) {
                        emailPromises.push((0, productTransaction_mail_1.sendSuccessfulEscrowEmailToInitiator)(payout.transaction_id, payout.vendor_name, transaction.buyer_email, product_name));
                    }
                    yield Promise.all(emailPromises);
                    // Mark notifications as sent
                    payout.vendor_notified = true;
                    payout.vendor_notified_at = new Date();
                    payout.buyer_notified = true;
                    payout.buyer_notified_at = new Date();
                    yield payout.save();
                    console.log(`✅ Success notification emails sent`);
                }
                catch (emailError) {
                    console.error("⚠️ Failed to send success emails:", emailError);
                    // Non-critical error, continue
                }
            }
            // ============================================
            // LOG SUCCESS
            // ============================================
            console.log(`
🎉 PAYOUT SUCCESSFUL
═══════════════════════════════════════
Transaction ID: ${payout.transaction_id}
Vendor: ${payout.vendor_email}
Amount: ₦${payout.payout_amount}
Transfer Ref: ${reference}
Status: transfer_success
═══════════════════════════════════════
    `);
        }
        catch (error) {
            console.error("❌ Error handling transfer success:", error);
        }
    });
}
// function to find payout
function findPayout(reference) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield payout_model_1.default.findOne({
            transfer_reference: reference,
        })
            .populate("transaction")
            .lean();
        return result;
    });
}
/**
 * Handle failed transfer
 * Updates Payout model and triggers retry logic or manual intervention
 */
function handleTransferFailed(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { reference, amount, status, recipient, message } = data;
            const failureReason = data.failure_reason || message || "Transfer failed";
            console.log(`❌ Processing transfer.failed:`, {
                reference,
                amount: amount / 100,
                status,
                reason: failureReason,
            });
            //  FIND PAYOUT BY TRANSFER REFERENCE
            const payout = yield findPayout(reference);
            if (!payout) {
                console.error(`❌ Payout not found for reference: ${reference}`);
                return;
            }
            // ✅ IDEMPOTENCY CHECK
            if (payout.payout_status === "transfer_failed" ||
                payout.payout_status === "manual_payout_required") {
                console.log(`⚠️ Transfer failure already processed for payout: ${payout.transaction_id}`);
                return;
            }
            // ============================================
            // UPDATE PAYOUT (includes retry logic)
            // ============================================
            yield payout.markAsTransferFailed(failureReason);
            console.log(`⚠️ Payout marked as failed: ${payout.transaction_id} - Status: ${payout.payout_status}`);
            console.log(`   Retry count: ${payout.retry_count}/${payout.max_retries}`);
            // ============================================
            // SEND NOTIFICATIONS
            // ============================================
            try {
                const emailPromises = [];
                const currentStatus = payout.payout_status;
                // Always notify vendor of failure
                emailPromises.push((0, productTransaction_mail_1.sendTransferFailedEmailToVendor)(payout.vendor_email, payout.vendor_name, payout.transaction_id, failureReason));
                // If manual payout is now required (max retries exceeded), notify admin
                if (currentStatus === "manual_payout_required") {
                    emailPromises.push((0, ManualPayment_mail_1.sendAdminManualPayoutAlert)(payout.transaction_id, payout.vendor_name, payout.payout_amount, payout.vendor_bank_details));
                    payout.admin_notified = true;
                    payout.admin_notified_at = new Date();
                }
                yield Promise.all(emailPromises);
                payout.vendor_notified = true;
                payout.vendor_notified_at = new Date();
                yield payout.save();
                console.log(`✅ Failure notification emails sent`);
            }
            catch (emailError) {
                console.error("⚠️ Failed to send failure emails:", emailError);
            }
            // ============================================
            // LOG FAILURE
            // ============================================
        }
        catch (error) {
            console.error("❌ Error handling transfer failure:", error);
        }
    });
}
/**
 * Handle reversed transfer
 * This is CRITICAL - money was sent but came back
 * Updates Payout and requires immediate manual intervention
 */
function handleTransferReversed(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { reference, amount, status, recipient, message } = data;
            const reversalReason = data.reversal_reason || message || "Transfer reversed by bank";
            console.log(`🔄 Processing transfer.reversed:`, {
                reference,
                amount: amount / 100,
                status,
                reason: reversalReason,
            });
            //  FIND PAYOUT BY TRANSFER REFERENCE
            const payout = (yield payout_model_1.default.findOne({
                transfer_reference: reference,
            }).populate("transaction"));
            if (!payout) {
                console.error(`❌ Payout not found for reference: ${reference}`);
                return;
            }
            // ✅ IDEMPOTENCY CHECK
            if (payout.payout_status === "reversed") {
                console.log(`⚠️ Transfer reversal already processed for payout: ${payout.transaction_id}`);
                return;
            }
            //  UPDATE PAYOUT TO REVERSED
            payout.payout_status = "reversed";
            payout.transfer_reversal_reason = reversalReason;
            payout.transfer_webhook_data = data;
            yield payout.save();
            console.log(`🔄 Payout marked as reversed: ${payout.transaction_id}`);
            // SEND URGENT NOTIFICATIONS
            try {
                yield Promise.all([
                    // Notify vendor
                    (0, productTransaction_mail_1.sendTransferFailedEmailToVendor)(payout.vendor_email, payout.vendor_name, payout.transaction_id, `Payment transfer was reversed by your bank. Reason: ${reversalReason}. Please update your bank details and contact support immediately.`),
                    // Notify admin urgently
                    (0, ManualPayment_mail_1.sendAdminManualPayoutAlert)(payout.transaction_id, payout.vendor_name, payout.payout_amount, payout.vendor_bank_details),
                ]);
                payout.vendor_notified = true;
                payout.vendor_notified_at = new Date();
                payout.admin_notified = true;
                payout.admin_notified_at = new Date();
                yield payout.save();
                console.log(`✅ Reversal notification emails sent`);
            }
            catch (emailError) {
                console.error("⚠️ Failed to send reversal emails:", emailError);
            }
            // ============================================
            // LOG REVERSAL
            // ============================================
            console.log(`
🚨 CRITICAL - PAYOUT REVERSED
═══════════════════════════════════════
Transaction ID: ${payout.transaction_id}
Vendor: ${payout.vendor_email}
Amount: ₦${payout.payout_amount}
Transfer Ref: ${reference}
Reversal Reason: ${reversalReason}
Status: reversed
⚠️ IMMEDIATE MANUAL INTERVENTION REQUIRED
═══════════════════════════════════════
    `);
        }
        catch (error) {
            console.error("❌ Error handling transfer reversal:", error);
        }
    });
}
/**
 * Legacy webhook handler for transfers only
 * Use paystackUnifiedWebhook instead
 * @deprecated Use paystackUnifiedWebhook for all events
 */
const paystackTransferWebhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.warn("⚠️ Using deprecated paystackTransferWebhook. Please migrate to paystackUnifiedWebhook");
    return (0, exports.paystackUnifiedWebhook)(req, res, next);
});
exports.paystackTransferWebhook = paystackTransferWebhook;
// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Format payout for logging
 */
function formatPayoutLog(payout) {
    return `
Payout ID: ${payout._id}
Transaction ID: ${payout.transaction_id}
Vendor: ${payout.vendor_email}
Amount: ₦${payout.payout_amount}
Status: ${payout.payout_status}
Transfer Status: ${payout.transfer_reference || "not_initiated"}
  `.trim();
}
/**
 * Check if payout is in valid state for processing
 */
function isValidForProcessing(payout) {
    return (payout.payout_status !== "transfer_success" &&
        payout.payout_status !== "manual_payout_completed" &&
        payout.payout_status !== "cancelled");
}
