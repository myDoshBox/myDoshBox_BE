import mongoose from "mongoose";

// create a schema for the individual user
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
    required: true,
  },
});

individualUserAuthSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    if (this.password !== this.confirmPassword) {
      return next(new Error("Passwords do not match"));
    }
  }
  next();
});

// create a model for the individual user
const IndividualUser = mongoose.model(
  "IndividualUser",
  individualUserAuthSchema
);

export default IndividualUser;