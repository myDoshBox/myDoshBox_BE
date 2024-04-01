import { Request, Response, NextFunction } from 'express';

export const ensureAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};

export const ensureGuest = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/log');
  }
};
