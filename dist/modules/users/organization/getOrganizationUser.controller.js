"use strict";
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
const getAllUsers = async (req, res) => {
    try {
        const users = await organizationAuth_model_1.default.find();
        if (users.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No users found'
            });
        }
        return res.status(200).json({
            status: 'success',
            data: { users }
        });
    }
    catch (err) {
        return handleDatabaseError(err, res, 'fetching users');
    }
};
exports.getAllUsers = getAllUsers;
// Get single user by ID
const getUserById = async (req, res) => {
    try {
        const user = await organizationAuth_model_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }
        return res.status(200).json({
            status: 'success',
            data: { user }
        });
    }
    catch (err) {
        return handleDatabaseError(err, res, 'fetching the user');
    }
};
exports.getUserById = getUserById;
// Update user by ID
const updateUserById = async (req, res) => {
    const _a = req.body, { email } = _a, updateData = __rest(_a, ["email"]);
    if (email && !(0, validator_utils_1.emailValidator)(email)) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid email format'
        });
    }
    try {
        const user = await organizationAuth_model_1.default.findByIdAndUpdate(req.params.id, Object.assign({ email }, updateData), {
            new: true,
            runValidators: true
        });
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }
        return res.status(200).json({
            status: 'success',
            data: { user }
        });
    }
    catch (err) {
        return handleDatabaseError(err, res, 'updating the user');
    }
};
exports.updateUserById = updateUserById;
// Handle database errors
const handleDatabaseError = (err, res, action) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: `Invalid data provided while ${action}`
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid user ID'
        });
    }
    return res.status(500).json({
        status: 'error',
        message: `An error occurred while ${action}. Please try again later.`,
        error: err.message
    });
};
