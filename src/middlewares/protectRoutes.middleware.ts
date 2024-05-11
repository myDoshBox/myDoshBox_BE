import { Request, Response, NextFunction } from "express";
import IndividualUser from "../modules/authentication/individualUserAuth/individualUserAuth.model";
import OrganizationModel from "../modules/authentication/organizationUserAuth/organizationAuth.model";

const protectRoutes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = res.locals.user;

  if (!user) {
    return res.sendStatus(403);
  }
  try {
    const userExists =
      user.role === "ind" || user.role === "g-ind"
        ? await IndividualUser.findOne({ email: user.userData.email })
        : await OrganizationModel.findOne({
            organization_email: user.userData.organization_email,
          });

    if (!userExists)
      return res.status(403).json({
        message: "User does not exist anymore",
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: "something happened at the protectRoutes function",
    });
  }

  return next();
};

export default protectRoutes;
