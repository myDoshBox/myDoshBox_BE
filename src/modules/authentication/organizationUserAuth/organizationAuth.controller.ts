import { Request, Response } from "express";
import UserModel from "./organizationAuth.model";
import jwt from "jsonwebtoken";
interface TokenPayload {
  id: string;
}

const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: " please provide email and password",
      });
    }

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user || !(await user?.correctPassword(password, user.password))) {
      return res.status(404).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err: any) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
