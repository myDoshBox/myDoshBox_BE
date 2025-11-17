"use strict";
// import { generateMailTransporter } from "../../../utilities/email.utils";
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
exports.sendDisputeCancelledMailToSeller = exports.sendDisputeCancelledMailToBuyer = exports.sendMediatorRequestedMailToSeller = exports.sendMediatorRequestedMailToBuyer = exports.sendAutoEscalationMailToSeller = exports.sendAutoEscalationMailToBuyer = exports.sendResolutionRejectedToSeller = exports.sendResolutionRejectedToBuyer = exports.sendResolutionAcceptedMailToSeller = exports.sendResolutionAcceptedMailToBuyer = exports.sendResolutionProposedToSeller = exports.sendResolutionProposedToBuyer = exports.sendDisputeMailToSeller = exports.sendDisputeMailToBuyer = void 0;
// export const sendDisputeMailToBuyer = async (
//   buyer_email: string,
//   product_name: string,
//   dispute_description: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const supportEmail = "mydoshbox@gmail.com";
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Dispute Raised by Seller</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear ${buyer_email},</p>
//           <p>The seller of the goods, ${product_name} has raised a dispute against your transaction</p>
//           <p>${dispute_description}</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Thank you for coming onboard as a mediator</p>
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
//       to: buyer_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Welcome Onboard Mediator",
//       html: emailMessage, // Assign the HTML string directly to the html property
//     });
//     console.log("info mesage id: " + info?.messageId);
//     console.log("info accepted: " + info?.accepted);
//     console.log("info rejected: " + info?.rejected);
//   } catch (error: unknown) {
//     console.error("Error sending mail", error);
//   }
// };
// export const sendDisputeMailToSeller = async (
//   vendor_email: string,
//   product_name: string,
//   dispute_description: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const supportEmail = "mydoshbox@gmail.com";
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Dispute Raised by Seller</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear ${vendor_email},</p>
//           <p>The buyer of the goods, ${product_name} has raised a dispute against your product</p>
//           <p>${dispute_description}</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Thank you for coming onboard as a mediator</p>
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
//       subject: "Welcome Onboard Mediator",
//       html: emailMessage, // Assign the HTML string directly to the html property
//     });
//     console.log("info mesage id: " + info?.messageId);
//     console.log("info accepted: " + info?.accepted);
//     console.log("info rejected: " + info?.rejected);
//   } catch (error: unknown) {
//     console.error("Error sending mail", error);
//   }
// };
// export const sendMediatorInvolvementMailToBuyer = async (
//   buyer_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const supportEmail = "mydoshbox@gmail.com";
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Mediator Involved Successful</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear ${buyer_email},</p>
//           <p>The dispute raised for the product, ${product_name} has been assigned to a mediator.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Thank you for coming onboard as a mediator</p>
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
//       to: buyer_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "New Dispute",
//       html: emailMessage, // Assign the HTML string directly to the html property
//     });
//     console.log("info mesage id: " + info?.messageId);
//     console.log("info accepted: " + info?.accepted);
//     console.log("info rejected: " + info?.rejected);
//   } catch (error: unknown) {
//     console.error("Error sending mail", error);
//   }
// };
// export const sendMediatorInvolvementMailToSeller = async (
//   vendor_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const supportEmail = "mydoshbox@gmail.com";
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Mediator Involved Successful</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear ${vendor_email},</p>
//           <p>The dispute raised for the product, ${product_name} has been assigned to a mediator.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Thank you for coming onboard as a mediator</p>
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
//       subject: "New Dispute",
//       html: emailMessage, // Assign the HTML string directly to the html property
//     });
//     console.log("info mesage id: " + info?.messageId);
//     console.log("info accepted: " + info?.accepted);
//     console.log("info rejected: " + info?.rejected);
//   } catch (error: unknown) {
//     console.error("Error sending mail", error);
//   }
// };
// export const sendBuyerResolutionMailToBuyer = async (
//   buyer_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const supportEmail = "mydoshbox@gmail.com";
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Buyer Resolution Message</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear ${buyer_email},</p>
//           <p>You have chosen to resolve the conflict raised by the seller for the product, ${product_name}. The seller has been notified of your choice and will either accept your resolution or involve a mediator</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Thank you for coming onboard as a mediator</p>
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
//       to: buyer_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "New Dispute",
//       html: emailMessage, // Assign the HTML string directly to the html property
//     });
//     console.log("info mesage id: " + info?.messageId);
//     console.log("info accepted: " + info?.accepted);
//     console.log("info rejected: " + info?.rejected);
//   } catch (error: unknown) {
//     console.error("Error sending mail", error);
//   }
// };
// export const sendBuyerResolutionMailToSeller = async (
//   vendor_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const supportEmail = "mydoshbox@gmail.com";
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Buyer Resolution Message</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear ${vendor_email},</p>
//           <p>The buyer has chosen to resolve the conflict you raised for the product, ${product_name}. The buyer awaits your choice to either accept the proposed resolution or involve a mediator</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Thank you for coming onboard as a mediator</p>
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
//       subject: "New Dispute",
//       html: emailMessage, // Assign the HTML string directly to the html property
//     });
//     console.log("info mesage id: " + info?.messageId);
//     console.log("info accepted: " + info?.accepted);
//     console.log("info rejected: " + info?.rejected);
//   } catch (error: unknown) {
//     console.error("Error sending mail", error);
//   }
// };
// export const sendSellerResolutionMailToBuyer = async (
//   buyer_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const supportEmail = "mydoshbox@gmail.com";
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Seller Resolution Message</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear ${buyer_email},</p>
//           <p>The seller has chosen to resolve the conflict you raised for the product, ${product_name}. The seller awaits your choice to either accept the proposed resolution or involve a mediator</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Thank you for coming onboard as a mediator</p>
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
//       to: buyer_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "New Dispute",
//       html: emailMessage, // Assign the HTML string directly to the html property
//     });
//     console.log("info mesage id: " + info?.messageId);
//     console.log("info accepted: " + info?.accepted);
//     console.log("info rejected: " + info?.rejected);
//   } catch (error: unknown) {
//     console.error("Error sending mail", error);
//   }
// };
// export const sendSellerResolutionMailToSeller = async (
//   vendor_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const supportEmail = "mydoshbox@gmail.com";
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Seller Resolution Message</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear ${vendor_email},</p>
//           <p>You have chosen to resolve the conflict raised by the buyer of the product, ${product_name}. The buyer has been notified of your choice and will either accept your resolution or involve a mediator</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Thank you for coming onboard as a mediator</p>
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
//       subject: "New Dispute",
//       html: emailMessage, // Assign the HTML string directly to the html property
//     });
//     console.log("info mesage id: " + info?.messageId);
//     console.log("info accepted: " + info?.accepted);
//     console.log("info rejected: " + info?.rejected);
//   } catch (error: unknown) {
//     console.error("Error sending mail", error);
//   }
// };
// import { generateMailTransporter } from "../../../utilities/email.utils";
// const supportEmail = "mydoshbox@gmail.com";
// /**
//  * Send dispute notification to buyer
//  */
// export const sendDisputeMailToBuyer = async (
//   buyer_email: string,
//   product_name: string,
//   dispute_description: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Dispute Raised</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Buyer,</p>
//           <p>A dispute has been raised by the seller for the product: <strong>${product_name}</strong>.</p>
//           <p><strong>Dispute Description:</strong></p>
//           <p>${dispute_description}</p>
//           <p>Please log in to your account to review the dispute and take appropriate action.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: buyer_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Dispute Raised - Action Required",
//       html: emailMessage,
//     });
//     console.log("Dispute email sent to buyer - Message ID:", info?.messageId);
//   } catch (error: unknown) {
//     console.error("Error sending dispute mail to buyer:", error);
//   }
// };
// /**
//  * Send dispute notification to seller
//  */
// export const sendDisputeMailToSeller = async (
//   vendor_email: string,
//   product_name: string,
//   dispute_description: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Dispute Raised</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Seller,</p>
//           <p>A dispute has been raised by the buyer for the product: <strong>${product_name}</strong>.</p>
//           <p><strong>Dispute Description:</strong></p>
//           <p>${dispute_description}</p>
//           <p>Please log in to your account to review the dispute and take appropriate action.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: vendor_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Dispute Raised - Action Required",
//       html: emailMessage,
//     });
//     console.log("Dispute email sent to seller - Message ID:", info?.messageId);
//   } catch (error: unknown) {
//     console.error("Error sending dispute mail to seller:", error);
//   }
// };
// /**
//  * Send mediator involvement notification to buyer
//  */
// export const sendMediatorInvolvementMailToBuyer = async (
//   buyer_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Mediator Assigned to Dispute</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Buyer,</p>
//           <p>A mediator has been assigned to the dispute for the product: <strong>${product_name}</strong>.</p>
//           <p>The mediator will review the case and make a fair decision. You may be contacted for additional information.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: buyer_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Mediator Assigned to Your Dispute",
//       html: emailMessage,
//     });
//     console.log(
//       "Mediator involvement email sent to buyer - Message ID:",
//       info?.messageId
//     );
//   } catch (error: unknown) {
//     console.error("Error sending mediator involvement mail to buyer:", error);
//   }
// };
// /**
//  * Send mediator involvement notification to seller
//  */
// export const sendMediatorInvolvementMailToSeller = async (
//   vendor_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Mediator Assigned to Dispute</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Seller,</p>
//           <p>A mediator has been assigned to the dispute for the product: <strong>${product_name}</strong>.</p>
//           <p>The mediator will review the case and make a fair decision. You may be contacted for additional information.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: vendor_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Mediator Assigned to Your Dispute",
//       html: emailMessage,
//     });
//     console.log(
//       "Mediator involvement email sent to seller - Message ID:",
//       info?.messageId
//     );
//   } catch (error: unknown) {
//     console.error("Error sending mediator involvement mail to seller:", error);
//   }
// };
// /**
//  * Send buyer resolution proposal notification to buyer
//  */
// export const sendBuyerResolutionMailToBuyer = async (
//   buyer_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Resolution Proposed</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Buyer,</p>
//           <p>You have successfully proposed a resolution for the dispute regarding the product: <strong>${product_name}</strong>.</p>
//           <p>The seller has been notified and will review your proposal. They can either accept your resolution or involve a mediator.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: buyer_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Resolution Proposed - Awaiting Seller Response",
//       html: emailMessage,
//     });
//     console.log(
//       "Buyer resolution email sent to buyer - Message ID:",
//       info?.messageId
//     );
//   } catch (error: unknown) {
//     console.error("Error sending buyer resolution mail to buyer:", error);
//   }
// };
// /**
//  * Send buyer resolution proposal notification to seller
//  */
// export const sendBuyerResolutionMailToSeller = async (
//   vendor_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Buyer Proposed Resolution</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Seller,</p>
//           <p>The buyer has proposed a resolution for the dispute regarding the product: <strong>${product_name}</strong>.</p>
//           <p>Please log in to your account to review the proposed changes and decide whether to accept the resolution or involve a mediator.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: vendor_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Buyer Proposed Resolution - Action Required",
//       html: emailMessage,
//     });
//     console.log(
//       "Buyer resolution email sent to seller - Message ID:",
//       info?.messageId
//     );
//   } catch (error: unknown) {
//     console.error("Error sending buyer resolution mail to seller:", error);
//   }
// };
// /**
//  * Send seller resolution proposal notification to buyer
//  */
// export const sendSellerResolutionMailToBuyer = async (
//   buyer_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Seller Proposed Resolution</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Buyer,</p>
//           <p>The seller has proposed a resolution for the dispute regarding the product: <strong>${product_name}</strong>.</p>
//           <p>Please log in to your account to review the proposal and decide whether to accept the resolution or involve a mediator.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: buyer_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Seller Proposed Resolution - Action Required",
//       html: emailMessage,
//     });
//     console.log(
//       "Seller resolution email sent to buyer - Message ID:",
//       info?.messageId
//     );
//   } catch (error: unknown) {
//     console.error("Error sending seller resolution mail to buyer:", error);
//   }
// };
// /**
//  * Send seller resolution proposal notification to seller
//  */
// export const sendSellerResolutionMailToSeller = async (
//   vendor_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Resolution Proposed</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Seller,</p>
//           <p>You have successfully proposed a resolution for the dispute regarding the product: <strong>${product_name}</strong>.</p>
//           <p>The buyer has been notified and will review your proposal. They can either accept your resolution or involve a mediator.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: vendor_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Resolution Proposed - Awaiting Buyer Response",
//       html: emailMessage,
//     });
//     console.log(
//       "Seller resolution email sent to seller - Message ID:",
//       info?.messageId
//     );
//   } catch (error: unknown) {
//     console.error("Error sending seller resolution mail to seller:", error);
//   }
// };
// /**
//  * Send resolution accepted notification to buyer
//  */
// export const sendResolutionAcceptedMailToBuyer = async (
//   buyer_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Dispute Resolved</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Buyer,</p>
//           <p>Great news! The dispute for the product <strong>${product_name}</strong> has been successfully resolved.</p>
//           <p>The proposed resolution has been accepted, and the transaction has been marked as completed.</p>
//           <p>Thank you for using our dispute resolution service.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: buyer_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Dispute Resolved Successfully",
//       html: emailMessage,
//     });
//     console.log(
//       "Resolution accepted email sent to buyer - Message ID:",
//       info?.messageId
//     );
//   } catch (error: unknown) {
//     console.error("Error sending resolution accepted mail to buyer:", error);
//   }
// };
// /**
//  * Send resolution accepted notification to seller
//  */
// export const sendResolutionAcceptedMailToSeller = async (
//   vendor_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Dispute Resolved</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Seller,</p>
//           <p>Great news! The dispute for the product <strong>${product_name}</strong> has been successfully resolved.</p>
//           <p>The proposed resolution has been accepted, and the transaction has been marked as completed.</p>
//           <p>Thank you for using our dispute resolution service.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: vendor_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Dispute Resolved Successfully",
//       html: emailMessage,
//     });
//     console.log(
//       "Resolution accepted email sent to seller - Message ID:",
//       info?.messageId
//     );
//   } catch (error: unknown) {
//     console.error("Error sending resolution accepted mail to seller:", error);
//   }
// };
// /**
//  * Send dispute cancelled notification to buyer
//  */
// export const sendDisputeCancelledMailToBuyer = async (
//   buyer_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Dispute Cancelled</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Buyer,</p>
//           <p>The dispute for the product <strong>${product_name}</strong> has been cancelled.</p>
//           <p>The transaction has been returned to pending status, and you can continue with the transaction as normal.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: buyer_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Dispute Cancelled",
//       html: emailMessage,
//     });
//     console.log(
//       "Dispute cancelled email sent to buyer - Message ID:",
//       info?.messageId
//     );
//   } catch (error: unknown) {
//     console.error("Error sending dispute cancelled mail to buyer:", error);
//   }
// };
// /**
//  * Send dispute cancelled notification to seller
//  */
// export const sendDisputeCancelledMailToSeller = async (
//   vendor_email: string,
//   product_name: string
// ) => {
//   try {
//     const transport = generateMailTransporter();
//     const emailMessage = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Dispute Cancelled</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
//     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <p>Dear Seller,</p>
//           <p>The dispute for the product <strong>${product_name}</strong> has been cancelled.</p>
//           <p>The transaction has been returned to pending status, and you can continue with the transaction as normal.</p>
//           <p>If you have any questions or need assistance, feel free to reach out to our support team at
//           <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
//           <p>Best regards,<br>Doshbox Team</p>
//         </td>
//       </tr>
//     </table>
//   </body>
//   </html>
//   `;
//     const info = await transport.sendMail({
//       to: vendor_email,
//       from: process.env.VERIFICATION_EMAIL,
//       subject: "Dispute Cancelled",
//       html: emailMessage,
//     });
//     console.log(
//       "Dispute cancelled email sent to seller - Message ID:",
//       info?.messageId
//     );
//   } catch (error: unknown) {
//     console.error("Error sending dispute cancelled mail to seller:", error);
//   }
// };
const email_utils_1 = require("../../../utilities/email.utils");
const supportEmail = "mydoshbox@gmail.com";
const dashboardUrl = "https://mydoshbox.vercel.app/dashboard";
/**
 * Send dispute notification to buyer
 */
