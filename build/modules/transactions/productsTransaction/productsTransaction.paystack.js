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
exports.verifyPaymentForEscrowProductTransaction = exports.paymentForEscrowProductTransaction = void 0;
const axios_1 = __importDefault(require("axios"));
const paymentForEscrowProductTransaction = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const API_URL = process.env.PAYSTACK_BASE_URL;
    const API_KEY = process.env.PAYSTACK_PAYMENT_KEY;
    const response = yield axios_1.default.post(`${API_URL}/transaction/initialize`, {
        reference: data.reference,
        amount: data.amount * 100,
        email: data.email,
        currency: "NGN",
        // channels: ["bank_transfer", "ussd", "card"],
        channels: ["card"],
        // callback_url: `https://mydoshbox.vercel.app/userdashboard/agreement?reference=${data.reference}`,
        callback_url: `http://localhost:3000/userdashboard/agreement?reference=${data.reference}`,
        // callback_url: `http://localhost:3000?reference=${data.reference}`,
    }, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "cache-control": "no-cache",
        },
    });
    return response.data;
});
exports.paymentForEscrowProductTransaction = paymentForEscrowProductTransaction;
const verifyPaymentForEscrowProductTransaction = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    const API_URL = process.env.PAYSTACK_BASE_URL;
    const API_KEY = process.env.PAYSTACK_PAYMENT_KEY;
    const response = yield axios_1.default.get(`${API_URL}/transaction/verify/${reference}`, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "cache-control": "no-cache",
        },
    });
    return response.data;
});
exports.verifyPaymentForEscrowProductTransaction = verifyPaymentForEscrowProductTransaction;
