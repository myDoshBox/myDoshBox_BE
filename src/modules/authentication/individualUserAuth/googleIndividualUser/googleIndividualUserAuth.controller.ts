import { NextFunction, Request, Response } from "express";
import { Credentials, OAuth2Client } from "google-auth-library";
import { createSessionAndSendTokens } from "../../../../utilities/createSessionAndSendToken.util";
import IndividualUser from "../individualUserAuth.model";
import OrganizationModel from "../../organizationUserAuth/organizationAuth.model";

export const getGoogleUrl = async (req: Request, res: Response) => {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL_INDIVIDUAL
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
    const { code } = req.query;
    if (req.query.error === "access_denied") {
      return res.redirect(
        "https://mydoshbox-git-testingbranch-mydoshbox-gmailcom.vercel.app/signup"
      );
    }

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URL_INDIVIDUAL
    );

    const response = await oAuth2Client.getToken(code as string);
    await oAuth2Client.setCredentials(response.tokens as Credentials);
    const googleUser = oAuth2Client.credentials;
    const userDetails = await getUserDetails(googleUser.access_token as string);

    const { name, email, email_verified, picture, sub } = userDetails;

    if (!userDetails.email_verified) {
      return res.status(401).json({
        status: "failed",
        message: "Google user not verified",
      });
    }

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

    // if (individualEmailAlreadyExist.sub)

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
      user: individualEmailAlreadyExist.toObject(),
      userAgent: req.get("user-agent") || "",
      role: "g-ind",
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // console.log(err.stack);
    next(err);
  }
};
