import mongoose, { Schema } from "mongoose";

interface ISession {
  user: Schema.Types.ObjectId;
  valid: boolean;
  userAgent: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationUser" || "IndividualUser",
    },
    role: { type: String, enum: ["org", "ind", "g-org", "g-ind"] },
    valid: { type: Boolean, default: true },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model<ISession>("Session", sessionSchema);

export { Session };
