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
exports.disputePostUpdateHook = exports.disputePostSaveHook = exports.payoutPostUpdateHook = exports.payoutPostSaveHook = exports.productTransactionPostUpdateHook = exports.productTransactionPostSaveHook = void 0;
const analyticsSync_utils_1 = require("./analyticsSync.utils");
//  Hook to create analytics when transaction is created
const productTransactionPostSaveHook = function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Only create analytics for new documents
            if (doc.isNew) {
                console.log(`📊 Creating analytics for new transaction: ${doc.transaction_id}`);
                yield (0, analyticsSync_utils_1.createAnalyticsFromTransaction)(doc.transaction_id);
            }
            next();
        }
        catch (error) {
            console.error("Error in transaction post-save hook:", error);
            // Don't block the main transaction if analytics fails
            next();
        }
    });
};
exports.productTransactionPostSaveHook = productTransactionPostSaveHook;
/**
 * Add to: productsTransaction.model.ts
 *
 * Hook to update analytics when transaction is updated
 */
const productTransactionPostUpdateHook = function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (doc && doc.transaction_id) {
                console.log(`📊 Updating analytics for transaction: ${doc.transaction_id}`);
                yield (0, analyticsSync_utils_1.updateAnalyticsFromTransaction)(doc.transaction_id);
            }
            next();
        }
        catch (error) {
            console.error("Error in transaction post-update hook:", error);
            next();
        }
    });
};
exports.productTransactionPostUpdateHook = productTransactionPostUpdateHook;
/**
 * USAGE IN productsTransaction.model.ts:
 *
 * import {
 *   productTransactionPostSaveHook,
 *   productTransactionPostUpdateHook
 * } from './hooks/analyticsHooks';
 *
 * productTransactionSchema.post('save', productTransactionPostSaveHook);
 * productTransactionSchema.post('findOneAndUpdate', productTransactionPostUpdateHook);
 */
// ============================================
// PAYOUT HOOKS
// ============================================
/**
 * Add to: payout.model.ts
 *
 * Hook to update analytics when payout is created or updated
 */
const payoutPostSaveHook = function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`💰 Updating analytics for payout: ${doc.transaction_id}`);
            yield (0, analyticsSync_utils_1.updateAnalyticsFromPayout)(doc._id.toString());
            next();
        }
        catch (error) {
            console.error("Error in payout post-save hook:", error);
            next();
        }
    });
};
exports.payoutPostSaveHook = payoutPostSaveHook;
/**
 * Hook for payout updates
 */
const payoutPostUpdateHook = function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (doc && doc._id) {
                console.log(`💰 Updating analytics for payout update: ${doc.transaction_id}`);
                yield (0, analyticsSync_utils_1.updateAnalyticsFromPayout)(doc._id.toString());
            }
            next();
        }
        catch (error) {
            console.error("Error in payout post-update hook:", error);
            next();
        }
    });
};
exports.payoutPostUpdateHook = payoutPostUpdateHook;
/**
 * USAGE IN payout.model.ts:
 *
 * import { payoutPostSaveHook, payoutPostUpdateHook } from './hooks/analyticsHooks';
 *
 * payoutSchema.post('save', payoutPostSaveHook);
 * payoutSchema.post('findOneAndUpdate', payoutPostUpdateHook);
 */
// ============================================
// DISPUTE HOOKS
// ============================================
/**
 * Add to: productDispute.model.ts
 *
 * Hook to update analytics when dispute is created or updated
 */
const disputePostSaveHook = function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`⚖️  Updating analytics for dispute: ${doc.transaction_id}`);
            yield (0, analyticsSync_utils_1.updateAnalyticsFromDispute)(doc._id.toString());
            next();
        }
        catch (error) {
            console.error("Error in dispute post-save hook:", error);
            next();
        }
    });
};
exports.disputePostSaveHook = disputePostSaveHook;
/**
 * Hook for dispute updates
 */
const disputePostUpdateHook = function (doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (doc && doc._id) {
                console.log(`⚖️  Updating analytics for dispute update: ${doc.transaction_id}`);
                yield (0, analyticsSync_utils_1.updateAnalyticsFromDispute)(doc._id.toString());
            }
            next();
        }
        catch (error) {
            console.error("Error in dispute post-update hook:", error);
            next();
        }
    });
};
exports.disputePostUpdateHook = disputePostUpdateHook;
/**
 * USAGE IN productDispute.model.ts:
 *
 * import { disputePostSaveHook, disputePostUpdateHook } from './hooks/analyticsHooks';
 *
 * disputeSchema.post('save', disputePostSaveHook);
 * disputeSchema.post('findOneAndUpdate', disputePostUpdateHook);
 */
// ============================================
// EXAMPLE: HOW TO ADD TO YOUR MODELS
// ============================================
/**
 * Example for ProductTransaction model:
 *
 * // At the bottom of productsTransaction.model.ts, before export:
 *
 * import {
 *   productTransactionPostSaveHook,
 *   productTransactionPostUpdateHook
 * } from '../analytics/hooks/analyticsHooks';
 *
 * productTransactionSchema.post('save', productTransactionPostSaveHook);
 * productTransactionSchema.post('findOneAndUpdate', productTransactionPostUpdateHook);
 *
 * const ProductTransaction = mongoose.model<IProductTransaction>(
 *   "ProductTransaction",
 *   productTransactionSchema
 * );
 *
 * export default ProductTransaction;
 */
/**
 * Example for Payout model:
 *
 * // At the bottom of payout.model.ts, before export:
 *
 * import { payoutPostSaveHook, payoutPostUpdateHook } from '../analyticsHooks';
 *
 * payoutSchema.post('save', payoutPostSaveHook);
 * payoutSchema.post('findOneAndUpdate', payoutPostUpdateHook);
 *
 * const Payout = mongoose.model<IPayout>("Payout", payoutSchema);
 *
 * export default Payout;
 */
/**
 * Example for ProductDispute model:
 *
 * // At the bottom of productDispute.model.ts, before export:
 *
 * import { disputePostSaveHook, disputePostUpdateHook } from '../analyticsHooks';
 *
 * disputeSchema.post('save', disputePostSaveHook);
 * disputeSchema.post('findOneAndUpdate', disputePostUpdateHook);
 *
 * const ProductDispute = mongoose.model<IProductDispute>(
 *   "ProductDispute",
 *   disputeSchema
 * );
 *
 * export default ProductDispute;
 */
