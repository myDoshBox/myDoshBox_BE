import { Document, model, Model, Schema } from "mongoose";
import { emailValidator } from "../../../utils/validator.utils";
import { hash, compare } from "bcrypt";
import crypto from "crypto";

interface UserDocument extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  _confirmPassword: string;
  verified: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: {
    token: string;
    createdAt?: Date;
  };
}

export interface UserModel extends Model<UserDocument> {
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

const individualUserSchema = new Schema<UserDocument>(
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
    verified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: {
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        expires: "1h",
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

individualUserSchema.pre<UserDocument>("save", async function (next) {
  if (this.isModified("password")) {
    const saltRounds = 10;
    this.password = await hash(this.password, saltRounds);
  }
  next();
});

individualUserSchema.pre("validate", function (next) {
  if (this.isModified("password") && this.password !== this._confirmPassword) {
    this.invalidate("confirmPassword", "Passwords do not match");
  }
  next();
});

individualUserSchema
  .virtual("confirmPassword")
  .get(function () {
    return this._confirmPassword;
  })
  .set(function (value: string) {
    this._confirmPassword = value;
  });

individualUserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await compare(candidatePassword, this.password);
};

individualUserSchema.methods.comparePasswordResetToken = function (
  token: string
) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return this.passwordResetToken?.token === hashedToken;
};

individualUserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = {
    token: crypto.createHash("sha256").update(resetToken).digest("hex"),
  };
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

export default model<UserDocument, UserModel>(
  "IndividualUser",
  individualUserSchema
);
