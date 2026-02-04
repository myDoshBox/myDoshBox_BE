// import mongoose, { Schema, Document } from "mongoose";

// interface IProductItem {
//   name: string;
//   quantity: number;
//   price: number;
//   image: string;
//   description: string;
// }

// interface IProductTransaction extends Document {
//   user: mongoose.Schema.Types.ObjectId;
//   shipping: mongoose.Schema.Types.ObjectId; // Fixed: Remove the object structure here
//   transaction_id: string;
//   payment_reference?: string;
//   buyer_email: string;
//   vendor_name: string;
//   vendor_phone_number: string;
//   vendor_email: string;
//   transaction_type: string;
//   products: IProductItem[];
//   sum_total: number;
//   transaction_total: number;
//   signed_escrow_doc: string;
//   delivery_address: string;
//   buyer_initiated: boolean;
//   seller_confirmed: boolean;
//   verified_payment_status: boolean;
//   shipping_submitted: boolean;
//   transaction_status: string;
//   seller_confirm_status: boolean;
//   buyer_confirm_status: boolean;
//   dispute_status: string;
//   payment_initiated_at?: Date;
//   payment_verified_at?: Date;
// }

// const productTransactionSchema = new mongoose.Schema<IProductTransaction>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "IndividualUser",
//       required: true,
//     },

//     shipping: {
//       type: Schema.Types.ObjectId,
//       ref: "ShippingDetails",
//     },

//     transaction_id: { type: String, required: true, unique: true },
//     payment_reference: { type: String, unique: true, sparse: true },
//     buyer_email: { type: String, required: true },
//     vendor_name: { type: String, required: true },
//     vendor_phone_number: { type: String, required: true },
//     vendor_email: { type: String, required: true },
//     transaction_type: { type: String, required: true },
//     products: [
//       {
//         name: { type: String, required: true },
//         quantity: { type: Number, required: true },
//         price: { type: Number, required: true },
//         image: { type: String, required: false },
//         description: { type: String, required: false },
//       },
//     ],
//     sum_total: { type: Number, required: true },
//     transaction_total: { type: Number, required: true },
//     signed_escrow_doc: { type: String },
//     delivery_address: { type: String, required: true },
//     buyer_initiated: { type: Boolean, default: false },
//     seller_confirmed: { type: Boolean, default: false },
//     buyer_confirm_status: { type: Boolean, default: false },
//     verified_payment_status: { type: Boolean, default: false },
//     shipping_submitted: { type: Boolean, default: false },
//     transaction_status: {
//       type: String,
//       default: "processing",
//       enum: [
//         "processing", // Initial state when buyer initiates
//         "awaiting_payment", // After seller confirms
//         "payment_verified", // After payment is verified
//         "awaiting_shipping", // After payment, before shipping details
//         "in_transit", // After shipping details submitted
//         "completed", // After buyer confirms receipt
//         "cancelled", // If cancelled
//         "inDispute", // If in dispute
//       ],
//     },
//     seller_confirm_status: { type: Boolean, default: false },
//     dispute_status: {
//       type: String,
//       enum: [
//         "none",
//         "processing",
//         "In_Dispute",
//         "resolving",
//         "resolved",
//         "escalated_to_mediator",
//         "cancelled",
//       ],
//       default: "none",
//     },

//     payment_initiated_at: { type: Date },
//     payment_verified_at: { type: Date },
//   },
//   { timestamps: true }
// );

// const ProductTransaction = mongoose.model<IProductTransaction>(
//   "ProductTransaction",
//   productTransactionSchema
// );

// export default ProductTransaction;
import mongoose, { Schema, Document } from "mongoose";

interface IProductItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
  description: string;
}

interface IShippingDetails {
  _id: mongoose.Types.ObjectId;
  shipping_company: string;
  delivery_person_name: string;
  delivery_person_number: string;
  delivery_person_email: string;
  delivery_date: string;
  pick_up_address: string;
  createdAt: Date;
  updatedAt: Date;
}

