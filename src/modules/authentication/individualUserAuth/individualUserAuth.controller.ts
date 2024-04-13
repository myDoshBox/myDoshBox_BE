import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response } from "express";

import IndividualUser from "./individualUserAuth.model";
import individualAuthPasswordToken from "./individualAuthPasswordToken";
import {
  sendOtpEmail,
  sendVerificationEmail,
} from "../../../utils/email.utils";

const generateAccessAndRefreshToken = (
  userId: string
): {
  accessToken: string;
  refreshToken: string;
} => {
  const accessToken = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET || "secret",
    {
      expiresIn: "1h",
    }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET || "secret",
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
};

export const individualUserRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, phoneNumber, password, confirmPassword } = req.body;

    if (!email || !phoneNumber || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if the user already exists
    const userExists = await IndividualUser.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Generate a verification token
    const verificationToken = crypto.randomBytes(64).toString("hex");

    // Create a new user
    const newUser = new IndividualUser({
      email,
      phoneNumber,
      password,
      verificationToken,
    });

    // Save the user to the database
    await newUser.save();

    // Send a verification email
    await sendVerificationEmail(email, verificationToken);

    // Generate access and refresh token
    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      newUser._id
    );

    // Send a response
    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      accessToken,
      refreshToken,
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
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Invalid token" });
    }
    
    // Check if the user exists and is verified
    const user = await IndividualUser.findOne({ verificationToken: token.toString() });

    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Update user's verification status
    user.verified = true;
    await user.save();

    // Respond with success message
    res.status(200).json({ message: "Email verified successfully." });
  } catch (error: unknown) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Error verifying email" });
  }
};

export const individualUserLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await IndividualUser.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Email/Password mismatch!" });

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
      return res.status(400).json({ message: "Email/Password mismatch!" });

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      user._id
    );

    res.status(200).json({
      message: "Login successful",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error: unknown) {
    console.error("Error Loggin in user:", error);
    res.status(500).json({ message: "Error Loggin in user" });
  }
};

export const generateOTP = async (req: Request, res: Response) => {
  try {
    // 1) Get user based on POSTed email
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email" });
    }

    const user = await IndividualUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user._id;
    const token = 'generateToken()'; // Make sure generateToken function exists and generates secure tokens

    await individualAuthPasswordToken.findOneAndDelete({ owner: userId });
    const newToken = await individualAuthPasswordToken.create({
      owner: userId,
      token,
    });

    // const message = `Forgot your password? Here is a one-time password for resetting your password: ${token}.\nIf you didn't forget your password, please ignore this email.`;

    // sendEmail function needs to be implemented separately
    sendOtpEmail(token, email);

    res.status(200).json({ token: newToken.token });
  } catch (err) {
    console.error("Error in generateOTP:", err);
    return res.status(500).json({
      message: "There was an error sending the email please try again",
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, token } = req.body;
  try {
    const user = await IndividualUser.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid user!" });

    const verifyToken = await individualAuthPasswordToken.findOne({
      owner: user._id,
    });

    if (!verifyToken) {
      return res.status(403).json({ error: "Invalid token!" });
    }

    const matched = await verifyToken.compareToken(token);

    if (!matched) {
      return res.status(403).json({ error: "Invalid token!" });
    }

    return res.json({ message: "Token verified!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
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
