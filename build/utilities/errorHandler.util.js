"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    if (err.name === "ValidationError") {
        err.statusCode = 400;
        err.message = "Please provide all required all required field";
        err.status = "fail";
    }
    return res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message,
        errstack: err.statusCode !== 500 ? null : err.stack,
    });
};
exports.errorHandler = errorHandler;
