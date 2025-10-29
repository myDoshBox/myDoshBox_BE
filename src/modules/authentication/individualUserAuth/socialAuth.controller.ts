import jwt from "jsonwebtoken";
import axios from "axios";
import { TwitterApi } from "twitter-api-v2";
import { Request, Response, NextFunction } from "express";
import IndividualUser from "../individualUserAuth/individualUserAuth.model1";
import TwitterSession from "../../sessions/TwitterSession.model";
import { sendWelcomeEmail } from "../../../utilities/email.utils";
import { createSessionAndSendTokens } from "../../../utilities/createSessionAndSendToken.util";
import { ErrorResponse } from "../../../utilities/errorHandler.util";

// ==================== GOOGLE LOGIN ====================
export const handleGoogleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Google credential is required",
      };
      return next(error);
    }

    // Decode the JWT credential from Google
    const decoded: any = jwt.decode(credential);

    if (!decoded?.email) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid Google token",
      };
      return next(error);
    }

    // Check if user exists
    let user = await IndividualUser.findOne({ email: decoded.email });
    const isNewUser = !user;

    // Create new user if doesn't exist
    if (!user) {
      user = await IndividualUser.create({
        email: decoded.email,
        phone_number: "", // Optional field
        role: "g-ind", // Google individual user
        picture: decoded.picture,
        sub: decoded.sub, // Google's unique user ID
        email_verified: true, // Google verifies emails
      });
      console.log("✅ Created new user via Google login:", user.email);
    } else {
      // Update existing user with latest Google data
      user.picture = decoded.picture || user.picture;
      user.sub = decoded.sub || user.sub;
      user.email_verified = true;
      await user.save();
    }

    // Send welcome email for new users
    if (isNewUser) {
      await sendWelcomeEmail(user.email).catch((err) => {
        console.error("Failed to send welcome email:", err);
      });
    }

    // Get user agent
    const userAgent = req.get("User-Agent") || "unknown";

    // Create session and generate tokens
    const result = await createSessionAndSendTokens({
      user: user.toObject(),
      userAgent: userAgent,
      role: "g-ind",
      message: isNewUser ? "Account created successfully" : "Login successful",
    });

    // Set cookies
    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      message: result.message,
      user: {
        id: user._id,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        picture: user.picture,
        email_verified: user.email_verified,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Google login failed",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

// ==================== TWITTER AUTH INITIATION ====================
export const initiateTwitterAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const redirectUri =
      (req.query.redirectUri as string) || process.env.TWITTER_REDIRECT_URI;

    if (!redirectUri) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Redirect URI is required",
      };
      return next(error);
    }

    const twitterClient = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    // Generate OAuth2 authorization URL
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
      redirectUri,
      {
        scope: ["tweet.read", "users.read", "offline.access"],
      }
    );

    // Store session with 10 minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await TwitterSession.create({
      state,
      codeVerifier,
      codeChallenge: "library-generated",
      redirectUri,
      expiresAt,
    });

    console.log("✅ Generated Twitter OAuth 2.0 URL");

    res.status(200).json({
      status: "success",
      message: "Twitter authentication URL generated",
      data: {
        authUrl: url,
        state: state,
      },
    });
  } catch (error) {
    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Failed to initiate Twitter authentication",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

// ==================== TWITTER CALLBACK ====================
export const handleTwitterCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, state } = req.body;

    if (!code || !state) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Code and state parameters are required",
      };
      return next(error);
    }

    // Find and validate session
    const session = await TwitterSession.findOne({
      state,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid or expired authentication session",
      };
      return next(error);
    }

    const { codeVerifier, redirectUri } = session;

    // Clean up session immediately
    await TwitterSession.deleteOne({ _id: session._id });

    // Initialize Twitter client
    const twitterClient = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    // Exchange code for access token
    const { accessToken } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri,
    });

    console.log("✅ Twitter token exchange successful");

    // Get user data from Twitter
    const authenticatedClient = new TwitterApi(accessToken);
    const userResult = await authenticatedClient.v2.me({
      "user.fields": ["id", "name", "username", "profile_image_url"],
    });

    if (!userResult.data) {
      const error: ErrorResponse = {
        statusCode: 500,
        status: "error",
        message: "Failed to fetch user data from Twitter",
      };
      return next(error);
    }

    const { id, name, username, profile_image_url } = userResult.data;

    // Twitter doesn't provide email, so generate one
    const email = `${username}@twitter.generated`;

    // Find or create user
    let user = await IndividualUser.findOne({
      $or: [{ email: email }, { sub: id }],
    });

    const isNewUser = !user;

    if (!user) {
      user = await IndividualUser.create({
        email,
        phone_number: "",
        role: "g-ind", // Social login user
        picture: profile_image_url,
        sub: id, // Twitter user ID
        email_verified: false, // Twitter doesn't provide email verification
      });
      console.log("✅ Created new user via Twitter login:", user.email);
    } else {
      // Update existing user
      user.picture = profile_image_url || user.picture;
      await user.save();
    }

    // Send welcome email for new users
    if (isNewUser) {
      await sendWelcomeEmail(user.email).catch((err) => {
        console.error("Failed to send welcome email:", err);
      });
    }

    // Get user agent
    const userAgent = req.get("User-Agent") || "unknown";

    // Create session and generate tokens
    const result = await createSessionAndSendTokens({
      user: user.toObject(),
      userAgent: userAgent,
      role: "g-ind",
      message: isNewUser ? "Account created successfully" : "Login successful",
    });

    // Set cookies
    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      message: result.message,
      user: {
        id: user._id,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        picture: user.picture,
        email_verified: user.email_verified,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    // Clean up session on error
    if (req.body.state) {
      await TwitterSession.deleteMany({ state: req.body.state }).catch(
        console.error
      );
    }

    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message: "Twitter authentication failed",
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};

