import axios from "axios";

interface IPayment {
  reference: string;
  amount: number;
  email: string;
  currency?: string;
  channels?: string[];
  callback_url?: string;
}

export const paymentForEscrowProductTransaction = async (data: IPayment) => {
  const API_URL = process.env.PAYSTACK_BASE_URL;
  const API_KEY = process.env.PAYSTACK_PAYMENT_KEY;
  const DEPLOYED_FRONTEND_BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://mydoshbox.vercel.app";

  // FIXED: Added /userdashboard to the callback URL path
  const callbackURL = `${DEPLOYED_FRONTEND_BASE_URL}/userdashboard/verifyPayment?reference=${data.reference}`;

  const response = await axios.post(
    `${API_URL}/transaction/initialize`,
    {
      reference: data?.reference,
      amount: data?.amount * 100,
      email: data?.email,
      currency: "NGN",
      channels: ["card"],
      callback_url: callbackURL,
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "cache-control": "no-cache",
      },
    },
  );

  return response.data;
};

export const verifyPaymentForEscrowProductTransaction = async (
  reference: string,
) => {
  const API_URL = process.env.PAYSTACK_BASE_URL;
  const API_KEY = process.env.PAYSTACK_PAYMENT_KEY;

  const response = await axios.get(
    `${API_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "cache-control": "no-cache",
      },
    },
  );

  return response.data;
};

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// ============================================
// INTERFACE DEFINITIONS
// ============================================

interface CreateRecipientParams {
  account_name: string;
  account_number: string;
  bank_code: string;
  email?: string;
  currency?: "NGN";
}

interface CreateRecipientResponse {
  status: boolean;
  message: string;
  data: {
    active: boolean;
    createdAt: string;
    currency: string;
    domain: string;
    id: number;
    integration: number;
    name: string;
    recipient_code: string;
    type: string;
    updatedAt: string;
    is_deleted: boolean;
    details: {
      authorization_code: null | string;
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
    };
  };
}

interface InitiateTransferParams {
  amount: number; // Amount in kobo (smallest currency unit)
  recipient: string; // Recipient code from createTransferRecipient
  reason?: string;
  reference?: string; // Unique reference for idempotency
  currency?: "NGN";
  source?: "balance";
}

interface InitiateTransferResponse {
  status: boolean;
  message: string;
  data: {
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    source: string;
    reason: string;
    recipient: number;
    status: string; // "pending", "success", "failed"
    transfer_code: string;
    id: number;
    createdAt: string;
    updatedAt: string;
    reference: string;
  };
}

interface VerifyTransferResponse {
  status: boolean;
  message: string;
  data: {
    recipient: {
      domain: string;
      type: string;
      currency: string;
      name: string;
      details: {
        account_number: string;
        account_name: string;
        bank_code: string;
        bank_name: string;
      };
      description: string;
      metadata: any;
      recipient_code: string;
      active: boolean;
      id: number;
      integration: number;
      createdAt: string;
      updatedAt: string;
    };
    domain: string;
    amount: number;
    currency: string;
    source: string;
    source_details: null;
    reason: string;
    status: string; // "pending", "success", "failed", "reversed"
    failures: null;
    transfer_code: string;
    id: number;
    createdAt: string;
    updatedAt: string;
    reference: string;
  };
}

interface ListBanksResponse {
  status: boolean;
  message: string;
  data: Array<{
    id: number;
    name: string;
    slug: string;
    code: string;
    longcode: string;
    gateway: string;
    pay_with_bank: boolean;
    active: boolean;
    country: string;
    currency: string;
    type: string;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  meta: {
    next: string | null;
    previous: string | null;
    perPage: number;
  };
}

// ============================================
// PAYSTACK TRANSFER FUNCTIONS
// ============================================

/**
 * Create a transfer recipient
 * This must be done before initiating a transfer
 * Store the recipient_code for future transfers to the same account
 */
export const createTransferRecipient = async (
  params: CreateRecipientParams,
): Promise<CreateRecipientResponse> => {
  try {
    console.log("🔄 Creating transfer recipient:", {
      account_name: params.account_name,
      account_number: params.account_number,
      bank_code: params.bank_code,
    });

    const response = await axios.post<CreateRecipientResponse>(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        type: "nuban", // Nigerian bank account
        name: params.account_name,
        account_number: params.account_number,
        bank_code: params.bank_code,
        currency: params.currency || "NGN",
        email: params.email,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Recipient created:", response.data.data.recipient_code);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Paystack recipient creation error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });

      // Return Paystack error response
      return {
        status: false,
        message:
          error.response?.data?.message ||
          "Failed to create transfer recipient",
        data: error.response?.data?.data || ({} as any),
      };
    }

    console.error("❌ Unexpected error creating recipient:", error);
    throw error;
  }
};

/**
 * Initiate a transfer to a recipient
 * Amount should be in kobo (multiply naira by 100)
 */
export const initiateTransfer = async (
  params: InitiateTransferParams,
): Promise<InitiateTransferResponse> => {
  try {
    console.log("🔄 Initiating transfer:", {
      amount: params.amount,
      recipient: params.recipient,
      reference: params.reference,
    });

    const response = await axios.post<InitiateTransferResponse>(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: params.source || "balance",
        amount: params.amount,
        recipient: params.recipient,
        reason: params.reason || "Escrow payment release",
        reference: params.reference,
        currency: params.currency || "NGN",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Transfer initiated:", {
      reference: response.data.data.reference,
      status: response.data.data.status,
      transfer_code: response.data.data.transfer_code,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Paystack transfer initiation error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });

      // Return Paystack error response
      return {
        status: false,
        message: error.response?.data?.message || "Failed to initiate transfer",
        data: error.response?.data?.data || ({} as any),
      };
    }

    console.error("❌ Unexpected error initiating transfer:", error);
    throw error;
  }
};

/**
 * Verify a transfer using reference or transfer code
 * Use this to check the status of a transfer
 */
export const verifyTransfer = async (
  reference: string,
): Promise<VerifyTransferResponse> => {
  try {
    console.log("🔄 Verifying transfer:", reference);

    const response = await axios.get<VerifyTransferResponse>(
      `${PAYSTACK_BASE_URL}/transfer/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Transfer verified:", {
      reference: response.data.data.reference,
      status: response.data.data.status,
      amount: response.data.data.amount,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Paystack transfer verification error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });

      return {
        status: false,
        message: error.response?.data?.message || "Failed to verify transfer",
        data: error.response?.data?.data || ({} as any),
      };
    }

    console.error("❌ Unexpected error verifying transfer:", error);
    throw error;
  }
};

