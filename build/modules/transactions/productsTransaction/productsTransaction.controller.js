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
exports.getAllEscrowProductTransaction = exports.getSingleEscrowProductTransaction = exports.confirmEscrowProductTransaction = exports.verifyEscrowProductTransactionPayment = exports.initiateEscrowProductTransaction = void 0;
const uuid_1 = require("uuid");
const productsTransaction_validation_1 = require("./productsTransaction.validation");
// import { Product } from "../models/Product"; // Import the Product model
const individualUserAuth_model1_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model1")); // Import the User model
// import { OrganizationUser } from "../../authentication/organizationUserAuth/organizationAuth.model"; // Import the User model
const errorHandling_middleware_1 = require("../../../middlewares/errorHandling.middleware"); // Import your CustomError class
const productsTransaction_model_1 = __importDefault(require("./productsTransaction.model"));
// import axios from "axios";
const productsTransaction_paystack_1 = require("./productsTransaction.paystack");
const productTransaction_mail_1 = require("./productTransaction.mail");
// import {
//   sendEscrowInitiationEmail,
//   sendEscrowInitiationEmailToVendor,
// } from "./productTransaction.mail";
// import { sendEmail } from "../utils/email"; // Import your email utility
const initiateEscrowProductTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { 
    // transaction_id,
    vendor_phone_number, buyer_email, // get it from the frontend
    vendor_email, transaction_type, product_name, 
    // product_category,
    product_quantity, product_price, transaction_total, product_image, product_description, signed_escrow_doc,
    // transaction_status,
    // payment_status,
    // profit_made,
     } = req.body;
    // Validate required fields
    (0, productsTransaction_validation_1.validateProductFields)({
        // transaction_id,
        vendor_phone_number,
        // buyer_email,
        vendor_email,
        transaction_type,
        product_name,
        // product_category,
        product_quantity,
        product_price,
        transaction_total,
        product_image,
        product_description,
        // signed_escrow_doc,
        // transaction_status,
        // payment_status,
        // profit_made,
    }, next);
    try {
        // Find the user who initiated the transaction
        // const user = req.user;
        const user = yield individualUserAuth_model1_1.default.findOne({ email: buyer_email }); // Assuming req.user is populated with authenticated user's info
        console.log("user", user);
        if (!user) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "User not found"));
        }
        else {
            // buyer pays for the escrow
            const transaction_id = yield (0, uuid_1.v4)(); // Generate a random UUID
            console.log(transaction_id);
            const data = {
                reference: transaction_id,
                amount: product_price,
                email: buyer_email,
            };
            const buyerPaysForEscrow = yield (0, productsTransaction_paystack_1.paymentForEscrowProductTransaction)(data);
            console.log(buyerPaysForEscrow);
            // details are saved in the db
            const newTransaction = new productsTransaction_model_1.default({
                transaction_id,
                vendor_phone_number,
                buyer_email,
                vendor_email,
                transaction_type,
                product_name,
                // product_category,
                product_quantity,
                product_price,
                transaction_total,
                product_image,
                product_description,
                signed_escrow_doc,
                // transaction_status,
                // verified_payment_status: false,
                // profit_made,
                // user: user?.email,
            });
            yield newTransaction.save();
            // send response
            res.json({
                buyerPaysForEscrow,
                status: "successful",
                message: "You have successfully initiated an escrow, please proceed to make payment.",
            });
        }
    }
    catch (error) {
        console.log(error);
        // return next(errorHandler(500, "server error"));
        return next((0, errorHandling_middleware_1.errorHandler)(500, "server error"));
    }
});
exports.initiateEscrowProductTransaction = initiateEscrowProductTransaction;
const verifyEscrowProductTransactionPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reference } = req.body;
        const transaction = yield productsTransaction_model_1.default.findOne({
            transaction_id: reference,
            verified_payment_status: false,
        });
        if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "transaction not found or your transaction has been verified"));
        }
        else {
            yield (0, productsTransaction_paystack_1.verifyPaymentForEscrowProductTransaction)(reference);
            // console.log(verifyTransaction);
            // console.log(reference);
            yield productsTransaction_model_1.default.updateOne({ transaction_id: reference }, {
                transaction_status: true,
                verified_payment_status: true,
            });
            // THIS IS WHEN WE SEND THE MESSAGES, NOT DURING INITIATION
            // pull out the content of the product table for mail delivery
            const { buyer_email, transaction_id, vendor_email, product_name, product_price, } = transaction;
            // const findProductDetails = await Product.findOne({
            //   email: buyer_email,
            // });
            // const buyer_email =
            // Send email to the initiator
            yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToInitiator)(buyer_email, transaction_id);
            // await sendEscrowInitiationEmail(user?.email, transaction_id);
            // Send email to the vendor
            yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToVendor)(transaction_id, vendor_email, product_name, product_price);
            // send response
            res.json({
                status: "successful",
                message: "Payment has been successfully verified.",
            });
        }
    }
    catch (error) {
        console.log(error);
        // return next(errorHandler(500, "server error"));
        return next((0, errorHandling_middleware_1.errorHandler)(500, "server error"));
    }
});
exports.verifyEscrowProductTransactionPayment = verifyEscrowProductTransactionPayment;
const confirmEscrowProductTransaction = () => __awaiter(void 0, void 0, void 0, function* () {
    // when the mail link is clicked
    // they are redirected to a signup
    // they signup and are redirected to the page for confirming the escrow
    // when they accept/confirm, a message/popup to tell the seller the next steps.
    // mail is sent to the buyer that the seller has agreed and will be sending the goods
    // the mail contains a link to the page where the buyer can click on so that they are redirected to where they can confirm that they like the product and close the escrow.
});
exports.confirmEscrowProductTransaction = confirmEscrowProductTransaction;
const getSingleEscrowProductTransaction = () => __awaiter(void 0, void 0, void 0, function* () { });
exports.getSingleEscrowProductTransaction = getSingleEscrowProductTransaction;
const getAllEscrowProductTransaction = () => __awaiter(void 0, void 0, void 0, function* () { });
exports.getAllEscrowProductTransaction = getAllEscrowProductTransaction;
