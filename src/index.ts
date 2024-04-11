/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import connectDB from "./config/dbconn.config";
import organizationRoutes from "./modules/authentication/organizationUserAuth/organizationAuth.route";
import googleAuthRoutes from "./modules/authentication/organizationUserAuth/googleOrganizationUserAuth.route";
import googleIndividualUserAuthroute from "./modules/authentication/individualUserAuth/googleIndividualUserAuth.route";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  return res.json({ msg: "welcome to doshbox api" });
});

app.use("/api/organization", organizationRoutes);

app.use("/auth", googleAuthRoutes);

app.use("/auth/ind", googleIndividualUserAuthroute);

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
