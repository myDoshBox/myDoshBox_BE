import { get } from "lodash";
import { Types } from "mongoose";
import { signJwt, verifyJwt } from "./signAndVerifyToken.util";

import { Session } from "../modules/sessions/session.model";
import OrganizationModel from "../modules/authentication/organizationUserAuth/organizationAuth.model";
import individualUserAuthModel from "../modules/authentication/individualUserAuth/individualUserAuth.model1";

// At the top of the file
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export function generateAccessAndRefreshToken(
  userObject: { _id: string; role: string },
  sessionId: Types.ObjectId,
  role: string
): { accessToken: string; refreshToken: string } {
  const accessToken = signJwt(
    {
      userData: {
        _id: userObject._id,
        role: userObject.role,
      },
      session: sessionId.toString(),
      role,
    },
    { expiresIn: process.env.ACCESS_TOKEN_TTL || ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = signJwt(
    {
      userData: {
        _id: userObject._id,
        role: userObject.role,
      },
      session: sessionId.toString(),
      role,
    },
    { expiresIn: process.env.REFRESH_TOKEN_TTL || REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const { decoded } = verifyJwt(refreshToken);

  if (!decoded || !get(decoded, "session")) return false;

  const session = await Session.findById(get(decoded, "session"));

  if (!session || !session.valid) return false;

  let user: any;

  if (session.role === "org" || session.role === "g-org") {
    user = await OrganizationModel.findById(session.user);
  } else if (session.role === "ind" || session.role === "g-ind") {
    user = await individualUserAuthModel.findById(session.user);
  } else {
    user = undefined;
  }

  if (!user) return false;

  const accessTokenTTL: string = process.env.ACCESS_TOKEN_TTL || "15m";

  const accessToken = signJwt(
    {
      userData: {
        _id: user._id.toString(),
        role: session.role,
      },
      session: session._id.toString(),
      role: session.role,
    },
    { expiresIn: accessTokenTTL }
  );

  return accessToken;
}
