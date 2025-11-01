import { NextFunction } from "express";
import { errorHandler } from "../../../middlewares/errorHandling.middleware";

export const validateProductFields = (
  fields: { [key: string]: any },
  next: NextFunction
) => {
  for (const [key, value] of Object.entries(fields)) {
    // Skip validation for arrays and objects (like products)
    if (Array.isArray(value) || typeof value === "object") {
      continue;
    }

    // Check if string fields are empty
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return next(errorHandler(400, `${key.replace(/_/g, " ")} is required`));
    }
  }
};
