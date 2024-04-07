import { Request, Response } from "express";
import IndividualUser, { UserDocument } from "./individualUserAuth.model";

export const individualUserRegistration = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, phoneNumber, password, confirmPassword } = req.body;

    // Check if the user already exists
    const userExists: UserDocument | null = await IndividualUser.getUserByEmail(
      email
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
  } catch (error) {
    console.error("Error in individualUserRegistration:", error);
    res.status(500).json({
      message: "Internal server error",
    });
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

export const generateOTP = async (req: Request, res: Response) => {};

export const verifyOTP = async (req: Request, res: Response) => {};

export const resetPassword = async (req: Request, res: Response) => {};

export const logout = async (req: Request, res: Response) => {};

