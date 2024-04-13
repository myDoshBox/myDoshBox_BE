import { Request, Response, NextFunction } from "express";
import IndividualUser, {
  IndividualUserModel,
} from "./individualUserAuth.model";
import individualAuthPasswordToken from "./individualAuthPasswordToken";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../../../utils/email.utils";
import catchAsync from "../../../utils/catchAsync";
import AppError from "../../../utils/appError";

export const generateToken = (length = 4) => {
  // decallar variable
  let otp = "";

  for (let i = 0; i < length; i++) {
    const digit = Math.floor(Math.random() * 10);
    otp += digit;
  }
  return otp;
};

const generateAccessAndRefreshToken = (
  userId: string
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET || "secret",
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET || "secret",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const individualUserRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phoneNumber, password, confirmPassword } = req.body;

    // Check if the user already exists
    const userExists: IndividualUserModel | null = await IndividualUser.findOne(
      { email }
    );

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Create a new user
    const newUser = new IndividualUser({
      email,
      phoneNumber,
      password,
    });

    // Save the user to the database
    await newUser.save();

    // Generate access and refresh token
    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      newUser._id
    );

    // Send a response
    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
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
      return res
        .status(404)
        .json({ message: "User not found or email does not match." });
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
  const { email, password } = req.body;
  const user = await IndividualUser.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "Email/Password mismatch!" });
  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.status(400).json({ message: "Email/Password mismatch!" });
  const token = Jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1h" }
  );
  // const decoded = Jwt.decode(token)
  // console.log(decoded);
  res.status(201).json({ token, userId: user._id });
};

// export const generateOTP = async (req: Request, res: Response) => {
//   const {email} = req.body;
//   // if(!isValidObjectId(userId)) return res.status(400).json({message: "Invalid userId!"});
//   const user = await IndividualUser.findOne({email});
//   if(!user) return res.status(400).json({message: "User not found!"});
//   const userId = user._id;
//   const token = generateToken();
//   console.log(token)

//   await individualAuthPasswordToken.findOneAndDelete({
//     owner: userId
//   });

//   const newToken = await individualAuthPasswordToken.create({
//     owner: userId,
//     token
//   })

//   const message = `Forgot your password? Here is one time password for your reset password : ${token}.\nIf you didn't forget your password, please ignore this email!`;

//   try {
//     // sendEmail function needs to be implemented separately
//     await sendEmail({
//       email,
//       subject: "Your password reset token (valid for 10 min)",
//       message,
//     });

//     // res.status(200).json({
//     //   status: "success",
//     //   message: "Token sent to email!",
//     // });
//     res.json({Token: newToken.token});

//   } catch (err) {
//     // user. = undefined;
//     // user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     return res.status(500).json({ err: "Cannot send email!" });
//   }
// };

// export const generateOTP = catchAsync(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     // 1) Get user based on POSTed email
//     const {email} = req.body;
//       const user = await IndividualUser.findOne({email});
//       if (!user) {
//         return next(new AppError("There is no user with email address.", 404));
//       }
//       const userId = user._id;
//       const token = generateToken();
//       await user.save({ validateBeforeSave: false });

//       console.log(token)

//       await individualAuthPasswordToken.findOneAndDelete({
//         owner: userId
//       });

//       const newToken = await individualAuthPasswordToken.create({
//         owner: userId,
//         token
//       })

//       const message = `Forgot your password? Here is one time password for your reset password : ${token}.\nIf you didn't forget your password, please ignore this email!`;

//       try {
//         // sendEmail function needs to be implemented separately
//         await sendEmail({
//           email,
//           subject: "Your password reset token (valid for 10 min)",
//           message,
//         });

//         // res.status(200).json({
//         //   status: "success",
//         //   message: "Token sent to email!",
//         // });
//         res.json({Token: newToken.token});

//       } catch (err) {
//         // user. = undefined;
//         // user.passwordResetExpires = undefined;

//       return next(
//         new AppError(
//           "There was an error sending the email. Try again later!",
//           500
//         )
//       );
//     }
//   }
// );

export const generateOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1) Get user based on POSTed email
      const { email } = req.body;
      if (!email) {
        return next(new AppError("Please provide an email address.", 400));
      }

      const user = await IndividualUser.findOne({ email });
      if (!user) {
        return next(
          new AppError("There is no user with that email address.", 404)
        );
      }

      const userId = user._id;
      const token = generateToken(); // Make sure generateToken function exists and generates secure tokens

      await individualAuthPasswordToken.findOneAndDelete({ owner: userId });
      const newToken = await individualAuthPasswordToken.create({
        owner: userId,
        token,
      });

      // const message = `Forgot your password? Here is a one-time password for resetting your password: ${token}.\nIf you didn't forget your password, please ignore this email.`;

      // sendEmail function needs to be implemented separately
      sendOtpEmail(token, email);

      res.status(200).json({ token: newToken.token });
    } catch (err) {
      console.error("Error in generateOTP:", err);
      return next(
        new AppError(
          "There was an error sending the email. Please try again later.",
          500
        )
      );
    }
  }
);

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, token } = req.body;
  try {
    const user = await IndividualUser.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid user!" });
    const verifyToken = await individualAuthPasswordToken.findOne({
      owner: user._id,
    });

    if (!verifyToken) {
      return res.status(403).json({ error: "Invalid token!" });
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
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await IndividualUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    // Update the user's password
    user.password = password;
    await user.save();

    // Find the user ID
    const userId = user._id;

    // Delete the password reset token
    await individualAuthPasswordToken.findOneAndDelete({ owner: userId });

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// export const logout = async (req: Request, res: Response) => {};
