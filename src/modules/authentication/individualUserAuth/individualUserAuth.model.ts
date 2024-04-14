<<<<<<< HEAD
import { Document, model, Model, Schema } from "mongoose";
import { emailValidator } from "../../../utils/validator.utils";
import { hash, compare } from "bcrypt";
import crypto from "crypto";

export interface IndividualUserDocument extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  verified: boolean;
  verificationToken: string;
  passwordChangedAt?: Date;
  passwordResetToken?: {
    token: string;
    createdAt?: Date;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  comparePasswordResetToken(token: string): boolean;
}

export interface IndividualUserModel extends Model<IndividualUserDocument> {}

const individualUserSchema = new Schema<IndividualUserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
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
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: {
      token: {
        type: String,
      },
      createdAt: {
        type: Date,
        expires: "1h",
        default: Date.now(),
        select: false,
      },
    },
  },
  { timestamps: true }
);

individualUserSchema.pre<IndividualUserDocument>("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const saltRounds = 10;
      this.password = await hash(this.password, saltRounds);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return next(err);
    }
  }
  next();
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
  return resetToken;
};

const IndividualUser = model<IndividualUserDocument, IndividualUserModel>(
  "IndividualUser",
  individualUserSchema
);

export default IndividualUser;
=======
>>>>>>> master
