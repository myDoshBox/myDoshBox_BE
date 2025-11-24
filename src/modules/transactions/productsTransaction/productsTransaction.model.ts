// import mongoose, { Schema, Document } from "mongoose";

// // const validProductCategories = [
// //   "Electronics",
// //   "Clothing",
// //   "Books",
// //   "Toys",
// //   "Home Appliances",
// // ];

// interface IProductTransaction extends Document {
//   user: mongoose.Schema.Types.ObjectId; // Reference to the User model
//   transaction_id: string;
//   buyer_email: string;
//   vendor_name: string;
//   vendor_phone_number: string;
//   vendor_email: string;
//   transaction_type: string;
//   product_name: string;
//   // product_category: string;
//   product_quantity: number;
//   product_price: number;
//   transaction_total: number;
//   product_image: string;
//   product_description: string;
//   signed_escrow_doc: string;
//   delivery_address: string;
//   verified_payment_status: boolean;
//   transaction_status: boolean;
//   seller_confirm_status: boolean;
//   // profit_made: number;
//   // timestamps: unknown;
// }

// const productTransactionSchema = new mongoose.Schema(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "IndividualUser", // Reference to User model
//       // required: true,
//     },

//     transaction_id: {
//       type: String,
//       required: true,
//     },

//     buyer_email: {
//       type: String,
//     },

//     vendor_name: {
//       type: String,
//       required: true,
//     },

//     vendor_phone_number: {
//       type: String,
//       required: true,
//     },

//     vendor_email: {
//       type: String,
//       required: true,
//     },

//     transaction_type: {
//       type: String,
//       required: true,
//     },

//     product_name: {
//       type: String,
//       required: true,
//     },

//     // product_category: {
//     //   type: String,
//     //   // enum: validProductCategories,
//     //   required: true,
//     // },

//     product_quantity: {
//       type: Number,
//       required: true,
//     },

//     product_price: {
//       type: Number,
//       required: true,
//     },

//     transaction_total: {
//       type: Number,
//       required: true,
//     },

//     product_image: {
//       type: String,
//       required: true,
//     },

//     product_description: {
//       type: String,
//       required: true,
//     },

//     signed_escrow_doc: {
//       type: String,
//       // required: true,
//     },

//     delivery_address: {
//       type: String,
//       // required: true,
//     },

//     verified_payment_status: {
//       type: Boolean,
//       default: false,
//     },

//     transaction_status: {
//       type: String,
//       default: "processing", // default to #processing, #cancelled when the initiator stops it, #inDispute when a dispute is raised and then #completed when done
//     },

//     seller_confirm_status: {
//       type: Boolean,
//       default: false,
//     },
//     // profit_made: {
//     //   type: Number,
//     //   default: 0,
//     // },
//   },
//   {
//     timestamps: true,
//   }
// );

// const ProductTransaction = mongoose.model<IProductTransaction>(
//   "Product",
//   productTransactionSchema
// );

// export default ProductTransaction;

// productsTransaction.model.ts - UPDATE
import mongoose, { Schema, Document } from "mongoose";

interface IProductItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
  description: string;
}

interface IProductTransaction extends Document {
  user: mongoose.Schema.Types.ObjectId;
  transaction_id: string;
  payment_reference?: string; // Make optional initially
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
}

const productTransactionSchema = new mongoose.Schema<IProductTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "IndividualUser",
      required: true,
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
      enum: ["none", "active", "resolved", "cancelled"],
      default: "none",
    },
    payment_initiated_at: { type: Date },
    payment_verified_at: { type: Date },
  },
  { timestamps: true }
);

const ProductTransaction = mongoose.model<IProductTransaction>(
  "ProductTransaction",
  productTransactionSchema
);

export default ProductTransaction;
