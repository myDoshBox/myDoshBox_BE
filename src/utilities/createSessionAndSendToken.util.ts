import { createSession } from "./createSession.util";
import { generateAccessAndRefreshToken } from "./generateAccessAndRefreshToken.util";

export const createSessionAndSendTokens = async (options: {
  user: any;
  userAgent: string;
  role: string;
  message: string;
}) => {
  const { user, userAgent, role, message } = options;

  // Create session in database
  const session = await createSession(user._id.toString(), userAgent, role);

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = generateAccessAndRefreshToken(
    user,
    session._id,
    role
  );

  return {
    status: "success",
    message,
    user,
    accessToken,
    refreshToken,
    sessionId: session._id,
  };
};
