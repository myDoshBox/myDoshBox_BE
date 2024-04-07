import { Types } from "mongoose";

import { createSession } from "./createSession.util";
import { generateAccessAndRefreshToken } from "./generateAccessAndRefreshToken.util";

export const createSessionAndSendTokens = async (options: {
  user: { _id: Types.ObjectId };
  userAgent: string;
  userKind: string;
  message: string;
}) => {
  const { user, userAgent, userKind, message } = options;
  const session = await createSession(user._id.toString(), userAgent, userKind);

  const { accessToken, refreshToken } = generateAccessAndRefreshToken(
    user,
    session._id
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
