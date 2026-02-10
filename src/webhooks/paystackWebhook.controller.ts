import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import ProductTransaction from "../modules/transactions/productsTransaction/productsTransaction.model";
import Payout from "../modules/transactions/productsTransaction/Payouts/payout.model";
import { errorHandler } from "../utilities/errorHandler.util";
import {
  sendTransferSuccessEmailToVendor,
  sendTransferFailedEmailToVendor,
  sendSuccessfulEscrowEmailToInitiator,
  sendEscrowInitiationEmailToVendor,
} from "../modules/transactions/productsTransaction/productTransaction.mail";
import { sendAdminManualPayoutAlert } from "../modules/transactions/productsTransaction/Payouts/ManualPayment.mail";
import type { IPayout } from "../modules/transactions/productsTransaction/Payouts/payout.model";

//  Main webhook endpoint for all Paystack events
//  Handles both payment and transfer events

export const paystackUnifiedWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //  VERIFY WEBHOOK SIGNATURE
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
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
      reference: data?.reference,
      status: data?.status,
    });

    switch (eventType) {
      // ========== PAYMENT EVENTS ==========
      case "charge.success":
        await handleChargeSuccess(data);
        break;

      //TRANSFER EVENTS (Now update Payout model)
      case "transfer.success":
        await handleTransferSuccess(data);
        break;

      case "transfer.failed":
        await handleTransferFailed(data);
        break;

      case "transfer.reversed":
        await handleTransferReversed(data);
        break;

      default:
        console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    // Still return 200 to prevent Paystack from retrying
    res.status(200).send("Webhook processing failed");
  }
};

/**
 * Handle successful charge (payment from buyer)
 * This marks payment as verified and allows vendor to ship
 */
async function handleChargeSuccess(data: any) {
  try {
    const { reference, amount, status } = data;

    console.log(`💳 Processing charge.success:`, {
      reference,
      amount: amount / 100, // Convert kobo to naira
      status,
    });

    // Find transaction by payment reference
    const transaction = await ProductTransaction.findOne({
      payment_reference: reference,
    });

    if (!transaction) {
      console.error(`❌ Transaction not found for reference: ${reference}`);
      return;
    }

    // ✅ IDEMPOTENCY CHECK
    if (transaction.verified_payment_status) {
      console.log(
        `⚠️ Payment already verified for transaction: ${transaction.transaction_id}`,
      );
      return;
    }

    // Validate amount matches
    const expectedAmount = Number(transaction.transaction_total) * 100; // Convert to kobo

    if (amount !== expectedAmount) {
      console.error(
        `❌ Amount mismatch for ${reference}: Expected ${expectedAmount}, got ${amount}`,
      );
      return;
    }

    if (status !== "success") {
      console.error(`❌ Payment status is not success: ${status}`);
      return;
    }

    // ============================================
    // UPDATE TRANSACTION
    // ============================================
    const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
      transaction._id,
      {
        verified_payment_status: true,
        transaction_status: "payment_verified",
        payment_verified_at: new Date(),
      },
      { new: true },
    );

    if (!updatedTransaction) {
      console.error(
        `❌ Failed to update transaction for reference: ${reference}`,
      );
      return;
    }

    console.log(
      `✅ Payment verified for transaction: ${transaction.transaction_id}`,
    );

    // ============================================
    // SEND NOTIFICATION EMAILS
    // ============================================
    try {
      await sendEscrowInitiationEmailToVendor(
        transaction.transaction_id,
        transaction.vendor_name,
        transaction.vendor_email,
        transaction.products,
        transaction.sum_total,
        transaction.transaction_total,
      );
      console.log(`✅ Vendor notification email sent`);
    } catch (emailError) {
      console.error("⚠️ Failed to send vendor email:", emailError);
      // Non-critical error, continue
    }
  } catch (error) {
    console.error("❌ Error handling charge success:", error);
  }
}

/**
 * Handle successful transfer (payout to vendor)
 * Updates Payout model - does NOT change transaction status
 */
