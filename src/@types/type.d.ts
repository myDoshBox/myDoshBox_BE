// import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: string; // or whatever type your user ID is
      email: string;
      // Add other fields as necessary
    };
  }
}
