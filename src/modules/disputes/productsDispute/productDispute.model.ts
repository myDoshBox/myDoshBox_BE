import mongoose, { Schema, Document } from "mongoose";

// const validProductCategories = [
//   "Electronics",
//   "Clothing",
//   "Books",
//   "Toys",
//   "Home Appliances",
// ];

export interface IProductDispute extends Document {
  user: mongoose.Schema.Types.ObjectId; // Reference to the User model
  transaction: mongoose.Schema.Types.ObjectId; // Reference to the Transaction model
  mediator: mongoose.Schema.Types.ObjectId; // Reference to the Transaction model
  transaction_id: string;
  buyer_email: string;
  vendor_email: string;
  vendor_name: string;
  vendor_phone_number: string;
  product_name: string;
  product_image: string;
  reason_for_dispute: string;
  dispute_description: string;
  dispute_status: boolean;
  dispute_resolution_method: boolean;
}

const productDisputeSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "IndividualUser", // Reference to User model
      // required: true,
    },

    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Product", // Reference to User model
      // required: true,
    },

    mediator: {
      type: Schema.Types.ObjectId,
      ref: "Mediator", // Reference to User model
      // required: true,
    },

    transaction_id: {
      type: String,
      required: true,
    },

    buyer_email: {
      type: String,
      required: true,
    },

    vendor_name: {
      type: String,
      required: true,
    },

    vendor_email: {
      type: String,
      required: true,
    },

    vendor_phone_number: {
      type: String,
      required: true,
    },

    product_name: {
      type: String,
      required: true,
    },

    product_image: {
      type: String,
      required: true,
    },

    reason_for_dispute: {
      type: String,
      required: true,
    },

    dispute_description: {
      type: String,
      required: true,
    },

    dispute_status: {
      type: String,
      default: "processing", // this is supposed to default to #processing, #resolving when both parties choose the resolve button #resolved when done, and then #cancelled if the user cancels the escrow transaction
    },

    dispute_resolution_method: {
      type: String,
      default: "unresolved", // #unresolved as default, #dipute parties# when resolved by the people involved, #mediator
    },
  },
  {
    timestamps: true,
  }
);

const ProductDispute = mongoose.model<IProductDispute>(
  "ProductDispute",
  productDisputeSchema
);

export default ProductDispute;
