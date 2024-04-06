import mongoose, { Schema } from "mongoose";

interface IndUser {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
  picture: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IndUser>(
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

const User = mongoose.model<IndUser>("IndUser", userSchema);

export { User };