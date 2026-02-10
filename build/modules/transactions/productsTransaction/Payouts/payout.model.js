"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importStar(require("mongoose"));
const payoutSchema = new mongoose_1.default.Schema({
    transaction: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductTransaction",
        required: true,
        index: true,
    },
    transaction_id: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    vendor_email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    vendor_name: {
        type: String,
        required: true,
        trim: true,
    },
    // Amounts
    payout_amount: {
        type: Number,
        required: true,
        min: 0,
    },
    original_sum_total: {
        type: Number,
        required: true,
        min: 0,
    },
    // Bank details snapshot
    vendor_bank_details: {
        account_name: {
            type: String,
            required: true,
            trim: true,
        },
        account_number: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^\d{10}$/.test(v);
                },
                message: "Account number must be 10 digits",
            },
        },
        bank_code: {
            type: String,
            required: true,
            trim: true,
        },
        bank_name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    // Status
    payout_status: {
        type: String,
        required: true,
        enum: [
            "pending_initiation",
            "transfer_initiated",
            "transfer_pending",
            "transfer_success",
            "transfer_failed",
            "manual_payout_processing",
            "manual_payout_completed",
            "manual_payout_required",
            "reversed",
            "cancelled",
        ],
        default: "pending_initiation",
        index: true,
    },
    payout_method: {
        type: String,
        required: true,
        enum: ["automatic", "manual"],
        index: true,
    },
    // Transfer tracking
    vendor_recipient_code: {
        type: String,
        trim: true,
        sparse: true,
        index: true,
    },
    transfer_reference: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        index: true,
    },
    transfer_initiated_at: {
        type: Date,
    },
    transfer_completed_at: {
        type: Date,
    },
    transfer_failure_reason: {
        type: String,
        trim: true,
    },
    transfer_reversal_reason: {
        type: String,
        trim: true,
    },
    transfer_webhook_data: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    // Manual payout
    manual_payout_reason: {
        type: String,
        trim: true,
    },
    manual_payout_requested_at: {
        type: Date,
    },
    manual_payout_processed_by: {
        type: String,
        trim: true,
    },
    manual_payout_processed_at: {
        type: Date,
    },
    manual_payout_notes: {
        type: String,
        trim: true,
    },
    manual_payout_proof: {
        type: String,
        trim: true,
    },
    // Retry tracking
    retry_count: {
        type: Number,
        default: 0,
        min: 0,
    },
    last_retry_at: {
        type: Date,
    },
    max_retries: {
        type: Number,
        default: 3,
        min: 1,
    },
    // Notifications
    vendor_notified: {
        type: Boolean,
        default: false,
    },
    vendor_notified_at: {
        type: Date,
    },
    buyer_notified: {
        type: Boolean,
        default: false,
    },
    buyer_notified_at: {
        type: Date,
    },
    admin_notified: {
        type: Boolean,
        default: false,
    },
    admin_notified_at: {
        type: Date,
    },
    // Metadata
    initiated_by_buyer_confirmation: {
        type: Boolean,
        required: true,
    },
    buyer_confirmation_date: {
        type: Date,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes for efficient queries
payoutSchema.index({ payout_status: 1, createdAt: -1 });
payoutSchema.index({ vendor_email: 1, payout_status: 1 });
payoutSchema.index({ payout_method: 1, payout_status: 1 });
payoutSchema.index({ transfer_reference: 1 });
payoutSchema.index({ createdAt: -1 });
// Middleware
payoutSchema.pre("save", function (next) {
    const payout = this;
    // Auto-set timestamps for status changes
    if (this.isModified("payout_status")) {
        switch (payout.payout_status) {
            case "transfer_initiated":
            case "transfer_pending":
                if (!payout.transfer_initiated_at) {
                    payout.transfer_initiated_at = new Date();
                }
                break;
            case "transfer_success":
            case "manual_payout_completed":
                if (!payout.transfer_completed_at) {
                    payout.transfer_completed_at = new Date();
                }
                break;
            case "manual_payout_required":
                if (!payout.manual_payout_requested_at) {
                    payout.manual_payout_requested_at = new Date();
                }
                break;
        }
    }
    next();
});
// Virtual fields
payoutSchema.virtual("is_completed").get(function () {
    const payout = this;
    return (payout.payout_status === "transfer_success" ||
        payout.payout_status === "manual_payout_completed");
});
payoutSchema.virtual("is_pending").get(function () {
    const payout = this;
    return (payout.payout_status === "pending_initiation" ||
        payout.payout_status === "transfer_initiated" ||
        payout.payout_status === "transfer_pending" ||
        payout.payout_status === "manual_payout_processing");
});
payoutSchema.virtual("is_failed").get(function () {
    const payout = this;
    return payout.payout_status === "transfer_failed";
});
payoutSchema.virtual("requires_manual_intervention").get(function () {
    const payout = this;
    return (payout.payout_status === "manual_payout_required" ||
        payout.payout_status === "transfer_failed");
});
payoutSchema.virtual("can_retry").get(function () {
    const payout = this;
    return (payout.payout_status === "transfer_failed" &&
        payout.retry_count < payout.max_retries);
});
// Instance methods
payoutSchema.methods.markAsTransferInitiated = function (transferRef, recipientCode) {
    this.payout_status = "transfer_initiated";
    this.transfer_reference = transferRef;
    this.transfer_initiated_at = new Date();
    if (recipientCode) {
        this.vendor_recipient_code = recipientCode;
    }
    return this.save();
};
payoutSchema.methods.markAsTransferSuccess = function (webhookData) {
    this.payout_status = "transfer_success";
    this.transfer_completed_at = new Date();
    if (webhookData) {
        this.transfer_webhook_data = webhookData;
    }
    return this.save();
};
payoutSchema.methods.markAsTransferFailed = function (reason) {
    this.payout_status = "transfer_failed";
    this.transfer_failure_reason = reason;
    this.retry_count += 1;
    this.last_retry_at = new Date();
    // If max retries exceeded, require manual intervention
    if (this.retry_count >= this.max_retries) {
        this.payout_status = "manual_payout_required";
        this.manual_payout_reason = `Transfer failed after ${this.retry_count} attempts: ${reason}`;
        this.manual_payout_requested_at = new Date();
    }
    return this.save();
};
payoutSchema.methods.markAsManualPayoutRequired = function (reason) {
    this.payout_status = "manual_payout_required";
    this.payout_method = "manual";
    this.manual_payout_reason = reason;
    this.manual_payout_requested_at = new Date();
    return this.save();
};
payoutSchema.methods.markAsManualPayoutCompleted = function (processedBy, proof, notes) {
    this.payout_status = "manual_payout_completed";
    this.manual_payout_processed_by = processedBy;
    this.manual_payout_processed_at = new Date();
    if (proof)
        this.manual_payout_proof = proof;
    if (notes)
        this.manual_payout_notes = notes;
    return this.save();
};
// Static methods
payoutSchema.statics.findPendingPayouts = function () {
    return this.find({
        payout_status: {
            $in: [
                "pending_initiation",
                "transfer_initiated",
                "transfer_pending",
                "manual_payout_processing",
            ],
        },
    }).sort({ createdAt: 1 });
};
payoutSchema.statics.findFailedPayouts = function () {
    return this.find({
        payout_status: "transfer_failed",
    }).sort({ createdAt: -1 });
};
payoutSchema.statics.findManualPayoutsRequired = function () {
    return this.find({
        payout_status: "manual_payout_required",
    }).sort({ manual_payout_requested_at: 1 });
};
payoutSchema.statics.getPayoutStats = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield this.aggregate([
            {
                $group: {
                    _id: "$payout_status",
                    count: { $sum: 1 },
                    total_amount: { $sum: "$payout_amount" },
                },
            },
        ]);
        return stats;
    });
};
const Payout = mongoose_1.default.model("Payout", payoutSchema);
exports.default = Payout;
