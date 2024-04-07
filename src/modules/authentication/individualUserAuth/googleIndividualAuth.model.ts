import mongoose, { Schema } from "mongoose";

interface GoogleIndividualUser {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
  picture: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<GoogleIndividualUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    email_verified: { type: Boolean, default: true },
    picture: { type: String, required: true },
    sub: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const GoogleIndUser = mongoose.model<GoogleIndividualUser>(
  "GoogleIndividualUser",
  userSchema
);

export default GoogleIndUser;
