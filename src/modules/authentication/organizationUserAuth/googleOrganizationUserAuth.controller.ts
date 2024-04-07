import { Request, Response, NextFunction } from "express";
import { Credentials, OAuth2Client } from "google-auth-library";
import GoogleOrganizationUser from "./googleOrganizationUserAuth.model";
import { createSession } from "../../../utilities/createSession.util";
import { generateAccessAndRefreshToken } from "../../../utilities/generateAccessAndRefreshToken.util";

export const getGoogleUrl = async (req: Request, res: Response) => {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL
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

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URL
    );

    const response = await oAuth2Client.getToken(code as string);
    await oAuth2Client.setCredentials(response.tokens as Credentials);
    const googleUser = oAuth2Client.credentials;
    const userDetails = await getUserDetails(googleUser.access_token as string);

    if (!userDetails.email_verified) {
      return res.status(400).json({
        status: "failed",
        message: "Google user not verified",
      });
    }

    const googleUserExist = await GoogleOrganizationUser.findOne({
      sub: userDetails.sub,
    });

    if (!googleUserExist) {
      return res.status(200).json({
        status: "success",
        data: {
          name: userDetails.name,
          email: userDetails.email,
          email_verified: userDetails.email_verified,
          picture: userDetails.picture,
          sub: userDetails.sub,
        },
      });
    }

    const session = await createSession(
      googleUserExist._id.toString(),
      req.get("user-agent") || "",
      "g-org"
    );

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      googleUserExist,
      session._id
    );

    return res.status(200).json({
      status: true,
      message: "Google user sucessfully logged in",
      user: googleUserExist,
      accessToken,
      refreshToken,
    });
  } catch (err: unknown) {
    // console.log("errorrrrrrrrrrr", err);
    next(err);
  }
};

export const createGoogleUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      email_verified,
      picture,
      sub,
      contact_email,
      contact_phone,
    } = req.body;

    if (
      !name ||
      !email ||
      !email_verified ||
      !picture ||
      !sub ||
      !contact_email ||
      !contact_phone
    ) {
      return res.status(400).json({
        status: false,
        message: "Please provide the all the needed data for signup",
      });
    }

    const emailAlreadyExist = await GoogleOrganizationUser.findOne({
      email,
    });
    //const emailAlreadyExist = await OtherUserModels.findOne({ email: userDetails.email });
    //const emailAlreadyExist = await OtherUserModels.findOne({ email: userDetails.email });

    if (emailAlreadyExist) {
      return res.status(400).json({
        status: false,
        message: "User with email already exist",
      });
    }

    const user = await GoogleOrganizationUser.create({
      name,
      email,
      email_verified,
      picture,
      sub,
      contact_email,
      contact_phone,
    });

    const session = await createSession(
      user._id.toString(),
      req.get("user-agent") || "",
      "g-org"
    );

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      user,
      session._id
    );

    return res.status(201).json({
      status: true,
      message: "google user sucessfully created",
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
