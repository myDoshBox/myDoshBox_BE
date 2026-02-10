"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProductFields = void 0;
const errorHandling_middleware_1 = require("../../../middlewares/errorHandling.middleware");
const validateProductFields = (fields, next) => {
    for (const [key, value] of Object.entries(fields)) {
        // Skip validation for arrays and objects (like products)
        if (Array.isArray(value) || typeof value === "object") {
            continue;
        }
        // Check if string fields are empty
        if (!value || (typeof value === "string" && value.trim() === "")) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `${key.replace(/_/g, " ")} is required`));
        }
    }
};
exports.validateProductFields = validateProductFields;
