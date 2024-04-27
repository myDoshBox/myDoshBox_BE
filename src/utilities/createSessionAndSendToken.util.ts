import { Types } from "mongoose";

import { createSession } from "./createSession.util";
import { generateAccessAndRefreshToken } from "./generateAccessAndRefreshToken.util";

export const createSessionAndSendTokens = async (options: {
  user: { _id: Types.ObjectId; password?: string };
  userAgent: string;
  role: string;
  message: string;
}) => {
  const { user, userAgent, role, message } = options;
  const session = await createSession(user._id.toString(), userAgent, role);

  const { accessToken, refreshToken } = generateAccessAndRefreshToken(
    user,
    session._id,
    role
  );

  console.log({
    status: "success",
    message,
    user,
    accessToken,
    refreshToken,
  });

  return {
    status: "success",
    message,
    user,
    accessToken,
    refreshToken,
  };
};
