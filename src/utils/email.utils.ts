import nodemailer, { Transporter } from "nodemailer";
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
};

export const sendURLEmail = async (email: string, resetURL: string) => {
  const transport = generateMailTransporter();

  // const { email, message: customMessage } = options; // Renamed the variable to avoid conflict
  const emailMessage = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;;

  transport.sendMail({
    to: email,
    from: process.env.VERIFICATION_EMAIL,
    subject: "Reset Password Token", 
    html: emailMessage, // Assign the HTML string directly to the html property
  });
};


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
