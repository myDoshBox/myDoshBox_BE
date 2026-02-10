"use strict";
// import { Request, Response, NextFunction } from "express";
// import { validateFormFields } from "../../utilities/validation.utilities";
// import MediatorModel, { IMediator } from "./mediator.model";
// import { errorHandler } from "../../middlewares/errorHandling.middleware";
// import {
//   sendMediatorInvolvementMailToMediator,
//   sendMediatorLoginDetailsMail,
//   sendResolutionMailToBuyer,
//   sendResolutionMailToSeller,
// } from "./mediator.mail";
// import bcrypt from "bcrypt";
// import { createSessionAndSendTokens } from "../../utilities/createSessionAndSendToken.util";
// import {
//   GetAllDisputeForAMediatorParams,
//   GetAllDisputeForAMediatorResponse,
//   MediatorLoginBody,
//   MediatorLoginResponse,
//   InvolveAMediatorParams,
//   InvolveAMediatorResponse,
//   ResolveDisputeParams,
//   ResolveDisputeBody,
//   ResolveDisputeResponse,
// } from "./mediator.interface";
// import ProductDispute from "../disputes/productsDispute/productDispute.model";
// // import ProductResolution from "../disputes/productsDispute/productResolution.model";
// import {
//   sendMediatorInvolvementMailToBuyer,
//   sendMediatorInvolvementMailToSeller,
// } from "../disputes/productsDispute/productDispute.mail";
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
exports.mediatorResolveDispute = exports.getAllDisputeForAMediator = exports.involveAMediator = exports.mediatorLogin = void 0;
const validation_utilities_1 = require("../../utilities/validation.utilities");
const mediator_model_1 = __importDefault(require("./mediator.model"));
const productsTransaction_model_1 = __importDefault(require("../transactions/productsTransaction/productsTransaction.model"));
const errorHandling_middleware_1 = require("../../middlewares/errorHandling.middleware");
const mediator_mail_1 = require("./mediator.mail");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createSessionAndSendToken_util_1 = require("../../utilities/createSessionAndSendToken.util");
const productDispute_model_1 = __importDefault(require("../disputes/productsDispute/productDispute.model"));
const productDispute_mail_1 = require("../disputes/productsDispute/productDispute.mail");
const productDispute_controller_1 = require("../disputes/productsDispute/productDispute.controller");
const cookieConfig_util_1 = require("../../utilities/cookieConfig.util");
/**
 * Mediator login
 * Validates credentials and creates a session
 */
const mediatorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { mediator_email, password } = req.body;
    (0, validation_utilities_1.validateFormFields)({ mediator_email, password }, next);
    try {
        // Find mediator with password field
        const mediatorToLogin = yield mediator_model_1.default.findOne({
            mediator_email,
        }).select("+password");
        if (!mediatorToLogin) {
            return next((0, errorHandling_middleware_1.errorHandler)(401, "Invalid email or password"));
        }
        // Verify password
        const isPasswordValid = yield bcrypt_1.default.compare(password, mediatorToLogin.password);
        if (!isPasswordValid) {
            return next((0, errorHandling_middleware_1.errorHandler)(401, "Invalid email or password"));
        }
        // Remove password from response
        const _a = mediatorToLogin.toObject(), { password: _ } = _a, mediatorWithoutPassword = __rest(_a, ["password"]);
        // Create session and generate tokens
        const sessionResponse = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)({
            user: {
                _id: mediatorToLogin._id,
                email: mediatorToLogin.mediator_email,
                role: "mediator",
            },
            userAgent: req.get("user-agent") || "unknown",
            role: "mediator",
            message: "Mediator successfully logged in",
        });
        // ✅ FIX: Set cookies with consistent configuration
        res.cookie("access_token", sessionResponse.accessToken, (0, cookieConfig_util_1.getCookieOptions)(15 * 60 * 1000));
        res.cookie("refresh_token", sessionResponse.refreshToken, (0, cookieConfig_util_1.getCookieOptions)(30 * 24 * 60 * 60 * 1000));
        res.status(200).json({
            status: sessionResponse.status,
            message: sessionResponse.message,
            user: sessionResponse.user,
            // token: sessionResponse.accessToken,
            accessToken: sessionResponse.accessToken,
            refreshToken: sessionResponse.refreshToken,
        });
    }
    catch (error) {
        console.error("Error logging in mediator:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.mediatorLogin = mediatorLogin;
/**
 * Involve a mediator in a dispute
 * Automatically assigns an available mediator with < 5 open disputes
 */
// export const involveAMediator = async (
//   req: Request<InvolveAMediatorParams>,
//   res: Response<InvolveAMediatorResponse>,
//   next: NextFunction,
// ): Promise<void> => {
//   const { transaction_id } = req.params;
//   const userEmail = await getUserEmailFromToken(req);
//   if (!userEmail) {
//     return next(errorHandler(401, "Authentication required"));
//   }
//   if (!userEmail) {
//     return next(errorHandler(401, "Authentication required"));
//   }
//   if (!transaction_id) {
//     return next(errorHandler(400, "Transaction ID is required"));
//   }
//   try {
//     // Find the dispute
//     const dispute = await ProductDispute.findOne({ transaction_id }).populate(
//       "transaction user mediator",
//     );
//     if (!dispute) {
//       return next(errorHandler(404, "Dispute not found"));
//     }
//     // Check if dispute can have a mediator involved
//     if (
//       dispute.dispute_status === "resolved" ||
//       dispute.dispute_status === "cancelled"
//     ) {
//       return next(
//         errorHandler(
//           400,
//           `Cannot involve a mediator: Dispute is ${dispute.dispute_status}`,
//         ),
//       );
//     }
//     // Check if mediator already assigned
//     if (dispute.mediator) {
//       return next(
//         errorHandler(400, "A mediator is already assigned to this dispute"),
//       );
//     }
//     // Find available mediators with < 5 open disputes
//     const mediators = await MediatorModel.find()
//       .select("-password")
//       .populate({
//         path: "disputes",
//         match: { dispute_status: { $in: ["processing", "resolving"] } },
//       });
//     // Find first available mediator (not buyer or seller)
//     const availableMediator = mediators.find(
//       (mediator: IMediator) =>
//         (mediator.dispute?.length || 0) < 5 &&
//         mediator.mediator_email !== dispute.buyer_email &&
//         mediator.mediator_email !== dispute.vendor_email,
//     );
//     if (!availableMediator) {
//       return next(
//         errorHandler(
//           503,
//           "No available mediators at this time. Please try again later.",
//         ),
//       );
//     }
//     const requested_by = userEmail === dispute.buyer_email ? "buyer" : "seller";
//     // Update dispute with mediator
//     const updatedDispute = await ProductDispute.findByIdAndUpdate(
//       dispute._id,
//       {
//         $set: {
//           mediator: availableMediator._id,
//           dispute_resolution_method: "mediator",
//           dispute_status: "resolving",
//         },
//       },
//       { new: true, runValidators: true },
//     ).populate("transaction user mediator");
//     if (!updatedDispute) {
//       return next(errorHandler(500, "Failed to update dispute with mediator"));
//     }
//     // Update mediator's dispute list
//     const updatedMediator = await MediatorModel.findByIdAndUpdate(
//       availableMediator._id,
//       { $addToSet: { disputes: dispute._id } },
//       { new: true, runValidators: true },
//     ).select("-password");
//     if (!updatedMediator) {
//       return next(errorHandler(500, "Failed to update mediator with dispute"));
//     }
//     // Send notification emails
//     try {
//       await Promise.all([
//         sendMediatorRequestedMailToBuyer(
//           dispute.buyer_email,
//           dispute.product_name,
//           requested_by,
//         ),
//         sendMediatorRequestedMailToSeller(
//           dispute.vendor_email,
//           dispute.product_name,
//           requested_by,
//         ),
//       ]);
//       console.log(
//         `Mediator involvement emails sent for transaction ${transaction_id}`,
//       );
//     } catch (emailError) {
//       console.error("Error sending mediator involvement emails:", emailError);
//       // Continue despite email failure
//     }
//     res.status(200).json({
//       status: "success",
//       message: "Mediator assigned to dispute successfully",
//       data: {
//         dispute: updatedDispute,
//         mediator: updatedMediator.toObject(),
//       },
//     });
//   } catch (error: unknown) {
//     console.error("Error involving mediator:", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };
// PARTIAL FIX - Only the involveAMediator function with corrections
/**
 * ✅ FIXED: Involve a mediator in a dispute
 * Automatically assigns an available mediator with < 5 open disputes
 */
const involveAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { transaction_id } = req.params;
    const userEmail = yield (0, productDispute_controller_1.getUserEmailFromToken)(req);
    if (!userEmail) {
        return next((0, errorHandling_middleware_1.errorHandler)(401, "Authentication required"));
    }
    if (!transaction_id) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
    }
    try {
        // Find the dispute
        const dispute = yield productDispute_model_1.default.findOne({ transaction_id }).populate("transaction user mediator");
        if (!dispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Dispute not found"));
        }
        // Check if dispute can have a mediator involved
        if (dispute.dispute_status === "resolved" ||
            dispute.dispute_status === "cancelled") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Cannot involve a mediator: Dispute is ${dispute.dispute_status}`));
        }
        // Check if mediator already assigned
        if (dispute.mediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "A mediator is already assigned to this dispute"));
        }
        // Find available mediators with < 5 open disputes
        const mediators = yield mediator_model_1.default.find()
            .select("-password")
            .populate({
            path: "disputes", // ✅ FIXED: Was working correctly already
            match: { dispute_status: { $in: ["processing", "resolving"] } },
        });
        // ✅ FIXED: Changed 'dispute' to 'disputes' in the property check
        const availableMediator = mediators.find((mediator) => {
            var _a;
            return (((_a = mediator.disputes) === null || _a === void 0 ? void 0 : _a.length) || 0) < 5 && // ✅ CRITICAL FIX: Changed from 'dispute' to 'disputes'
                mediator.mediator_email !== dispute.buyer_email &&
                mediator.mediator_email !== dispute.vendor_email;
        });
        if (!availableMediator) {
            console.log("❌ No available mediator found. Debug info:");
            mediators.forEach((m) => {
                var _a;
                console.log(`  - ${m.mediator_email}: ${((_a = m.disputes) === null || _a === void 0 ? void 0 : _a.length) || 0} disputes`);
            });
            return next((0, errorHandling_middleware_1.errorHandler)(503, "No available mediators at this time. Please try again later."));
        }
        console.log(`✅ Found available mediator: ${availableMediator.mediator_email} with ${((_a = availableMediator.disputes) === null || _a === void 0 ? void 0 : _a.length) || 0} disputes`);
        const requested_by = userEmail === dispute.buyer_email ? "buyer" : "seller";
        // Update dispute with mediator
        const updatedDispute = yield productDispute_model_1.default.findByIdAndUpdate(dispute._id, {
            $set: {
                mediator: availableMediator._id,
                dispute_resolution_method: "mediator",
                dispute_status: "resolving",
            },
        }, { new: true, runValidators: true }).populate("transaction user mediator");
        if (!updatedDispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update dispute with mediator"));
        }
        // Update mediator's dispute list
        const updatedMediator = yield mediator_model_1.default.findByIdAndUpdate(availableMediator._id, { $addToSet: { disputes: dispute._id } }, // ✅ Correct property name
        { new: true, runValidators: true }).select("-password");
        if (!updatedMediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update mediator with dispute"));
        }
        // Send notification emails
        try {
            yield Promise.all([
                (0, productDispute_mail_1.sendMediatorRequestedMailToBuyer)(dispute.buyer_email, dispute.product_name, requested_by),
                (0, productDispute_mail_1.sendMediatorRequestedMailToSeller)(dispute.vendor_email, dispute.product_name, requested_by),
            ]);
            console.log(`Mediator involvement emails sent for transaction ${transaction_id}`);
        }
        catch (emailError) {
            console.error("Error sending mediator involvement emails:", emailError);
            // Continue despite email failure
        }
        res.status(200).json({
            status: "success",
            message: "Mediator assigned to dispute successfully",
            data: {
                dispute: updatedDispute,
                mediator: updatedMediator.toObject(),
            },
        });
    }
    catch (error) {
        console.error("Error involving mediator:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.involveAMediator = involveAMediator;
/**
 * Get all disputes assigned to a mediator
 */
const getAllDisputeForAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { mediator_email } = req.params;
    if (!mediator_email) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Mediator email is required"));
    }
    try {
        // Find mediator
        const mediator = yield mediator_model_1.default.findOne({ mediator_email }).select("-password");
        if (!mediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Mediator not found"));
        }
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get total count
        const total = yield productDispute_model_1.default.countDocuments({
            mediator: mediator._id,
        });
        // Find all disputes assigned to mediator
        const disputes = yield productDispute_model_1.default.find({ mediator: mediator._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("transaction user");
        // Calculate total pages
        const totalPages = Math.ceil(total / limit);
        // Handle empty results
        if (disputes.length === 0) {
            res.status(200).json({
                status: "success",
                message: "No disputes assigned to this mediator",
                data: {
                    mediator: mediator.toObject(),
                    disputes: [],
                },
                pagination: {
                    total: 0,
                    page,
                    limit,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        }
        // Return results with pagination
        res.status(200).json({
            status: "success",
            message: "Disputes fetched successfully for mediator",
            data: {
                mediator: mediator.toObject(),
                disputes,
            },
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    }
    catch (error) {
        console.error("Error fetching mediator disputes:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.getAllDisputeForAMediator = getAllDisputeForAMediator;
/**
 * Mediator resolves a dispute
 * Determines fault and notifies both parties
 */
const mediatorResolveDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.params;
    const { dispute_fault, resolution_description } = req.body;
    // Validate inputs
    if (!transaction_id) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
    }
    if (!dispute_fault || !["buyer", "seller"].includes(dispute_fault)) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Dispute fault must be either 'buyer' or 'seller'"));
    }
    if (!resolution_description || resolution_description.trim().length === 0) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Resolution description is required and cannot be empty"));
    }
    try {
        // Find dispute
        const dispute = yield productDispute_model_1.default.findOne({ transaction_id }).populate("transaction user mediator");
        if (!dispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Dispute not found for this transaction"));
        }
        // Verify mediator is assigned
        if (!dispute.mediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "No mediator has been assigned to this dispute"));
        }
        // Check dispute status
        if (dispute.dispute_status !== "resolving") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Cannot resolve dispute with status: ${dispute.dispute_status}`));
        }
        // Update dispute with resolution
        const updatedDispute = yield productDispute_model_1.default.findByIdAndUpdate(dispute._id, {
            $set: {
                dispute_status: "resolved",
                dispute_fault: dispute_fault, // Now properly typed
                resolution_description: resolution_description.trim(), // Now properly typed
                resolved_at: new Date(),
                resolution_summary: `Resolved by mediator. Fault: ${dispute_fault}`,
            },
        }, { new: true, runValidators: true }).populate("transaction user mediator");
        if (!updatedDispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to resolve dispute"));
        }
        // Update transaction dispute status
        yield productsTransaction_model_1.default.findOneAndUpdate({ transaction_id }, { $set: { dispute_status: "resolved" } }, { new: true });
        // Send resolution emails to both parties
        // Use the non-null values we just set
        try {
            yield Promise.all([
                (0, mediator_mail_1.sendResolutionMailToBuyer)(updatedDispute.buyer_email, updatedDispute.product_name, resolution_description.trim(), dispute_fault),
                (0, mediator_mail_1.sendResolutionMailToSeller)(updatedDispute.vendor_email, updatedDispute.product_name, resolution_description.trim(), dispute_fault),
            ]);
            console.log(`Resolution emails sent for transaction ${transaction_id}`);
        }
        catch (emailError) {
            console.error("Error sending resolution emails:", emailError);
            // Continue despite email failure
        }
        res.status(200).json({
            status: "success",
            message: "Dispute resolved successfully by mediator",
            data: {
                dispute: updatedDispute,
            },
        });
    }
    catch (error) {
        console.error("Error resolving dispute:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.mediatorResolveDispute = mediatorResolveDispute;
