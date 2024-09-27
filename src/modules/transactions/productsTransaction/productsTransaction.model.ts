import mongoose, { Schema, Document } from "mongoose";

// const validProductCategories = [
//   "Electronics",
//   "Clothing",
//   "Books",
//   "Toys",
//   "Home Appliances",
// ];

interface IProduct extends Document {
  user: mongoose.Schema.Types.ObjectId; // Reference to the User model
  transaction_id: string;
  buyer_email: string;
  vendor_phone_number: string;
  vendor_email: string;
  transaction_type: string;
  product_name: string;
  // product_category: string;
  product_quantity: number;
  product_price: number;
  transaction_total: number;
  product_image: string;
  product_description: string;
  signed_escrow_doc: string;
  verified_payment_status: boolean;
  transaction_status: boolean;
  // profit_made: number;
  // timestamps: unknown;
}

const productSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      // required: true,
    },

    transaction_id: {
      type: String,
      required: true,
    },

    buyer_email: {
      type: String,
    },

    vendor_phone_number: {
      type: String,
      required: true,
    },

    vendor_email: {
      type: String,
      required: true,
    },

    transaction_type: {
      type: String,
      required: true,
    },

    product_name: {
      type: String,
      required: true,
    },

    // product_category: {
    //   type: String,
    //   // enum: validProductCategories,
    //   required: true,
    // },

    product_quantity: {
      type: Number,
      required: true,
    },

    product_price: {
      type: Number,
      required: true,
    },

    transaction_total: {
      type: Number,
      required: true,
    },

    product_image: {
      type: String,
      required: true,
    },

    product_description: {
      type: String,
      required: true,
    },

    signed_escrow_doc: {
      type: String,
      // required: true,
    },

    verified_payment_status: {
      type: Boolean,
      default: false,
    },

    transaction_status: {
      type: Boolean,
      default: false, // this is supposed to be pending and then successful when done
    },

    // profit_made: {
    //   type: Number,
    //   default: 0,
    // },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
