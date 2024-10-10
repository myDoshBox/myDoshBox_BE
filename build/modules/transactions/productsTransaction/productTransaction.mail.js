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
exports.sendEscrowInitiationEmailToVendor = exports.sendEscrowInitiationEmailToInitiator = void 0;
const email_utils_1 = require("../../../utilities/email.utils");
const DEPLOYED_FRONTEND_BASE_URL = process.env.DEPLOYED_FRONTEND_BASE_URL;
const sendEscrowInitiationEmailToInitiator = (buyer_email, 
//   token: string,
transaction_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const transactionURL = `${DEPLOYED_FRONTEND_BASE_URL}/product-transaction?initiate-escrow-product-transaction=${transaction_id}`;
        // const verificationURL = `http://localhost:3000/auth/verify-email?token=${token}`;
        const supportEmail = "mydoshbox@gmail.com";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Escrow Transaction Initiated Successfully</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <h1 style="margin: 0;">Please Verify Your Email Address</h1>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${buyer_email},</p>
          <p>Your escrow transaction has been initiated successfully. Please wait for the vendor's confirmation. Transaction ID: ${transaction_id}</p>

          <p>You can click on the link to view the transaction:</p>
          <p><a href="${transactionURL}" style="text-decoration: none; color: #007bff;">View Transaction</a></p>
          <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
          <p>Thank you for choosing Doshbox. Thank you for using our service</p>
          <p>Best regards,<br>
          <p>Doshbox<br>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        // console.log("here");
        const info = yield transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "Escrow Transaction Initiated",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
});
exports.sendEscrowInitiationEmailToInitiator = sendEscrowInitiationEmailToInitiator;
//  const vendorMailContent = `A new escrow transaction has been initiated for the following product: ${product_name}. Please confirm the details and proceed with the shipping. The price for the product is ${product_price} without the 5% charge. Transaction ID: ${transaction_id}`;
//  await sendEmail(vendor_email, "Confirm Escrow Transaction", vendorMailContent);
const sendEscrowInitiationEmailToVendor = (transaction_id, vendor_email, product_name, product_price
//   token: string,
) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const transactionURL = `${DEPLOYED_FRONTEND_BASE_URL}/product-transaction/confirm-escrow-product-transaction?transaction=${transaction_id}`;
        // const verificationURL = `http://localhost:3000/auth/verify-email?token=${token}`;
        const supportEmail = "mydoshbox@gmail.com";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A Buyer has Initiated an Escrow Transaction with You</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <h1 style="margin: 0;">Please Verify Your Email Address</h1>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${vendor_email},</p>
          <p>A new escrow transaction has been initiated for the following product: ${product_name} with the price: ${product_price}.</p>

          <p>Please click on the link to be redirected to the product summary for confirmation:</p>
          <p><a href="${transactionURL}" style="text-decoration: none; color: #007bff;">View Transaction</a></p>
          <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
          <p>Thank you for choosing Doshbox. Thank you for using our service</p>
          <p>Best regards,<br>
          <p>Doshbox<br>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        // console.log("here");
        const info = yield transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "Escrow Transaction Initiation",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
});
exports.sendEscrowInitiationEmailToVendor = sendEscrowInitiationEmailToVendor;