// VENDOR BANK DETAILS SCHEMA
const vendorBankDetailsSchema = new Schema(
  {
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
        validator: function (v: string) {
          return /^\d{10}$/.test(v); // Nigerian account numbers are 10 digits
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
  { _id: false },
);

export interface IProductTransaction extends Document {
  user: mongoose.Schema.Types.ObjectId;
  shipping?: mongoose.Schema.Types.ObjectId | IShippingDetails;
  transaction_id: string;
  payment_reference?: string;
  buyer_email: string;
  vendor_name: string;
  vendor_phone_number: string;
  vendor_email: string;
  transaction_type: string;
  products: IProductItem[];
  sum_total: number;
  transaction_total: number;
  signed_escrow_doc: string;
  delivery_address: string;
  buyer_initiated: boolean;
  seller_confirmed: boolean;
  verified_payment_status: boolean;
  shipping_submitted: boolean;
  transaction_status: string;
  seller_confirm_status: boolean;
  buyer_confirm_status: boolean;
  dispute_status: string;
  payment_initiated_at?: Date;
  payment_verified_at?: Date;

  // NEW FIELDS FOR PAYMENT RELEASE FUNCTIONALITY
  vendor_bank_details?: {
    account_name: string;
    account_number: string;
    bank_code: string;
    bank_name: string;
  };

  vendor_recipient_code?: string; // Paystack recipient code (stored for future use)

  payment_released: boolean; // Flag to track if payment has been released
  payment_released_at?: Date; // Timestamp when payment was released
  transfer_reference?: string; // Paystack transfer reference
  transfer_status?: "pending" | "success" | "failed" | "reversed";
  transfer_amount?: number; // Amount transferred to vendor (in Naira)
  transfer_completed_at?: Date; // When transfer was confirmed successful
  transfer_failure_reason?: string; // If transfer failed, why
  transfer_reversal_reason?: string; // If transfer was reversed, why
  transfer_webhook_data?: any; // Full webhook data for audit trail
  requires_manual_review?: boolean; // Flag for admin intervention
}

const productTransactionSchema = new mongoose.Schema<IProductTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "IndividualUser",
      required: true,
    },

    shipping: {
      type: Schema.Types.ObjectId,
      ref: "ShippingDetails",
    },

    transaction_id: { type: String, required: true, unique: true },
    payment_reference: { type: String, unique: true, sparse: true },
    buyer_email: { type: String, required: true },
    vendor_name: { type: String, required: true },
    vendor_phone_number: { type: String, required: true },
    vendor_email: { type: String, required: true },
    transaction_type: { type: String, required: true },
    products: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: false },
        description: { type: String, required: false },
      },
    ],
    sum_total: { type: Number, required: true },
    transaction_total: { type: Number, required: true },
    signed_escrow_doc: { type: String },
    delivery_address: { type: String, required: true },
    buyer_initiated: { type: Boolean, default: false },
    seller_confirmed: { type: Boolean, default: false },
    buyer_confirm_status: { type: Boolean, default: false },
    verified_payment_status: { type: Boolean, default: false },
    shipping_submitted: { type: Boolean, default: false },
    transaction_status: {
      type: String,
      default: "processing",
      enum: [
        "processing", // Initial state when buyer initiates
        "awaiting_payment", // After seller confirms
        "payment_verified", // After payment is verified
        "awaiting_shipping", // After payment, before shipping details
        "in_transit", // After shipping details submitted
        "completed", // After buyer confirms receipt
        "cancelled", // If cancelled
        "inDispute", // If in dispute
      ],
    },
    seller_confirm_status: { type: Boolean, default: false },
    dispute_status: {
      type: String,
      enum: [
        "none",
        "processing",
        "In_Dispute",
        "resolving",
        "resolved",
        "escalated_to_mediator",
        "cancelled",
      ],
      default: "none",
    },

    payment_initiated_at: { type: Date },
    payment_verified_at: { type: Date },

    // NEW FIELDS FOR PAYMENT RELEASE
    vendor_bank_details: {
      type: vendorBankDetailsSchema,
      required: false,
    },

    vendor_recipient_code: {
      type: String,
      trim: true,
      index: true,
    },

    payment_released: {
      type: Boolean,
      default: false,
      index: true,
    },

    payment_released_at: {
      type: Date,
    },

    transfer_reference: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    transfer_status: {
      type: String,
      enum: ["pending", "success", "failed", "reversed"],
      default: undefined,
    },

    transfer_amount: {
      type: Number,
      min: 0,
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
      type: Schema.Types.Mixed,
    },

    requires_manual_review: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// ADD INDEXES FOR PERFORMANCE
productTransactionSchema.index({ transfer_reference: 1 });
productTransactionSchema.index({ payment_released: 1, transfer_status: 1 });
productTransactionSchema.index({ requires_manual_review: 1 });
productTransactionSchema.index({ vendor_recipient_code: 1 });
productTransactionSchema.index({ vendor_email: 1 });
productTransactionSchema.index({ transaction_status: 1, payment_released: 1 });

