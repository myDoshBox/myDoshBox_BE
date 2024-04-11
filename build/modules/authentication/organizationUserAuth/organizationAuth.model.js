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
const validator_utils_1 = require("../../../utils/validator.utils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const organizationalSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name"],
    },
    orgEmail: {
        type: String,
        required: [true, "Please tell us your email"],
        lowercase: true,
        validate: {
            validator: validator_utils_1.emailValidator,
            message: "Please provide a valid email address",
        },
    },
    email: {
        type: String,
        required: [true, "Please tell us your email"],
        unique: true,
        lowercase: true,
        validate: {
            validator: validator_utils_1.emailValidator,
            message: "Please provide a valid email address",
        },
    },
    password: {
        type: String,
        select: false,
    },
    passwordConfirmation: {
        type: String,
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});
// Hash password before saving to the database
organizationalSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        this.password = yield bcryptjs_1.default.hash(this.password, 12);
        next();
    });
});
organizationalSchema.methods.correctPassword = function (candidatePassword, userPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(candidatePassword, userPassword);
    });
};
organizationalSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    console.log({ resetToken }, this.passwordResetToken);
    const resetExpires = new Date();
    resetExpires.setMinutes(resetExpires.getMinutes() + 60); // Add 10 minutes to the current time
    this.passwordResetExpires = resetExpires;
    return resetToken;
};
const OrganizationModel = mongoose_1.default.model("Organization", organizationalSchema);
exports.default = OrganizationModel;
