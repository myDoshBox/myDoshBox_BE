/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import cors from "cors";
import swaggerJSDOC from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { Request, Response } from "express";
import connectDB from "./config/dbconn.config";

import organizationUserAuthRouter from "./modules/authentication/organizationUserAuth/organizationUser/organizationAuth.route";
// import UserAuthRouter from "./modules/authentication/organizationUserAuth/organizationUser/organizationAuth.route";
import individualUserAuthRouter from "./modules/authentication/individualUserAuth/individualUser/individualAuth.route";
import googleOrganizationUserAuthRouter from "./modules/authentication/organizationUserAuth/googleOrganizationUser/googleOrganizationUserAuth.route";
import googleIndividualUserAuthRouter from "./modules/authentication/individualUserAuth/googleIndividualUser/googleIndividualUserAuth.route";
import { errorHandler } from "./utilities/errorHandler.util";
import prodSpec from "./prodSwagger";
import { options } from "./devSwagger";
import deserializeUser from "./middlewares/deserializeUser.middleware";
import protectRoutes from "./middlewares/protectRoutes.middleware";
import individualRoutes from "./modules/users/individualUsers/individualUsers.route";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(deserializeUser);

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  return res.json({ msg: "welcome to doshbox api test" });
});

app.use("/auth/organization", organizationUserAuthRouter); 
app.use("/auth/individual", individualUserAuthRouter);
// app.use("/auth", UserAuthRouter)

app.use("/auth/organization", googleOrganizationUserAuthRouter);
app.use("/auth/individual", googleIndividualUserAuthRouter);

app.use("/user", protectRoutes, individualRoutes);

app.use(errorHandler);

//

// const swaggerDocumentOne = require("./swagger-one.json");
// const swaggerDocumentTwo = require("./swagger-two.json");

// var options = {};

// app.use(
//   "/api-docs-one",
//   swaggerUi.serveFiles(swaggerDocumentOne, options),
//   swaggerUi.setup(swaggerDocumentOne)
// );

// app.use(
//   "/api-docs-two",
//   swaggerUi.serveFiles(swaggerDocumentTwo, options),
//   swaggerUi.setup(swaggerDocumentTwo)
// );

//

// let options = {};

const spec = swaggerJSDOC(options);
// const prodSpec = swaggerJSDOC(prodOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(prodSpec));

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
