import axios, { AxiosError } from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PAYMENT_KEY = process.env.PAYSTACK_PAYMENT_KEY;
const PAYSTACK_BASE_URL =
  process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";

interface IPayment {
  reference: string;
  amount: number;
  email: string;
  currency?: string;
  channels?: string[];
  callback_url?: string;
}

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
  amount: number;
  recipient: string;
  reason?: string;
  reference?: string;
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

interface BalanceResponse {
  status: boolean;
  message: string;
  data: Array<{
    currency: string;
    balance: number; // Amount in kobo
  }>;
}

// PAYMENT FUNCTIONS
export const paymentForEscrowProductTransaction = async (data: IPayment) => {
  const DEPLOYED_FRONTEND_BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://mydoshbox.vercel.app";

  const callbackURL = `${DEPLOYED_FRONTEND_BASE_URL}/userdashboard/verifyPayment?reference=${data.reference}`;

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        reference: data?.reference,
        amount: data?.amount * 100, // Convert to kobo
        email: data?.email,
        currency: "NGN",
        channels: ["card"],
        callback_url: callbackURL,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_PAYMENT_KEY}`,
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Paystack payment initialization error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });

      return {
        status: false,
        message:
          error.response?.data?.message || "Failed to initialize payment",
        data: {},
      };
    }

    console.error("❌ Unexpected error initializing payment:", error);
    throw error;
  }
};

export const verifyPaymentForEscrowProductTransaction = async (
  reference: string,
) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_PAYMENT_KEY}`,
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
      },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Paystack payment verification error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
      });

      return {
        status: false,
        message: error.response?.data?.message || "Failed to verify payment",
        data: {},
      };
    }

    console.error("❌ Unexpected error verifying payment:", error);
    throw error;
  }
};

// BALANCE CHECKING
//  Check available Paystack balance
// CRITICAL: Always check balance before initiating transfers
//  Returns balance in kobo - divide by 100 for naira

export const checkPaystackBalance = async (): Promise<BalanceResponse> => {
  try {
    console.log("🔄 Checking Paystack balance...");

    const response = await axios.get<BalanceResponse>(
      `${PAYSTACK_BASE_URL}/balance`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const ngnBalance = response.data.data.find(
      (bal: { currency: string; balance: number }) => bal.currency === "NGN",
    );

    console.log("✅ Balance check successful:", {
      balance_kobo: ngnBalance?.balance || 0,
      balance_naira: ((ngnBalance?.balance || 0) / 100).toFixed(2),
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Paystack balance check error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });

      return {
        status: false,
        message: error.response?.data?.message || "Failed to check balance",
        data: [{ currency: "NGN", balance: 0 }],
      };
    }

    console.error("❌ Unexpected error checking balance:", error);
    throw error;
  }
};

//  Helper function to get NGN balance in naira (not kobo)

export const getAvailableBalanceInNaira = async (): Promise<number> => {
  const balanceResponse = await checkPaystackBalance();

  if (!balanceResponse.status) {
    return 0;
  }

  const ngnBalance = balanceResponse.data.find((bal) => bal.currency === "NGN");

  return (ngnBalance?.balance || 0) / 100; // Convert kobo to naira
};

//  TRANSFER RECIPIENT MANAGEMENT//
//  Create a transfer recipient
// This must be done before initiating a transfer
// Store the recipient_code for future transfers to the same account

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
        type: "nuban",
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
  } catch (error: unknown) {
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

//  NOW TRANSFER INITIATION
// Initiate a transfer to a recipient
// Amount should be in kobo (multiply naira by 100)
//  NOTE:Check balance first using checkPaystackBalance()

export const initiateTransfer = async (
  params: InitiateTransferParams,
): Promise<InitiateTransferResponse> => {
  try {
    console.log("🔄 Initiating transfer:", {
      amount_kobo: params.amount,
      amount_naira: (params.amount / 100).toFixed(2),
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
  } catch (error: unknown) {
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

//  TRANSFER VERIFICATION
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
  } catch (error: unknown) {
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

//  BANK UTILITIES
//  * List all Nigerian banks
//  * Use this to get bank codes for recipient creation
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
  } catch (error: unknown) {
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

//  RESOLVE ACCONNT NUMBER
//  * Validates account number and returns account name
// Use this to verify vendor bank details before creating recipient

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
  } catch (error: unknown) {
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

//  Convert naira to kobo, Helper function
export const nairaToKobo = (naira: number): number => {
  return Math.round(naira * 100);
};

/**
 * Convert kobo to naira
 */
export const koboToNaira = (kobo: number): number => {
  return kobo / 100;
};

/**
 * Format amount for display
 */
export const formatAmount = (
  amount: number,
  currency: string = "NGN",
): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Validate transfer before initiation
 * Comprehensive pre-flight checks
 */
export const validateTransferRequest = async (
  amount: number,
  recipientCode: string,
): Promise<{
  valid: boolean;
  error?: string;
  availableBalance?: number;
}> => {
  try {
    // Check 1: Validate amount
    if (amount <= 0) {
      return {
        valid: false,
        error: "Transfer amount must be greater than zero",
      };
    }

    // Check 2: Validate recipient code
    if (!recipientCode || recipientCode.length === 0) {
      return { valid: false, error: "Recipient code is required" };
    }

    // Check 3: Check available balance
    const availableBalance = await getAvailableBalanceInNaira();
    const amountInNaira = amount / 100; // Convert kobo to naira

    if (availableBalance < amountInNaira) {
      return {
        valid: false,
        error: `Insufficient balance. Required: ₦${amountInNaira.toFixed(2)}, Available: ₦${availableBalance.toFixed(2)}`,
        availableBalance,
      };
    }

    // Check 4: Minimum transfer amount (Paystack minimum is ₦100)
    if (amountInNaira < 100) {
      return {
        valid: false,
        error: "Minimum transfer amount is ₦100",
        availableBalance,
      };
    }

    return { valid: true, availableBalance };
  } catch (error: unknown) {
    console.error("❌ Error validating transfer request:", error);
    return {
      valid: false,
      error: "Failed to validate transfer request. Please try again.",
    };
  }
};
