"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const productTransactionSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "IndividualUser", // Reference to User model
        // required: true,
    },
    transaction_id: {
        type: String,
        required: true,
    },
    buyer_email: {
        type: String,
    },
    vendor_name: {
        type: String,
        required: true,
    },
    vendor_phone_number: {
        type: String,
        required: true,
    },
    vendor_email: {
        type: String,
        required: true,
    },
    transaction_type: {
        type: String,
        required: true,
    },
    product_name: {
        type: String,
        required: true,
    },
    // product_category: {
    //   type: String,
    //   // enum: validProductCategories,
    //   required: true,
    // },
    product_quantity: {
        type: Number,
        required: true,
    },
    product_price: {
        type: Number,
        required: true,
    },
    transaction_total: {
        type: Number,
        required: true,
    },
    product_image: {
        type: String,
        required: true,
    },
    product_description: {
        type: String,
        required: true,
    },
    signed_escrow_doc: {
        type: String,
        // required: true,
    },
    delivery_address: {
        type: String,
        // required: true,
    },
    verified_payment_status: {
        type: Boolean,
        default: false,
    },
    transaction_status: {
        type: String,
        default: "processing", // default to #processing, #cancelled when the initiator stops it, #inDispute when a dispute is raised and then #completed when done
    },
    seller_confirm_status: {
        type: Boolean,
        default: false,
    },
    // profit_made: {
    //   type: Number,
    //   default: 0,
    // },
}, {
    timestamps: true,
});
const ProductTransaction = mongoose_1.default.model("Product", productTransactionSchema);
exports.default = ProductTransaction;
