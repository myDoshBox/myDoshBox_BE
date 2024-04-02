import { Request, Response } from "express";
import IndividualUser from "./individualUserAuth.model"
import Jwt from "jsonwebtoken";


export const individualUserRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, phoneNumber, password } = req.body;

    const userExists = await IndividualUser.findOne({ email }).lean();

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    // create a new user
    const newUser = new IndividualUser({
      email,
      phoneNumber,
      password,
    });

    // save the user to the database
    await newUser.save();

    // send a response
    res.status(201).json({
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const verifyIndividualUserEmail = async (
  req: Request,
  res: Response
) => {};

export const individualUserLogin = async (req: Request, res: Response) => {
  const {email, password} = req.body;
  const user = await IndividualUser.findOne({email});
  if(!user) return res.status(400).json({message: "Email/Password mismatch!"});
  const isMatch = await user.comparePassword(password);
  if(!isMatch) return res.status(400).json({message: "Email/Password mismatch!"}); 
  const token = Jwt.sign({userId: user._id}, process.env.JWT_SECRET || "secret", {expiresIn: "1h"});
  const decoded = Jwt.decode(token)
  console.log(decoded);
  res.status(201).json({token, userId: user._id});
};

export const generateOTP = async (req: Request, res: Response) => {};

export const verifyOTP = async (req: Request, res: Response) => {};

export const resetPassword = async (req: Request, res: Response) => {};   

export const logout = async (req: Request, res: Response) => {};
