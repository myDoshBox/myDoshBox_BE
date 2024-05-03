import JWT from "jsonwebtoken"
import OrganizationModel from "./organizationUserAuth/organizationAuth.model";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import individualUserAuthModel from "./individualUserAuth/individualUserAuth.model";

import AppError from "../../utils/appError";

interface TokenPayload {
    id: string;
  }
  
  const signToken = (id: string): string => {
    const payload: TokenPayload = { id };
    return JWT.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

  
export const userLogin = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      res.status(401).json({
        status: "fail",
        message: "Password do not match",
      });
    }
  
    // 2) Check if user exists && password is correct
    const organization = await OrganizationModel.findOne({ email });
    const user = await individualUserAuthModel.findOne({ email });

    // if(!organization && !user) return res.json({error: "Incorrect email or password"})
    
    if (!organization || !(await organization.correctPassword(password, organization.password))) {
      // return next(new AppError("Incorrect email or password", 401));
      res.status(401).json({
        status: "fail",
        message: "Password do not match",
      });
    }
  
    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  });