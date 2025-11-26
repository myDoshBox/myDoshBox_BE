// const newDispute = await ProductDispute.create({
//   user: "64fa1234abcd5678ef901234",  // ObjectId of user
//   user_model: "IndividualUser",      // or "OrganizationUser"
//   transaction_id: "TXN-12345",
//   buyer_email: "buyer@example.com",
//   vendor_email: "vendor@example.com",
//   vendor_name: "Vendor Inc.",
//   vendor_phone_number: "+2348012345678",
//   product_name: "Bluetooth Speaker",
//   product_image: "https://example.com/speaker.png",
//   reason_for_dispute: "Product not delivered",
//   dispute_description: "The product was never shipped.",
//   dispute_raised_by: "buyer",
//   dispute_raised_by_email: "buyer@example.com",
// });

// import mongoose, { Schema, Document } from "mongoose";

// export interface IProductItem {
//   name: string;
//   quantity: number;
//   price: number;
//   image: string;
//   description: string;
// }

// export interface IProductDispute extends Document {
//   user: mongoose.Schema.Types.ObjectId; // Reference to the User model
//   transaction: mongoose.Schema.Types.ObjectId; // Reference to the Transaction model
//   mediator: mongoose.Schema.Types.ObjectId; // Reference to the Mediator model
//   transaction_id: string;
//   buyer_email: string;
//   vendor_email: string;
//   vendor_name: string;
//   vendor_phone_number: string;
//   product_name: string;
//   product_image: string;
//   products: IProductItem[];
//   reason_for_dispute: string;
//   dispute_description: string;
//   dispute_status: string;
//   dispute_fault: string;
//   dispute_resolution_method: string;
//   resolution_description: string;
//   dispute_raised_by: string;
//   dispute_raised_by_email: string;
// }

// const productDisputeSchema = new mongoose.Schema(
//   {
// user: {
//   type: Schema.Types.ObjectId,
//   refPath: "user_model",
//   required: true,
// },
// user_model: {
//   type: String,
//   required: true,
//   enum: ["IndividualUser", "OrganizationUser"],
// },
//     transaction: {
//       type: Schema.Types.ObjectId,
//       ref: "ProductTransaction", // Corrected reference to ProductTransaction model
//     },
//     mediator: {
//       type: Schema.Types.ObjectId,
//       ref: "Mediator", // Reference to Mediator model
//     },
//     transaction_id: {
//       type: String,
//       required: true,
//     },
//     buyer_email: {
//       type: String,
//       required: true,
//     },
//     vendor_name: {
//       type: String,
//       required: true,
//     },
//     vendor_email: {
//       type: String,
//       required: true,
//     },
//     vendor_phone_number: {
//       type: String,
//       required: true,
//     },
//     product_name: {
//       type: String,
//       required: true,
//     },
//     product_image: {
//       type: String,
//       required: true,
//     },

//     reason_for_dispute: {
//       type: String,
//       required: true,
//     },
//     dispute_description: {
//       type: String,
//       required: true,
//     },
//     dispute_status: {
//       type: String,
//       default: "resolving",
//       enum: ["resolving", "resolved", "cancelled"],
//     },
//     dispute_resolution_method: {
//       type: String,
//       default: "unresolved",
//       enum: ["unresolved", "dispute_parties", "mediator"],
//     },
//     dispute_fault: {
//       type: String,
//       enum: ["buyer", "seller"],
//     },
//     resolution_description: {
//       type: String,
//     },
//     dispute_raised_by: {
//       type: String,
//       enum: ["buyer", "seller"],
//       required: true,
//     },
//     dispute_raised_by_email: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const ProductDispute = mongoose.model<IProductDispute>(
//   "ProductDispute",
//   productDisputeSchema
// );

// export default ProductDispute;

// import mongoose, { Schema, Document } from "mongoose";

// export interface IProductItem {
//   name: string;
//   quantity: number;
//   price: number;
//   image: string;
//   description: string;
// }

// export interface IProductDispute extends Document {
//   user: mongoose.Schema.Types.ObjectId;
//   transaction: mongoose.Schema.Types.ObjectId;
//   mediator?: mongoose.Schema.Types.ObjectId;
//   transaction_id: string;
//   buyer_email: string;
//   vendor_email: string;
//   vendor_name: string;
//   vendor_phone_number: string;
//   product_name: string;
//   product_image: string;
//   products: IProductItem[];
//   reason_for_dispute: string;
//   dispute_description: string;
//   dispute_status: "processing" | "resolving" | "resolved" | "cancelled";
//   dispute_fault?: "buyer" | "seller";
//   dispute_resolution_method: "unresolved" | "dispute_parties" | "mediator";
//   resolution_description?: string;
//   dispute_raised_by: "buyer" | "seller";
//   dispute_raised_by_email: string;
//   proposed_by?: "buyer" | "seller";
//   createdAt: Date;
//   updatedAt: Date;
// }