const sendDisputeMailToBuyer = (buyer_email, product_name, dispute_description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dispute Raised - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Warning Color -->
            <tr>
              <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  ⚠️ Dispute Raised by Seller
                </h1>
                <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 14px;">
                  Action required on your transaction
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  The seller has raised a dispute regarding your transaction for <strong>${product_name}</strong>. Please review the details below and take appropriate action.
                </p>

                <!-- Dispute Details Box -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 Dispute Details
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Product Name
                      </p>
                      <p style="margin: 0 0 16px 0; color: #78350f; font-size: 15px; font-weight: 600;">
                        ${product_name}
                      </p>
                      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Dispute Reason
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        ${dispute_description}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Next Steps -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  🔍 What You Can Do
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <!-- Option 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Propose a resolution</strong> - Suggest a solution to resolve the dispute
                          </td>
                        </tr>
                      </table>

                      <!-- Option 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Request mediator</strong> - Get help from a neutral third party
                          </td>
                        </tr>
                      </table>

                      <!-- Option 3 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Wait for seller's proposal</strong> - Review any resolution offered by the seller
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Important Notice -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #991b1b; font-size: 14px; font-weight: 700;">
                        ⚠️ Important Notice
                      </p>
                      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                        Your transaction is currently on hold while this dispute is being resolved. Payments will remain in escrow until a resolution is reached.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                        View Dispute & Respond
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "⚠️ Dispute Raised - Action Required",
            html: emailMessage,
        });
        console.log("Dispute email sent to buyer - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending dispute mail to buyer:", error);
    }
});
exports.sendDisputeMailToBuyer = sendDisputeMailToBuyer;
/**
 * Send dispute notification to seller
 */
