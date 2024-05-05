import { Request, Response } from "express";
import OrganizationModel from "./organizationUserAuth/organizationAuth.model";
import IndividualUser from "./individualUserAuth/individualUserAuth.model";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../../utilities/email.utils";
import { createSessionAndSendTokens } from "../../utilities/createSessionAndSendToken.util";

export const UserLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
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
        password
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
    });
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
        password,
        organizationUserToLogin.password
      );
      if (!passwordMatch) {
        return res.status(422).json({ error: "Invalid email or password" });
      }
      const { ...userWithoutPassword } = organizationUserToLogin.toObject();
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
