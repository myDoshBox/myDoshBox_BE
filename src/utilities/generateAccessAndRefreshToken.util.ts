import { get } from "lodash";
import { Types } from "mongoose";
import { signJwt, verifyJwt } from "./signAndVerifyToken.util";

import { Session } from "../modules/sessions/session.model";
import GoogleOrganizationUser from "../modules/authentication/organizationUserAuth/googleOrganizationUserAuth.model";
import OrganizationModel from "../modules/authentication/organizationUserAuth/organizationAuth.model";
import individualUserAuthModel from "../modules/authentication/individualUserAuth/individualUserAuth.model";
import GoogleIndUser from "../modules/authentication/individualUserAuth/googleIndividualAuth.model";

export function generateAccessAndRefreshToken(
  userObject: object,
  sessionId: Types.ObjectId,
  role: string
): { accessToken: string; refreshToken: string } {
  const accessToken = signJwt(
    { userData: userObject, session: sessionId, role },
    { expiresIn: `${process.env.ACCESS_TOKEN_TTL}` }
  );

  const refreshToken = signJwt(
    { userData: userObject, session: sessionId, role },
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

  let user: Document;

  if (session.role === "org") {
    user = (await OrganizationModel.findById({
      _id: session.user,
    })) as Document;
  } else if (session.role === "ind") {
    user = (await individualUserAuthModel.findById({
      _id: session.user,
    })) as Document;
  } else if (session.role === "g-org") {
    user = (await GoogleOrganizationUser.findById({
      _id: session.user,
    })) as Document;
  } else {
    user = (await GoogleIndUser.findById({ _id: session.user })) as Document;
  }

  if (!user) return false;

  const accessToken = signJwt(
    { userData: user, session: session._id, role: session.role },
    { expiresIn: process.env.ACCESS_TOKEN_TTL as string }
  );

  return accessToken;
}
