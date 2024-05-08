import { Request, NextFunction, Response, RequestHandler } from "express";
import OrganizationModel from "./organizationUserAuth/organizationAuth.model";
import IndividualUser from "./individualUserAuth/individualUserAuth.model";
import jwt from "jsonwebtoken";
import { sendURLEmail, sendVerificationEmail } from "../../utilities/email.utils";
import { createSessionAndSendTokens } from "../../utilities/createSessionAndSendToken.util";
import AppError from "../../utilities/appError";
import catchAsync from "../../utilities/catchAsync";
import * as crypto from "crypto"
import PasswordTokenSchema from "../authentication/individualUserAuth/individualUser/individualAuthPasswordToken";

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

export const UserLogin = async (req: Request, res: Response) => {
  const { email, user_password } = req.body as {
    email: string;
    user_password: string;
  };

  if (!email || !user_password) {
    res.status(400).json({ message: "Please provide email and password" });
    return;
  }

  try {
    const individualUserToLogin = await IndividualUser.findOne({
      email,
    }).select("+password");

    if (individualUserToLogin) {
      if (!individualUserToLogin.email_verified) {
        const verificationToken = jwt.sign(
          { email },
          process.env.JWT_SECRET as string,
          { expiresIn: 60 * 60 }
        );
        await sendVerificationEmail(email, verificationToken);
        return res.status(200).json({
          status: "true",
          message:
            "Account is unverified! Verfication email sent. verify account to continue",
        });
      }

      const passwordMatch = await individualUserToLogin.comparePassword(
        user_password
      );
      if (!passwordMatch) {
        return res.status(422).json({ error: "Password is not correct" });
      }

      const { ...userWithoutPassword } = individualUserToLogin.toObject();
      const {
        status,
        message,
        user: userWithoutPasswordForSession,
        accessToken,
        refreshToken,
      } = await createSessionAndSendTokens({
        user: userWithoutPassword,
        userAgent: req.get("user-agent") || "",
        role: individualUserToLogin.role,
        message: "Individual user successfully logged in",
      });

      return res.status(200).json({
        status,
        message,
        user: userWithoutPasswordForSession,
        refreshToken,
        accessToken,
      });
    }

    const organizationUserToLogin = await OrganizationModel.findOne({
      organization_email: email,
    }).select("+password");

    if (organizationUserToLogin) {
      if (!organizationUserToLogin.email_verified) {
        const verificationToken = jwt.sign(
          { email: organizationUserToLogin.organization_email },
          process.env.JWT_SECRET as string,
          { expiresIn: 60 * 60 }
        );
        await sendVerificationEmail(
          organizationUserToLogin.organization_email,
          verificationToken
        );
        return res.status(200).json({
          status: "true",
          message:
            "Account is unverified! Verification email sent. Verify account to continue",
        });
      }

      const passwordMatch = await organizationUserToLogin.correctPassword(
        user_password,
        organizationUserToLogin.password
      );

      if (!passwordMatch) {
        return res.status(422).json({ error: "Invalid email or password" });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } =
        organizationUserToLogin.toObject();
      const {
        status,
        message,
        user: userWithoutPasswordForSession,
        accessToken,
        refreshToken,
      } = await createSessionAndSendTokens({
        user: userWithoutPassword,
        userAgent: req.get("user-agent") || "",
        role: organizationUserToLogin.role,
        message: "Organization user successfully logged in",
      });
      return res.status(200).json({
        status,
        message,
        user: userWithoutPasswordForSession,
        refreshToken,
        accessToken,
      });
    }
  } catch (error) {
    console.error("Error Logging in user:", error);
    res.status(500).json({ message: "Error Logging in user" });
  }
};


export const ForgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) Get user based on POSTed email
    const { email } = req.body;
    console.log(email);

    try {
      // Check if the user exists in the organization model
      const org = await OrganizationModel.findOne({
        organization_email: email,
      });

      // Check if the user exists in the individual model
      const user = await IndividualUser.findOne({
        email,
      });

      // If neither organization nor individual user is found, throw an error
      if (!org && !user) {
        throw new AppError("There is no user with this email address.", 404);
      }

      // Generate the random reset token based on whether org or user is defined
      const resetToken = (org ? org.createPasswordResetToken() : user!.createPasswordResetToken());

      // Save the organization or user based on which one is found
      await (org ? org.save({ validateBeforeSave: false }) : user!.save({ validateBeforeSave: false }));

      // Send reset email to the user's email
      const resetURL = `${req.protocol}://${req.get("host")}/auth/resetPassword/${resetToken}`;
      // sendURLEmail([org?.organization_email, user?.email].filter(Boolean), resetURL);
      const validEmails = [org?.organization_email, user?.email].filter((email) => typeof email === 'string') as string[];

      sendURLEmail(validEmails, resetURL);

      res.status(200).json({ message: "success" }); 
    } catch (error) {
      return next(new AppError("There is an error processing the request.", 500));
    }
  } 
);


export const ResetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) Get user based on the token

    const token = req.params.token;
    console.log(token)

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const org = await OrganizationModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    const user = await IndividualUser.findOne({
      passwordResetToken: hashedToken,
      // passwordResetExpires: { $gt: Date.now() }, 
    });
    console.log(user)

    // 2) If token has not expired, and there is a user, set the new password
    if (!org && !user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    if (org) {
      org.password = req.body.password;
      org.passwordResetToken = undefined;
      org.passwordResetExpires = undefined;
      await org.save();
    }

    if (user) {
      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }

    // 3) Update changedPasswordAt property for the user/organization
    // [Update this part according to your implementation]

    // 4) Log the user/organization in and send JWT
    if (org) {
      createSendToken(org, 200, res);
    } else if (user) {
      createSendToken(user, 200, res);
    }
  }
);

