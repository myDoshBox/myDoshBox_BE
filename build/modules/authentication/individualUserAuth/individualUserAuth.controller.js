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
exports.individualUserRegistration = void 0;
const individualUserAuth_model_1 = __importDefault(require("./individualUserAuth.model"));
const individualHashPassword_1 = require("./individualHashPassword");
const individualUserRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phoneNumber, password } = req.body;
        // Hash the password
        const hashedPassword = yield (0, individualHashPassword_1.hashPassword)(password);
        // check if the user already exists
        const userExists = yield individualUserAuth_model_1.default.findOne({ email })
            .select("email")
            .lean();
        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        // create a new user
        const newUser = new individualUserAuth_model_1.default({
            email,
            phoneNumber,
            password: hashedPassword // The password is hashed
        });
        // save the user to the database
        yield newUser.save();
        // send a response
        res.status(201).json({
            message: "User registered successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
        });
    }
});
exports.individualUserRegistration = individualUserRegistration;
// export const verifyIndividualUserEmail = async (
//   req: Request,
//   res: Response
// ) => {};
// export const individualUserLogin = async (req: Request, res: Response) => {};
// export const generateOTP = async (req: Request, res: Response) => {};
// export const verifyOTP = async (req: Request, res: Response) => {};
// export const resetPassword = async (req: Request, res: Response) => {};
// export const logout = async (req: Request, res: Response) => {};
