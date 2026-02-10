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
exports.validateTransferRequest = exports.formatAmount = exports.koboToNaira = exports.nairaToKobo = exports.resolveAccountNumber = exports.listBanks = exports.verifyTransfer = exports.initiateTransfer = exports.createTransferRecipient = exports.getAvailableBalanceInNaira = exports.checkPaystackBalance = exports.verifyPaymentForEscrowProductTransaction = exports.paymentForEscrowProductTransaction = void 0;
const axios_1 = __importDefault(require("axios"));
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PAYMENT_KEY = process.env.PAYSTACK_PAYMENT_KEY;
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
// PAYMENT FUNCTIONS
const paymentForEscrowProductTransaction = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const DEPLOYED_FRONTEND_BASE_URL = process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://mydoshbox.vercel.app";
    const callbackURL = `${DEPLOYED_FRONTEND_BASE_URL}/userdashboard/verifyPayment?reference=${data.reference}`;
    try {
        const response = yield axios_1.default.post(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
            reference: data === null || data === void 0 ? void 0 : data.reference,
            amount: (data === null || data === void 0 ? void 0 : data.amount) * 100, // Convert to kobo
            email: data === null || data === void 0 ? void 0 : data.email,
            currency: "NGN",
            channels: ["card"],
            callback_url: callbackURL,
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_PAYMENT_KEY}`,
                "Content-Type": "application/json",
                "cache-control": "no-cache",
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("❌ Paystack payment initialization error:", {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                message: (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message,
                data: (_d = error.response) === null || _d === void 0 ? void 0 : _d.data,
            });
            return {
                status: false,
                message: ((_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.message) || "Failed to initialize payment",
                data: {},
            };
        }
        console.error("❌ Unexpected error initializing payment:", error);
        throw error;
    }
});
exports.paymentForEscrowProductTransaction = paymentForEscrowProductTransaction;
const verifyPaymentForEscrowProductTransaction = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const response = yield axios_1.default.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_PAYMENT_KEY}`,
                "Content-Type": "application/json",
                "cache-control": "no-cache",
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("❌ Paystack payment verification error:", {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                message: (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message,
            });
            return {
                status: false,
                message: ((_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.message) || "Failed to verify payment",
                data: {},
            };
        }
        console.error("❌ Unexpected error verifying payment:", error);
        throw error;
    }
});
exports.verifyPaymentForEscrowProductTransaction = verifyPaymentForEscrowProductTransaction;
// BALANCE CHECKING
//  Check available Paystack balance
// CRITICAL: Always check balance before initiating transfers
//  Returns balance in kobo - divide by 100 for naira
const checkPaystackBalance = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        console.log("🔄 Checking Paystack balance...");
        const response = yield axios_1.default.get(`${PAYSTACK_BASE_URL}/balance`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        const ngnBalance = response.data.data.find((bal) => bal.currency === "NGN");
        console.log("✅ Balance check successful:", {
            balance_kobo: (ngnBalance === null || ngnBalance === void 0 ? void 0 : ngnBalance.balance) || 0,
            balance_naira: (((ngnBalance === null || ngnBalance === void 0 ? void 0 : ngnBalance.balance) || 0) / 100).toFixed(2),
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("❌ Paystack balance check error:", {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                message: (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message,
                data: (_d = error.response) === null || _d === void 0 ? void 0 : _d.data,
            });
            return {
                status: false,
                message: ((_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.message) || "Failed to check balance",
                data: [{ currency: "NGN", balance: 0 }],
            };
        }
        console.error("❌ Unexpected error checking balance:", error);
        throw error;
    }
});
exports.checkPaystackBalance = checkPaystackBalance;
//  Helper function to get NGN balance in naira (not kobo)
const getAvailableBalanceInNaira = () => __awaiter(void 0, void 0, void 0, function* () {
    const balanceResponse = yield (0, exports.checkPaystackBalance)();
    if (!balanceResponse.status) {
        return 0;
    }
    const ngnBalance = balanceResponse.data.find((bal) => bal.currency === "NGN");
    return ((ngnBalance === null || ngnBalance === void 0 ? void 0 : ngnBalance.balance) || 0) / 100; // Convert kobo to naira
});
exports.getAvailableBalanceInNaira = getAvailableBalanceInNaira;
//  TRANSFER RECIPIENT MANAGEMENT//
//  Create a transfer recipient
// This must be done before initiating a transfer
// Store the recipient_code for future transfers to the same account
const createTransferRecipient = (params) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        console.log("🔄 Creating transfer recipient:", {
            account_name: params.account_name,
            account_number: params.account_number,
            bank_code: params.bank_code,
        });
        const response = yield axios_1.default.post(`${PAYSTACK_BASE_URL}/transferrecipient`, {
            type: "nuban",
            name: params.account_name,
            account_number: params.account_number,
            bank_code: params.bank_code,
            currency: params.currency || "NGN",
            email: params.email,
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Recipient created:", response.data.data.recipient_code);
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("❌ Paystack recipient creation error:", {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                message: (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message,
                data: (_d = error.response) === null || _d === void 0 ? void 0 : _d.data,
            });
            // Return Paystack error response
            return {
                status: false,
                message: ((_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.message) ||
                    "Failed to create transfer recipient",
                data: ((_h = (_g = error.response) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.data) || {},
            };
        }
        console.error("❌ Unexpected error creating recipient:", error);
        throw error;
    }
});
exports.createTransferRecipient = createTransferRecipient;
//  NOW TRANSFER INITIATION
// Initiate a transfer to a recipient
// Amount should be in kobo (multiply naira by 100)
//  NOTE:Check balance first using checkPaystackBalance()
const initiateTransfer = (params) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        console.log("🔄 Initiating transfer:", {
            amount_kobo: params.amount,
            amount_naira: (params.amount / 100).toFixed(2),
            recipient: params.recipient,
            reference: params.reference,
        });
        const response = yield axios_1.default.post(`${PAYSTACK_BASE_URL}/transfer`, {
            source: params.source || "balance",
            amount: params.amount,
            recipient: params.recipient,
            reason: params.reason || "Escrow payment release",
            reference: params.reference,
            currency: params.currency || "NGN",
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Transfer initiated:", {
            reference: response.data.data.reference,
            status: response.data.data.status,
            transfer_code: response.data.data.transfer_code,
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("❌ Paystack transfer initiation error:", {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                message: (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message,
                data: (_d = error.response) === null || _d === void 0 ? void 0 : _d.data,
            });
            // Return Paystack error response
            return {
                status: false,
                message: ((_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.message) || "Failed to initiate transfer",
                data: ((_h = (_g = error.response) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.data) || {},
            };
        }
        console.error("❌ Unexpected error initiating transfer:", error);
        throw error;
    }
});
exports.initiateTransfer = initiateTransfer;
//  TRANSFER VERIFICATION
const verifyTransfer = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        console.log("🔄 Verifying transfer:", reference);
        const response = yield axios_1.default.get(`${PAYSTACK_BASE_URL}/transfer/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Transfer verified:", {
            reference: response.data.data.reference,
            status: response.data.data.status,
            amount: response.data.data.amount,
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("❌ Paystack transfer verification error:", {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                message: (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message,
                data: (_d = error.response) === null || _d === void 0 ? void 0 : _d.data,
            });
            return {
                status: false,
                message: ((_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.message) || "Failed to verify transfer",
                data: ((_h = (_g = error.response) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.data) || {},
            };
        }
        console.error("❌ Unexpected error verifying transfer:", error);
        throw error;
    }
});
exports.verifyTransfer = verifyTransfer;
//  BANK UTILITIES
//  * List all Nigerian banks
//  * Use this to get bank codes for recipient creation
const listBanks = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (country = "nigeria", currency = "NGN") {
    var _a, _b, _c;
    try {
        const response = yield axios_1.default.get(`${PAYSTACK_BASE_URL}/bank`, {
            params: {
                country,
                currency,
                perPage: 100,
            },
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("❌ Paystack list banks error:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            return {
                status: false,
                message: ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || "Failed to list banks",
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
});
exports.listBanks = listBanks;
//  RESOLVE ACCONNT NUMBER
//  * Validates account number and returns account name
// Use this to verify vendor bank details before creating recipient
const resolveAccountNumber = (account_number, bank_code) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        console.log("🔄 Resolving account number:", {
            account_number,
            bank_code,
        });
        const response = yield axios_1.default.get(`${PAYSTACK_BASE_URL}/bank/resolve`, {
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
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("❌ Account resolution error:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            return {
                status: false,
                message: ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || "Failed to resolve account",
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
});
exports.resolveAccountNumber = resolveAccountNumber;
//  Convert naira to kobo, Helper function
const nairaToKobo = (naira) => {
    return Math.round(naira * 100);
};
exports.nairaToKobo = nairaToKobo;
/**
 * Convert kobo to naira
 */
const koboToNaira = (kobo) => {
    return kobo / 100;
};
exports.koboToNaira = koboToNaira;
/**
 * Format amount for display
 */
const formatAmount = (amount, currency = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
    }).format(amount);
};
exports.formatAmount = formatAmount;
/**
 * Validate transfer before initiation
 * Comprehensive pre-flight checks
 */
const validateTransferRequest = (amount, recipientCode) => __awaiter(void 0, void 0, void 0, function* () {
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
        const availableBalance = yield (0, exports.getAvailableBalanceInNaira)();
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
    }
    catch (error) {
        console.error("❌ Error validating transfer request:", error);
        return {
            valid: false,
            error: "Failed to validate transfer request. Please try again.",
        };
    }
});
exports.validateTransferRequest = validateTransferRequest;
