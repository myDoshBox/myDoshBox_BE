import mongoose, { Schema } from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User } from "../users/organizationUsers/OrganizationUser.model";

interface ISession {
  user: Schema.Types.ObjectId;
  valid: boolean;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    valid: { type: Boolean, default: true },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model<ISession>("Session", sessionSchema);

export { Session };
