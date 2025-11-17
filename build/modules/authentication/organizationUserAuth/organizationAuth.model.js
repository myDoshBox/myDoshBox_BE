"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_utils_1 = require("../../../utilities/validator.utils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = require("bcrypt");
const organizationalSchema = new mongoose_1.default.Schema({
    organization_name: {
        type: String,
        required: [true, "Please tell us your name"],
    },
    contact_number: {
        type: String,
        required: [true, "Please provide a contact number"],
    },
    organization_email: {
        type: String,
        required: [true, "Please tell us your email"],
        lowercase: true,
        unique: true,
        validate: {
            validator: validator_utils_1.emailValidator,
            message: "Please provide a valid email address",
        },
    },
    contact_email: {
        type: String,
        required: [true, "Please provide a contact email"],
        lowercase: true,
        validate: {
            validator: validator_utils_1.emailValidator,
            message: "Please provide a valid email address",
        },
    },
    email_verified: {
        type: Boolean,
        default: false,
    },
    sub: { type: String },
    picture: { type: String },
    role: {
        type: String,
        enum: ["org"],
        required: [true, "Please provide role"],
    },
    password: {
        type: String,
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });
// Hash password before saving to the database
organizationalSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.password) {
            return next();
        }
        if (!this.isModified("password"))
            return next();
        this.password = yield bcryptjs_1.default.hash(this.password, 12);
        next();
    });
});
organizationalSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, bcrypt_1.compare)(candidatePassword, this.password);
    });
};
organizationalSchema.methods.createPasswordResetToken = function () {
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
const OrganizationModel = mongoose_1.default.model("OrganizationUser", organizationalSchema);
exports.default = OrganizationModel;
