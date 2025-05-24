import mongoose, { Schema } from "mongoose";

interface IBlacklistedToken {
  token: string;
}

const blacklistedTokenSchema = new Schema<IBlacklistedToken>({
  token: { type: String },
});

const BlacklistedToken = mongoose.model<IBlacklistedToken>(
  "BlacklistedToken",
  blacklistedTokenSchema
);

export { BlacklistedToken };
