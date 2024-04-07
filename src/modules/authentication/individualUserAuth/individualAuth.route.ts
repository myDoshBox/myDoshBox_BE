import { Router } from "express";
import { generateOTP, individualUserLogin, individualUserRegistration, resetIndividualPassword, verifyIndividualUserEmail, verifyOTP } from "../individualUserAuth/individualUserAuth.controller";

const individualrouter = Router();

// routes
individualrouter.route("/register").post(individualUserRegistration);
individualrouter.route('/login').post(individualUserLogin);
individualrouter.route('/generate/otp').post(generateOTP);
individualrouter.route('/verify-otp').post(verifyOTP); 
individualrouter.route('/reset-password').post(resetIndividualPassword);
individualrouter.route('/verify-individual-email').post(verifyIndividualUserEmail)

export default individualrouter; 
