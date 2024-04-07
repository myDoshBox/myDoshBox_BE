import mongoose, { Schema } from "mongoose";

interface IGoogleOrganizationUser {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
  picture: string;
  contact_phone: string;
  contact_email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IGoogleOrganizationUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    email_verified: { type: Boolean, default: true },
    contact_email: { type: String, required: true },
    contact_phone: { type: String, required: true },
    picture: { type: String, required: true },
    sub: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const GoogleOrganizationUser = mongoose.model<IGoogleOrganizationUser>(
  "GoogleOrganizationUser",
  userSchema
);

export default GoogleOrganizationUser;
