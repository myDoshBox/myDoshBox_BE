import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response } from "express";

import IndividualUser from "./individualUserAuth.model";
import individualAuthPasswordToken from "./individualAuthPasswordToken";
import { sendVerificationEmail } from "../../../utils/email.utils";
import {
  generateAccessToken,
  generateAccessAndRefreshToken,
} from "../../../utils/generateToken";

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

    const { user, message, status, accessToken, refreshToken } =
      await createSessionAndSendTokens({
        user: newUser,
        userAgent: req.get("user-agent") || "",
        userKind: "ind",
        message: "Individual user successfully created",
      });

    // Send a response
    return res.status(201).json({
      message,
      status,
      user,
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
    const user = await IndividualUser.findOne({
      verificationToken: token.toString(),
    }).select("verificationToken verified");

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
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

export const refreshAccessToken = (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided." });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    // Generate a new access token
    const accessToken = generateAccessToken(decoded as string);

    res.json({ accessToken });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }
    return res.status(401).json({ message: "Failed to refresh access token." });
  }
};

export const individualUserLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await IndividualUser.findOne({ email }).select("+password");

    if (!user)
      return res.status(400).json({ message: "Email/Password mismatch!" });

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
      return res.status(400).json({ message: "Email/Password mismatch!" });

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      user._id
    );

    user.password = "";

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
