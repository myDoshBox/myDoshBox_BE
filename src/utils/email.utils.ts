import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Ensure all necessary environment variables are provided
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USERNAME ||
    !process.env.EMAIL_PASSWORD 
  ) {
    throw new Error(
      "Email configuration is incomplete. Please provide EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, and EMAIL_PASSWORD environment variables."
    );
  }

  // Create a transporter
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email options
  const mailOptions = {
    from: "Oladapo Elijah <toktogift@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
