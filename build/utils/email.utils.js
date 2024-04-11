"use strict";
// // import nodemailer, { Transporter } from "nodemailer";
// // import dotenv from "dotenv";
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
exports.sendURLEmail = void 0;
// // dotenv.config();
// // interface EmailOptions {
// //   email: string;
// //   subject: string;
// //   message: string;
// // }
// // const sendEmail = async (options: EmailOptions): Promise<void> => {
// //   // Ensure all necessary environment variables are provided
// //   if (
// //     !process.env.EMAIL_HOST ||
// //     !process.env.EMAIL_PORT ||
// //     !process.env.EMAIL_USERNAME ||
// //     !process.env.EMAIL_PASSWORD
// //   ) {
// //     throw new Error(
// //       "Email configuration is incomplete. Please provide EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, and EMAIL_PASSWORD environment variables."
// //     );
// //   }
// //   // Create a transporter
// //   const transporter: Transporter = nodemailer.createTransport({
// //     host: process.env.EMAIL_HOST,
// //     port: Number(process.env.EMAIL_PORT),
// //     auth: {
// //       user: process.env.EMAIL_USERNAME,
// //       pass: process.env.EMAIL_PASSWORD,
// //     },
// //   });
// //   // Define the email options
// //   const mailOptions = {
// //     from: "Oladapo Elijah <toktogift@gmail.com>",
// //     to: options.email,
// //     subject: options.subject,
// //     text: options.message,
// //     // html:
// //   };
// //   // Actually send the email
// //   await transporter.sendMail(mailOptions);
// // };
// // export default sendEmail;
// import nodemailer, { Transporter } from "nodemailer";
// interface EmailOptions {
//   email: string;
//   subject: string;
//   message: string;
// }
// const sendEmail = async (options: EmailOptions): Promise<void> => {
//   // 1) Create a transporter
//   const transporter: Transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST!,
//     port: Number(process.env.EMAIL_PORT),
//     auth: {
//       user: process.env.EMAIL_USERNAME!,
//       pass: process.env.EMAIL_PASSWORD!,
//     },
//   });
//   // 2) Define the email options
//   const mailOptions = {
//     from: "Oladapo Elijah <toktogift@gmail.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html:
//   };
//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };
// export default sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateMailTransporter = () => {
    const transport = nodemailer_1.default.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    return transport;
};
// export const sendOtpEmail = async (otp: string, email: string) => {
//   const transport = generateMailTransporter();
//   // const { email, message: customMessage } = options; // Renamed the variable to avoid conflict
//   //   const emailMessage = Hi, we just received a request that you forgot your password. Here is your OTP to create a new password: ${otp};
//   //   transport.sendMail({
//   //     to: email,
//   //     from: process.env.VERIFICATION_EMAIL,
//   //     subject: "Reset Password Token",
//   //     html: emailMessage, // Assign the HTML string directly to the html property
//   //   });
//   // };
// };
const sendURLEmail = (email, resetURL) => __awaiter(void 0, void 0, void 0, function* () {
    const transport = generateMailTransporter();
    // const { email, message: customMessage } = options; // Renamed the variable to avoid conflict
    const emailMessage = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    transport.sendMail({
        to: email,
        from: process.env.VERIFICATION_EMAIL,
        subject: "Reset Password Token",
        html: emailMessage, // Assign the HTML string directly to the html property
    });
});
exports.sendURLEmail = sendURLEmail;
// const sendEmail = async (options: EmailOptions): Promise<void> => {
//   // Ensure all necessary environment variables are provided
//   if (
//     !process.env.EMAIL_HOST ||
//     !process.env.EMAIL_PORT ||
//     !process.env.EMAIL_USERNAME ||
//     !process.env.EMAIL_PASSWORD
//   ) {
//     throw new Error(
//       "Email configuration is incomplete. Please provide EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, and EMAIL_PASSWORD environment variables."
//     );
//   }
//   // Create a transporter
//   const transporter: Transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: Number(process.env.EMAIL_PORT),
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   // Define the email options
//   const mailOptions = {
//     from: "Oladapo Elijah <toktogift@gmail.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html:
//   };
//   // Actually send the email
//   await transporter.sendMail(mailOptions);
// };
// export default sendEmail;
