import jwt from "jsonwebtoken";
import { Request, Response } from "express";

import IndividualUser from "../individualUserAuth.model";
import individualAuthPasswordToken from "./individualAuthPasswordToken";
import { sendVerificationEmail } from "../../../../utilities/email.utils";
import OrganizationModel from "../../organizationUserAuth/organizationAuth.model";

export const individualUserRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, phone_number, password, confirm_password } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required",
      });
    } else if (!phone_number) {
      return res.status(400).json({
        status: "fail",
        message: "Phone number is required",
      });
    } else if (!password) {
      return res.status(400).json({
        status: "fail",
        message: "Password is required",
      });
    } else if (!confirm_password) {
      return res.status(400).json({
        status: "fail",
        message: "Confirm password  is required",
      });
    }

    if (password !== confirm_password) {
      return res.status(401).json({
        status: "fail",
        message: "Password do not match",
      });
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
    return res
      .status(500)
      .json({ message: "Error registering the user", error });
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
