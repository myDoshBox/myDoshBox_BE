import { IndividualUserDocument } from "../modules/authentication/individualUserAuth/individualUserAuth.model1"; // Adjust the path to your User interface/model

declare module "express-serve-static-core" {
  interface Request {
    user?: IndividualUserDocument; // Assuming IUser is the interface for your User model
  }
}
