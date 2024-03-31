import { Request, Response } from "express";
import OrganizationModel from "./organizationAuth.model";
import jwt from "jsonwebtoken";
import sendEmail from "../../../utils/email.utils";

interface TokenPayload {
  id: string;
}

const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: " please provide email and password",
      });
    }

    const org = await OrganizationModel.findOne({ email }).select("+password");

    if (!org || !(await org?.correctPassword(password, org.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const token = signToken(org._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err: any) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const org = await OrganizationModel.findOne({ email: req.body.email });

    if (!org) {
      return res.status(404).json({
        status: "fail",
        Message: "There is no user with this email address",
      });
    }

    const resetToken = org.createPasswordResetToken();

    await org.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}//api/organization/resetpassword/${resetToken}`;

    const message = `Forgot ypur password? Submit a PATCH request with your new password and password Confirmation to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: org.email,
        subject: "Your password reset token (valid for 10 min)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      org.passwordResetToken = undefined;
      org.passwordResetExpires = undefined;
      await org.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: "fail",
        message: "There was an error sending the email. Try again later!",
      });
    }
  } catch (err: any) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const resetPassword = (req: Request, res: Response) => {};
