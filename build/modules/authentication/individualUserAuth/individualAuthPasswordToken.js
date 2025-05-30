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
passwordTokenSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Hash the token
        if (this.isModified("token")) {
            this.token = yield bcrypt_1.hash(this.token, 10);
        }
        next();
    });
});
passwordTokenSchema.methods.compareToken = function (token) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield bcrypt_1.compare(token, this.token);
        return result;
    });
};
exports.default = mongoose_1.model("PasswordToken", passwordTokenSchema);
