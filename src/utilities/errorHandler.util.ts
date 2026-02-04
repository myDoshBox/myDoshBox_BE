// import { Response, Request, NextFunction } from "express";

// export interface ErrorResponse {
//   message: string;
//   statusCode: number;
//   status: string;
//   stack?: object;
//   name?: string;
// }

// export const errorHandler = (
//   err: ErrorResponse,
//   req: Request,
//   res: Response,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   next: NextFunction
// ) => {
//   if (err.name === "ValidationError") {
//     err.statusCode = 400;
//     err.status = "fail";
//   }

//   res.status(err.statusCode || 500).json({
//     status: err.status,
//     message: err.message,
//     errstack: err.statusCode !== 500 ? null : err.stack,
//   });
// };
// utilities/errorHandler.util.ts
import { Response, Request, NextFunction } from "express";

export interface ErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  stack?: object;
  name?: string;
}

/**
 * Factory function to create custom error objects
 */
export const createError = (
  statusCode: number,
  message: string,
): ErrorResponse => {
  return {
    message,
    statusCode,
    status: statusCode >= 400 && statusCode < 500 ? "fail" : "error",
  };
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
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
