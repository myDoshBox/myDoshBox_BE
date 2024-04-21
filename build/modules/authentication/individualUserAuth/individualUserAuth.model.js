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
const mongoose_1 = require("mongoose");
const validator_utils_1 = require("../../../utilities/validator.utils");
const bcrypt_1 = require("bcrypt");
const crypto_1 = __importDefault(require("crypto"));
const individualUserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [5, "Email must be at least 5 characters"],
        validate: {
            validator: validator_utils_1.emailValidator,
            message: "Invalid email format",
        },
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
        minlength: [6, "Password must be at least 6 characters"],
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: {
        token: {
            type: String,
        },
        createdAt: {
            type: Date,
            expires: "1h",
            default: Date.now(),
            select: false,
        },
    },
}, { timestamps: true });
individualUserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password")) {
            try {
                const saltRounds = 10;
                this.password = yield (0, bcrypt_1.hash)(this.password, saltRounds);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (err) {
                return next(err);
            }
        }
        next();
    });
});
individualUserSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, bcrypt_1.compare)(candidatePassword, this.password);
    });
};
individualUserSchema.methods.comparePasswordResetToken = function (token) {
    var _a;
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    return ((_a = this.passwordResetToken) === null || _a === void 0 ? void 0 : _a.token) === hashedToken;
};
individualUserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    this.passwordResetToken = {
        token: crypto_1.default.createHash("sha256").update(resetToken).digest("hex"),
    };
    return resetToken;
};
const IndividualUser = (0, mongoose_1.model)("IndividualUser", individualUserSchema);
exports.default = IndividualUser;
