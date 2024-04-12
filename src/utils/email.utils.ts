import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const generateMailTransporter = () =>{
  const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    return transport
}

interface EmailOptions {
  email: string;
  subject?: string;
  message: string;
}


export const sendOtpEmail = async (otp: string, email: string) => {
  const transport = generateMailTransporter();

  // const { email, message: customMessage } = options; // Renamed the variable to avoid conflict
  const emailMessage = `Hi, we just received a request that you forgot your password. Here is your OTP to create a new password: ${otp}`;

  transport.sendMail({
    to: email,
    from: process.env.VERIFICATION_EMAIL,
    subject: "Reset Password Token", 
    html: emailMessage, // Assign the HTML string directly to the html property
  });

}

export const sendURLEmail = async (email: string, resetURL: string) => {
  const transport = generateMailTransporter();

  // const { email, message: customMessage } = options; // Renamed the variable to avoid conflict
  const emailMessage = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  transport.sendMail({
    to: email,
    from: process.env.VERIFICATION_EMAIL,
    subject: "Reset Password Token",
    html: emailMessage, // Assign the HTML string directly to the html property
  });
};
