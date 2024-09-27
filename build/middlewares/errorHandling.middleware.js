"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.errorHandlingMiddleware = exports.ApiError = void 0;
class CustomError extends Error {
    constructor(statusCode, message) {
        super(message); // Pass message to the base Error class
        this.statusCode = statusCode;
        // this.name = this.constructor.name; // Set the error name to the class name
        Error.captureStackTrace(this, this.constructor); // Capture stack trace
    }
}
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.ApiError = ApiError;
const errorHandlingMiddleware = (err, req, res
// next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    // const message = err.message || "Internal Server Error";
    res.status(statusCode).send({ success: false, message: err.message });
};
exports.errorHandlingMiddleware = errorHandlingMiddleware;
// export const errorHandlingMiddleware = (
//   err: CustomError,
//   req: Request,
//   res: Response
//   //   _next: NextFunction
// ) => {
//   const statusCode = err.statusCode || 500;
//   const message = err.message || "Internal Server Error";
//   res.status(statusCode).json({ success: false, statusCode, message });
// };
// export const errorHandlingMiddleware = (
//   statusCode: number,
//   message: string
// ): CustomError => {
//   return new CustomError(statusCode, message);
// };
const errorHandler = (statusCode, message) => {
    return new CustomError(statusCode, message);
};
exports.errorHandler = errorHandler;
