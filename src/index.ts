/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import cors from "cors";
import swaggerJSDOC from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { Request, Response } from "express";
import connectDB from "./config/dbconn.config";

import organizationUserAuthRouter from "./modules/authentication/organizationUserAuth/organizationAuth.route";
import individualUserAuthRouter from "./modules/authentication/individualUserAuth/individualAuth.route";
import { errorHandler } from "./utilities/errorHandler.util";
import { options as prodOptions } from "./prodSwagger";
import { options as devOptions } from "./devSwagger";
import deserializeUser from "./middlewares/deserializeUser.middleware";
//import protectRoutes from "./middlewares/protectRoutes.middleware";
//import individualRoutes from "./modules/users/individualUsers/individualUsers.route";
import individualUsersRoutes from "./modules/users/individualUsers/individualUsers.route";
import organizationUsersRoutes from "./modules/users/organization/getOrganizationUser.route";
import authRouter from "./modules/authentication/userAuth.route";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// app.use(cors());
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(deserializeUser);

// app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  return res.json({ msg: "welcome to doshbox api updated test" });
});

app.use("/auth/organization", organizationUserAuthRouter);
app.use("/auth/individual", individualUserAuthRouter);
app.use("/auth", authRouter);
app.use("/user", organizationUsersRoutes);
app.use("/users", individualUsersRoutes);

app.use(errorHandler);

const devSpec = swaggerJSDOC(devOptions);
const prodSpec = swaggerJSDOC(prodOptions);

app.use("/dev-api-docs", swaggerUi.serve, swaggerUi.setup(devSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(prodSpec));

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
