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
  } catch (error) {
    console.error("Error Logging in user:", error);
    res.status(500).json({ message: "Error Logging in user" });
  }
};

// export const OrganizationUserForgotPassword = catchAsync(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     // 1) Get user based on POSTed email
//     const { email } = req.body;
//     const org = await OrganizationModel.findOne({
//       organization_email: email, // Use email directly, assuming it's the organization's email
//     });
//     const user = await IndividualUser.findOne({
//       email: email, // Use email directly
//     });
//     console.log(user);
//     if (!org && !user) { // Check if neither organization nor individual user found
//       return next(new AppError("There is no user with the provided email address.", 404));
//     }

//     // 2) Generate the random reset token
//     const resetToken = org ? org.createPasswordResetToken() : user.createPasswordResetToken();

//     // Since we're not sure whether org or user is defined, check before saving
//     if (org) await org.save({ validateBeforeSave: false });
//     if (user) await user.save({ validateBeforeSave: false });

//     // 3) Send it to user's email
//     const resetURL = `${req.protocol}://${req.get(
//       "host"
//     )}/auth/organization/resetPassword/${resetToken}`;

//     try {
//          sendURLEmail([org.organization_email, user.email], resetURL);
//       // Filter out undefined emails
//       res.status(200).json({ message: "success" });
//     } catch (err) {
//       return next(new AppError("There is an error sending the email.", 500));
//     }
//   }
// );

// export const organizationUserResetPassword = catchAsync(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     // 1) Get user based on the token
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(req.params.token)
//       .digest("hex");

//     const org = await OrganizationModel.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() },
//     });

//     const user = await IndividualUser.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() },
//     });

//     // 2) If token has not expired, and there is a user, set the new password
//     if (!org && !user) {
//       return next(new AppError("Token is invalid or has expired", 400));
//     }

//     if (org) {
//       org.password = req.body.password;
//       org.passwordResetToken = undefined;
//       org.passwordResetExpires = undefined;
//       await org.save();
//     }

//     if (user) {
//       user.password = req.body.password;
//       user.passwordResetToken = undefined;
//       user.passwordResetExpires = undefined;
//       await user.save();
//     }

//     // 3) Update changedPasswordAt property for the user/organization
//     // [Update this part according to your implementation]

//     // 4) Log the user/organization in and send JWT
//     if (org) {
//       createSendToken(org, 200, res);
//     } else if (user) {
//       createSendToken(user, 200, res);
//     }
//   }
// );
