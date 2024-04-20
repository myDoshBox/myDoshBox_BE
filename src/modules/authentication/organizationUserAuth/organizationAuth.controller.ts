import { Request, Response, NextFunction } from "express";
import OrganizationModel from "./organizationAuth.model";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import catchAsync from "../../../utilities/catchAsync";
import AppError from "../../../utilities/appError";
import { sendURLEmail } from "../../../utilities/email.utils";
import { createSessionAndSendTokens } from "../../../utilities/createSessionAndSendToken.util";

interface TokenPayload {
  id: string;
}

const signToken = (id: string): string => {
  const payload: TokenPayload = { id };
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      organization_name,
      organization_email,
      contact_email,
      contact_number,
      password,
      password_confirmation,
    } = req.body;

    if (password !== password_confirmation) {
      res.status(401).json({
        status: "fail",
        message: "Password do not match",
      });
    }

    const emailAlreadyExist = await OrganizationModel.findOne({
      organization_email,
    });

    if (emailAlreadyExist) {
      return res.status(409).json({
        status: "failed",
        message: "User with email already exist",
      });
    }

    const org = await OrganizationModel.create({
      organization_name,
      organization_email,
      contact_email,
      contact_number,
      password,
      userKind: "org",
    });

    const createSessionAndSendTokensOptions = {
      user: org.toObject(),
      userAgent: req.get("user-agent") || "",
      userKind: org.userKind,
      message: "Organization user sucessfully created and logged in",
    };

    const { status, message, user, accessToken, refreshToken } =
      await createSessionAndSendTokens(createSessionAndSendTokensOptions);

    return res.status(201).json({
      status,
      message,
      user,
      refreshToken,
      accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organization_email, password } = req.body;

    if (!organization_email || !password) {
      res.status(401).json({
        status: "fail",
        message: "Password do not match",
      });
    }

    // 2) Check if user exists && password is correct
    const loggedInUser = await OrganizationModel.findOne({
      organization_email,
    }).select("+password");

    if (
      !loggedInUser ||
      !(await loggedInUser.correctPassword(password, loggedInUser.password))
    ) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect details",
      });
    }

    // 3) If everything ok, send token to client
    const createSessionAndSendTokensOptions = {
      user: loggedInUser.toObject(),
      userAgent: req.get("user-agent") || "",
      userKind: loggedInUser.userKind,
      message: "Organization user sucessfully logged in",
    };

    const { status, message, user, accessToken, refreshToken } =
      await createSessionAndSendTokens(createSessionAndSendTokensOptions);

    return res.status(200).json({
      status,
      message,
      user,
      refreshToken,
      accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) Get user based on POSTed email
    const org = await OrganizationModel.findOne({
      email: req.body.email,
    });
    if (!org) {
      return next(new AppError("There is no user with email address.", 404));
    }

    // 2) Generate the random reset token
    const resetToken = org.createPasswordResetToken();
    await org.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/organization/resetPassword/${resetToken}`;

    try {
      sendURLEmail(org.organization_email, resetURL);
      res.status(200).json({ message: "success" });
    } catch (err) {
      return next(new AppError("There is an error sending the email.", 500));
    }
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const org = await OrganizationModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is org, set the new password
    if (!org) {
      return next(new AppError("Token is invalid or has expired", 400));
    }
    org.password = req.body.password;
    org.passwordResetToken = undefined;
    org.passwordResetExpires = undefined;
    await org.save();

    // 3) Update changedPasswordAt property for the org
    // 4) Log the org in, send JWT
    createSendToken(org, 200, res);
  }
);
