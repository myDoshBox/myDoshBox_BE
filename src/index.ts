/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { Request, Response } from "express";
import connectDB from "./config/dbconn.config";
import organizationRoute from './modules/authentication/organizationUserAuth/individualAuth.route'
import individualRoute from './modules/authentication/individualUserAuth/individualAuth.route';

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:false}));
 
app.get("/", (req: Request, res: Response) => {
  return res.json({ msg: "welcome to doshbox api" });
});

app.use('/organization', organizationRoute)
app.use('/auth', individualRoute)

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
