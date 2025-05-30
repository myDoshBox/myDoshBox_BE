"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const validator_utils_1 = require("../../../utilities/validator.utils");
const bcrypt_1 = require("bcrypt");
// import bcrypt from "bcryptjs";
const crypto_1 = __importDefault(require("crypto"));
const individualUserSchema = new mongoose_1.Schema({
    orguser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "orgUser", // Reference to User model
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Please tell us your email"],
        lowercase: true,
        trim: true,
        minlength: [5, "Email must be at least 5 characters"],
        validate: {
            validator: validator_utils_1.emailValidator,
            message: "Invalid email format",
        },
    },
    phone_number: {
        type: String,
        trim: true,
        required: false,
    },
    email_verified: {
        type: Boolean,
        default: false,
    },
    sub: String,
    role: {
        type: String,
        enum: ["ind", "g-ind"],
        required: [true, "Please provide role"],
    },
    picture: String,
    password: {
        type: String,
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });
individualUserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        try {
            const saltRounds = 10;
            this.password = await (0, bcrypt_1.hash)(this.password, saltRounds);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (err) {
            next(err);
        }
    }
    next();
});
individualUserSchema.methods.comparePassword = async function (candidatePassword) {
    return await (0, bcrypt_1.compare)(candidatePassword, this.password);
};
individualUserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    // console.log({ resetToken }, this.passwordResetToken);
    const resetExpires = new Date();
    resetExpires.setMinutes(resetExpires.getMinutes() + 10); // Add 10 minutes to the current time
    this.passwordResetExpires = resetExpires;
    return resetToken;
};
individualUserSchema.methods.comparePasswordResetToken = function (token) {
    var _a;
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    return ((_a = this.passwordResetToken) === null || _a === void 0 ? void 0 : _a.token) === hashedToken;
};
const IndividualUser = (0, mongoose_1.model)("IndividualUser", individualUserSchema);
exports.default = IndividualUser;
