import { Request, Response, NextFunction } from "express";
import OrganizationModel from "../organizationAuth.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import catchAsync from "../../../../utilities/catchAsync";
import AppError from "../../../../utilities/appError";
import { sendVerificationEmail } from "../../../../utilities/email.utils";
import { BlacklistedToken } from "../../../blacklistedTokens/blacklistedToken.model";
import IndividualUser from "../../individualUserAuth/individualUserAuth.model";

interface TokenPayload {
  id: string;
}

const signToken = (id: string): string => {
  const payload: TokenPayload = { id };
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const organizationUserSignup = async (
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

    if (!organization_name) {
      return res.status(400).json({
        status: "fail",
        message: "Organization name is required",
      });
    } else if (!organization_email) {
      return res.status(400).json({
        status: "fail",
        message: "Organization email is required",
      });
    } else if (!contact_email) {
      return res.status(400).json({
        status: "fail",
        message: "Contact email is required",
      });
    } else if (!contact_number) {
      return res.status(400).json({
        status: "fail",
        message: "Contact number is required",
      });
    } else if (!password) {
      return res.status(400).json({
        status: "fail",
        message: "Password is required",
      });
    } else if (!password_confirmation) {
      return res.status(400).json({
        status: "fail",
        message: "Password confirmation  is required",
      });
    }

    if (password !== password_confirmation) {
      return res.status(401).json({
        status: "fail",
        message: "Password do not match",
      });
    }

    const individualEmailAlreadyExist = await IndividualUser.findOne({
      email: organization_email,
    });
    const organizationEmailAlreadyExist = await OrganizationModel.findOne({
      organization_email,
    });

    console.log(individualEmailAlreadyExist, organizationEmailAlreadyExist);

    if (organizationEmailAlreadyExist || individualEmailAlreadyExist) {
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
      role: "org",
    });

    const verificationToken = jwt.sign(
      {
        email: org.organization_email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: 60 * 60,
      }
    );

    await sendVerificationEmail(org.organization_email, verificationToken);

    return res.status(201).json({
      status: "true",
      message:
        "Account successfully created. Verification email sent. Verify account to continue",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    next(err);
  }
};

export const organizationUserResetPassword = catchAsync(
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

export const verifyOrganizationUserEmail = async (
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
    const user = await OrganizationModel.findOne({
      organization_email: email,
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