async function handleTransferSuccess(data: any) {
  try {
    const { reference, amount, status, recipient } = data;

    console.log(`💸 Processing transfer.success:`, {
      reference,
      amount: amount / 100, // Convert kobo to naira
      status,
    });

    //  FIND PAYOUT BY TRANSFER REFERENCE
    const payout = await Payout.findOne({
      transfer_reference: reference,
    }).populate("transaction");

    if (!payout) {
      console.error(`❌ Payout not found for reference: ${reference}`);
      return;
    }

    // ✅ IDEMPOTENCY CHECK
    if (payout.payout_status === "transfer_success") {
      console.log(
        `⚠️ Transfer already processed for payout: ${payout.transaction_id}`,
      );
      return;
    }

    // Validate amount matches
    const expectedAmount = Math.round(payout.payout_amount * 100); // Convert to kobo

    if (Math.abs(amount - expectedAmount) > 1) {
      // Allow 1 kobo difference for rounding
      console.error(
        `❌ Amount mismatch for ${reference}: Expected ${expectedAmount}, got ${amount}`,
      );
      // Log but don't fail - continue with the update
    }

    // ============================================
    // UPDATE PAYOUT TO SUCCESS
    // ============================================
    await payout.markAsTransferSuccess(data);

    console.log(
      `✅ Payout completed successfully: ${payout.transaction_id} - Transfer reference: ${reference}`,
    );

    // ============================================
    // SEND SUCCESS NOTIFICATIONS (if not already sent)
    // ============================================
    if (!payout.vendor_notified || !payout.buyer_notified) {
      try {
        const transaction = payout.transaction as any;
        const product_name = transaction?.products?.[0]?.name || "Product";

        const emailPromises = [];

        if (!payout.vendor_notified) {
          emailPromises.push(
            sendTransferSuccessEmailToVendor(
              payout.vendor_email,
              payout.vendor_name,
              payout.payout_amount,
              payout.transaction_id,
            ),
          );
        }

        if (!payout.buyer_notified && transaction) {
          emailPromises.push(
            sendSuccessfulEscrowEmailToInitiator(
              payout.transaction_id,
              payout.vendor_name,
              transaction.buyer_email,
              product_name,
            ),
          );
        }

        await Promise.all(emailPromises);

        // Mark notifications as sent
        payout.vendor_notified = true;
        payout.vendor_notified_at = new Date();
        payout.buyer_notified = true;
        payout.buyer_notified_at = new Date();
        await payout.save();

        console.log(`✅ Success notification emails sent`);
      } catch (emailError) {
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
  } catch (error) {
    console.error("❌ Error handling transfer success:", error);
  }
}

// function to find payout
async function findPayout(reference: string): Promise<IPayout | null> {
  const result = await Payout.findOne({
    transfer_reference: reference,
  })
    .populate("transaction")
    .lean<IPayout>();
  return result as IPayout | null;
}
/**
 * Handle failed transfer
 * Updates Payout model and triggers retry logic or manual intervention
 */
async function handleTransferFailed(data: any) {
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
    const payout = await findPayout(reference);

    if (!payout) {
      console.error(`❌ Payout not found for reference: ${reference}`);
      return;
    }

    // ✅ IDEMPOTENCY CHECK
    if (
      payout.payout_status === "transfer_failed" ||
      payout.payout_status === "manual_payout_required"
    ) {
      console.log(
        `⚠️ Transfer failure already processed for payout: ${payout.transaction_id}`,
      );
      return;
    }

    // ============================================
    // UPDATE PAYOUT (includes retry logic)
    // ============================================
    await payout.markAsTransferFailed(failureReason);

    console.log(
      `⚠️ Payout marked as failed: ${payout.transaction_id} - Status: ${payout.payout_status}`,
    );
    console.log(`   Retry count: ${payout.retry_count}/${payout.max_retries}`);

    // ============================================
    // SEND NOTIFICATIONS
    // ============================================
    try {
      const emailPromises = [];
      const currentStatus = payout.payout_status as IPayout["payout_status"];

      // Always notify vendor of failure
      emailPromises.push(
        sendTransferFailedEmailToVendor(
          payout.vendor_email,
          payout.vendor_name,
          payout.transaction_id,
          failureReason,
        ),
      );

      // If manual payout is now required (max retries exceeded), notify admin
      if (currentStatus === "manual_payout_required") {
        emailPromises.push(
          sendAdminManualPayoutAlert(
            payout.transaction_id,
            payout.vendor_name,
            payout.payout_amount,
            payout.vendor_bank_details,
          ),
        );

        payout.admin_notified = true;
        payout.admin_notified_at = new Date();
      }

      await Promise.all(emailPromises);

      payout.vendor_notified = true;
      payout.vendor_notified_at = new Date();
      await payout.save();

      console.log(`✅ Failure notification emails sent`);
    } catch (emailError) {
      console.error("⚠️ Failed to send failure emails:", emailError);
    }

    // ============================================
    // LOG FAILURE
    // ============================================
  } catch (error) {
    console.error("❌ Error handling transfer failure:", error);
  }
}

/**
 * Handle reversed transfer
 * This is CRITICAL - money was sent but came back
 * Updates Payout and requires immediate manual intervention
 */
async function handleTransferReversed(data: any) {
  try {
    const { reference, amount, status, recipient, message } = data;
    const reversalReason =
      data.reversal_reason || message || "Transfer reversed by bank";

    console.log(`🔄 Processing transfer.reversed:`, {
      reference,
      amount: amount / 100,
      status,
      reason: reversalReason,
    });

    //  FIND PAYOUT BY TRANSFER REFERENCE
    const payout = (await Payout.findOne({
      transfer_reference: reference,
    }).populate("transaction")) as IPayout | null;

    if (!payout) {
      console.error(`❌ Payout not found for reference: ${reference}`);
      return;
    }

    // ✅ IDEMPOTENCY CHECK
    if (payout.payout_status === "reversed") {
      console.log(
        `⚠️ Transfer reversal already processed for payout: ${payout.transaction_id}`,
      );
      return;
    }

    //  UPDATE PAYOUT TO REVERSED
    payout.payout_status = "reversed";
    payout.transfer_reversal_reason = reversalReason;
    payout.transfer_webhook_data = data;
    await payout.save();

    console.log(`🔄 Payout marked as reversed: ${payout.transaction_id}`);

    // SEND URGENT NOTIFICATIONS
    try {
      await Promise.all([
        // Notify vendor
        sendTransferFailedEmailToVendor(
          payout.vendor_email,
          payout.vendor_name,
          payout.transaction_id,
          `Payment transfer was reversed by your bank. Reason: ${reversalReason}. Please update your bank details and contact support immediately.`,
        ),
        // Notify admin urgently
        sendAdminManualPayoutAlert(
          payout.transaction_id,
          payout.vendor_name,
          payout.payout_amount,
          payout.vendor_bank_details,
        ),
      ]);

      payout.vendor_notified = true;
      payout.vendor_notified_at = new Date();
      payout.admin_notified = true;
      payout.admin_notified_at = new Date();
      await payout.save();

      console.log(`✅ Reversal notification emails sent`);
    } catch (emailError) {
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
  } catch (error) {
    console.error("❌ Error handling transfer reversal:", error);
  }
}

/**
 * Legacy webhook handler for transfers only
 * Use paystackUnifiedWebhook instead
 * @deprecated Use paystackUnifiedWebhook for all events
 */
export const paystackTransferWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.warn(
    "⚠️ Using deprecated paystackTransferWebhook. Please migrate to paystackUnifiedWebhook",
  );
  return paystackUnifiedWebhook(req, res, next);
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format payout for logging
 */
function formatPayoutLog(payout: any): string {
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
function isValidForProcessing(payout: any): boolean {
  return (
    payout.payout_status !== "transfer_success" &&
    payout.payout_status !== "manual_payout_completed" &&
    payout.payout_status !== "cancelled"
  );
}
