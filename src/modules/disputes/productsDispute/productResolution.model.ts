import mongoose, { Schema, Document } from "mongoose";

interface IProductResolution extends Document {
  dispute: mongoose.Schema.Types.ObjectId; // Reference to the Transaction model
  dispute_id: string;
  resolution_description: string;
  resolution_status: boolean;
}

const productResolutionSchema = new mongoose.Schema(
  {
    dispute: {
      type: Schema.Types.ObjectId,
      ref: "ProductDispute", // Reference to User model
      // required: true,
    },

    dispute_id: {
      type: String,
      required: true,
    },

    resolution_description: {
      type: String,
      required: true,
    },

    resolution_status: {
      type: String,
      default: "processing", // this is supposed to default to #processing, #resolving when both parties choose the resolve button #resolved when done, and then #cancelled if the user cancels the escrow transaction
    },
  },
  {
    timestamps: true,
  }
);

const ProductResolution = mongoose.model<IProductResolution>(
  "ProductResolution",
  productResolutionSchema
);

export default ProductResolution;
