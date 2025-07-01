import mongoose, { Schema, Document } from "mongoose";

export interface IMediator extends Document {
  dispute: mongoose.Schema.Types.ObjectId; // Reference to the User model
  first_name: string;
  middle_name: string;
  last_name: string;
  mediator_email: string;
  mediator_phone_number: string;
  password: string;
}

const mediatorSchema = new mongoose.Schema(
  {
    dispute: {
      type: Schema.Types.ObjectId,
      ref: "ProductDispute", // Reference to User model
      // required: true,
    },

    first_name: {
      type: String,
    },

    middle_name: {
      type: String,
    },

    last_name: {
      type: String,
      required: true,
    },

    mediator_email: {
      type: String,
      required: true,
      unique: true,
    },

    mediator_phone_number: {
      type: String,
    },

    password: {
      type: String,
      required: true,
      select: false, // Exclude password by default
    },
  },
  {
    timestamps: true,
  }
);

const MediatorModel = mongoose.model<IMediator>("Mediator", mediatorSchema);

export default MediatorModel;
