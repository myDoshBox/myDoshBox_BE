import mongoose, { Schema } from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import GoogleOrganizationUser from "../authentication/organizationUserAuth/googleOrganizationUserAuth.model";
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// import GoogleIndividualUser from "../authentication/individualUserAuth/googleIndividualAuth.model";

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
      ref: "GoogleOrganizationUser" || "GoogleIndividualUser",
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
