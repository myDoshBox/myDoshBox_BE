import { compare, hash } from "bcrypt";
import mongoose, {  Model, ObjectId, Schema } from "mongoose";

export interface IndividualUserDocument {
    _id: ObjectId;
    email: string;
    password: string;
    phoneNumber: string;
    verified: boolean;
}

interface IndividualUserMethods {
    comparePassword(password: string): Promise<boolean>;
}

// create a schema for the individual user
const individualUserAuthSchema = new Schema<IndividualUserDocument>({

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
    verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Method to compare passwords
individualUserAuthSchema.methods.comparePassword = async function (password: string) {
    const result = await compare(password, this.password);
    return result;
};

// Hash password before saving
individualUserAuthSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await hash(this.password, 10);
    }
    next();
});

// create a model for the individual user
export default mongoose.model<IndividualUserDocument, Model<IndividualUserMethods>>(
    "IndividualUser",
    individualUserAuthSchema 
);