const sendDisputeMailToSeller = (vendor_email, product_name, dispute_description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dispute Raised - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- Main Container -->
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <!-- Header with Warning Color -->
            <tr>
              <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  ⚠️ Dispute Raised by Buyer
                </h1>
                <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 14px;">
                  Action required on your transaction
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px;">
                
                <!-- Greeting -->
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  The buyer has raised a dispute regarding the transaction for <strong>${product_name}</strong>. Please review the details below and take appropriate action.
                </p>

                <!-- Dispute Details Box -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 Dispute Details
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Product Name
                      </p>
                      <p style="margin: 0 0 16px 0; color: #78350f; font-size: 15px; font-weight: 600;">
                        ${product_name}
                      </p>
                      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Dispute Reason
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        ${dispute_description}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Next Steps -->
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  🔍 What You Can Do
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <!-- Option 1 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Propose a resolution</strong> - Suggest a solution to resolve the dispute
                          </td>
                        </tr>
                      </table>

                      <!-- Option 2 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Request mediator</strong> - Get help from a neutral third party
                          </td>
                        </tr>
                      </table>

                      <!-- Option 3 -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Wait for buyer's proposal</strong> - Review any resolution offered by the buyer
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Important Notice -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #991b1b; font-size: 14px; font-weight: 700;">
                        ⚠️ Important Notice
                      </p>
                      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                        Your transaction is currently on hold while this dispute is being resolved. Payments will remain in escrow until a resolution is reached.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                        View Dispute & Respond
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <!-- Support Section -->
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "⚠️ Dispute Raised - Action Required",
            html: emailMessage,
        });
        console.log("Dispute email sent to seller - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending dispute mail to seller:", error);
    }
});
exports.sendDisputeMailToSeller = sendDisputeMailToSeller;
// Continue with other email functions using the same unified template style...
// I'll include the most critical ones for brevity
const sendResolutionProposedToBuyer = (buyer_email, product_name, proposed_by, proposal_number) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const message = proposed_by === "buyer"
            ? `You have successfully proposed Resolution #${proposal_number} for the dispute regarding <strong>${product_name}</strong>.`
            : `The seller has proposed Resolution #${proposal_number} for the dispute regarding <strong>${product_name}</strong>.`;
        const actionText = proposed_by === "buyer"
            ? "The seller will review your proposal and either accept, reject, or request a mediator."
            : "Please review the proposal and decide whether to accept, reject, or request a mediator.";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resolution Proposed - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  💡 Resolution Proposal #${proposal_number}
                </h1>
                <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">
                  ${proposed_by === "buyer" ? "You proposed" : "Seller proposed"} a solution
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  ${message}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Product Name
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 600;">
                        ${product_name}
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 700;">
                        📌 Next Steps
                      </p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                        ${actionText}
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        <strong>💡 Tip:</strong> You can propose up to 3 resolutions. After 3 rejections, the dispute will automatically be escalated to a mediator.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                        View Proposal Details
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `💡 Resolution Proposal #${proposal_number} - ${product_name}`,
            html: emailMessage,
        });
        console.log("Resolution proposal email sent to buyer - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending resolution proposal email to buyer:", error);
    }
});
exports.sendResolutionProposedToBuyer = sendResolutionProposedToBuyer;
const sendResolutionProposedToSeller = (vendor_email, product_name, proposed_by, proposal_number) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const message = proposed_by === "seller"
            ? `You have successfully proposed Resolution #${proposal_number} for the dispute regarding <strong>${product_name}</strong>.`
            : `The buyer has proposed Resolution #${proposal_number} for the dispute regarding <strong>${product_name}</strong>.`;
        const actionText = proposed_by === "seller"
            ? "The buyer will review your proposal and either accept, reject, or request a mediator."
            : "Please review the proposal and decide whether to accept, reject, or request a mediator.";
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resolution Proposed - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  💡 Resolution Proposal #${proposal_number}
                </h1>
                <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">
                  ${proposed_by === "seller" ? "You proposed" : "Buyer proposed"} a solution
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  ${message}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Product Name
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 600;">
                        ${product_name}
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 700;">
                        📌 Next Steps
                      </p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                        ${actionText}
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        <strong>💡 Tip:</strong> You can propose up to 3 resolutions. After 3 rejections, the dispute will automatically be escalated to a mediator.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                        View Proposal Details
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `💡 Resolution Proposal #${proposal_number} - ${product_name}`,
            html: emailMessage,
        });
        console.log("Resolution proposal email sent to seller - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending resolution proposal email to seller:", error);
    }
});
exports.sendResolutionProposedToSeller = sendResolutionProposedToSeller;
const sendResolutionAcceptedMailToBuyer = (buyer_email, product_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resolution Accepted - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  ✅ Dispute Resolved Successfully!
                </h1>
                <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px;">
                  Resolution accepted by both parties
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  Great news! The dispute regarding <strong>${product_name}</strong> has been successfully resolved through mutual agreement.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #065f46; font-size: 14px; font-weight: 700;">
                        🎉 What This Means
                      </p>
                      <p style="margin: 0; color: #064e3b; font-size: 14px; line-height: 1.6;">
                        The proposed resolution has been accepted, and the transaction will proceed according to the agreed terms. All dispute-related holds have been removed.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                        View Transaction Details
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "✅ Dispute Resolved Successfully",
            html: emailMessage,
        });
        console.log("Resolution accepted email sent to buyer - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending resolution accepted mail to buyer:", error);
    }
});
exports.sendResolutionAcceptedMailToBuyer = sendResolutionAcceptedMailToBuyer;
const sendResolutionAcceptedMailToSeller = (vendor_email, product_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resolution Accepted - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  ✅ Dispute Resolved Successfully!
                </h1>
                <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px;">
                  Resolution accepted by both parties
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  Great news! The dispute regarding <strong>${product_name}</strong> has been successfully resolved through mutual agreement.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #065f46; font-size: 14px; font-weight: 700;">
                        🎉 What This Means
                      </p>
                      <p style="margin: 0; color: #064e3b; font-size: 14px; line-height: 1.6;">
                        The proposed resolution has been accepted, and the transaction will proceed according to the agreed terms. All dispute-related holds have been removed.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                        View Transaction Details
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: "✅ Dispute Resolved Successfully",
            html: emailMessage,
        });
        console.log("Resolution accepted email sent to seller - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending resolution accepted mail to seller:", error);
    }
});
exports.sendResolutionAcceptedMailToSeller = sendResolutionAcceptedMailToSeller;
const sendResolutionRejectedToBuyer = (buyer_email, product_name, rejected_by, rejection_count, max_rejections) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const remainingAttempts = max_rejections - rejection_count;
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resolution Rejected - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  ❌ Resolution Rejected
                </h1>
                <p style="margin: 8px 0 0 0; color: #fee2e2; font-size: 14px;">
                  Proposal declined by ${rejected_by}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  The proposed resolution for <strong>${product_name}</strong> has been rejected by the ${rejected_by}.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 700;">
                        ⚠️ Rejection ${rejection_count}/${max_rejections}
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining before automatic mediator escalation.
                      </p>
                    </td>
                  </tr>
                </table>

                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 What's Next?
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Propose a new resolution</strong> - Suggest an alternative solution
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Request mediator</strong> - Get help from a neutral third party
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Wait for other party</strong> - They may propose a new resolution
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                        View Dispute Details
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `❌ Resolution Rejected (${rejection_count}/${max_rejections}) - ${product_name}`,
            html: emailMessage,
        });
        console.log("Resolution rejected email sent to buyer - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending rejection email to buyer:", error);
    }
});
exports.sendResolutionRejectedToBuyer = sendResolutionRejectedToBuyer;
const sendResolutionRejectedToSeller = (vendor_email, product_name, rejected_by, rejection_count, max_rejections) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const remainingAttempts = max_rejections - rejection_count;
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resolution Rejected - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  ❌ Resolution Rejected
                </h1>
                <p style="margin: 8px 0 0 0; color: #fee2e2; font-size: 14px;">
                  Proposal declined by ${rejected_by}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  The proposed resolution for <strong>${product_name}</strong> has been rejected by the ${rejected_by}.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 700;">
                        ⚠️ Rejection ${rejection_count}/${max_rejections}
                      </p>
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining before automatic mediator escalation.
                      </p>
                    </td>
                  </tr>
                </table>

                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 What's Next?
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Propose a new resolution</strong> - Suggest an alternative solution
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Request mediator</strong> - Get help from a neutral third party
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Wait for other party</strong> - They may propose a new resolution
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                        View Dispute Details
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `❌ Resolution Rejected (${rejection_count}/${max_rejections}) - ${product_name}`,
            html: emailMessage,
        });
        console.log("Resolution rejected email sent to seller - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending rejection email to seller:", error);
    }
});
exports.sendResolutionRejectedToSeller = sendResolutionRejectedToSeller;
const sendAutoEscalationMailToBuyer = (buyer_email, product_name, rejection_count) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dispute Escalated - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  🔔 Dispute Escalated to Mediator
                </h1>
                <p style="margin: 8px 0 0 0; color: #ede9fe; font-size: 14px;">
                  Professional mediation initiated
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  Your dispute regarding <strong>${product_name}</strong> has been automatically escalated to a mediator after ${rejection_count} rejections.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 8px; border-left: 4px solid #8b5cf6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #5b21b6; font-size: 14px; font-weight: 700;">
                        🤝 What Happens Now?
                      </p>
                      <p style="margin: 0; color: #4c1d95; font-size: 14px; line-height: 1.6;">
                        A qualified mediator will be assigned to review the case and make a fair, binding decision. Both parties will have the opportunity to present their case.
                      </p>
                    </td>
                  </tr>
                </table>

                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 Mediation Process
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Case Review</strong> - Mediator reviews all proposals and communications
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Information Gathering</strong> - Both parties may be contacted for details
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Final Decision</strong> - Mediator makes a binding decision
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">4</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Implementation</strong> - Decision is executed and dispute resolved
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                        <strong>⏱️ Timeline:</strong> Most disputes are resolved within 3-5 business days of mediator assignment.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);">
                        View Dispute Status
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `🔔 Dispute Escalated to Mediator - ${product_name}`,
            html: emailMessage,
        });
        console.log("Auto-escalation email sent to buyer - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending auto-escalation email to buyer:", error);
    }
});
exports.sendAutoEscalationMailToBuyer = sendAutoEscalationMailToBuyer;
const sendAutoEscalationMailToSeller = (vendor_email, product_name, rejection_count) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dispute Escalated - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  🔔 Dispute Escalated to Mediator
                </h1>
                <p style="margin: 8px 0 0 0; color: #ede9fe; font-size: 14px;">
                  Professional mediation initiated
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  Your dispute regarding <strong>${product_name}</strong> has been automatically escalated to a mediator after ${rejection_count} rejections.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 8px; border-left: 4px solid #8b5cf6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #5b21b6; font-size: 14px; font-weight: 700;">
                        🤝 What Happens Now?
                      </p>
                      <p style="margin: 0; color: #4c1d95; font-size: 14px; line-height: 1.6;">
                        A qualified mediator will be assigned to review the case and make a fair, binding decision. Both parties will have the opportunity to present their case.
                      </p>
                    </td>
                  </tr>
                </table>

                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 Mediation Process
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Case Review</strong> - Mediator reviews all proposals and communications
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Information Gathering</strong> - Both parties may be contacted for details
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Final Decision</strong> - Mediator makes a binding decision
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">4</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Implementation</strong> - Decision is executed and dispute resolved
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                        <strong>⏱️ Timeline:</strong> Most disputes are resolved within 3-5 business days of mediator assignment.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);">
                        View Dispute Status
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `🔔 Dispute Escalated to Mediator - ${product_name}`,
            html: emailMessage,
        });
        console.log("Auto-escalation email sent to seller - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending auto-escalation email to seller:", error);
    }
});
exports.sendAutoEscalationMailToSeller = sendAutoEscalationMailToSeller;
const sendMediatorRequestedMailToBuyer = (buyer_email, product_name, requested_by) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const message = requested_by === "buyer"
            ? `You have requested a mediator for the dispute regarding <strong>${product_name}</strong>.`
            : `The seller has requested a mediator for the dispute regarding <strong>${product_name}</strong>.`;
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mediator Requested - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  🤝 Mediator Requested
                </h1>
                <p style="margin: 8px 0 0 0; color: #ede9fe; font-size: 14px;">
                  Professional mediation initiated
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  ${message}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Product Name
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 600;">
                        ${product_name}
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 8px; border-left: 4px solid #8b5cf6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #5b21b6; font-size: 14px; font-weight: 700;">
                        📌 What Happens Next
                      </p>
                      <p style="margin: 0; color: #4c1d95; font-size: 14px; line-height: 1.6;">
                        A qualified mediator will be assigned to your case within 24-48 hours. The mediator will review all evidence, communications, and proposals before making a fair, binding decision.
                      </p>
                    </td>
                  </tr>
                </table>

                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 Mediation Process
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Mediator Assignment</strong> - A neutral third party will be assigned (24-48 hours)
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Case Review</strong> - Mediator examines all evidence and history
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Additional Information</strong> - You may be contacted for clarification
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">4</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Final Decision</strong> - Binding resolution issued (typically 3-5 business days)
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        <strong>💡 Important:</strong> The mediator's decision is final and binding on both parties. Please ensure all relevant information has been shared.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);">
                        View Dispute Status
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `🤝 Mediator Requested - ${product_name}`,
            html: emailMessage,
        });
        console.log("Mediator requested email sent to buyer - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending mediator requested mail to buyer:", error);
    }
});
exports.sendMediatorRequestedMailToBuyer = sendMediatorRequestedMailToBuyer;
const sendMediatorRequestedMailToSeller = (vendor_email, product_name, requested_by) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const message = requested_by === "seller"
            ? `You have requested a mediator for the dispute regarding <strong>${product_name}</strong>.`
            : `The buyer has requested a mediator for the dispute regarding <strong>${product_name}</strong>.`;
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mediator Requested - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  🤝 Mediator Requested
                </h1>
                <p style="margin: 8px 0 0 0; color: #ede9fe; font-size: 14px;">
                  Professional mediation initiated
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  ${message}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">
                        Product Name
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 600;">
                        ${product_name}
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 8px; border-left: 4px solid #8b5cf6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #5b21b6; font-size: 14px; font-weight: 700;">
                        📌 What Happens Next
                      </p>
                      <p style="margin: 0; color: #4c1d95; font-size: 14px; line-height: 1.6;">
                        A qualified mediator will be assigned to your case within 24-48 hours. The mediator will review all evidence, communications, and proposals before making a fair, binding decision.
                      </p>
                    </td>
                  </tr>
                </table>

                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 Mediation Process
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Mediator Assignment</strong> - A neutral third party will be assigned (24-48 hours)
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Case Review</strong> - Mediator examines all evidence and history
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Additional Information</strong> - You may be contacted for clarification
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">4</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Final Decision</strong> - Binding resolution issued (typically 3-5 business days)
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                        <strong>💡 Important:</strong> The mediator's decision is final and binding on both parties. Please ensure all relevant information has been shared.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);">
                        View Dispute Status
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `🤝 Mediator Requested - ${product_name}`,
            html: emailMessage,
        });
        console.log("Mediator requested email sent to seller - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending mediator requested mail to seller:", error);
    }
});
exports.sendMediatorRequestedMailToSeller = sendMediatorRequestedMailToSeller;
const sendDisputeCancelledMailToBuyer = (buyer_email, product_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dispute Cancelled - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  🔵 Dispute Cancelled
                </h1>
                <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">
                  Transaction can now proceed normally
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  The dispute regarding <strong>${product_name}</strong> has been successfully cancelled by mutual agreement.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 700;">
                        ✅ What This Means
                      </p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                        All dispute-related holds have been removed from your transaction. You can now proceed with the transaction according to the original terms.
                      </p>
                    </td>
                  </tr>
                </table>

                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 Next Steps
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Transaction resumes</strong> - Continue with the normal transaction process
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Communicate with seller</strong> - Coordinate delivery and payment as agreed
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Complete transaction</strong> - Follow through with delivery confirmation and payment release
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                        <strong>💚 Good News:</strong> Both parties have agreed to cancel the dispute and move forward. Your transaction is no longer on hold.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                        View Transaction Details
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: buyer_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `🔵 Dispute Cancelled - ${product_name}`,
            html: emailMessage,
        });
        console.log("Dispute cancelled email sent to buyer - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending dispute cancelled mail to buyer:", error);
    }
});
exports.sendDisputeCancelledMailToBuyer = sendDisputeCancelledMailToBuyer;
const sendDisputeCancelledMailToSeller = (vendor_email, product_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, email_utils_1.generateMailTransporter)();
        const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dispute Cancelled - MyDoshBox</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
            
            <tr>
              <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  🔵 Dispute Cancelled
                </h1>
                <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">
                  Transaction can now proceed normally
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                  Hello,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  The dispute regarding <strong>${product_name}</strong> has been successfully cancelled by mutual agreement.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 700;">
                        ✅ What This Means
                      </p>
                      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                        All dispute-related holds have been removed from your transaction. You can now proceed with the transaction according to the original terms.
                      </p>
                    </td>
                  </tr>
                </table>

                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
                  📋 Next Steps
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Transaction resumes</strong> - Continue with the normal transaction process
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Communicate with buyer</strong> - Coordinate delivery and payment as agreed
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                            <div style="width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding-left: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
                            <strong>Complete transaction</strong> - Fulfill delivery obligations and receive payment
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                        <strong>💚 Good News:</strong> Both parties have agreed to cancel the dispute and move forward. Your transaction is no longer on hold.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                        View Transaction Details
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  Need help? Contact our support team at 
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none; font-weight: 600;">${supportEmail}</a>
                </p>

                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  Best regards,<br/>
                  <strong style="color: #10b981;">The MyDoshBox Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} MyDoshBox. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Secure escrow transactions made simple
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
        const info = yield transport.sendMail({
            to: vendor_email,
            from: process.env.VERIFICATION_EMAIL,
            subject: `🔵 Dispute Cancelled - ${product_name}`,
            html: emailMessage,
        });
        console.log("Dispute cancelled email sent to seller - Message ID:", info === null || info === void 0 ? void 0 : info.messageId);
    }
    catch (error) {
        console.error("Error sending dispute cancelled mail to seller:", error);
    }
});
exports.sendDisputeCancelledMailToSeller = sendDisputeCancelledMailToSeller;
