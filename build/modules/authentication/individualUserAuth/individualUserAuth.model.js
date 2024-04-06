"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// create a schema for the individual user
const individualUserAuthSchema = new mongoose_1.default.Schema({
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
const IndividualUser = mongoose_1.default.model("IndividualUser", individualUserAuthSchema);
exports.default = IndividualUser;
