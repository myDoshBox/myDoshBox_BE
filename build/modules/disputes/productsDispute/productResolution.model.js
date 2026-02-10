"use strict";
// import mongoose, { Schema, Document } from "mongoose";
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
Object.defineProperty(exports, "__esModule", { value: true });
// interface IProductResolution extends Document {
//   dispute: mongoose.Schema.Types.ObjectId; // Reference to the Transaction model
//   dispute_id: string;
//   resolution_description: string;
//   resolution_status: string;
// }
// const productResolutionSchema = new mongoose.Schema(
//   {
//     dispute: {
//       type: Schema.Types.ObjectId,
//       ref: "ProductDispute", // Reference to User model
//       // required: true,
//     },
//     dispute_id: {
//       type: String,
//       required: true,
//     },
//     resolution_description: {
//       type: String,
//       required: true,
//     },
//     // resolution_status: {
//     //   type: String,
//     //   default: "processing", // this is supposed to default to #processing, #resolving when both parties choose the resolve button #resolved when done, and then #cancelled if the user cancels the escrow transaction
//     // },
//     resolution_status: {
//       type: String,
//       default: "processing",
//       enum: ["processing", "resolving", "resolved", "cancelled"],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// const ProductResolution = mongoose.model<IProductResolution>(
//   "ProductResolution",
//   productResolutionSchema
// );
// export default ProductResolution;
const mongoose_1 = __importStar(require("mongoose"));
const productDisputeSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: "userModel",
        required: true,
    },
    transaction: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductTransaction",
        required: true,
    },
    mediator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Mediator",
    },
    transaction_id: {
        type: String,
        required: true,
        index: true,
    },
    // Parties
    buyer_email: { type: String, required: true },
    vendor_name: { type: String, required: true },
    vendor_email: { type: String, required: true },
    vendor_phone_number: { type: String, required: true },
    // Products
    product_name: { type: String, required: true },
    product_image: { type: String, required: true },
    products: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            image: { type: String, required: true },
            description: String,
        },
    ],
    // Initial dispute
    reason_for_dispute: { type: String, required: true },
    dispute_description: { type: String, required: true },
    dispute_raised_by: {
        type: String,
        enum: ["buyer", "seller"],
        required: true,
    },
    dispute_raised_by_email: { type: String, required: true },
    // Resolution tracking
    resolution_proposals: [
        {
            proposed_by: {
                type: String,
                enum: ["buyer", "seller"],
                required: true,
            },
            proposed_by_email: { type: String, required: true },
            proposal_date: { type: Date, default: Date.now },
            proposal_type: {
                type: String,
                enum: ["transaction_update", "description_only"],
                required: true,
            },
            resolution_description: String,
            proposed_changes: {
                vendor_name: String,
                vendor_phone_number: String,
                vendor_email: String,
                transaction_type: String,
                updated_products: [
                    {
                        name: String,
                        quantity: Number,
                        price: Number,
                        image: String,
                        description: String,
                    },
                ],
                transaction_total: Number,
                signed_escrow_doc: String,
                delivery_address: String,
            },
            status: {
                type: String,
                enum: ["pending", "accepted", "rejected"],
                default: "pending",
            },
            responded_by: String,
            response_date: Date,
            rejection_reason: String,
        },
    ],
    rejection_count: { type: Number, default: 0 },
    max_rejections: { type: Number, default: 3 },
    // Status
    dispute_status: {
        type: String,
        enum: [
            "processing",
            "resolving",
            "resolved",
            "cancelled",
            "escalated_to_mediator",
        ],
        default: "processing",
    },
    dispute_resolution_method: {
        type: String,
        enum: ["unresolved", "dispute_parties", "mediator"],
        default: "unresolved",
    },
    // Mediator
    mediator_requested_by: {
        type: String,
        enum: ["buyer", "seller"],
    },
    mediator_requested_at: Date,
    mediator_assigned_at: Date,
    // Final resolution
    resolved_at: Date,
    resolution_summary: String,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes for efficient queries
productDisputeSchema.index({ transaction_id: 1, dispute_status: 1 });
productDisputeSchema.index({ buyer_email: 1, createdAt: -1 });
productDisputeSchema.index({ vendor_email: 1, createdAt: -1 });
// Virtual for current pending proposal
productDisputeSchema.virtual("pending_proposal").get(function () {
    return this.resolution_proposals.find((p) => p.status === "pending");
});
// Virtual for auto-escalation check
productDisputeSchema.virtual("should_auto_escalate").get(function () {
    return (this.rejection_count >= this.max_rejections &&
        this.dispute_status !== "escalated_to_mediator" &&
        this.dispute_resolution_method !== "mediator");
});
const ProductDispute = mongoose_1.default.model("ProductDispute", productDisputeSchema);
exports.default = ProductDispute;
