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
exports.confirmEscrowProductTransaction = exports.paymentForEscrowProductTransaction = exports.initiateEscrowProductTransaction = void 0;
const productsTransaction_validation_1 = require("./productsTransaction.validation");
// import { Product } from "../models/Product"; // Import the Product model
const individualUserAuth_model1_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model1")); // Import the User model
// import { OrganizationUser } from "../../authentication/organizationUserAuth/organizationAuth.model"; // Import the User model
const errorHandling_middleware_1 = require("../../../middlewares/errorHandling.middleware"); // Import your CustomError class
const productsTransaction_model_1 = __importDefault(require("./productsTransaction.model"));
const axios_1 = __importDefault(require("axios"));
// import {
//   sendEscrowInitiationEmail,
//   sendEscrowInitiationEmailToVendor,
// } from "./productTransaction.mail";
// import { sendEmail } from "../utils/email"; // Import your email utility
const initiateEscrowProductTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { transaction_id, vendor_phone_number, buyer_email, // get it from the frontend
    vendor_email, transaction_type, product_name, product_category, product_quantity, product_price, product_image, product_description, signed_escrow_doc, transaction_status, payment_status, profit_made, } = req.body;
    // Validate required fields
    (0, productsTransaction_validation_1.validateProductFields)({
        transaction_id,
        vendor_phone_number,
        buyer_email,
        vendor_email,
        transaction_type,
        product_name,
        product_category,
        product_quantity,
        product_price,
        product_image,
        product_description,
        signed_escrow_doc,
        transaction_status,
        payment_status,
        profit_made,
    }, next);
    try {
        // Find the user who initiated the transaction
        // const user = req.user;
        const user = yield individualUserAuth_model1_1.default.findById((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.email); // Assuming req.user is populated with authenticated user's info
        if (!user) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "User not found"));
        }
        else {
            // buyer pays for the escrow
            const data = {
                reference: transaction_id,
                amount: product_price,
                email: buyer_email,
            };
            const buyerPaysForEscrow = yield (0, exports.paymentForEscrowProductTransaction)(data);
            console.log(buyerPaysForEscrow);
            // const paymentData: IPayment = {
            //   transaction_id,
            //   product_price,
            //   currency: "NGN",
            //   user: user,
            //   phone_number,
            //   product_description,
            //   is_permanent: true,
            //   narration,
            //   redirect_url,
            //   customer,
            // };
            // details are saved in the db
            // Send email to the initiator
            // await sendEscrowInitiationEmail(user?.email, transaction_id);
            // Send email to the vendor
            const newTransaction = new productsTransaction_model_1.default({
                transaction_id,
                vendor_phone_number,
                buyer_email,
                vendor_email,
                transaction_type,
                product_name,
                product_category,
                product_quantity,
                product_price,
                product_image,
                product_description,
                signed_escrow_doc,
                transaction_status,
                payment_status,
                profit_made,
                user: user === null || user === void 0 ? void 0 : user.email,
            });
            yield newTransaction.save();
            // send response
            res.status(201).json({
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
const paymentForEscrowProductTransaction = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const API_URL = process.env.PAYSTACK_BASE_URL;
    const API_KEY = process.env.PAYSTACK_PAYMENT_KEY;
    const response = yield axios_1.default.post(
    // `${API_URL}/charges?type=bank_transfer`,
    `${API_URL}/transaction/initialize`, {
        reference: data.reference,
        amount: data.amount * 100,
        email: data.email,
        currency: "NGN",
        channels: ["bank_transfer"],
        callback_url: `http://localhost:3005?reference=${data.reference}`,
        // user: data.user,
        // phone_number: data.phone_number,
        // product_description: data.product_description,
        // is_permanent: data.is_permanent,
        // narration: data.narration,
        // redirect_url: data.redirect_url,
        // customer: data.customer,
    }, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "cache-control": "no-cache",
        },
    });
    return response.data;
    // // Send email to the initiator
    // await sendEscrowInitiationEmail(user?.email, transaction_id);
    // // Send email to the vendor
    // await sendEscrowInitiationEmailToVendor(
    //   user?.email,
    //   product_name,
    //   product_price,
    //   transaction_id
    // );
    // const https = require("https");
    // const params = JSON.stringify({
    //   email: "customer@email.com",
    //   amount: "20000",
    // });
    // const options = {
    //   hostname: "api.paystack.co",
    //   port: 443,
    //   path: "/transaction/initialize",
    //   method: "POST",
    //   headers: {
    //     Authorization: "Bearer SECRET_KEY",
    //     "Content-Type": "application/json",
    //   },
    // };
    // const req = https
    //   .request(options, (res) => {
    //     let data = "";
    //     res.on("data", (chunk) => {
    //       data += chunk;
    //     });
    //     res.on("end", () => {
    //       console.log(JSON.parse(data));
    //     });
    //   })
    //   .on("error", (error) => {
    //     console.error(error);
    //   });
    // req.write(params);
    // req.end();
});
exports.paymentForEscrowProductTransaction = paymentForEscrowProductTransaction;
const confirmEscrowProductTransaction = () => __awaiter(void 0, void 0, void 0, function* () {
    // when the mail link is clicked
    // they are redirected to a signup
    // they signup and are redirected to the page for confirming the escrow
    // when they accept/confirm, a message/popup to tell the seller the next steps.
    // mail is sent to the buyer that the seller has agreed and will be sending the goods
    // the mail contains a link to the page where the buyer can click on so that they are redirected to where they can confirm that they like the product and close the escrow.
});
exports.confirmEscrowProductTransaction = confirmEscrowProductTransaction;
