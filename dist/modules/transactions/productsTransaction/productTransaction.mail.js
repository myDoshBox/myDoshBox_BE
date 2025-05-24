"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccessfulEscrowEmailToVendor = exports.sendSuccessfulEscrowEmailToInitiator = exports.sendShippingDetailsEmailToVendor = exports.sendShippingDetailsEmailToInitiator = exports.sendEscrowInitiationEmailToVendor = exports.sendEscrowInitiationEmailToInitiator = void 0;
const email_utils_1 = require("../../../utilities/email.utils");
// const DEPLOYED_FRONTEND_BASE_URL = process.env.DEPLOYED_FRONTEND_BASE_URL;
const sendEscrowInitiationEmailToInitiator = async (buyer_email, 
//   token: string,
transaction_id, transaction_total) => {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        // const transactionURL = `${DEPLOYED_FRONTEND_BASE_URL}/product-transaction/userdashboard/initiate-escrow-product-transaction?transaction=${transaction_id}`;
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
          <p>Dear ${buyer_email},</p>
          <p>Your escrow transaction of ${transaction_total} with the id: ${transaction_id} has been initiated successfully. Please wait for the vendor's confirmation.</p>

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
        const info = await transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "Escrow Transaction Initiated Successfully",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
};
exports.sendEscrowInitiationEmailToInitiator = sendEscrowInitiationEmailToInitiator;
//  const vendorMailContent = `A new escrow transaction has been initiated for the following product: ${product_name}. Please confirm the details and proceed with the shipping. The price for the product is ${product_price} without the 5% charge. Transaction ID: ${transaction_id}`;
//  await sendEmail(vendor_email, "Confirm Escrow Transaction", vendorMailContent);
const sendEscrowInitiationEmailToVendor = async (transaction_id, vendor_name, vendor_email, product_name, product_price
//   token: string,
) => {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        // const transactionURL = `${DEPLOYED_FRONTEND_BASE_URL}/product-transaction/confirm-escrow-product-transaction?transaction=${transaction_id}`;
        // const transactionURL = `http://localhost:3000/userdashboard/confirm-escrow-product-transaction?transaction=${transaction_id}`;
        // const verificationURL = `http://localhost:3000/auth/verify-email?token=${token}`;
        const signup = "https://mydoshbox.vercel.app/signup";
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
          <p>Dear ${vendor_name},</p>
          <p>
            A new escrow transaction has been initiated for the following product: ${product_name} with the price: ${product_price} and transaction id, ${transaction_id}. Please proceed to the app to confirm that the product requested is as discussed and also fill the out shipping details form attached so that the product can be sent to the buyer
          </p>

          <p>
            If you do not have an account with us, please click on the link provided below to create an account in order to fufil your customer's request.
          </p>

          <a href="${signup}" style="text-decoration: none; color: #007bff;">http://localhost:3000/signup</a>

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
        const info = await transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "Escrow Transaction Initiation by Buyer",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
};
exports.sendEscrowInitiationEmailToVendor = sendEscrowInitiationEmailToVendor;
// SHIPPING DETAILS MAIL
const sendShippingDetailsEmailToInitiator = async (buyer_email, shipping_company, delivery_person_name, delivery_person_number, delivery_date, pick_up_address) => {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        // const transactionURL = `${DEPLOYED_FRONTEND_BASE_URL}/product-transaction/userdashboard/initiate-escrow-product-transaction?transaction=${transaction_id}`;
        // const verificationURL = `http://localhost:3000/auth/verify-email?token=${token}`;
        const supportEmail = "mydoshbox@gmail.com";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Vendor Has Sent The Shipping Details For Your Transaction</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${buyer_email},</p>

            <p>The seller has agreed with the transaction that you have initiated and has sent you the shipping details for your product. The shipping details are provided below.</p>

            Shipping Company: ${shipping_company}
            Delivery Person Name: ${delivery_person_name}
            Delivery Person Number: ${delivery_person_number}
            Delivery Date: ${delivery_date}
            Pick Up Address: ${pick_up_address}
            
            <p>Please be sure to confirm when you have received the product, thank you</p>

          
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
        const info = await transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "Shipping Details from Vendor",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
};
exports.sendShippingDetailsEmailToInitiator = sendShippingDetailsEmailToInitiator;
const sendShippingDetailsEmailToVendor = async (transaction_id = "", vendor_name = "", vendor_email = "", product_name = ""
//   token: string,
) => {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        // const transactionURL = `${DEPLOYED_FRONTEND_BASE_URL}/product-transaction/confirm-escrow-product-transaction?transaction=${transaction_id}`;
        // const transactionURL = `http://localhost:3000/userdashboard/confirm-escrow-product-transaction?transaction=${transaction_id}`;
        // const verificationURL = `http://localhost:3000/auth/verify-email?token=${token}`;
        const supportEmail = "mydoshbox@gmail.com";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You have Successfully Confirmed the Escrow With Shipping Details</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${vendor_name},</p>
          <p>You have successfully confirmed the escrow for the product, ${product_name} with transaction id, ${transaction_id}.</p>
        

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
        const info = await transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "Escrow Transaction Successfully Confirmed With Shipping Details",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
};
exports.sendShippingDetailsEmailToVendor = sendShippingDetailsEmailToVendor;
//  const vendorMailContent = `A new escrow transaction has been initiated for the following product: ${product_name}. Please confirm the details and proceed with the shipping. The price for the product is ${product_price} without the 5% charge. Transaction ID: ${transaction_id}`;
//  await sendEmail(vendor_email, "Confirm Escrow Transaction", vendorMailContent);
// export const sendShippingDetailsEmailToVendor = async (
//   // transaction_id: string | undefined,
//   // vendor_name: string | undefined,
//   // vendor_email: string | undefined,
//   // product_name: string | undefined
//   transaction_id: string = "",
//   vendor_name: string = "",
//   vendor_email: string = "",
//   product_name: string = ""
//   // product_price: number
//   //   token: string,
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     // const transactionURL = `${DEPLOYED_FRONTEND_BASE_URL}/product-transaction/confirm-escrow-product-transaction?transaction=${transaction_id}`;
//     // const transactionURL = `http://localhost:3000/product-transaction/confirm-escrow-product-transaction?transaction=${transaction_id}`;
//     // const verificationURL = `http://localhost:3000/auth/verify-email?token=${token}`;
//     const supportEmail = "mydoshbox@gmail.com";
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>You have Successfully Confirmed the Escrow With Shipping Details</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear ${vendor_name},</p>
//           <p>You have successfully confirmed the escrow for the product, ${product_name} with transaction id, ${transaction_id}.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Thank you for choosing Doshbox. Thank you for using our service</p>
//           <p>Best regards,<br>
//           <p>Doshbox<br>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     // console.log("here");
//     const info = await transport.sendMail({
//       to: vendor_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject:
//         "Escrow Transaction Successfully Confirmed With Shipping Details",
//       html: emailMessage, // Assign the HTML string directly to the html property
//     });
//     console.log("info mesage id: " + info?.messageId);
//     console.log("info accepted: " + info?.accepted);
//     console.log("info rejected: " + info?.rejected);
//   } catch (err) {
//     console.log(err);
//   }
// };
const sendSuccessfulEscrowEmailToInitiator = async (
// transaction_id: string | undefined,
// vendor_name: string | undefined,
// vendor_email: string | undefined,
// product_name: string | undefined
transaction_id = "", vendor_name = "", buyer_email = "", product_name = ""
// product_price: number
//   token: string,
) => {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        // const transactionURL = `${DEPLOYED_FRONTEND_BASE_URL}/product-transaction/confirm-escrow-product-transaction?transaction=${transaction_id}`;
        // const transactionURL = `http://localhost:3000/product-transaction/confirm-escrow-product-transaction?transaction=${transaction_id}`;
        // const verificationURL = `http://localhost:3000/auth/verify-email?token=${token}`;
        const supportEmail = "mydoshbox@gmail.com";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Successfully Completed Escrow Transaction</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${buyer_email},</p>
          <p>
            the escrow with ${vendor_name} for the product, ${product_name} with transaction id, ${transaction_id} has been successfully completed, thank you for choosing us.
          </p>

          <p>
            If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.
          </p>

          <p>Thank you for choosing Doshbox.</p>
          <p>Best regards,<br>
          <p>Doshbox<br>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        // console.log("here");
        const info = await transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "Successfully Completion of Escrow Transaction",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
};
exports.sendSuccessfulEscrowEmailToInitiator = sendSuccessfulEscrowEmailToInitiator;
const sendSuccessfulEscrowEmailToVendor = async (
// transaction_id: string | undefined,
// vendor_name: string | undefined,
// vendor_email: string | undefined,
// product_name: string | undefined
transaction_id = "", vendor_name = "", vendor_email = "", product_name = ""
// product_price: number
//   token: string,
) => {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        // const transactionURL = `${DEPLOYED_FRONTEND_BASE_URL}/product-transaction/confirm-escrow-product-transaction?transaction=${transaction_id}`;
        // const transactionURL = `http://localhost:3000/product-transaction/confirm-escrow-product-transaction?transaction=${transaction_id}`;
        // const verificationURL = `http://localhost:3000/auth/verify-email?token=${token}`;
        const supportEmail = "mydoshbox@gmail.com";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You have Successfully Completed This Escrow</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${vendor_name},</p>
          <p>You have successfully confirmed the escrow for the product, ${product_name} with transaction id, ${transaction_id}. Your money will be released to you within the next 24 hours</p>

          <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>

          <p>Thank you for choosing Doshbox.</p>
          <p>Best regards,<br>
          <p>Doshbox<br>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        // console.log("here");
        const info = await transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "Successful Completion of This Escrow",
            html: emailMessage, // Assign the HTML string directly to the html property
        });
        console.log("info mesage id: " + (info === null || info === void 0 ? void 0 : info.messageId));
        console.log("info accepted: " + (info === null || info === void 0 ? void 0 : info.accepted));
        console.log("info rejected: " + (info === null || info === void 0 ? void 0 : info.rejected));
    }
    catch (err) {
        console.log(err);
    }
};
exports.sendSuccessfulEscrowEmailToVendor = sendSuccessfulEscrowEmailToVendor;