// ADD VALIDATION MIDDLEWARE
productTransactionSchema.pre("save", function (next) {
  const transaction = this as IProductTransaction;

  // If payment is being released, ensure bank details exist
  if (
    transaction.payment_released &&
    !transaction.vendor_bank_details &&
    transaction.transaction_status === "completed"
  ) {
    return next(
      new Error("Vendor bank details required before releasing payment"),
    );
  }

  // Ensure transfer_amount matches transaction_total when transfer is successful
  if (
    transaction.transfer_status === "success" &&
    transaction.transfer_amount &&
    transaction.transaction_total
  ) {
    // Optionally add validation for amount matching
    // if (transaction.transfer_amount !== transaction.transaction_total) {
    //   return next(new Error("Transfer amount must match transaction total"));
    // }
  }

  // Set payment_released_at when payment_released becomes true
  if (this.isModified("payment_released") && transaction.payment_released) {
    transaction.payment_released_at = new Date();
  }

  // Set transfer_completed_at when transfer_status becomes success
  if (
    this.isModified("transfer_status") &&
    transaction.transfer_status === "success"
  ) {
    transaction.transfer_completed_at = new Date();
  }

  // Automatically set transfer_amount to transaction_total if not set
  if (
    !transaction.transfer_amount &&
    transaction.transaction_total &&
    transaction.transfer_status
  ) {
    transaction.transfer_amount = transaction.transaction_total;
  }

  next();
});

// ADD HELPER METHODS
productTransactionSchema.methods.isEligibleForPaymentRelease =
  function (): boolean {
    const transaction = this as IProductTransaction;
    return (
      transaction.transaction_status === "completed" &&
      !transaction.payment_released &&
      !!transaction.vendor_bank_details &&
      transaction.buyer_confirm_status === true &&
      transaction.verified_payment_status === true
    );
  };

productTransactionSchema.methods.canMarkAsCompleted = function (): boolean {
  const transaction = this as IProductTransaction;
  return (
    transaction.transaction_status === "in_transit" &&
    transaction.buyer_confirm_status === true &&
    transaction.shipping_submitted === true
  );
};

productTransactionSchema.methods.hasTransferFailed = function (): boolean {
  const transaction = this as IProductTransaction;
  return transaction.transfer_status === "failed";
};

productTransactionSchema.methods.needsManualReview = function (): boolean {
  const transaction = this as IProductTransaction;
  return (
    transaction.requires_manual_review === true ||
    (transaction.transfer_status === "failed" &&
      !transaction.transfer_failure_reason) ||
    (transaction.payment_released && !transaction.transfer_status)
  );
};

// VIRTUAL FIELD FOR DISPLAY
productTransactionSchema.virtual("display_status").get(function () {
  const transaction = this as IProductTransaction;

  if (transaction.dispute_status !== "none") {
    return `Dispute: ${transaction.dispute_status}`;
  }

  if (transaction.transfer_status === "failed") {
    return "Payment Transfer Failed";
  }

  if (transaction.transfer_status === "success") {
    return "Payment Released Successfully";
  }

  if (
    transaction.payment_released &&
    transaction.transfer_status === "pending"
  ) {
    return "Payment Release Pending";
  }

  if (
    transaction.transaction_status === "completed" &&
    !transaction.payment_released
  ) {
    return "Awaiting Payment Release";
  }

  return transaction.transaction_status;
});

// VIRTUAL FIELD FOR VENDOR PAYMENT STATUS
productTransactionSchema.virtual("vendor_payment_status").get(function () {
  const transaction = this as IProductTransaction;

  if (transaction.transfer_status === "success") {
    return {
      status: "paid",
      message: "Payment transferred to your account",
      date: transaction.transfer_completed_at,
      amount: transaction.transfer_amount,
    };
  }

  if (transaction.transfer_status === "failed") {
    return {
      status: "failed",
      message: "Payment transfer failed",
      reason: transaction.transfer_failure_reason,
      requires_action: true,
    };
  }

  if (transaction.transfer_status === "pending") {
    return {
      status: "pending",
      message: "Payment release in progress",
      estimated_time: "1-3 business days",
    };
  }

  if (
    transaction.transaction_status === "completed" &&
    !transaction.payment_released
  ) {
    return {
      status: "awaiting_release",
      message: "Awaiting payment release confirmation",
      requires_bank_details: !transaction.vendor_bank_details,
    };
  }

  return {
    status: "not_eligible",
    message: "Payment not yet eligible for release",
  };
});

// Ensure virtuals are included in JSON output
productTransactionSchema.set("toJSON", { virtuals: true });
productTransactionSchema.set("toObject", { virtuals: true });

const ProductTransaction = mongoose.model<IProductTransaction>(
  "ProductTransaction",
  productTransactionSchema,
);

export default ProductTransaction;
