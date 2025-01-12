import mongoose, { Schema, Document } from "mongoose";

interface IShipping extends Document {
  user: mongoose.Schema.Types.ObjectId; // Reference to the User model
  product: mongoose.Schema.Types.ObjectId; // Reference to the User model
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
      // required: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product", // Reference to product model
      // required: true,
      //   WE HAVE TO MAKE THIS UNIQUE
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
      // required: true,
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
