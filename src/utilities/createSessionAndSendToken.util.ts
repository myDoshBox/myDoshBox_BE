// // import { createSession } from "./createSession.util";
// // import { generateAccessAndRefreshToken } from "./generateAccessAndRefreshToken.util";

// // export const createSessionAndSendTokens = async (options: {
// //   user: any;
// //   userAgent: string;
// //   role: string;
// //   message: string;
// // }) => {
// //   const { user, userAgent, role, message } = options;

// //   // Create session in database
// //   const session = await createSession(user._id.toString(), userAgent, role);

// //   // Generate access and refresh tokens
// //   const { accessToken, refreshToken } = generateAccessAndRefreshToken(
// //     user,
// //     session._id,
// //     role
// //   );

// //   return {
// //     status: "success",
// //     message,
// //     user,
// //     accessToken,
// //     refreshToken,
// //     sessionId: session._id,
// //   };
// // };
// // utilities/createSessionAndSendToken.util.ts

// // src/utilities/createSessionAndSendToken.util.ts

// // src/utilities/createSessionAndSendToken.util.ts

// // src/utilities/createSessionAndSendToken.util.ts
// // src/utilities/createSessionAndSendToken.util.ts
// // src/utilities/createSessionAndSendToken.util.ts

// import mongoose from "mongoose";
// import { signJwt } from "./signAndVerifyToken.util";
// import { Session, ISessionDocument } from "../modules/sessions/session.model";

// export interface UserData {
//   _id: mongoose.Types.ObjectId | string;
//   email: string;
//   phone_number?: string;
//   role: string;
// }

// export interface CreateSessionParams {
//   user: UserData;
//   userAgent: string;
//   role: string;
//   message?: string;
// }

// export interface SessionResponse {
//   accessToken: string;
//   refreshToken: string;
//   message: string;
//   user: UserData;
//   status: string;
//   sessionId: string;
// }

// export const createSessionAndSendTokens = async ({
//   user,
//   userAgent,
//   role,
//   message = "Login successful",
// }: CreateSessionParams): Promise<SessionResponse> => {
//   // Use user.role if provided, otherwise use the role parameter
//   const userRole = user.role || role;

//   // Create session with empty refreshToken initially
//   const session: ISessionDocument = await Session.create({
//     user: user._id,
//     userAgent: userAgent || "unknown",
//     role: userRole,
//     valid: true,
//     refreshToken: "",
//   });

//   // Convert session._id to string for JWT payload
//   const sessionId = session._id.toString();
//   const userId = user._id.toString();

//   // Generate tokens
//   const accessToken = signJwt(
//     {
//       userData: {
//         _id: userId,
//         role: userRole,
//       },
//       session: sessionId,
//       role: userRole,
//     },
//     { expiresIn: "15m" }
//   );

//   const refreshToken = signJwt(
//     {
//       userData: {
//         _id: userId,
//         role: userRole,
//       },
//       session: sessionId,
//       role: userRole,
//     },
//     { expiresIn: "30d" }
//   );

//   // Update session with refreshToken
//   session.refreshToken = refreshToken;
//   await session.save();

//   return {
//     accessToken,
//     refreshToken,
//     message,
//     user: {
//       ...user,
//       role: userRole, // Ensure role is included in response
//     },
//     status: "success",
//     sessionId,
//   };
// };

import mongoose from "mongoose";
import { signJwt } from "./signAndVerifyToken.util";
import { Session, ISessionDocument } from "../modules/sessions/session.model";

// ✅ UPDATED: Make sure this interface matches what you're passing
export interface UserData {
  _id: mongoose.Types.ObjectId | string;
  email: string; // Required
  phone_number?: string;
  role: string; // Required
  organization_email?: string; // Optional for org users
  contact_email?: string; // Optional for org users
}

export interface CreateSessionParams {
  user: UserData;
  userAgent: string;
  role: string;
  message?: string;
}

export interface SessionResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
  user: UserData;
  status: string;
  sessionId: string;
}

export const createSessionAndSendTokens = async ({
  user,
  userAgent,
  role,
  message = "Login successful",
}: CreateSessionParams): Promise<SessionResponse> => {
  // Use user.role if provided, otherwise use the role parameter
  const userRole = user.role || role;

  // ✅ Get email (handle both individual and organization users)
  const userEmail = user.email || user.organization_email || user.contact_email;

  if (!userEmail) {
    throw new Error("User email is required for session creation");
  }

  // Create session with empty refreshToken initially
  const session: ISessionDocument = await Session.create({
    user: user._id,
    userAgent: userAgent || "unknown",
    role: userRole,
    valid: true,
    refreshToken: "",
  });

  // Convert session._id to string for JWT payload
  const sessionId = session._id.toString();
  const userId = user._id.toString();

  // ✅ UPDATED: Include email in token payload
  const tokenPayload = {
    userData: {
      _id: userId,
      role: userRole,
      email: userEmail, // ✅ This is now included
    },
    session: sessionId,
    role: userRole,
  };

  // Generate tokens with email included
  const accessToken = signJwt(tokenPayload, { expiresIn: "15m" });
  const refreshToken = signJwt(tokenPayload, { expiresIn: "30d" });

  // Update session with refreshToken
  session.refreshToken = refreshToken;
  await session.save();

  return {
    accessToken,
    refreshToken,
    message,
    user: {
      ...user,
      role: userRole, // Ensure role is included in response
    },
    status: "success",
    sessionId,
  };
};
