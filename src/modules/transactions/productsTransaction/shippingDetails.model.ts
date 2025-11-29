import mongoose, { Schema, Document } from "mongoose";

interface IShipping extends Document {
  user: mongoose.Schema.Types.ObjectId;
  product: mongoose.Schema.Types.ObjectId;
  transaction_id: string;
  shipping_company: string;
  delivery_person_name: string;
  delivery_person_number: string;
  delivery_person_email: string;
  delivery_date: string;
  pick_up_address: string;
  buyer_email: string;
  vendor_email: string;
}

const shippingDetailSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "IndividualUser", // Reference to User model
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "ProductTransaction", // ✅ FIXED: Changed from "Product" to "ProductTransaction"
    },
    transaction_id: {
      type: String,
      required: true,
    },

    shipping_company: {
      type: String,
      required: true,
    },

    delivery_person_name: {
      type: String,
      required: true,
    },

    delivery_person_number: {
      type: String,
      required: true,
    },

    delivery_person_email: {
      type: String,
    },

    delivery_date: {
      type: String,
      required: true,
    },

    pick_up_address: {
      type: String,
      required: true,
    },

    buyer_email: {
      type: String,
    },

    vendor_email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ShippingDetails = mongoose.model<IShipping>(
  "ShippingDetails",
  shippingDetailSchema
);

export default ShippingDetails;
