import { Request, Response } from "express";
import { Credentials, OAuth2Client } from "google-auth-library";
import { User } from "../../users/organizationUsers/OrganizationUser.model";
// import { signJwt } from "../../users/organizationUsers/organizationUsers.utils";
import { createSession } from "../../../utilities/createSession.util";
import { generateAccessAndRefreshToken } from "../../../utilities/generateAccessAndRefreshToken.util";
// import { createSession } from "./sessionsController.controller";

export const getGoogleUrl = async (req: Request, res: Response) => {
  console.log("here");
  // const stateOptions = req.body;
  // const encodedStateOptions = btoa(JSON.stringify(stateOptions));

  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL
  );

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    // state: encodedStateOptions,
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

export const getGoogleUserDetail = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    // const decodedState = JSON.parse(atob(state as string));

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
        status: false,
        message: "Google user not verified",
      });
    }
    console.log("hello");

    const googleUserExist = await User.findOne({
      sub: userDetails.sub,
    });

    //

    if (!googleUserExist) {
      return res.status(200).json({
        status: true,
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
      req.get("user-agent") || ""
    );

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      googleUserExist,
      session._id
    );

    console.log("New Google User");
    console.log(googleUserExist);
    console.log(accessToken);
    console.log(refreshToken);

    return res.status(200).json({
      status: true,
      message: "Google user sucessfully logged in",
      user: googleUserExist,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log("error");
    return res.json(err);
  }
};

export const createGoogleUser = async (req: Request, res: Response) => {
  try {
    // console.log(req.body);
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

    const emailAlreadyExist = await User.findOne({
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

    const user = await User.create({
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
      req.get("user-agent") || ""
    );

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      user,
      session._id
    );

    console.log("Existing Google User");
    console.log(user);
    console.log(accessToken);
    console.log(refreshToken);

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
