"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
// Expire token after 1 hour
const passwordTokenSchema = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "IndividualUser",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: 3600,
        default: Date.now,
    },
});
passwordTokenSchema.pre("save", async function (next) {
    // Hash the token
    if (this.isModified("token")) {
        this.token = await (0, bcrypt_1.hash)(this.token, 10);
    }
    next();
});
passwordTokenSchema.methods.compareToken = async function (token) {
    const result = await (0, bcrypt_1.compare)(token, this.token);
    return result;
};
exports.default = (0, mongoose_1.model)("PasswordToken", passwordTokenSchema);