// ==================== FACEBOOK LOGIN ====================
export const handleFacebookLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Facebook access token is required",
      };
      return next(error);
    }

    console.log("🔧 Verifying Facebook access token...");

    // Verify token and get user data from Facebook
    const { data } = await axios.get(
      `https://graph.facebook.com/v20.0/me?fields=id,name,email,picture.width(500).height(500)&access_token=${accessToken}`
    );

    console.log("✅ Facebook API response received");

    if (!data.id) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message: "Invalid Facebook access token",
      };
      return next(error);
    }

    if (!data.email) {
      const error: ErrorResponse = {
        statusCode: 400,
        status: "fail",
        message:
          "Email permission required. Please grant email access when logging in with Facebook.",
      };
      return next(error);
    }

    // Find or create user
    let user = await IndividualUser.findOne({
      $or: [{ email: data.email }, { sub: data.id }],
    });

    const isNewUser = !user;

    if (!user) {
      user = await IndividualUser.create({
        email: data.email,
        phone_number: "",
        role: "g-ind", // Social login user
        picture: data.picture?.data?.url,
        sub: data.id, // Facebook user ID
        email_verified: true, // Facebook emails are verified
      });
      console.log("✅ Created new user via Facebook login:", user.email);
    } else {
      // Update existing user with latest Facebook data
      user.picture = data.picture?.data?.url || user.picture;
      user.email_verified = true;
      await user.save();
    }

    // Send welcome email for new users
    if (isNewUser) {
      await sendWelcomeEmail(user.email).catch((err) => {
        console.error("Failed to send welcome email:", err);
      });
    }

    // Get user agent
    const userAgent = req.get("User-Agent") || "unknown";

    // Create session and generate tokens
    const result = await createSessionAndSendTokens({
      user: user.toObject(),
      userAgent: userAgent,
      role: "g-ind",
      message: isNewUser ? "Account created successfully" : "Login successful",
    });

    // Set cookies
    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      message: result.message,
      user: {
        id: user._id,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        picture: user.picture,
        email_verified: user.email_verified,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    console.error(
      "Facebook login error:",
      error.response?.data || error.message
    );

    let message = "Facebook authentication failed";

    // Parse Facebook API errors
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      if (fbError.code === 190) {
        message = "Invalid Facebook token. Please try logging in again.";
      } else if (fbError.code === 104) {
        message = "Facebook API limit reached. Please try again later.";
      }
    }

    const errResponse: ErrorResponse = {
      statusCode: 500,
      status: "error",
      message,
      stack: error instanceof Error ? { stack: error.stack } : undefined,
    };
    next(errResponse);
  }
};
