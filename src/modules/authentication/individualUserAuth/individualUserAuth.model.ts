
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

// Interface representing the individual document
export interface UserDocument extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  _confirmPassword?: string;
  isVerified: boolean;
}

// Helper functions for user management
export interface UserModel extends mongoose.Model<UserDocument> {
  getAllUsers: () => Promise<UserDocument[]>;
  getUserByEmail: (email: string) => Promise<UserDocument | null>;
  getUserById: (id: string) => Promise<UserDocument | null>;
}

const individualSchema: Schema<UserDocument> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [5, "Email must be at least 5 characters"],
      validate: {
        validator: (value: string) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
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
      minlength: [6, "Password must be at least 6 characters"],
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash the password before saving it to the database
individualSchema.pre<UserDocument>("save", async function (next) {
  if (this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Middleware to validate confirm password
individualSchema.pre("validate", function (next) {
  if (this.isModified("password") && this.password !== this._confirmPassword) {
    this.invalidate("confirmPassword", "Passwords do not match");
  }
  next();
});

// Virtual field for confirm password (not stored in the database)
individualSchema
  .virtual("confirmPassword")
  .get(function (this: { _confirmPassword: string }) {
    return this._confirmPassword;
  })
  .set(function (this: { _confirmPassword: string }, value: string) {
    this._confirmPassword = value;
  });

// Helper functions implementation
individualSchema.statics.getAllUsers = async function () {
  return await this.find({});
};

individualSchema.statics.getUserByEmail = async function (email: string) {
  return await this.findOne({ email });
};

individualSchema.statics.getUserById = async function (id: string) {
  return await this.findById(id);
};

// Create a model for the individual user
const Individual = mongoose.model<UserDocument, UserModel>(
  "Individual",
  individualSchema
);

export default Individual;

