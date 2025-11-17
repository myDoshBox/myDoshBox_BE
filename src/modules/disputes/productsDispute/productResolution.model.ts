// import mongoose, { Schema, Document } from "mongoose";

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
import mongoose, { Schema, Document } from "mongoose";

interface IProductItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
  description?: string;
}

interface IResolutionProposal {
  proposed_by: "buyer" | "seller";
  proposed_by_email: string;
  proposal_date: Date;
  proposal_type: "transaction_update" | "description_only";
  resolution_description?: string;

  // Transaction changes (if applicable)
  proposed_changes?: {
    vendor_name?: string;
    vendor_phone_number?: string;
    vendor_email?: string;
    transaction_type?: string;
    updated_products?: IProductItem[];
    transaction_total?: number;
    signed_escrow_doc?: string;
    delivery_address?: string;
  };

  status: "pending" | "accepted" | "rejected";
  responded_by?: string;
  response_date?: Date;
  rejection_reason?: string;
}

interface IProductDispute extends Document {
  user: mongoose.Schema.Types.ObjectId;
  transaction: mongoose.Schema.Types.ObjectId;
  mediator?: mongoose.Schema.Types.ObjectId;
  transaction_id: string;

  // Parties involved
  buyer_email: string;
  vendor_name: string;
  vendor_email: string;
  vendor_phone_number: string;

  // Disputed products
  product_name: string; // Summary for emails
  product_image: string;
  products: IProductItem[];

  // Initial dispute details
  reason_for_dispute: string;
  dispute_description: string;
  dispute_raised_by: "buyer" | "seller";
  dispute_raised_by_email: string;

  // Resolution tracking
  resolution_proposals: IResolutionProposal[];
  rejection_count: number;
  max_rejections: number;

  // Status
  dispute_status:
    | "processing"
    | "resolving"
    | "resolved"
    | "cancelled"
    | "escalated_to_mediator";
  dispute_resolution_method: "unresolved" | "dispute_parties" | "mediator";

  // Mediator request
  mediator_requested_by?: "buyer" | "seller";
  mediator_requested_at?: Date;
  mediator_assigned_at?: Date;

  // Final resolution
  resolved_at?: Date;
  resolution_summary?: string;
}

const productDisputeSchema = new Schema<IProductDispute>(
  {
    user: {
      type: Schema.Types.ObjectId,
      refPath: "userModel",
      required: true,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "ProductTransaction",
      required: true,
    },
    mediator: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

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
  return (
    this.rejection_count >= this.max_rejections &&
    this.dispute_status !== "escalated_to_mediator" &&
    this.dispute_resolution_method !== "mediator"
  );
});

const ProductDispute = mongoose.model<IProductDispute>(
  "ProductDispute",
  productDisputeSchema
);

export default ProductDispute;
