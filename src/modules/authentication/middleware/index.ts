import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import IndividualUser, {
  IndividualUserModel,
} from "../individualUserAuth/individualUserAuth.model";
import { generateAccessToken } from "../../../utils/generateToken";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IndividualUserModel;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string);

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token from Authorization header

  try {
    const userId = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as string;

    const user = await IndividualUser.findOne({ _id: userId }) as IndividualUserModel;

    req.user = user; // Attach decoded user information to the request object

    const { exp } = jwt.decode(token) as { exp: number }; // Get expiry time of the access token
    const now = Date.now() / 1000; // Current time in seconds

    // Check if the access token is about to expire (within 1 minute)
    if (exp - now < 60) {
      // Issue a new access token
      const accessToken = generateAccessToken(userId);
      res.setHeader("Authorization", `Bearer ${accessToken}`);
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token." });
    }
    return res.status(401).json({ message: "Failed to authenticate token." });
  }
};
