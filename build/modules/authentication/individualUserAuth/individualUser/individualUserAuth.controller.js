"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetIndividualPassword = exports.individualUserRegistration = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const individualUserAuth_model_1 = __importDefault(require("../individualUserAuth.model"));
const individualAuthPasswordToken_1 = __importDefault(require("./individualAuthPasswordToken"));
const email_utils_1 = require("../../../../utilities/email.utils");
const organizationAuth_model_1 = __importDefault(require("../../organizationUserAuth/organizationAuth.model"));
const individualUserRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone_number, password, confirm_password } = req.body;
        if (!email) {
            return res.status(400).json({
                status: "fail",
                message: "Email is required",
            });
        }
        else if (!phone_number) {
            return res.status(400).json({
                status: "fail",
                message: "Phone number is required",
            });
        }
        else if (!password) {
            return res.status(400).json({
                status: "fail",
                message: "Password is required",
            });
        }
        else if (!confirm_password) {
            return res.status(400).json({
                status: "fail",
                message: "Confirm password  is required",
            });
        }
        if (password !== confirm_password) {
            return res.status(401).json({
                status: "fail",
                message: "Password do not match",
            });
        }
        // Check if the user already exists
        const individualEmailAlreadyExist = yield individualUserAuth_model_1.default.findOne({
            email,
        });
        const organizationEmailAlreadyExist = yield organizationAuth_model_1.default.findOne({
            organization_email: email,
        });
        if (individualEmailAlreadyExist || organizationEmailAlreadyExist) {
            return res.status(400).json({
                status: "false",
                message: "User already exists",
            });
        }
        // Check if password and confirmPassword match
        if (password !== confirm_password) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }
        // Create a new user
        const newUser = new individualUserAuth_model_1.default({
            email,
            phone_number,
            password,
            role: "ind",
        });
        // Save the user to the database
        yield newUser.save();
        const verificationToken = jsonwebtoken_1.default.sign({
            email: newUser.email,
        }, process.env.JWT_SECRET, {
            expiresIn: 60 * 60,
        });
        yield (0, email_utils_1.sendVerificationEmail)(email, verificationToken);
        // Send a response
        return res.status(201).json({
            status: "true",
            message: "Account successfully created. Verification email sent. Verify account to continue",
        });
    }
    catch (error) {
        console.error("Error registering the user:", error);
        return res
            .status(500)
            .json({ message: "Error registering the user", error });
    }
});
exports.individualUserRegistration = individualUserRegistration;
const resetIndividualPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = yield individualUserAuth_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }
        // Update the user's password
        user.password = password;
        yield user.save();
        // Find the user ID
        const userId = user._id;
        // Delete the password reset token
        yield individualAuthPasswordToken_1.default.findOneAndDelete({ owner: userId });
        res.json({ message: "Password reset successfully!" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Error resetting password" });
    }
});
exports.resetIndividualPassword = resetIndividualPassword;
// export const logout = async (req: Request, res: Response) => {};
