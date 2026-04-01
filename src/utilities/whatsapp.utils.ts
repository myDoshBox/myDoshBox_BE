import axios from "axios";

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

const whatsappHeaders = {
  Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
};

// ─── Core send function ───────────────────────────────────────────────────────

export const sendWhatsAppMessage = async (
  to: string, // must be in international format e.g. 2348012345678
  message: string,
): Promise<boolean> => {
  try {
    // Normalize Nigerian numbers — strip leading 0, add 234
    const normalized = normalizeNigerianNumber(to);
    if (!normalized) {
      console.warn(`⚠️ WhatsApp: Could not normalize number: ${to}`);
      return false;
    }

    await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: normalized,
        type: "text",
        text: { body: message },
      },
      { headers: whatsappHeaders },
    );

    console.log(`✅ WhatsApp sent to ${normalized}`);
    return true;
  } catch (error: any) {
    // Non-fatal — log but don't crash the main flow
    console.error(
      "❌ WhatsApp send failed:",
      error?.response?.data?.error?.message || error.message,
    );
    return false;
  }
};

// ─── Number normalizer ────────────────────────────────────────────────────────

const normalizeNigerianNumber = (phone: string): string | null => {
  if (!phone) return null;

  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // Already in international format
  if (digits.startsWith("234") && digits.length === 13) return digits;

  // Local format: 08012345678 → 2348012345678
  if (digits.startsWith("0") && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }

  // 11 digits without leading zero: 8012345678 → 2348012345678
  if (!digits.startsWith("0") && digits.length === 10) {
    return `234${digits}`;
  }

  // International without +: 2348012345678
  if (digits.length === 13) return digits;

  return null;
};

// ─── Message templates ────────────────────────────────────────────────────────

export const WA_MESSAGES = {
  transactionInitiated: (
    vendorName: string,
    transactionId: string,
    sumTotal: number,
  ) =>
    `🛍️ *MyDoshBox — New Transaction*\n\nHello ${vendorName},\n\nA buyer has initiated an escrow transaction for your products.\n\n*Transaction ID:* ${transactionId}\n*Amount:* ₦${Number(sumTotal).toLocaleString()}\n\nPlease log in to confirm the order:\nhttps://mydoshbox.vercel.app/userdashboard\n\n_MyDoshBox — Secure escrow made simple_`,

  vendorInvitation: (
    vendorName: string,
    transactionId: string,
    sumTotal: number,
  ) =>
    `🎉 *MyDoshBox — Someone wants to buy from you!*\n\nHello ${vendorName},\n\nA buyer has placed an escrow order worth *₦${Number(sumTotal).toLocaleString()}* for your products.\n\nYour payment is guaranteed once you sign up, confirm and deliver.\n\n👉 Create your free account:\nhttps://mydoshbox.vercel.app/signup\n\n*Transaction ID:* ${transactionId}\n\n_MyDoshBox — Secure escrow made simple_`,

  transactionAccepted: (
    vendorName: string,
    transactionId: string,
    transactionTotal: number,
  ) =>
    `✅ *MyDoshBox — Transaction Confirmed*\n\n${vendorName} has confirmed your order!\n\n*Transaction ID:* ${transactionId}\n*Amount to pay:* ₦${Number(transactionTotal).toLocaleString()}\n\nPlease log in to proceed with payment:\nhttps://mydoshbox.vercel.app/userdashboard\n\n_MyDoshBox — Secure escrow made simple_`,

  transactionDeclined: (vendorName: string, transactionId: string) =>
    `❌ *MyDoshBox — Transaction Declined*\n\n${vendorName} has declined your transaction request.\n\n*Transaction ID:* ${transactionId}\n\nYou may contact the vendor or initiate a new transaction:\nhttps://mydoshbox.vercel.app/userdashboard\n\n_MyDoshBox — Secure escrow made simple_`,

  paymentVerified: (
    vendorName: string,
    transactionId: string,
    sumTotal: number,
  ) =>
    `💰 *MyDoshBox — Payment Received!*\n\nHello ${vendorName},\n\nThe buyer has completed payment for transaction *${transactionId}*.\n\n*Your payout:* ₦${Number(sumTotal).toLocaleString()} (held in escrow)\n\nPlease submit shipping details now:\nhttps://mydoshbox.vercel.app/userdashboard\n\n_MyDoshBox — Secure escrow made simple_`,

  shippingSubmitted: (
    buyerEmail: string,
    shippingCompany: string,
    deliveryDate: string,
  ) =>
    `🚚 *MyDoshBox — Your Order is on the Way!*\n\nHello,\n\nThe vendor has submitted shipping details for your order.\n\n*Shipping company:* ${shippingCompany}\n*Expected delivery:* ${deliveryDate}\n\nPlease confirm receipt once delivered:\nhttps://mydoshbox.vercel.app/userdashboard\n\n_MyDoshBox — Secure escrow made simple_`,

  transactionCompleted: (productName: string, transactionId: string) =>
    `🎉 *MyDoshBox — Transaction Completed!*\n\nYour escrow transaction for *${productName}* has been completed successfully.\n\n*Transaction ID:* ${transactionId}\n\nThank you for using MyDoshBox!\nhttps://mydoshbox.vercel.app/userdashboard\n\n_MyDoshBox — Secure escrow made simple_`,

  paymentReleasedToVendor: (
    vendorName: string,
    transactionId: string,
    amount: number,
  ) =>
    `💳 *MyDoshBox — Payment Released!*\n\nHello ${vendorName},\n\nThe buyer has confirmed delivery and *₦${Number(amount).toLocaleString()}* has been released to your bank account.\n\n*Transaction ID:* ${transactionId}\n\nFunds typically arrive within 24 hours.\n\n_MyDoshBox — Secure escrow made simple_`,

  disputeRaised: (productName: string, transactionId: string) =>
    `⚠️ *MyDoshBox — Dispute Raised*\n\nA dispute has been raised on transaction *${transactionId}* for *${productName}*.\n\nPlease log in to view the dispute and respond:\nhttps://mydoshbox.vercel.app/userdashboard\n\n_MyDoshBox — Secure escrow made simple_`,

  transactionCancelled: (productName: string, transactionId: string) =>
    `❌ *MyDoshBox — Transaction Cancelled*\n\nTransaction *${transactionId}* for *${productName}* has been cancelled.\n\nIf you have questions, contact support: mydoshbox@gmail.com\n\n_MyDoshBox — Secure escrow made simple_`,
};
