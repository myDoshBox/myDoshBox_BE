import mongoose, { Document, Model, Schema } from "mongoose";
import { emailValidator } from "../../../utils/validator.utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Extend the UserDoc interface to include virtual properties
interface UserDoc extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirmation: string;
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

const UserSchema: Schema<UserDoc> = new mongoose.Schema({
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
  phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false,
  },
  passwordConfirmation: {
    type: String,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Hash password before saving to the database
UserSchema.pre<UserDoc>("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.correctPassword = async function (
  this: UserDoc,
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.createPasswordResetToken = function (this: UserDoc) {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //   console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

// Export the UserModel
const UserModel: Model<UserDoc> = mongoose.model<UserDoc>("User", UserSchema);

export default UserModel;
