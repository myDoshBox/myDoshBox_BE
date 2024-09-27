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
exports.Paystack = void 0;
const axios_1 = __importDefault(require("axios"));
class Paystack {
    constructor() {
        this.API_URL = process.env.PAYSTACK_BASE_URL;
        this.API_KEY = process.env.PAYSTACK_PAYMENT_KEY;
    }
    initializeTransaction(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(`${this.API_URL}/transaction/initialize`, data, {
                headers: {
                    Authorization: `Bearer ${this.API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            response.data;
        });
    }
    verifyTransaction(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(`${this.API_URL}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${this.API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            response.data;
        });
    }
}
exports.Paystack = Paystack;
