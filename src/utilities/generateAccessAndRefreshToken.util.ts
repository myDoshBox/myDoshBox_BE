import { get } from "lodash";
import { Types } from "mongoose";
import { signJwt, verifyJwt } from "./signAndVerifyToken.util";

import { Session } from "../modules/sessions/session.model";
import GoogleOrganizationUser from "../modules/authentication/organizationUserAuth/googleOrganizationUserAuth.model";
import GoogleIndividualUser from "../modules/authentication/individualUserAuth/googleIndividualAuth.model";
import IndividualUser from "../modules/authentication/individualUserAuth/individualUserAuth.model";
import OrganizationUser from "../modules/authentication/organizationUserAuth/organizationAuth.model";

export function generateAccessAndRefreshToken(
  userObject: object,
  sessionId: Types.ObjectId
): { accessToken: string; refreshToken: string } {
  const accessToken = signJwt(
    { userData: userObject, session: sessionId },
    { expiresIn: `${process.env.ACCESS_TOKEN_TTL}` }
  );

  const refreshToken = signJwt(
    { userData: userObject, session: sessionId },
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
    { userData: user, session: session._id },
    { expiresIn: process.env.ACCESS_TOKEN_TTL as string }
  );

  return accessToken;
}
