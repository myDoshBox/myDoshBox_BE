import mongoose, { Schema, Document } from "mongoose";

// const validProductCategories = [
//   "Electronics",
//   "Clothing",
//   "Books",
//   "Toys",
//   "Home Appliances",
// ];

interface IProductDispute extends Document {
  user: mongoose.Schema.Types.ObjectId; // Reference to the User model
  transaction: mongoose.Schema.Types.ObjectId; // Reference to the Transaction model
  transaction_id: string;
  product_name: string;
  product_image: string;
  reason_for_dispute: string;
  dispute_description: string;
  dispute_status: boolean;
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
      ref: "ProductTransaction", // Reference to User model
      // required: true,
    },

    transaction_id: {
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
      default: "processing", // this is supposed to be pending and then completed when done
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProductDispute>(
  "Product",
  productDisputeSchema
);

export default Product;
