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
exports.deleteMediator = exports.updateMediator = exports.getMediatorById = exports.getAllMediators = exports.onboardAMediator = void 0;
const validation_utilities_1 = require("../../utilities/validation.utilities");
const mediator_model_1 = __importDefault(require("../mediator/mediator.model"));
const errorHandling_middleware_1 = require("../../middlewares/errorHandling.middleware");
const mediator_mail_1 = require("../mediator/mediator.mail");
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Onboard a new mediator to the system
 * Only accessible by admin users
 */
const onboardAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { first_name, middle_name, last_name, mediator_email, mediator_phone_number, password, } = req.body;
    // Log which admin is performing this action
    console.log(`Admin ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email} is onboarding mediator: ${mediator_email}`);
    (0, validation_utilities_1.validateFormFields)({
        first_name,
        last_name,
        mediator_email,
        password,
    }, next);
    try {
        // Check if mediator already exists
        const findMediator = yield mediator_model_1.default.findOne({
            mediator_email: mediator_email,
        });
        if (findMediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Mediator already exist, please proceed to login"));
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create new mediator
        const addNewMediatorToSystem = new mediator_model_1.default({
            first_name,
            middle_name,
            last_name,
            mediator_email,
            mediator_phone_number,
            password: hashedPassword,
            onboarded_by: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id, // Track which admin onboarded this mediator
        });
        yield addNewMediatorToSystem.save();
        // Send login credentials email
        yield (0, mediator_mail_1.sendMediatorLoginDetailsMail)(first_name, mediator_email, password);
        res.status(201).json({
            status: "success",
            message: "Mediator has been added successfully and a mail sent",
            data: {
                mediator: {
                    id: addNewMediatorToSystem._id,
                    first_name: addNewMediatorToSystem.first_name,
                    last_name: addNewMediatorToSystem.last_name,
                    email: addNewMediatorToSystem.mediator_email,
                    phone_number: addNewMediatorToSystem.mediator_phone_number,
                },
                onboarded_by: (_c = req.user) === null || _c === void 0 ? void 0 : _c.email,
            },
        });
    }
    catch (error) {
        console.error("Error adding mediator: ", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.onboardAMediator = onboardAMediator;
const getAllMediators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(`Admin ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email} is fetching all mediators`);
        const fetchAllMediators = yield mediator_model_1.default.find()
            .select("-password")
            .sort({ createdAt: -1 });
        if ((fetchAllMediators === null || fetchAllMediators === void 0 ? void 0 : fetchAllMediators.length) === 0) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "No mediators present in the system"));
        }
        res.status(200).json({
            status: "success",
            message: "All mediators fetched successfully",
            results: fetchAllMediators.length,
            data: {
                mediators: fetchAllMediators,
            },
        });
    }
    catch (error) {
        console.error("Error fetching mediators: ", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.getAllMediators = getAllMediators;
const getMediatorById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mediatorId } = req.params;
        const mediator = yield mediator_model_1.default.findById(mediatorId).select("-password");
        if (!mediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Mediator not found"));
        }
        res.status(200).json({
            status: "success",
            message: "Mediator fetched successfully",
            data: {
                mediator,
            },
        });
    }
    catch (error) {
        console.error("Error fetching mediator: ", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.getMediatorById = getMediatorById;
const updateMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mediatorId } = req.params;
        console.log("📦 Received body:", req.body);
        console.log("🔑 Body keys:", Object.keys(req.body || {}));
        const updateData = req.body || {};
        // Prevent password updates through this endpoint
        if ("password" in updateData) {
            delete updateData.password;
        }
        // Validate that at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "No update data provided"));
        }
        const updatedMediator = yield mediator_model_1.default.findByIdAndUpdate(mediatorId, updateData, { new: true, runValidators: true }).select("-password");
        if (!updatedMediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Mediator not found"));
        }
        res.status(200).json({
            status: "success",
            message: "Mediator updated successfully",
            data: {
                mediator: updatedMediator,
            },
        });
    }
    catch (error) {
        console.error("Error updating mediator: ", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.updateMediator = updateMediator;
const deleteMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { mediatorId } = req.params;
        const mediator = yield mediator_model_1.default.findByIdAndDelete(mediatorId);
        if (!mediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Mediator not found"));
        }
        console.log(`Admin ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.email} deleted mediator: ${mediator.mediator_email}`);
        res.status(200).json({
            status: "success",
            message: "Mediator deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting mediator: ", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.deleteMediator = deleteMediator;
