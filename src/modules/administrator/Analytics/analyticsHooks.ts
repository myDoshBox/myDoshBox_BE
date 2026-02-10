import {
  createAnalyticsFromTransaction,
  updateAnalyticsFromTransaction,
  updateAnalyticsFromPayout,
  updateAnalyticsFromDispute,
} from "./analyticsSync.utils";

//  Hook to create analytics when transaction is created

export const productTransactionPostSaveHook = async function (
  doc: any,
  next: any,
) {
  try {
    // Only create analytics for new documents
    if (doc.isNew) {
      console.log(
        `📊 Creating analytics for new transaction: ${doc.transaction_id}`,
      );
      await createAnalyticsFromTransaction(doc.transaction_id);
    }
    next();
  } catch (error) {
    console.error("Error in transaction post-save hook:", error);
    // Don't block the main transaction if analytics fails
    next();
  }
};

/**
 * Add to: productsTransaction.model.ts
 *
 * Hook to update analytics when transaction is updated
 */
export const productTransactionPostUpdateHook = async function (
  doc: any,
  next: any,
) {
  try {
    if (doc && doc.transaction_id) {
      console.log(
        `📊 Updating analytics for transaction: ${doc.transaction_id}`,
      );
      await updateAnalyticsFromTransaction(doc.transaction_id);
    }
    next();
  } catch (error) {
    console.error("Error in transaction post-update hook:", error);
    next();
  }
};

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
export const payoutPostSaveHook = async function (doc: any, next: any) {
  try {
    console.log(`💰 Updating analytics for payout: ${doc.transaction_id}`);
    await updateAnalyticsFromPayout(doc._id.toString());
    next();
  } catch (error) {
    console.error("Error in payout post-save hook:", error);
    next();
  }
};

/**
 * Hook for payout updates
 */
export const payoutPostUpdateHook = async function (doc: any, next: any) {
  try {
    if (doc && doc._id) {
      console.log(
        `💰 Updating analytics for payout update: ${doc.transaction_id}`,
      );
      await updateAnalyticsFromPayout(doc._id.toString());
    }
    next();
  } catch (error) {
    console.error("Error in payout post-update hook:", error);
    next();
  }
};

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
export const disputePostSaveHook = async function (doc: any, next: any) {
  try {
    console.log(`⚖️  Updating analytics for dispute: ${doc.transaction_id}`);
    await updateAnalyticsFromDispute(doc._id.toString());
    next();
  } catch (error) {
    console.error("Error in dispute post-save hook:", error);
    next();
  }
};

/**
 * Hook for dispute updates
 */
export const disputePostUpdateHook = async function (doc: any, next: any) {
  try {
    if (doc && doc._id) {
      console.log(
        `⚖️  Updating analytics for dispute update: ${doc.transaction_id}`,
      );
      await updateAnalyticsFromDispute(doc._id.toString());
    }
    next();
  } catch (error) {
    console.error("Error in dispute post-update hook:", error);
    next();
  }
};

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