// const productDisputeSchema = new mongoose.Schema(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       refPath: "user_model",
//       required: true,
//     },
//     user_model: {
//       type: String,
//       // required: true,
//       enum: ["IndividualUser", "OrganizationUser"],
//     },
//     transaction: {
//       type: Schema.Types.ObjectId,
//       ref: "ProductTransaction",
//       required: true,
//     },
//     mediator: {
//       type: Schema.Types.ObjectId,
//       ref: "Mediator",
//       default: null,
//     },
//     transaction_id: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     buyer_email: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     vendor_name: {
//       type: String,
//       required: true,
//     },
//     vendor_email: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     vendor_phone_number: {
//       type: String,
//       required: true,
//     },
//     product_name: {
//       type: String,
//       required: true,
//     },
//     product_image: {
//       type: String,
//       required: true,
//     },
//     products: [
//       {
//         name: { type: String, required: true },
//         quantity: { type: Number, required: true },
//         price: { type: Number, required: true },
//         image: { type: String, required: true },
//         description: { type: String },
//       },
//     ],
//     reason_for_dispute: {
//       type: String,
//       required: true,
//     },
//     dispute_description: {
//       type: String,
//       required: true,
//     },
//     dispute_status: {
//       type: String,
//       default: "processing",
//       enum: ["processing", "resolving", "resolved", "cancelled"],
//     },
//     dispute_resolution_method: {
//       type: String,
//       default: "unresolved",
//       enum: ["unresolved", "dispute_parties", "mediator"],
//     },
//     dispute_fault: {
//       type: String,
//       enum: ["buyer", "seller"],
//     },
//     resolution_description: {
//       type: String,
//     },
//     dispute_raised_by: {
//       type: String,
//       enum: ["buyer", "seller"],
//       required: true,
//     },
//     dispute_raised_by_email: {
//       type: String,
//       required: true,
//     },
//     proposed_by: {
//       type: String,
//       enum: ["buyer", "seller"],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Add compound indexes for common queries
// productDisputeSchema.index({ transaction_id: 1, dispute_status: 1 });
// productDisputeSchema.index({ mediator: 1, dispute_status: 1 });

// const ProductDispute = mongoose.model<IProductDispute>(
//   "ProductDispute",
//   productDisputeSchema
// );

// export default ProductDispute;
// ============================================
// FILE 1: productDispute.model.ts
// ============================================

// productDispute.model.ts - Simplified Version

import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProductItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
  description?: string;
}

export interface IResolutionProposal {
  proposed_by: "buyer" | "seller";
  proposed_by_email: string;
  proposal_date: Date;
  proposal_description: string; // Simple text description only
  status: "pending" | "accepted" | "rejected";
  responded_by?: string;
  response_date?: Date;
  response_description?: string;
}

export interface IProductDispute extends Document {
  user: Types.ObjectId;
  user_model: string;
  transaction: Types.ObjectId;
  mediator?: Types.ObjectId;
  transaction_id: string;

  // Parties involved
  buyer_email: string;
  vendor_name: string;
  vendor_email: string;
  vendor_phone_number: string;

  // Disputed products (snapshot from transaction)
  product_name: string;
  product_image: string;
  products: IProductItem[];

  // Initial dispute details
  reason_for_dispute: string;
  dispute_description: string;
  dispute_raised_by: "buyer" | "seller";
  dispute_raised_by_email: string;

  // NEW: Dispute stage/category
  dispute_stage: "pre_payment" | "post_payment" | "post_delivery";

  // Transaction state at dispute time (for reference)
  transaction_state_snapshot: {
    buyer_initiated: boolean;
    seller_confirmed: boolean;
    verified_payment_status: boolean;
    shipping_submitted: boolean;
    buyer_confirm_status: boolean;
  };

  // Resolution tracking (simplified)
  resolution_proposals: IResolutionProposal[];
  rejection_count: number;
  max_rejections: number;

  // Status
  dispute_status:
    | "none"
    | "In_Dispute"
    | "processing"
    | "resolving"
    | "resolved"
    | "cancelled"
    | "escalated_to_mediator";
  dispute_resolution_method: "unresolved" | "dispute_parties" | "mediator";

  // Mediator
  mediator_requested_by?: "buyer" | "seller";
  mediator_requested_at?: Date;
  mediator_assigned_at?: Date;

  // Final resolution
  resolved_at?: Date;
  resolution_summary?: string;
  resolution_description?: string;
  dispute_fault?: "buyer" | "seller";

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const productDisputeSchema = new Schema<IProductDispute>(
  {
    user: {
      type: Schema.Types.ObjectId,
      refPath: "user_model",
      required: true,
    },
    user_model: {
      type: String,
      enum: ["IndividualUser", "OrganizationUser"],
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

    // Products (snapshot)
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

    // Dispute stage
    dispute_stage: {
      type: String,
      enum: ["pre_payment", "post_payment", "post_delivery"],
      required: true,
    },

    // Transaction state snapshot
    transaction_state_snapshot: {
      buyer_initiated: { type: Boolean, default: false },
      seller_confirmed: { type: Boolean, default: false },
      verified_payment_status: { type: Boolean, default: false },
      shipping_submitted: { type: Boolean, default: false },
      buyer_confirm_status: { type: Boolean, default: false },
    },

    // Simplified resolution proposals (text only)
    resolution_proposals: [
      {
        proposed_by: {
          type: String,
          enum: ["buyer", "seller"],
          required: true,
        },
        proposed_by_email: { type: String, required: true },
        proposal_date: { type: Date, default: Date.now },
        proposal_description: { type: String, required: true },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        responded_by: String,
        response_date: Date,
        response_description: String, // Why accepted/rejected
      },
    ],
    rejection_count: { type: Number, default: 0 },
    max_rejections: { type: Number, default: 3 },

    // Status
    dispute_status: {
      type: String,
      enum: [
        "none",
        "processing",
        "In_Dispute",
        "resolving",
        "resolved",
        "cancelled",
        "escalated_to_mediator",
      ],
      default: "none",
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
    resolution_description: {
      type: String,
      trim: true,
    },
    dispute_fault: {
      type: String,
      enum: ["buyer", "seller"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
productDisputeSchema.index({ transaction_id: 1, dispute_status: 1 });
productDisputeSchema.index({ buyer_email: 1, createdAt: -1 });
productDisputeSchema.index({ vendor_email: 1, createdAt: -1 });
productDisputeSchema.index({ dispute_stage: 1 });

const ProductDispute = mongoose.model<IProductDispute>(
  "ProductDispute",
  productDisputeSchema
);

export default ProductDispute;
