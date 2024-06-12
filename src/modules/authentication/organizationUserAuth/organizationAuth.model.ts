import mongoose, { Document, Model, Schema } from "mongoose";
import { emailValidator } from "../../../utilities/validator.utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";
// import { compare } from "bcrypt";

// Extend the OrganizationDoc interface to include virtual properties
export interface organizationalDoc extends Document {
  organization_name: string;
  organization_email: string;
  contact_email: string;
  contact_number: string;
  password: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  email_verified: boolean;
  sub: string;
  picture: string;
  role: string;
  // comparePassword(candidatePassword: string): Promise<boolean>;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

const organizationalSchema: Schema<organizationalDoc> = new mongoose.Schema(
  {
    organization_name: {
      type: String,
      required: [true, "Please tell us your name"],
    },
    contact_number: {
      type: String,
      required: [true, "Please provide a contact number"],
    },
    organization_email: {
      type: String,
      required: [true, "Please tell us your email"],
      lowercase: true,
      unique: true,
      validate: {
        validator: emailValidator,
        message: "Please provide a valid email address",
      },
    },
    contact_email: {
      type: String,
      required: [true, "Please provide a contact email"],
      lowercase: true,
      validate: {
        validator: emailValidator,
        message: "Please provide a valid email address",
      },
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    sub: { type: String },
    picture: { type: String },
    role: {
      type: String,
      enum: ["org", "g-org"],
      required: [true, "Please provide role"],
    },
    password: {
      type: String,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Hash password before saving to the database
organizationalSchema.pre<organizationalDoc>("save", async function (next) {
  if (!this.password) {
    return next();
  }

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// organizationalSchema.methods.comparePassword = async function (
//   candidatePassword: string
// ) {
//   return await compare(candidatePassword, this.password);
// };

organizationalSchema.methods.correctPassword = async function (
  this: organizationalDoc,
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

organizationalSchema.methods.createPasswordResetToken = function (
  this: organizationalDoc
) {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // console.log({ resetToken }, this.passwordResetToken);

  const resetExpires = new Date();
  resetExpires.setMinutes(resetExpires.getMinutes() + 10); // Add 10 minutes to the current time
  this.passwordResetExpires = resetExpires;

  return resetToken;
};

const OrganizationModel: Model<organizationalDoc> =
  mongoose.model<organizationalDoc>("OrganizationUser", organizationalSchema);

export default OrganizationModel;
