import { NextFunction, Request, Response } from "express";
import { Credentials, OAuth2Client } from "google-auth-library";
import GoogleIndividualUser from "./googleIndividualAuth.model";
import { createSessionAndSendTokens } from "../../../utilities/createSessionAndSendToken.util";

export const getGoogleUrl = async (req: Request, res: Response) => {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_IDS,
    process.env.GOOGLE_CLIENT_SECRETS,
    process.env.GOOGLE_REDIRECT_URI
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
      process.env.GOOGLE_CLIENT_IDS,
      process.env.GOOGLE_CLIENT_SECRETS,
      process.env.GOOGLE_REDIRECT_URI
    );

    const response = await oAuth2Client.getToken(code as string);
    await oAuth2Client.setCredentials(response.tokens as Credentials);
    const googleUser = oAuth2Client.credentials;
    const userDetails = await getUserDetails(googleUser.access_token as string);

    const { name, email, email_verified, picture, sub } = userDetails;

    if (!userDetails.email_verified) {
      return res.status(400).json({
        status: "failed",
        message: "Google user not verified",
      });
    }

    const googleUserExist = await GoogleIndividualUser.findOne({
      sub: userDetails.sub,
    });

    if (!googleUserExist) {
      const newUser = await GoogleIndividualUser.create({
        name,
        email,
        email_verified,
        picture,
        sub,
      });

      const createSessionAndSendTokensOptions = {
        user: newUser.toObject(),
        userAgent: req.get("user-agent") || "",
        userKind: "g-ind",
        message: "Individual google user successfully created",
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
      user: googleUserExist.toObject(),
      userAgent: req.get("user-agent") || "",
      userKind: "g-ind",
      message: "Individual google user successfully logged in",
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
  } catch (err: unknown) {
    // console.log(err.stack);
    next(err);
  }
};
