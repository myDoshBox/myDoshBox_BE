import { Model, Schema, ObjectId, model } from "mongoose";
import {hash, compare} from "bcrypt"

export interface OrganizationDocument{
    _id: ObjectId;
    email: string;
    password: string;
    phone: string;
    verified: boolean;
}

interface OrganizationMethods {
    comparePassword(password: string): Promise<boolean>;
}

const organizationSchema = new Schema<OrganizationDocument>({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: {type: String, required: true},
    verified: {type: Boolean, default: false},
}, {timestamps: true});
 
organizationSchema.pre('save', async function (next) {
    if (this.isModified('password')){
        this.password = await hash(this.password, 10);

    }
    next()
});

organizationSchema.methods.comparePassword = async function (password: string) {
    const result = await compare(password, this.password);
    return result;
};

export default model("Organization", organizationSchema) as Model<OrganizationDocument, {}, OrganizationMethods>


 