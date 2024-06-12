import { Document, model, Model, Schema } from "mongoose";
import { emailValidator } from "../../../utilities/validator.utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IndividualUserDocument extends Document {
  email: string;
  sub: string;
  picture: string;
  role: string;
  phone_number: string;
  password: string;
  email_verified: boolean;
  passwordChangedAt?: Date;
  passwordResetExpires?: Date;
  passwordResetToken?: string;
  // comparePassword(candidatePassword: string): Promise<boolean>;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  createPasswordResetToken(): string;
  comparePasswordResetToken(token: string): boolean;
}

export interface IndividualUserModel extends Model<IndividualUserDocument> {}

const individualUserSchema = new Schema<IndividualUserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Please tell us your email"],
      lowercase: true,
      trim: true,
      minlength: [5, "Email must be at least 5 characters"],
      validate: {
        validator: emailValidator,
        message: "Invalid email format",
      },
    },
    phone_number: {
      type: String,
      trim: true,
      required: false,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    sub: String,
    role: {
      type: String,
      enum: ["ind", "g-ind"],
      required: [true, "Please provide role"],
    },
    picture: String,
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

individualUserSchema.pre<IndividualUserDocument>("save", async function (next) {
  if (!this.password) {
    return next();
  }

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

individualUserSchema.methods.correctPassword = async function (
  this: IndividualUserDocument,
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

individualUserSchema.methods.createPasswordResetToken = function (
  this: IndividualUserDocument
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

individualUserSchema.methods.comparePasswordResetToken = function (
  token: string
) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return this.passwordResetToken?.token === hashedToken;
};

const IndividualUser = model<IndividualUserDocument, IndividualUserModel>(
  "IndividualUser",
  individualUserSchema
);

export default IndividualUser;
