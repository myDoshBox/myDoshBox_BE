import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";

import IndividualUser from "../individualUserAuth.model";
import individualAuthPasswordToken from "./individualAuthPasswordToken";
import { sendVerificationEmail } from "../../../../utilities/email.utils";
import { createSessionAndSendTokens } from "../../../../utilities/createSessionAndSendToken.util";
import { BlacklistedToken } from "../../../blacklistedTokens/blacklistedToken.model";
import OrganizationModel from "../../organizationUserAuth/organizationAuth.model";

export const individualUserRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, phone_number, password, confirm_password } = req.body;
    console.log(name, email, phone_number, password, confirm_password);

    if (!name || !email || !phone_number || !password || !confirm_password) {
      return res
        .status(400) 
        .json({ message: "Please provide all required fields" });
    }

    // Check if the user already exists
    const individualEmailAlreadyExist = await IndividualUser.findOne({
      email,
    });
    const organizationEmailAlreadyExist = await OrganizationModel.findOne({
      organization_email: email,
    });

    if (individualEmailAlreadyExist || organizationEmailAlreadyExist) {
      return res.status(400).json({
        status: "false",
        message: "User already exists",
      });
    }

    // Check if password and confirmPassword match
    if (password !== confirm_password) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Create a new user
    const newUser = new IndividualUser({
      name,
      email,
      phone_number,
      password,
      role: "ind",
    });

    // Save the user to the database
    await newUser.save();

    const verificationToken = jwt.sign(
      {
        email: newUser.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: 60 * 60,
      }
    );

    await sendVerificationEmail(email, verificationToken);

    // Send a response
    return res.status(201).json({
      status: "true",
      message:
        "Account successfully created. Verification email sent. Verify account to continue",
    });
  } catch (error: unknown) {
    console.error("Error registering the user:", error);
    res.status(500).json({ message: "Error registering the user" });
  }
};

export const verifyIndividualUserEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { token } = req.body;

    const blackListedToken = await BlacklistedToken.findOne({
      token,
    });

    if (blackListedToken) {
      return res.status(400).json({
        status: false,
        message:
          "Link has already been used. Kindly regenerate confirm email link!",
      });
    }

    const { email } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Check if the user exists and is verified
    const user = await IndividualUser.findOne({
      email,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User with this email does not exist" });
    }

    if (user.email_verified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    await BlacklistedToken.create({
      token,
    });

    // Update user's verification status
    user.email_verified = true;
    await user.save();

    // Respond with success message
    return res.status(200).json({
      message: "Email verified successfully. Kindly go ahead to login",
      status: "true",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error verifying email:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        status: false,
        message:
          "Your token has expired. Please try to generate link and confirm email again", //expired token
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        status: false,
        message: "Invalid Token!!", // invalid token
      });
    }
    res.status(500).json({ message: "Error verifying email" });
  }
};
//export const individualUserLogin = async (req: Request, res: Response) => {};

export const individualUserLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const userToLogin = await IndividualUser.findOne({ email }).select(
      "+password"
    );

    if (!userToLogin)
      return res.status(400).json({ message: "Email/Password mismatch!" });

    const isMatch = await userToLogin.comparePassword(password);

    if (!isMatch)
      return res.status(400).json({ message: "Email/Password mismatch!" });

    if (!userToLogin.email_verified) {
      const verificationToken = jwt.sign(
        {
          email: userToLogin.email,
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: 60 * 60,
        }
      );

      await sendVerificationEmail(email, verificationToken);

      // Send a response
      return res.status(200).json({
        status: "true",
        message:
          "Account is unverified! Verification email sent. Verify account to continue",
      });
    }

    const createSessionAndSendTokensOptions = {
      user: userToLogin.toObject(),
      userAgent: req.get("user-agent") || "",
      role: userToLogin.role,
      message: "Individual user successfully logged in",
    };

    const { status, message, user, accessToken, refreshToken } =
      await createSessionAndSendTokens(createSessionAndSendTokensOptions);

    user.password = "";

    return res.status(200).json({
      status,
      message,
      user,
      refreshToken,
      accessToken,
    });
  } catch (error: unknown) {
    console.error("Error Loggin in user:", error);
    res.status(500).json({ message: "Error Loggin in user" });
  }
};

export const resetIndividualPassword = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await IndividualUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    // Update the user's password
    user.password = password;
    await user.save();

    // Find the user ID
    const userId = user._id;

    // Delete the password reset token
    await individualAuthPasswordToken.findOneAndDelete({ owner: userId });

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
// export const logout = async (req: Request, res: Response) => {};
