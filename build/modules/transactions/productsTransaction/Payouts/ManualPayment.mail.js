"use strict";
// ============================================
// EMAIL TEMPLATES FOR MANUAL PAYOUT
// ============================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBuyerConfirmationEmail = sendBuyerConfirmationEmail;
exports.sendVendorManualPayoutEmail = sendVendorManualPayoutEmail;
exports.sendAdminManualPayoutAlert = sendAdminManualPayoutAlert;
const email_utils_1 = require("../../../../utilities/email.utils");
function sendBuyerConfirmationEmail(buyer_email, transaction_id, vendor_name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transport = yield (0, email_utils_1.generateMailTransporter)();
            const supportEmail = "mydoshbox@gmail.com";
            const dashboardUrl = "https://mydoshbox.vercel.app/userdashboard";
            const subject = `Order Confirmed - ${transaction_id}`;
            const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Success Gradient -->
            <tr>
              <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 24px; text-align: center;">
                <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                  🎉
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                  Order Confirmed!
                </h1>
                <p style="margin: 12px 0 0 0; color: #d1fae5; font-size: 15px;">
                  Thank you for confirming receipt
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Dear Customer,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  We've received your confirmation that the product has been delivered successfully. Thank you for completing the transaction!
                </p>

                <!-- Transaction Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Transaction ID
                          </td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">
                            ${transaction_id}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 13px;">
                            Vendor
                          </td>
                          <td style="padding: 12px 0 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                            ${vendor_name}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 0 0; color: #6b7280; font-size: 13px;">
                            Status
                          </td>
                          <td style="padding: 12px 0 0 0; color: #059669; font-size: 14px; font-weight: 700; text-align: right;">
                            ✅ CONFIRMED
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Next Steps -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 What Happens Next
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <!-- Step 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #065f46; font-weight: 700; font-size: 16px;">✓</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Receipt confirmed</strong> - You've confirmed successful delivery
                          </td>
                        </tr>
                      </table>

                      <!-- Step 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #92400e; font-weight: 700; font-size: 14px;">→</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Vendor payment processing</strong> - Vendor payout initiated
                          </td>
                        </tr>
                      </table>

                      <!-- Step 3 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #6b7280; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                            <strong>Transaction completed</strong> - You'll receive final confirmation
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Payment Processing Info -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 700;">
                        💳 Payment Processing
                      </p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                        The payment to the vendor will be processed within 24-48 business hours. You'll receive a confirmation email once the payout is complete.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Thank You Message -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; font-weight: 700;">
                        🙏 Thank You
                      </p>
                      <p style="margin: 0; color: #047857; font-size: 14px; line-height: 1.6;">
                        Thank you for using our escrow service! Your trust means everything to us.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                        View Transaction History
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
            const info = yield transport.sendMail({
                to: buyer_email,
                from: process.env.VERIFICATION_EMAIL,
                subject: subject,
                html: html,
            });
            console.log("Buyer confirmation email sent - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
        }
        catch (error) {
            console.error("Error sending buyer confirmation email:", error);
            throw error;
        }
    });
}
function sendVendorManualPayoutEmail(vendor_email, vendor_name, transaction_id, payout_amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transport = yield (0, email_utils_1.generateMailTransporter)();
            const supportEmail = "mydoshbox@gmail.com";
            const dashboardUrl = "https://mydoshbox.vercel.app/userdashboard";
            const subject = `Payment Processing - ${transaction_id}`;
            const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Processing - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Success Gradient -->
            <tr>
              <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 24px; text-align: center;">
                <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                  🎉
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                  Great News!
                </h1>
                <p style="margin: 12px 0 0 0; color: #d1fae5; font-size: 15px;">
                  Buyer confirmed delivery - Payment processing
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Dear ${vendor_name},
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  The buyer has confirmed receipt of the product. Your payment is being processed!
                </p>

                <!-- Amount Display -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; border: 2px solid #10b981; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 32px 24px; text-align: center;">
                      <p style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        Payout Amount
                      </p>
                      <p style="margin: 0; color: #065f46; font-size: 40px; font-weight: 700; line-height: 1;">
                        ₦${payout_amount.toFixed(2)}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Transaction Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Transaction ID
                          </td>
                          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; font-family: 'Courier New', monospace;">
                            ${transaction_id}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 13px;">
                            Payout Amount
                          </td>
                          <td style="padding: 12px 0 8px 0; color: #059669; font-size: 18px; font-weight: 700; text-align: right;">
                            ₦${payout_amount.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0 0 0; border-top: 1px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0 0 0; color: #6b7280; font-size: 13px;">
                            Status
                          </td>
                          <td style="padding: 12px 0 0 0; color: #f59e0b; font-size: 14px; font-weight: 700; text-align: right;">
                            ⏳ PROCESSING
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Payment Timeline -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  💳 Payment Timeline
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <!-- Step 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #065f46; font-weight: 700; font-size: 16px;">✓</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Buyer confirmed delivery</strong> - Transaction approved for payout
                          </td>
                        </tr>
                      </table>

                      <!-- Step 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #92400e; font-weight: 700; font-size: 14px;">→</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Manual payout processing</strong> - Admin will process payment within 24-48 hours
                          </td>
                        </tr>
                      </table>

                      <!-- Step 3 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #6b7280; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                            <strong>Funds transferred</strong> - You'll receive funds in your bank account
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Important Info Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 700;">
                        📌 Important Information
                      </p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                        You will receive the funds in your registered bank account within 24-48 business hours. We'll send you another email once the transfer is complete.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                        View Transaction Status
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
            const info = yield transport.sendMail({
                to: vendor_email,
                from: process.env.VERIFICATION_EMAIL,
                subject: subject,
                html: html,
            });
            console.log("Vendor manual payout email sent - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
        }
        catch (error) {
            console.error("Error sending vendor manual payout email:", error);
            throw error;
        }
    });
}
function sendAdminManualPayoutAlert(transaction_id, vendor_name, payout_amount, bank_details) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transport = yield (0, email_utils_1.generateMailTransporter)();
            const adminEmail = process.env.ADMIN_EMAIL || "petersonzoconis@gmail.com";
            const paystackDashboardUrl = "https://dashboard.paystack.com/";
            const subject = `ACTION REQUIRED: Manual Payout - ${transaction_id}`;
            const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual Payout Required - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 700px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Warning Gradient -->
            <tr>
              <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 24px; text-align: center;">
                <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                  ⚠️
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                  Manual Payout Required
                </h1>
                <p style="margin: 12px 0 0 0; color: #fecaca; font-size: 15px;">
                  A transaction requires manual payout processing
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Alert Message -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 8px; border-left: 6px solid #ef4444; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px; font-weight: 700;">
                        ⚠️ ACTION REQUIRED: Manual Payout Processing
                      </p>
                      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                        Please process this payout via your bank's online banking or Paystack dashboard.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Transaction Summary -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 700;">
                  📋 Transaction Summary
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 2px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 24px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 12px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Transaction ID
                          </td>
                          <td style="padding: 12px 0; color: #111827; font-size: 16px; font-weight: 700; text-align: right; font-family: 'Courier New', monospace;">
                            ${transaction_id}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 0; border-top: 2px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Vendor Name
                          </td>
                          <td style="padding: 12px 0; color: #111827; font-size: 16px; font-weight: 700; text-align: right;">
                            ${vendor_name}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 0; border-top: 2px solid #e5e7eb;"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Payout Amount
                          </td>
                          <td style="padding: 12px 0; color: #dc2626; font-size: 24px; font-weight: 800; text-align: right;">
                            ₦${payout_amount.toFixed(2)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Bank Details -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 700;">
                  🏦 Bank Details
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border: 2px solid #3b82f6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 24px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 12px 0; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Account Name
                          </td>
                          <td style="padding: 12px 0; color: #111827; font-size: 16px; font-weight: 700; text-align: right;">
                            ${bank_details.account_name}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 0; border-top: 2px solid rgba(59, 130, 246, 0.3);"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Account Number
                          </td>
                          <td style="padding: 12px 0; color: #111827; font-size: 20px; font-weight: 700; text-align: right; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                            ${bank_details.account_number}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 0; border-top: 2px solid rgba(59, 130, 246, 0.3);"></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Bank Name
                          </td>
                          <td style="padding: 12px 0; color: #111827; font-size: 16px; font-weight: 700; text-align: right;">
                            ${bank_details.bank_name}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Action Steps -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 700;">
                  📝 Action Steps
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <!-- Step 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 32px; height: 32px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 16px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 15px; line-height: 1.6;">
                            <strong>Login to Paystack Dashboard</strong> or your bank's online banking
                          </td>
                        </tr>
                      </table>

                      <!-- Step 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 32px; height: 32px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 16px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 15px; line-height: 1.6;">
                            <strong>Initiate transfer</strong> using the bank details provided above
                          </td>
                        </tr>
                      </table>

                      <!-- Step 3 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 32px; height: 32px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 16px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 15px; line-height: 1.6;">
                            <strong>Mark as completed</strong> in the admin panel after successful transfer
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Paystack Info -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 6px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 700;">
                        💡 Paystack Note
                      </p>
                      <p style="margin: 0 0 8px 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        <strong>Automatic transfers are not yet enabled on your Paystack account.</strong>
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        To enable automatic payouts in the future, go to Settings → Preferences → Enable Transfers in your Paystack dashboard.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Buttons -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0 0 12px 0;">
                      <a href="${paystackDashboardUrl}" style="display: inline-block; padding: 16px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                        Go to Paystack Dashboard
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="mailto:admin@mydoshbox.com" style="display: inline-block; padding: 16px 32px; background-color: #ffffff; color: #3b82f6; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #3b82f6;">
                        Contact Support
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Important Notes -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 24px;">
                  <tr>
                    <td>
                      <p style="margin: 0 0 12px 0; color: #111827; font-size: 14px; font-weight: 700;">
                        📌 Important Notes:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        <li>Process this payout within 24 hours</li>
                        <li>Verify all bank details before initiating transfer</li>
                        <li>Keep transaction reference for reconciliation</li>
                        <li>Mark transaction as "Paid" in admin panel after completion</li>
                      </ul>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 32px 0;" />

                <!-- Footer -->
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; text-align: center;">
                  This is an automated alert. Please process this payout promptly.
                </p>
                <p style="margin: 0; color: #374151; font-size: 14px; text-align: center;">
                  MyDoshBox Admin Team
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #1f2937; padding: 24px; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #d1d5db; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. Admin Alert System
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
            const info = yield transport.sendMail({
                to: adminEmail,
                from: process.env.VERIFICATION_EMAIL,
                subject: subject,
                html: html,
            });
            console.log("Admin manual payout alert sent - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
        }
        catch (error) {
            console.error("Error sending admin manual payout alert:", error);
            throw error;
        }
    });
}
// Export all functions
exports.default = {
    sendBuyerConfirmationEmail,
    sendVendorManualPayoutEmail,
    sendAdminManualPayoutAlert,
};
