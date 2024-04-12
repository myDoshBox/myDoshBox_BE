import { get } from "lodash";
import { Types } from "mongoose";
import { signJwt, verifyJwt } from "./signAndVerifyToken.util";

import { Session } from "../modules/sessions/session.model";
import GoogleOrganizationUser from "../modules/authentication/organizationUserAuth/googleOrganizationUserAuth.model";

export function generateAccessAndRefreshToken(
  userObject: object,
  sessionId: Types.ObjectId,
  userKind: string
): { accessToken: string; refreshToken: string } {
  const accessToken = signJwt(
    { userData: userObject, session: sessionId, userKind },
    { expiresIn: `${process.env.ACCESS_TOKEN_TTL}` }
  );

  const refreshToken = signJwt(
    { userData: userObject, session: sessionId, userKind },
    { expiresIn: `${process.env.REFRESH_TOKEN_TTL}` }
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

  const user = await GoogleOrganizationUser.findById({ _id: session.user });

  if (!user) return false;

  const accessToken = signJwt(
    { userData: user, session: session._id, userKind: session.userKind },
    { expiresIn: process.env.ACCESS_TOKEN_TTL as string }
  );

  return accessToken;
}
