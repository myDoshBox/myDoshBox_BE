/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { Request, Response } from "express";
import connectDB from "./config/dbconn.config";
import passport from "passport";
import session from "express-session";
import MongoStore from 'connect-mongo';

const app = express();

  //passport middleware
app.use(passport.initialize());
app.use(passport.session());
  

app.get("/", (req: Request, res: Response) => {
  return res.json({ msg: "welcome to doshbox api" });
});

//middleware and db for sessions setup
  // Access MongoDB URL from environment variables
  const mongoURI = process.env.DATABASE_URI;
  
  // Check if the MongoDB URL is defined in the environment variables
if (!mongoURI) {
  console.error('MongoDB URI is not defined in the environment variables.');
  process.exit(1); // Exit the process if MongoDB URI is not defined
}

// Configure session middleware with MongoStore
app.use(session({
  secret: process.env.SESSION_SECRET_KEY || "",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoURI }),
}));


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