/**
 * List all Nigerian banks
 * Use this to get bank codes for recipient creation
 */
export const listBanks = async (
  country: string = "nigeria",
  currency: string = "NGN",
): Promise<ListBanksResponse> => {
  try {
    const response = await axios.get<ListBanksResponse>(
      `${PAYSTACK_BASE_URL}/bank`,
      {
        params: {
          country,
          currency,
          perPage: 100,
        },
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Paystack list banks error:", error.response?.data);
      return {
        status: false,
        message: error.response?.data?.message || "Failed to list banks",
        data: [],
        meta: {
          next: null,
          previous: null,
          perPage: 0,
        },
      };
    }

    console.error("❌ Unexpected error listing banks:", error);
    throw error;
  }
};

/**
 * Resolve account number
 * Validates account number and returns account name
 */
export const resolveAccountNumber = async (
  account_number: string,
  bank_code: string,
): Promise<{
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}> => {
  try {
    console.log("🔄 Resolving account number:", {
      account_number,
      bank_code,
    });

    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank/resolve`, {
      params: {
        account_number,
        bank_code,
      },
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Account resolved:", response.data.data.account_name);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Account resolution error:", error.response?.data);
      return {
        status: false,
        message: error.response?.data?.message || "Failed to resolve account",
        data: {
          account_number: "",
          account_name: "",
          bank_id: 0,
        },
      };
    }

    console.error("❌ Unexpected error resolving account:", error);
    throw error;
  }
};
