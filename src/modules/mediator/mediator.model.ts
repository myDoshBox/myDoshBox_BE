import mongoose, { Schema, Document } from "mongoose";

export interface IMediator extends Document {
  _id: mongoose.Types.ObjectId;
  dispute: mongoose.Schema.Types.ObjectId[]; // Reference to the User model
  first_name: string;
  middle_name: string;
  last_name: string;
  mediator_email: string;
  mediator_phone_number: string;
  password: string;
  refreshToken?: string;
  token?: string;
}

const mediatorSchema = new mongoose.Schema(
  {
    disputes: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductDispute", // Reference to User model
        // required: true,
      },
    ],

    first_name: {
      type: String,
      required: true,
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
    token: {
      type: String,
    },

    password: {
      type: String,
      required: true,
      select: false, // Exclude password by default
    },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

const MediatorModel = mongoose.model<IMediator>("Mediator", mediatorSchema);

export default MediatorModel;
