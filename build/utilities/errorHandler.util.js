"use strict";
// import { Response, Request, NextFunction } from "express";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.createError = void 0;
/**
 * Factory function to create custom error objects
 */
const createError = (statusCode, message) => {
    return {
        message,
        statusCode,
        status: statusCode >= 400 && statusCode < 500 ? "fail" : "error",
    };
};
exports.createError = createError;
/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    if (err.name === "ValidationError") {
        err.statusCode = 400;
        err.status = "fail";
    }
    res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message,
        errstack: err.statusCode !== 500 ? null : err.stack,
    });
};
exports.errorHandler = errorHandler;
