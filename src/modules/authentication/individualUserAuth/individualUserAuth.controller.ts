import { Request, Response } from "express"
import IndividualUser from "./individualUserAuth.model"
import { hashPassword } from "./individualHashPassword"


export const individualUserRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, phoneNumber, password } = req.body;
     // Hash the password
     const hashedPassword = await hashPassword(password);

     // check if the user already exists
     const userExists = await IndividualUser.findOne({ email })
     .select("email")
     .lean();

   if (userExists) {
     return res.status(400).json({
       message: "User already exists",
     });
   }

   // create a new user
   const newUser = new IndividualUser({
     email,
     phoneNumber,
     password: hashedPassword // The password is hashed
   });

   // save the user to the database
   await newUser.save();

   // send a response
   res.status(201).json({
     message: "User registered successfully",
   });
 } catch (error) {
   res.status(500).json({
     message: "Internal server error",
   });
 }
};


// export const verifyIndividualUserEmail = async (
//   req: Request,
//   res: Response
// ) => {};

// export const individualUserLogin = async (req: Request, res: Response) => {};

// export const generateOTP = async (req: Request, res: Response) => {};

// export const verifyOTP = async (req: Request, res: Response) => {};

// export const resetPassword = async (req: Request, res: Response) => {};

// export const logout = async (req: Request, res: Response) => {};
