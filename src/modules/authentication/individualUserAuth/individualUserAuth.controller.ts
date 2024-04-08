import { Request, Response, NextFunction } from "express";
import IndividualUser, { IndividaulDocument } from "./individualUserAuth.model";
import individualAuthPasswordToken from "./individualAuthPasswordToken";
import { isValidObjectId } from "mongoose";
import Jwt from "jsonwebtoken";

export const generateToken = (length = 4) =>{
  // decallar variable 
  let otp = "";
  
  for(let i = 0; i < length; i++){
      const digit = Math.floor(Math.random() * 10)
      otp += digit
  }
  return otp;
}


export const individualUserRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phoneNumber, password, confirmPassword } = req.body;

    // Check if the user already exists
    const userExists: IndividaulDocument | null = await IndividualUser.findOne(
      {email}
    );

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Create a new user
    const newUser = new IndividualUser({
      email,
      phoneNumber,
      password,
      confirmPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Send a response
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error: unknown) {
    // console.error("Error in individualUserRegistration:", error.name, "HEREEEEEEEEEEEEEEEEEEEEEE");
    next(error);
  }
};


export const verifyIndividualUserEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    // Check if the user exists and is verified
    const user = await IndividualUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found or email does not match." });
    }
    if (user.verified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Perform email verification logic here...
    
    // Update user's verification status
    user.verified = true; 
    await user.save();

    // Respond with success message
    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


// export const verifyIndividualUserEmail = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { email, token } = req.body;

//     // Find the user by email using UserModel's static method
//     const user: UserDocument | null = await IndividualUser.getUserByEmail(
//       email
//     );

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     // Check if the provided token matches the stored verification token
//     if (user.emailVerificationToken !== token) {
//       return res.status(400).json({
//         message: "Invalid verification token",
//       });
//     }

//     // Mark the user's email as verified
//     user.isEmailVerified = true;
//     user.emailVerificationToken = undefined;
//     await user.save();

//     // Send a response
//     res.status(200).json({
//       message: "Email verified successfully",
//     });
//   } catch (error) {
//     console.error("Error in verifyIndividualUserEmail:", error);
//     res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// export const individualUserLogin = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Check if the user exists
//     const user: UserDocument | null = await IndividualUser.getUserByEmail(
//       email
//     );

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     // Check if password is correct
//     const isPasswordValid = await user.comparePassword(password);

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         message: "Invalid email or password",
//       });
//     }

//     // Implement JWT token generation and return token in response
//     // For example:
//     // const token = generateToken(user);
//     // res.status(200).json({ token });

//     res.status(200).json({
//       message: "Login successful",
//     });
//   } catch (error) {
//     console.error("Error in individualUserLogin:", error);
//     res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// export const individualUserLogin = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   const user = await IndividualUser.findOne({ email });
//   if (!user)
//     return res.status(400).json({ message: "Email/Password mismatch!" });
//   const isMatch = await user.comparePassword(password);
//   if (!isMatch)
//     return res.status(400).json({ message: "Email/Password mismatch!" });
//   const token = Jwt.sign(
//     { userId: user._id },
//     process.env.JWT_SECRET || "secret",
//     { expiresIn: "1h" }
//   );
//   const decoded = Jwt.decode(token);
//   console.log(decoded);
//   res.status(201).json({ token, userId: user._id }); 
// };

export const individualUserLogin = async (req: Request, res: Response) => {
  const {email, password} = req.body;
  const user = await IndividualUser.findOne({email});
  if(!user) return res.status(400).json({message: "Email/Password mismatch!"});
  const isMatch = await user.comparePassword(password);
  if(!isMatch) return res.status(400).json({message: "Email/Password mismatch!"}); 
  const token = Jwt.sign({userId: user._id}, process.env.JWT_SECRET || "secret", {expiresIn: "1h"});
  // const decoded = Jwt.decode(token)
  // console.log(decoded);
  res.status(201).json({token, userId: user._id});
};

export const generateOTP = async (req: Request, res: Response) => {
  const {email} = req.body;
  // if(!isValidObjectId(userId)) return res.status(400).json({message: "Invalid userId!"});
  const user = await IndividualUser.findOne({email});
  if(!user) return res.status(400).json({message: "User not found!"});
  const userId = user._id;
  const token = generateToken();
  console.log(token)

  await individualAuthPasswordToken.findOneAndDelete({
    owner: userId
  });

  const newToken = await individualAuthPasswordToken.create({
    owner: userId,
    token
  })
  res.json({Token: newToken.token}); 
};

export const verifyOTP = async (req: Request, res: Response) => {
  const {email, token} = req.body;
  try {
    const user = await IndividualUser.findOne({email})
    if(!user) return res.status(400).json({message: "Invalid user!"})
    const verifyToken = await individualAuthPasswordToken.findOne({owner: user._id});

    if (!verifyToken) {
        return res.status(403).json({ error: "Invalid token!"});
    }

    const matched = await verifyToken.compareToken(token);

    if (!matched) {
        return res.status(403).json({ error: "Invalid token!" });
    }

    return res.json({ message: "Token verified!" });
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
}
};

export const resetIndividualPassword = async (req: Request, res: Response) => {
  const {userId, password} = req.body;
  // if(!isValidObjectId(userId)) return res.status(400).json({message: "Invalid userId!"});
  const user = await IndividualUser.findById({_id:userId});
  if(!user) return res.status(400).json({message: "User not found!"});
  user.password = password;    
  await user.save();

  await individualAuthPasswordToken.findOneAndDelete({
    owner: userId
  })

  res.json({message: "Password reset successfully!"});
};

// export const logout = async (req: Request, res: Response) => {};
