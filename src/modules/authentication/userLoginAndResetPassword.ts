import { NextFunction, Request, RequestHandler, Response } from "express";
import catchAsync from "../../utilities/catchAsync";
import { sendURLEmail } from "../../utilities/email.utils";
import OrganizationModel from "./organizationUserAuth/organizationAuth.model";
import IndividualUser from "./individualUserAuth/individualUserAuth.model";
import AppError from "../../utilities/appError";
import jwt, { JwtPayload } from "jsonwebtoken"
import * as crypto from "crypto";

interface TokenPayload {
  id: string;
}

const signToken = (id: string): string => {
  const payload: TokenPayload = { id };
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const userLogin: RequestHandler = async (req: Request, res: Response) =>{
    const {email, password, organization_email} = req.body;
    const user = await IndividualUser.findOne({email})
    const organization = await OrganizationModel.findOne({organization_email})

    if(!user && !organization){
        return res.status(422).json({error: "Invalid email or password!"})
    }

    // compare password
    if(user){
        const passwordMatch = await user.comparePassword(password)
        if(!passwordMatch) return res.status(422).json({error: "Invalid email or password"})
    }

    if(organization){
        const passwordMatch = await organization.correctPassword(password, organization.password)
        if(!passwordMatch) return res.status(422).json({error: "Invalid email or passwprd!"})
    }

    // generate token

    if(user){
        const token = jwt.sign({id: user._id, email: user.email, name: user.name}, process.env.JWT_SECRET!, {expiresIn: '1h'})
        return res.status(200).json(token)
    }

    if(organization){
        const token = jwt.sign({id: organization._id, email: organization.organization_email}, process.env.JWT_SECRET!, {expiresIn: '1h'})
        return res.status(200).json(token)
    }
}



export const OrganizationUserForgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // 1) Get user based on POSTed email
      const {email} = req.body
      console.log(email)
      const org = await OrganizationModel.findOne({
        organization_email: email,
      });
      const user = await IndividualUser.findOne({
        email,
      });
      console.log(user)
      if (!org || !user) {
        return next(new AppError("There is no user with email address.", 404));
      }
  
      // 2) Generate the random reset token
      // const resetToken = org.createPasswordResetToken();
      // await org.save({ validateBeforeSave: false });
      // await user.save({ validateBeforeSave: false });
      const resetToken = org ? org.createPasswordResetToken() : user.createPasswordResetToken();
      await (org ? org.save({ validateBeforeSave: false }) : user.save({ validateBeforeSave: false }));
  
      // 3) Send it to user's email
      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/auth/organization/resetPassword/${resetToken}`;
  
      try {
        sendURLEmail([org.organization_email, user.email], resetURL);
        res.status(200).json({ message: "success" });
      } catch (err) {
        return next(new AppError("There is an error sending the email.", 500));
      }
    }
  );

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


//  export const organizationUserResetPassword = catchAsync(
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
//     })

//     // 2) If token has not expired, and there is org, set the new password
//     if (!org || !user) {
//       return next(new AppError("Token is invalid or has expired", 400));
//     }
//     org.password = req.body.password;
//     org.passwordResetToken = undefined;
//     org.passwordResetExpires = undefined;
//     await org.save();

//     user.password = req.body.password;
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await org.save();

//     // 3) Update changedPasswordAt property for the org
//     // 4) Log the org in, send JWT
//     createSendToken(org, 200, res);
//   }
// );

export const organizationUserResetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const org = await OrganizationModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    const user = await IndividualUser.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is a user, set the new password
    if (!org && !user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    if (org) {
      org.password = req.body.password;
      org.passwordResetToken = undefined;
      org.passwordResetExpires = undefined;
      await org.save();
    }

    if (user) {
      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }

    // 3) Update changedPasswordAt property for the user/organization
    // [Update this part according to your implementation]

    // 4) Log the user/organization in and send JWT
    if (org) {
      createSendToken(org, 200, res);
    } else if (user) {
      createSendToken(user, 200, res);
    }
  }
);
