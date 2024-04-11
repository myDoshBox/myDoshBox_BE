import mongoose, { Document, Model, Schema } from "mongoose";
import { emailValidator } from "../../../utils/validator.utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Extend the OrganizationDoc interface to include virtual properties
interface organizationalDoc extends Document {
  name: string;
  email: string;
  org_Email: string;
  phoneNumber: string;
  password: string;
  password_Confirmation: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

const organizationalSchema: Schema<organizationalDoc> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
    },
    org_Email: {
      type: String,
      required: [true, "Please tell us your email"],
      lowercase: true,
      validate: {
        validator: emailValidator,
        message: "Please provide a valid email address",
      },
    },
    email: {
      type: String,
      required: [true, "Please tell us your email"],
      unique: true,
      lowercase: true,
      validate: {
        validator: emailValidator,
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      select: false,
    },
    password_Confirmation: {
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
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

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
  console.log({ resetToken }, this.passwordResetToken);

  const resetExpires = new Date();
  resetExpires.setMinutes(resetExpires.getMinutes() + 10); // Add 10 minutes to the current time
  this.passwordResetExpires = resetExpires;

  return resetToken;
};

const OrganizationModel: Model<organizationalDoc> =
  mongoose.model<organizationalDoc>("OrganizationUser", organizationalSchema);

export default OrganizationModel;
