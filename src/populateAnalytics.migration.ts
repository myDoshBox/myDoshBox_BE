// scripts/fixCommissionsDetailed.ts
import mongoose from "mongoose";
import TransactionAnalytics from "./modules/administrator/Analytics/transactionAnalytics.model";
import dotenv from "dotenv";

dotenv.config();

const fixCommissionsDetailed = async () => {
  try {
    console.log("🔧 Connecting to database...");
    await mongoose.connect(process.env.DATABASE_URI as string);

    console.log("✅ Connected!\n");

    // First, let's see what we're dealing with
    const totalCommissionBefore = await TransactionAnalytics.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$commission_amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("📊 BEFORE FIX:");
    console.log(`   Total records: ${totalCommissionBefore[0]?.count || 0}`);
    console.log(
      `   Total commission: ₦${totalCommissionBefore[0]?.total || 0}\n`,
    );

    // Get all analytics records
    const analytics = await TransactionAnalytics.find({}).lean();
    console.log(`📋 Found ${analytics.length} analytics records to update\n`);

    let updated = 0;
    let totalOldCommission = 0;
    let totalNewCommission = 0;

    for (const record of analytics) {
      const oldCommission = record.commission_amount || 0;
      const newCommission = record.transaction_total * 0.01;

      totalOldCommission += oldCommission;
      totalNewCommission += newCommission;

      if (updated < 5) {
        // Show first 5 for debugging
        console.log(`Transaction: ${record.transaction_id}`);
        console.log(`  Transaction Total: ₦${record.transaction_total}`);
        console.log(`  Old Commission: ₦${oldCommission.toFixed(2)}`);
        console.log(`  New Commission: ₦${newCommission.toFixed(2)}`);
        console.log(
          `  Difference: ₦${(newCommission - oldCommission).toFixed(2)}\n`,
        );
      }

      await TransactionAnalytics.updateOne(
        { _id: record._id },
        {
          $set: {
            commission_amount: newCommission,
            commission_percentage: 1,
          },
        },
      );

      updated++;
    }

    console.log(`\n✅ Updated ${updated} records`);
    console.log(`📊 Total Old Commission: ₦${totalOldCommission.toFixed(2)}`);
    console.log(`📊 Total New Commission: ₦${totalNewCommission.toFixed(2)}`);
    console.log(
      `💰 Difference: ₦${(totalNewCommission - totalOldCommission).toFixed(2)}\n`,
    );

    // Verify the fix
    const totalCommissionAfter = await TransactionAnalytics.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$commission_amount" },
        },
      },
    ]);

    console.log("📊 AFTER FIX:");
    console.log(
      `   Total commission: ₦${totalCommissionAfter[0]?.total || 0}\n`,
    );

    await mongoose.disconnect();
    console.log("✅ Done! Database disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixCommissionsDetailed();
