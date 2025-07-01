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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDispute = exports.getAllDisputeForAMediator = exports.involveAMediator = void 0;
const involveAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { });
exports.involveAMediator = involveAMediator;
const getAllDisputeForAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { });
exports.getAllDisputeForAMediator = getAllDisputeForAMediator;
// to resolve a dispute, you have to fetch all the details of the transaction in dispute such as the transaction_id, buyer_email, vendor_email, product_name, product_image, reason_for_dispute, dispute_description, and dispute_status
// trigger mails for both buyers and sellers after the dispute is resolved
// and then update the dispute status to resolved
// and then update the transaction status to completed
const resolveDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { });
exports.resolveDispute = resolveDispute;
