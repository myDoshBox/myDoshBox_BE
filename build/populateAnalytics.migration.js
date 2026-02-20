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
// scripts/fixCommissionsDetailed.ts
const mongoose_1 = __importDefault(require("mongoose"));
const transactionAnalytics_model_1 = __importDefault(require("./modules/administrator/adminAnalytics/transactionAnalytics.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fixCommissionsDetailed = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        console.log("🔧 Connecting to database...");
        yield mongoose_1.default.connect(process.env.DATABASE_URI);
        console.log("✅ Connected!\n");
        // First, let's see what we're dealing with
        const totalCommissionBefore = yield transactionAnalytics_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$commission_amount" },
                    count: { $sum: 1 },
                },
            },
        ]);
        console.log("📊 BEFORE FIX:");
        console.log(`   Total records: ${((_a = totalCommissionBefore[0]) === null || _a === void 0 ? void 0 : _a.count) || 0}`);
        console.log(`   Total commission: ₦${((_b = totalCommissionBefore[0]) === null || _b === void 0 ? void 0 : _b.total) || 0}\n`);
        // Get all analytics records
        const analytics = yield transactionAnalytics_model_1.default.find({}).lean();
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
                console.log(`  Difference: ₦${(newCommission - oldCommission).toFixed(2)}\n`);
            }
            yield transactionAnalytics_model_1.default.updateOne({ _id: record._id }, {
                $set: {
                    commission_amount: newCommission,
                    commission_percentage: 1,
                },
            });
            updated++;
        }
        console.log(`\n✅ Updated ${updated} records`);
        console.log(`📊 Total Old Commission: ₦${totalOldCommission.toFixed(2)}`);
        console.log(`📊 Total New Commission: ₦${totalNewCommission.toFixed(2)}`);
        console.log(`💰 Difference: ₦${(totalNewCommission - totalOldCommission).toFixed(2)}\n`);
        // Verify the fix
        const totalCommissionAfter = yield transactionAnalytics_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$commission_amount" },
                },
            },
        ]);
        console.log("📊 AFTER FIX:");
        console.log(`   Total commission: ₦${((_c = totalCommissionAfter[0]) === null || _c === void 0 ? void 0 : _c.total) || 0}\n`);
        yield mongoose_1.default.disconnect();
        console.log("✅ Done! Database disconnected.");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
});
fixCommissionsDetailed();
