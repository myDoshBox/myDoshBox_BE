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
exports.updateUserById = exports.getUserById = exports.getAllUsers = void 0;
const organizationAuth_model_1 = __importDefault(require("../../authentication/organizationUserAuth/organizationAuth.model"));
const validator_utils_1 = require("../../../utilities/validator.utils");
// Get all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield organizationAuth_model_1.default.find();
        if (users.length === 0) {
            res.status(404).json({
                status: "fail",
                message: "No users found",
            });
        }
        res.status(200).json({
            status: "success",
            data: { users },
        });
    }
    catch (err) {
        return handleDatabaseError(err, res, "fetching users");
    }
});
exports.getAllUsers = getAllUsers;
// Get single user by ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield organizationAuth_model_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                status: "fail",
                message: "User not found",
            });
        }
        res.status(200).json({
            status: "success",
            data: { user },
        });
    }
    catch (err) {
        return handleDatabaseError(err, res, "fetching the user");
    }
});
exports.getUserById = getUserById;
// Update user by ID
const updateUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { email } = _a, updateData = __rest(_a, ["email"]);
    if (email && !validator_utils_1.emailValidator(email)) {
        res.status(400).json({
            status: "fail",
            message: "Invalid email format",
        });
    }
    try {
        const user = yield organizationAuth_model_1.default.findByIdAndUpdate(req.params.id, Object.assign({ email }, updateData), {
            new: true,
            runValidators: true,
        });
        if (!user) {
            res.status(404).json({
                status: "fail",
                message: "User not found",
            });
        }
        res.status(200).json({
            status: "success",
            data: { user },
        });
    }
    catch (err) {
        return handleDatabaseError(err, res, "updating the user");
    }
});
exports.updateUserById = updateUserById;
// Handle database errors
const handleDatabaseError = (err, res, action) => {
    if (err.name === "ValidationError") {
        res.status(400).json({
            status: "fail",
            message: `Invalid data provided while ${action}`,
        });
    }
    if (err.name === "CastError") {
        res.status(400).json({
            status: "fail",
            message: "Invalid user ID",
        });
    }
    res.status(500).json({
        status: "error",
        message: `An error occurred while ${action}. Please try again later.`,
        error: err.message,
    });
};
