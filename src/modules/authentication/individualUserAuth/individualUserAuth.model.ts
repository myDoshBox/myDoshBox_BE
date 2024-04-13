import { Document, model, Model, Schema } from "mongoose";
import { emailValidator } from "../../../utils/validator.utils";
import { hash, compare } from "bcrypt";
import crypto from "crypto";

// Interface representing the individual document
export interface UserDocument extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  _confirmPassword?: string;
  verified: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

// Helper functions for user management
export interface UserModel extends Model<UserDocument> {
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

const individualUserSchema: Schema<UserDocument> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [5, "Email must be at least 5 characters"],
      validate: {
        validator: emailValidator,
        message: "Invalid email format",
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
    },
    verified: { type: Boolean, default: false },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Hash the password before saving it to the database
individualUserSchema.pre<UserDocument>("save", async function (next) {
  if (this.isModified("password")) {
    const saltRounds = 10;
    this.password = await hash(this.password, saltRounds);
  }
  next();
});

// Middleware to validate confirm password
individualUserSchema.pre("validate", function (next) {
  if (this.isModified("password") && this.password !== this._confirmPassword) {
    this.invalidate("confirmPassword", "Passwords do not match");
  }
  next();
});

// Virtual field for confirm password (not stored in the database)
individualUserSchema
  .virtual("confirmPassword")
  .get(function (this: { _confirmPassword: string }) {
    return this._confirmPassword;
  })
  .set(function (this: { _confirmPassword: string }, value: string) {
    this._confirmPassword = value;
  });

// Compare the password with the hashed password in the database
individualUserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await compare(candidatePassword, this.password);
};

individualUserSchema.methods.createPasswordResetToken = function (
  this: UserDocument
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

// Create a model for the individual user
export default model("IndividualUser", individualUserSchema) as Model<
  UserDocument,
  object,
  UserModel
>;
