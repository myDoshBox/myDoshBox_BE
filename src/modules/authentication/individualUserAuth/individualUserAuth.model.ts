import { compare, hash } from "bcrypt";
import mongoose, { Model, model } from "mongoose";

// create a schema for the individual user

export interface IndividaulDocument {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  verified: boolean;
}


interface Methods {
  comparePassword(password: string): Promise<boolean>;
}

const individualUserAuthSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  }
});

individualUserAuthSchema.pre("save", async function (next) {
  // Hash the token
  if (this.isModified("password")) {
      this.password = await hash(this.password, 10);
  }
  next();
});

individualUserAuthSchema.methods.comparePassword = async function (password: string) {
  const result = await compare(password, this.password); // Change this.token to this.password
  return result;
}


// create a model for the individual user
 
export default model("IndividualUser", individualUserAuthSchema) as Model<IndividaulDocument, {}, Methods>