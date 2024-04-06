
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


