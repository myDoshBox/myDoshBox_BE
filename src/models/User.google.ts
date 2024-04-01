import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for user documents
interface UserDocument extends Document {
  sub: string;
  name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  createdAt: Date;
}

// Define the Mongoose schema for users
const UserSchema = new Schema<UserDocument>({
  sub: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  email_verified: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Mongoose model
const Users = mongoose.model<UserDocument>('User', UserSchema);

// Export the model and interface
export default Users;
export { UserDocument };
