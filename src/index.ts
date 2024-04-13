/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import cors from "cors";
import swaggerJSDOC from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { Request, Response } from "express";
import connectDB from "./config/dbconn.config";
import organizationRoutes from "./modules/authentication/organizationUserAuth/organizationAuth.route";
import individualUserRouter from "./modules/authentication/individualUserAuth/individualAuth.route";
import googleAuthRoutes from "./modules/authentication/organizationUserAuth/googleOrganizationUserAuth.route";
import googleIndividualUserAuthroute from "./modules/authentication/individualUserAuth/googleIndividualUserAuth.route";
import { errorHandler } from "./utilities/errorHandler.util";
import { options } from "./swagger";
import deserializeUser from "./sharedMiddlewares/deserializeUser.middleware";
import protectRoutes from "./sharedMiddlewares/protectRoutes.middleware";

// const swaggerJsDoc = require("swagger-jsdoc")
// const swaggerUi = require('swagger-ui-express')
// import { options } from "./modules/authentication/individualUserAuth/individualAuthSwagger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(deserializeUser);

app.get("/", (req: Request, res: Response) => {
  return res.json({ msg: "welcome to doshbox api" });
});

app.use("/api/organization", organizationRoutes);
app.use("/api/individual", individualUserRouter);

app.use("/api/auth/org", googleAuthRoutes);
app.use("/api/auth/ind", googleIndividualUserAuthroute);

app.use(errorHandler);

const spec = swaggerJSDOC(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));

app.get("/api/me", protectRoutes, (req: Request, res: Response) => {
  console.log(`Logged in user: ${res.locals.user}`);

  return res.status(200).json({
    message: "Logged in user profile",
    data: res.locals.user,
  });
});

// =======
// const swaggerUiSetup = swaggerUi.setup(specs);

// app.use("/api-docs", swaggerUi.serve, swaggerUiSetup);

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    try {
      console.log("connected to mongoose");

      app.listen(PORT, () => {
        console.log(`server is running on http://localhost:${PORT}`);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error);
    }
  })
  .catch((error: any) => {
    throw new Error(error);
  });

// app.listen(`${PORT}`, () =>{
//     console.log(`listening on port ${PORT}`);

// })
