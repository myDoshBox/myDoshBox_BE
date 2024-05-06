import { Request, Response } from "express";
import OrganizationModel from "./organizationUserAuth/organizationAuth.model";
import IndividualUser from "./individualUserAuth/individualUserAuth.model";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../../utilities/email.utils";
import { createSessionAndSendTokens } from "../../utilities/createSessionAndSendToken.util";

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
      if (individualUserToLogin.role === "g-ind") {
        res.status(400).json({
          message:
            "Login using Google since you already signed in with Google.",
        });
      }

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
      if (organizationUserToLogin.role === "g-org") {
        res.status(400).json({
          message:
            "Login using Google since you already signed in with Google.",
        });
      }
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

    if (!individualUserToLogin || !organizationUserToLogin) {
      res.status(400).json({
        message: "This user does not exists",
      });
    }
  } catch (error) {
    console.error("Error Logging in user:", error);
    res.status(500).json({ message: "Error Logging in user" });
  }
};
