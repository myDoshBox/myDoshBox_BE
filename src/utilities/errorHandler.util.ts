import { Response, Request } from "express";

export interface ErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  stack?: object;
  name?: string;
}

export const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response
) => {
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
