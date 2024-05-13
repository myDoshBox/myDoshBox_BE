import { NextFunction, Request, Response } from "express";
import { Credentials, OAuth2Client } from "google-auth-library";
// import GoogleOrganizationUser from "./googleOrganizationUserAuth.model";
import OrganizationModel from "../organizationAuth.model";
import { createSessionAndSendTokens } from "../../../../utilities/createSessionAndSendToken.util";
import IndividualUser from "../../individualUserAuth/individualUserAuth.model";

export const getGoogleUrl = async (req: Request, res: Response) => {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL_ORGANIZATION
  );

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope:
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
  });
  return res.json({ authorizeUrl });
};

export const getUserDetails = async (access_token: string) => {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );

  const data = await response.json();

  return data;
};

export const getGoogleUserDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.query;

    if (req.query.error === "access_denied") {
      return res.redirect(
        "https://mydoshbox-git-testingbranch-mydoshbox-gmailcom.vercel.app/signup"
      );
    }

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URL_ORGANIZATION
    );

    const response = await oAuth2Client.getToken(code as string);
    await oAuth2Client.setCredentials(response.tokens as Credentials);
    const googleUser = oAuth2Client.credentials;
    const userDetails = await getUserDetails(googleUser.access_token as string);

    if (!userDetails.email_verified) {
      return res.status(401).json({
        status: "failed",
        message: "Google user not verified",
      });
    }

    // Check if the user already exists
    const individualEmailAlreadyExist = await IndividualUser.findOne({
      email: userDetails.email,
    });
    const organizationEmailAlreadyExist = await OrganizationModel.findOne({
      organization_email: userDetails.email,
    });

    if (
      organizationEmailAlreadyExist &&
      organizationEmailAlreadyExist.role === "org"
    ) {
      return res.status(400).json({
        status: "false",
        message:
          "Kindly login with your email and password as account was not registered with google",
      });
    }

    if (individualEmailAlreadyExist) {
      return res.status(400).json({
        status: "false",
        message:
          "User already exist as an individual user. Kindly login as an individual user to continue",
      });
    }

    const googleUserExist = organizationEmailAlreadyExist?.sub;

    if (!googleUserExist) {
      return res.status(200).json({
        status: "success",
        data: {
          organization_name: userDetails.name,
          organization_email: userDetails.email,
          email_verified: userDetails.email_verified,
          picture: userDetails.picture,
          sub: userDetails.sub,
        },
      });
    }

    const createSessionAndSendTokensOptions = {
      user: organizationEmailAlreadyExist.toObject(),
      userAgent: req.get("user-agent") || "",
      role: "g-org",
      message: "Google user sucessfully logged in",
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
    // console.log("errorrrrrrrrrrr", err);
    next(err);
  }
};

export const createGoogleUser = async (req: Request, res: Response) => {
  try {
    const {
      organization_name,
      organization_email,
      email_verified,
      picture,
      sub,
      contact_email,
      contact_number,
    } = req.body;

    if (
      !organization_name ||
      !organization_email ||
      !email_verified ||
      !picture ||
      !sub ||
      !contact_email ||
      !contact_number
    ) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide the all the needed data for signup",
      });
    }

    const emailAlreadyExist = await OrganizationModel.findOne({
      organization_email,
    });
    //const emailAlreadyExist = await OtherUserModels.findOne({ email: userDetails.email });
    //const emailAlreadyExist = await OtherUserModels.findOne({ email: userDetails.email });

    if (emailAlreadyExist) {
      return res.status(409).json({
        status: "failed",
        message: "User with email already exist",
      });
    }

    const newUser = await OrganizationModel.create({
      organization_name,
      organization_email,
      email_verified,
      picture,
      sub,
      contact_email,
      contact_number,
      role: "g-org",
      //g-org, g-ind, org, ind
    });

    const createSessionAndSendTokensOptions = {
      user: newUser.toObject(),
      userAgent: req.get("user-agent") || "",
      role: newUser.role,
      message: "Google user sucessfully created and logged in",
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log(err.stack);
    return res.json(err);
  }
};
