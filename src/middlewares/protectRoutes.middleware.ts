import { Request, Response, NextFunction } from "express";

const protectRoutes = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;

  console.log(user);

  if (!user) {
    return res.sendStatus(403);
  }

  return next();
};

export default protectRoutes;
