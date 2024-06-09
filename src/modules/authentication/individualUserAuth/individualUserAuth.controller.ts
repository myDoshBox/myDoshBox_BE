import jwt from "jsonwebtoken";
// import { NextFunction, Request, Response } from "express";
import { NextFunction, Request, Response } from "express";

import IndividualUser from "./individualUserAuth.model1";
import individualAuthPasswordToken from "./individualAuthPasswordToken";
import { sendVerificationEmail } from "../../../utilities/email.utils";
import OrganizationModel from "../organizationUserAuth/organizationAuth.model";
// import { createSessionAndSendTokens } from "../../../../utilities/createSessionAndSendToken.util";
import bcrypt from "bcrypt";
import { signJwt } from "../../../utilities/signAndVerifyToken.util";

import { OAuth2Client } from "google-auth-library";
import { createSessionAndSendTokens } from "../../../utilities/createSessionAndSendToken.util";

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
        message: "Confirm password is required",
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
      email,
    });

    if (individualEmailAlreadyExist || organizationEmailAlreadyExist) {
      return res.status(400).json({
        status: "false",
        message: "User already exists",
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
        expiresIn: 2 * 60,
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

export const individualUserRegistrationGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, phone_number } = req.body;

  try {
    const individualUserToLogin = await IndividualUser.findOne({
      email,
    }).select("+password");

    if (individualUserToLogin) {
      const token = signJwt.toString();
      // const token = signJwt();

      res.cookie("access_token", token, { httpOnly: true }).status(200).json();
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8);

      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

      // Create a new user
      const newUser = new IndividualUser({
        email,
        phone_number,
        password: hashedPassword,
        role: "ind",
        email_verified: true,
      });

      await newUser.save();

      const token = signJwt.toString();
      res.cookie("access_token", token, { httpOnly: true }).status(200).json();
    }
  } catch (error) {
    console.log(error);
    next(error);
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

export const getGoogleUrl = async (req: Request, res: Response) => {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL_INDIVIDUAL
  );

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL_INDIVIDUAL,
  });

  return res.json({ authorizeUrl });
};

export const getUserDetails = async (access_token: string) => {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );

  if (!response.ok) {
    throw new Error();
  }

  const data = response.json();
  return data;
};

/**
 * Retrieves the details of a Google user using the provided authorization code.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */
export const getGoogleUserDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Missing authorization code" });
    }

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URL_INDIVIDUAL
    );

    const { tokens } = await oAuth2Client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL_INDIVIDUAL,
    });

    oAuth2Client.setCredentials(tokens);
    const userDetails = await getUserDetails(tokens.access_token as string);

    if (!userDetails.email_verified) {
      return res.status(401).json({
        status: "failed",
        message: "Google user not verified",
      });
    }

    const { name, email, email_verified, picture, sub } = userDetails;

    // Check if the user already exists
    const individualEmailAlreadyExist = await IndividualUser.findOne({
      email,
    });
    const organizationEmailAlreadyExist = await OrganizationModel.findOne({
      organization_email: email,
    });

    if (
      individualEmailAlreadyExist &&
      individualEmailAlreadyExist.role === "ind"
    ) {
      return res.status(400).json({
        status: "false",
        message:
          "Kindly login with your email and password as account was not registered with google",
      });
    }

    if (organizationEmailAlreadyExist) {
      return res.status(400).json({
        status: "false",
        message:
          "User already exist as an organization. Kindly login as an organization to continue",
      });
    }

    const googleUserExist = individualEmailAlreadyExist?.sub;

    if (!googleUserExist) {
      const newUser = await IndividualUser.create({
        name,
        email,
        email_verified,
        picture,
        sub,
        role: "g-ind",
      });

      const createSessionAndSendTokensOptions = {
        user: newUser.toObject(),
        userAgent: req.get("user-agent") || "",
        role: newUser.role,
        message: "Individual Google user successfully created",
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
    }

    const createSessionAndSendTokensOptions = {
      user: individualEmailAlreadyExist.toObject(),
      userAgent: req.get("user-agent") || "",
      role: "g-ind",
      message: "Individual Google user successfully logged in",
    };

    const { status, message, user, accessToken, refreshToken } =
      await createSessionAndSendTokens(createSessionAndSendTokensOptions);

    return res.status(200).json({
      status,
      message,
      user,
      accessToken,
      refreshToken,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    next(err);
  }
};
