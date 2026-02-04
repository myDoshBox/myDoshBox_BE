import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import ProductTransaction from "../modules/transactions/productsTransaction/productsTransaction.model";
import { errorHandler } from "../utilities/errorHandler.util";
import {
  sendTransferSuccessEmailToVendor,
  sendTransferFailedEmailToVendor,
} from "../modules/transactions/productsTransaction/productTransaction.mail";

/**
 * Handle Paystack webhook events for transfers
 *
 * Webhook Events to handle:
 * - transfer.success: Transfer completed successfully
 * - transfer.failed: Transfer failed
 * - transfer.reversed: Transfer was reversed
 *
 * CRITICAL: Always verify webhook signature to prevent fraud
 */
export const paystackTransferWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ============================================
    // STEP 1: VERIFY WEBHOOK SIGNATURE
    // ============================================
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

    // ============================================
    // STEP 2: PARSE WEBHOOK EVENT
    // ============================================
    const event = req.body;
    const { event: eventType, data } = event;

    console.log(`📬 Received webhook event: ${eventType}`);

    // ============================================
    // STEP 3: HANDLE TRANSFER EVENTS
    // ============================================
    switch (eventType) {
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
 * Handle successful transfer
 */
async function handleTransferSuccess(data: any) {
  try {
    const { reference, amount, status, recipient, reason } = data;

    console.log(`✅ Processing transfer.success:`, {
      reference,
      amount,
      status,
    });

    // Find transaction by transfer reference
    const transaction = await ProductTransaction.findOne({
      transfer_reference: reference,
    });

    if (!transaction) {
      console.error(`❌ Transaction not found for reference: ${reference}`);
      return;
    }

    // Check if already processed (idempotency)
    if (transaction.transfer_status === "success") {
      console.log(
        `⚠️ Transfer already processed for transaction: ${transaction.transaction_id}`,
      );
      return;
    }

    // Update transaction
    const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
      transaction._id,
      {
        transfer_status: "success",
        transfer_completed_at: new Date(),
        transfer_webhook_data: data, // Store full webhook data for audit
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
      `✅ Transaction updated: ${transaction.transaction_id} - Transfer successful`,
    );

    // Send success email to vendor
    try {
      await sendTransferSuccessEmailToVendor(
        transaction.vendor_email,
        transaction.vendor_name,
        transaction.transfer_amount || amount / 100, // Convert from kobo to naira
        transaction.transaction_id,
      );
      console.log(
        `✅ Success email sent to vendor: ${transaction.vendor_email}`,
      );
    } catch (emailError) {
      console.error("⚠️ Failed to send success email:", emailError);
      // Non-critical error, continue
    }

    // TODO: Create audit log entry
    // await AuditLog.create({
    //   transaction_id: transaction.transaction_id,
    //   action: 'TRANSFER_SUCCESS',
    //   details: {
    //     reference,
    //     amount: amount / 100,
    //     timestamp: new Date()
    //   }
    // });
  } catch (error) {
    console.error("❌ Error handling transfer success:", error);
  }
}

/**
 * Handle failed transfer
 */
async function handleTransferFailed(data: any) {
  try {
    const { reference, amount, status, recipient, reason } = data;

    console.log(`❌ Processing transfer.failed:`, {
      reference,
      amount,
      status,
      reason,
    });

    // Find transaction by transfer reference
    const transaction = await ProductTransaction.findOne({
      transfer_reference: reference,
    });

    if (!transaction) {
      console.error(`❌ Transaction not found for reference: ${reference}`);
      return;
    }

    // Check if already processed
    if (transaction.transfer_status === "failed") {
      console.log(
        `⚠️ Transfer failure already processed for transaction: ${transaction.transaction_id}`,
      );
      return;
    }

    // Update transaction
    const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
      transaction._id,
      {
        transfer_status: "failed",
        transfer_failure_reason: reason || "Transfer failed",
        transfer_webhook_data: data,
        // Keep payment_released: true but mark transfer as failed
        // This allows for retry or manual intervention
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
      `⚠️ Transaction updated: ${transaction.transaction_id} - Transfer failed`,
    );

    // Send failure notification emails
    try {
      await Promise.all([
        sendTransferFailedEmailToVendor(
          transaction.vendor_email,
          transaction.vendor_name,
          transaction.transaction_id,
          reason || "Transfer processing failed",
        ),
      ]);
      console.log(`✅ Failure notification emails sent`);
    } catch (emailError) {
      console.error("⚠️ Failed to send failure emails:", emailError);
    }

    // TODO: Create support ticket for manual intervention
    // TODO: Trigger alert to admin dashboard
    // TODO: Create audit log entry
  } catch (error) {
    console.error("❌ Error handling transfer failure:", error);
  }
}

/**
 * Handle reversed transfer
 */
async function handleTransferReversed(data: any) {
  try {
    const { reference, amount, status, recipient, reason } = data;

    console.log(`🔄 Processing transfer.reversed:`, {
      reference,
      amount,
      status,
      reason,
    });

    // Find transaction by transfer reference
    const transaction = await ProductTransaction.findOne({
      transfer_reference: reference,
    });

    if (!transaction) {
      console.error(`❌ Transaction not found for reference: ${reference}`);
      return;
    }

    // Update transaction
    const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
      transaction._id,
      {
        transfer_status: "reversed",
        transfer_reversal_reason: reason || "Transfer reversed",
        transfer_webhook_data: data,
        // Mark for manual review
        requires_manual_review: true,
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
      `⚠️ Transaction updated: ${transaction.transaction_id} - Transfer reversed`,
    );

    // Send notification emails about reversal
    try {
      await Promise.all([
        sendTransferFailedEmailToVendor(
          transaction.vendor_email,
          transaction.vendor_name,
          transaction.transaction_id,
          `Transfer was reversed: ${reason || "Unknown reason"}`,
        ),
      ]);
      console.log(`✅ Reversal notification emails sent`);
    } catch (emailError) {
      console.error("⚠️ Failed to send reversal emails:", emailError);
    }

    // TODO: Create high-priority support ticket
    // TODO: Trigger urgent admin alert
    // TODO: Create audit log entry
  } catch (error) {
    console.error("❌ Error handling transfer reversal:", error);
  }
}

/**
 * Enhanced webhook handler that also handles payment events
 * This replaces your existing paystackWebhook
 */
export const paystackUnifiedWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Verify signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;
    const { event: eventType, data } = event;

    console.log(`📬 Webhook event received: ${eventType}`);

    // Handle different event types
    switch (eventType) {
      // ========== PAYMENT EVENTS ==========
      case "charge.success":
        await handleChargeSuccess(data);
        break;

      // ========== TRANSFER EVENTS ==========
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
        console.log(`ℹ️ Unhandled event type: ${eventType}`);
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(200).send("Webhook processing failed");
  }
};

/**
 * Handle successful charge (payment)
 * This is your existing payment webhook logic
 */
async function handleChargeSuccess(data: any) {
  try {
    const { reference, amount, status } = data;

    const transaction = await ProductTransaction.findOne({
      payment_reference: reference,
    });

    if (transaction && !transaction.verified_payment_status) {
      const expectedAmount = Number(transaction.transaction_total) * 100;

      if (amount === expectedAmount && status === "success") {
        await ProductTransaction.findByIdAndUpdate(transaction._id, {
          verified_payment_status: true,
          transaction_status: "payment_verified",
          payment_verified_at: new Date(),
        });

        console.log(
          `✅ Payment verified for transaction: ${transaction.transaction_id}`,
        );

        // Send vendor notification email (existing logic)
        // await sendEscrowInitiationEmailToVendor(...);
      }
    }
  } catch (error) {
    console.error("❌ Error handling charge success:", error);
  }
}
