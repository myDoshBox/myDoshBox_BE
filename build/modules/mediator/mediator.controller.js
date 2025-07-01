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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDispute = exports.getAllDisputeForAMediator = exports.involveAMediator = exports.getAllMediators = exports.mediatorLogin = exports.onboardAMediator = void 0;
const validation_utilities_1 = require("../../utilities/validation.utilities");
const mediator_model_1 = __importDefault(require("./mediator.model"));
const errorHandling_middleware_1 = require("../../middlewares/errorHandling.middleware");
const mediator_mail_1 = require("./mediator.mail");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createSessionAndSendToken_util_1 = require("../../utilities/createSessionAndSendToken.util");
const productDispute_model_1 = __importDefault(require("../disputes/productsDispute/productDispute.model"));
// this works but its not returning any response in its body
const onboardAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { first_name, middle_name, last_name, mediator_email, mediator_phone_number, password, } = req.body;
    (0, validation_utilities_1.validateFormFields)({
        first_name,
        // middle_name,
        last_name,
        mediator_email,
        // mediator_phone_number,
        password,
    }, next);
    try {
        // check if mediator exist
        const findMediator = yield mediator_model_1.default.findOne({
            mediator_email: mediator_email,
        });
        // console.log(findMediator);
        if (findMediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(204, "Mediator already exist, please proceed to login"));
        }
        const hashedPassword = bcrypt_1.default.hashSync(password, 10);
        // console.log(hashedPassword);
        const addNewMediatorToSystem = new mediator_model_1.default({
            first_name,
            // middle_name,
            last_name,
            mediator_email,
            mediator_phone_number,
            password: hashedPassword,
        });
        yield addNewMediatorToSystem.save();
        yield (0, mediator_mail_1.sendMediatorLoginDetailsMail)(first_name, mediator_email, password);
        res.json({
            // addNewMediatorToSystem,
            status: "success",
            message: "Mediator has been added successfully and a mail sent",
        });
    }
    catch (error) {
        console.error("Error adding mediator: ", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.onboardAMediator = onboardAMediator;
const mediatorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { mediator_email, password } = req.body;
    (0, validation_utilities_1.validateFormFields)({
        mediator_email,
        password,
    }, next);
    try {
        const mediatorToLogin = yield mediator_model_1.default.findOne({
            mediator_email,
        }).select("+password");
        if (!mediatorToLogin) {
            return next((0, errorHandling_middleware_1.errorHandler)(401, "Invalid email or password"));
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, mediatorToLogin === null || mediatorToLogin === void 0 ? void 0 : mediatorToLogin.password);
        if (!isPasswordValid) {
            return next((0, errorHandling_middleware_1.errorHandler)(401, "invalid password"));
        }
        const _a = mediatorToLogin.toObject(), { password: _ } = _a, mediatorWithoutPassword = __rest(_a, ["password"]);
        const sessionResponse = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)({
            user: mediatorWithoutPassword,
            userAgent: req.get("user-agent") || "",
            role: "mediator",
            message: "Mediator successfully logged in",
        });
        res.status(200).json({
            status: sessionResponse.status,
            message: sessionResponse.message,
            user: sessionResponse.user,
            accessToken: sessionResponse.accessToken,
            refreshToken: sessionResponse.refreshToken,
        });
    }
    catch (error) {
        console.error("Error logging in: ", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
    // You can now use mediatorWithoutPassword as needed
});
exports.mediatorLogin = mediatorLogin;
const getAllMediators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const fetchAllMediators = yield mediator_model_1.default.find()
        .select("-password")
        .sort({ createdAt: -1 });
    if ((fetchAllMediators === null || fetchAllMediators === void 0 ? void 0 : fetchAllMediators.length) === 0) {
        return next((0, errorHandling_middleware_1.errorHandler)(404, "no mediators present in the system"));
    }
    else {
        res.json({
            fetchAllMediators,
            status: "success",
            message: "All mediators fetched successfully",
        });
    }
});
exports.getAllMediators = getAllMediators;
const involveAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { });
exports.involveAMediator = involveAMediator;
const getAllDisputeForAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { mediator_email } = req.params;
    // Find mediator by email
    const mediator = yield mediator_model_1.default.findOne({ mediator_email }).select("-password");
    console.log("Found Mediator:", mediator);
    if (!mediator) {
        return next((0, errorHandling_middleware_1.errorHandler)(404, "Mediator not found"));
    }
    // Find all disputes assigned to the mediator
    const disputes = yield productDispute_model_1.default.find({ mediator: mediator._id })
        .sort({ createdAt: -1 })
        .populate("transaction user"); // Populate transaction and user details
    console.log("Found Disputes:", disputes);
    if (disputes.length === 0) {
        return next((0, errorHandling_middleware_1.errorHandler)(404, "No disputes assigned to this mediator"));
    }
    // Convert mediator to plain object to ensure password is excluded
    const mediatorWithoutPassword = mediator.toObject();
    res.status(200).json({
        status: "success",
        message: "Disputes fetched successfully for mediator",
        data: {
            mediator: mediatorWithoutPassword,
            disputes,
        },
    });
});
exports.getAllDisputeForAMediator = getAllDisputeForAMediator;
// to resolve a dispute, you have to fetch all the details of the transaction in dispute such as the transaction_id, buyer_email, vendor_email, product_name, product_image, reason_for_dispute, dispute_description, and dispute_status
// trigger mails for both buyers and sellers after the dispute is resolved
// and then update the dispute status to resolved
// and then update the transaction status to completed
const resolveDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { });
exports.resolveDispute = resolveDispute;
