"use strict";
// import { Request, Response, NextFunction } from "express";
// import { validateFormFields } from "../../../utilities/validation.utilities";
// import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
// import ProductTransaction from "../../transactions/productsTransaction/productsTransaction.model";
// import ProductDispute from "./productDispute.model";
// import { errorHandler } from "../../../middlewares/errorHandling.middleware";
// import {
//   BuyerResolveDisputeParams,
//   BuyerResolveDisputeBody,
//   BuyerResolveDisputeResponse,
//   SellerResolveDisputeParams,
//   SellerResolveDisputeResponse,
//   SellerResolveDisputeBody,
// } from "./productDispute.interface";
// import { log } from "console";
// import {
//   sendBuyerResolutionMailToBuyer,
//   sendBuyerResolutionMailToSeller,
//   sendDisputeMailToBuyer,
//   sendDisputeMailToSeller,
//   sendSellerResolutionMailToBuyer,
//   sendSellerResolutionMailToSeller,
// } from "./productDispute.mail";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisputeDetails = exports.getAllDisputesByUser = exports.cancelDispute = exports.requestMediator = exports.respondToResolution = exports.proposeResolution = exports.raiseDispute = exports.getUserEmailFromToken = void 0;
const validation_utilities_1 = require("../../../utilities/validation.utilities");
const individualUserAuth_model1_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model1"));
const organizationAuth_model_1 = __importDefault(require("../../authentication/organizationUserAuth/organizationAuth.model"));
const productsTransaction_model_1 = __importDefault(require("../../transactions/productsTransaction/productsTransaction.model"));
const productDispute_model_1 = __importDefault(require("./productDispute.model"));
const errorHandling_middleware_1 = require("../../../middlewares/errorHandling.middleware");
const productDispute_mail_1 = require("./productDispute.mail");
// Helper to get user email from token
const getUserEmailFromToken = (req) => {
    var _a, _b, _c;
    const tokenUser = req.user;
    return (((_a = tokenUser === null || tokenUser === void 0 ? void 0 : tokenUser.userData) === null || _a === void 0 ? void 0 : _a.email) ||
        ((_b = tokenUser === null || tokenUser === void 0 ? void 0 : tokenUser.userData) === null || _b === void 0 ? void 0 : _b.organization_email) ||
        ((_c = tokenUser === null || tokenUser === void 0 ? void 0 : tokenUser.userData) === null || _c === void 0 ? void 0 : _c.contact_email) ||
        null);
};
exports.getUserEmailFromToken = getUserEmailFromToken;
// Helper to determine dispute stage
const determineDisputeStage = (transaction) => {
    if (!transaction.verified_payment_status) {
        return "pre_payment";
    }
    else if (!transaction.buyer_confirm_status) {
        return "post_payment";
    }
    else {
        return "post_delivery";
    }
};
/**
 * Raise a new dispute
 */
const raiseDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.params;
    const { user_email, buyer_email, vendor_name, vendor_email, vendor_phone_number, product_name, product_image, disputed_products, reason_for_dispute, dispute_description, } = req.body;
    (0, validation_utilities_1.validateFormFields)({
        transaction_id,
        reason_for_dispute,
        dispute_description,
        user_email,
        buyer_email,
        vendor_email,
    }, next);
    if (!(dispute_description === null || dispute_description === void 0 ? void 0 : dispute_description.trim()) || !(reason_for_dispute === null || reason_for_dispute === void 0 ? void 0 : reason_for_dispute.trim())) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Fields cannot be empty or contain only whitespace"));
    }
    if (!product_name && !disputed_products) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Either product_name/product_image or disputed_products array is required"));
    }
    try {
        const user = (yield individualUserAuth_model1_1.default.findOne({ email: user_email })) ||
            (yield organizationAuth_model_1.default.findOne({ email: user_email }));
        if (!user) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "User not found"));
        }
        const transaction = yield productsTransaction_model_1.default.findOne({ transaction_id });
        if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        if (buyer_email === vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot raise a dispute against yourself"));
        }
        if (user_email !== buyer_email && user_email !== vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "You are not authorized to raise a dispute"));
        }
        const transactionStatus = transaction.transaction_status;
        if (transactionStatus === "completed") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot raise dispute: Transaction completed"));
        }
        if (transactionStatus === "cancelled") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot raise dispute: Transaction cancelled"));
        }
        if (transaction.dispute_status === "active") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction already has an active dispute"));
        }
        let dispute_raised_by;
        if (user_email === vendor_email) {
            dispute_raised_by = "seller";
        }
        else if (user_email === buyer_email) {
            dispute_raised_by = "buyer";
        }
        else {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Unauthorized to raise this dispute"));
        }
        // NEW: Check if buyer is raising dispute - require payment verification
        // if (user_email === buyer_email && !transaction.verified_payment_status) {
        // if (user_email === buyer_email && !transaction.verified_payment_status) {
        //   console.log(user_email, "user_email");
        //   return next(
        //     errorHandler(
        //       400,
        //       "Buyer can only raise a dispute after payment has been verified"
        //     )
        //   );
        // }
        // Determine products to dispute
        let productsToDispute;
        if (product_name) {
            if (!product_image) {
                return next((0, errorHandling_middleware_1.errorHandler)(400, "product_image is required"));
            }
            productsToDispute = [{ name: product_name, image: product_image }];
        }
        else {
            if (!Array.isArray(disputed_products) || disputed_products.length === 0) {
                return next((0, errorHandling_middleware_1.errorHandler)(400, "disputed_products must be a non-empty array"));
            }
            for (const dp of disputed_products) {
                if (!dp.name || !dp.image) {
                    return next((0, errorHandling_middleware_1.errorHandler)(400, "Each product must have 'name' and 'image'"));
                }
            }
            productsToDispute = disputed_products;
        }
        const matchingProducts = transaction.products.filter((p) => productsToDispute.some((dp) => dp.name === p.name));
        if (matchingProducts.length === 0) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "None of the provided products match the transaction"));
        }
        const existingDispute = yield productDispute_model_1.default.findOne({ transaction_id });
        if (existingDispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "A dispute already exists for this transaction"));
        }
        // Determine dispute stage
        const dispute_stage = determineDisputeStage(transaction);
        // Update transaction
        const updatedTransaction = yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, { $set: { dispute_status: "active" } }, { new: true, runValidators: true });
        if (!updatedTransaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction dispute status"));
        }
        const productSummary = matchingProducts.length === 1
            ? matchingProducts[0].name
            : `${matchingProducts.length} Products`;
        // Create dispute with transaction state snapshot
        const newProductDispute = new productDispute_model_1.default({
            user: user._id,
            transaction: transaction._id,
            mediator: null,
            transaction_id,
            buyer_email,
            vendor_name,
            vendor_email,
            vendor_phone_number,
            product_name: productSummary,
            product_image: matchingProducts[0].image,
            products: matchingProducts.map((p) => ({
                name: p.name,
                quantity: p.quantity,
                price: p.price,
                image: p.image,
                description: p.description,
            })),
            reason_for_dispute: reason_for_dispute.trim(),
            dispute_description: dispute_description.trim(),
            dispute_raised_by,
            dispute_raised_by_email: user_email,
            dispute_stage, // NEW: Track stage
            transaction_state_snapshot: {
                buyer_initiated: transaction.buyer_initiated,
                seller_confirmed: transaction.seller_confirmed,
                verified_payment_status: transaction.verified_payment_status,
                shipping_submitted: transaction.shipping_submitted,
                buyer_confirm_status: transaction.buyer_confirm_status,
            },
            dispute_status: "processing",
            dispute_resolution_method: "unresolved",
            resolution_proposals: [],
            rejection_count: 0,
            max_rejections: 3,
        });
        yield newProductDispute.save();
        // Send emails
        try {
            yield Promise.all([
                (0, productDispute_mail_1.sendDisputeMailToBuyer)(buyer_email, productSummary, dispute_description.trim()),
                (0, productDispute_mail_1.sendDisputeMailToSeller)(vendor_email, productSummary, dispute_description.trim()),
            ]);
        }
        catch (emailError) {
            console.error("Error sending dispute emails:", emailError);
        }
        // Determine stage-specific guidance
        let stageGuidance = "";
        switch (dispute_stage) {
            case "pre_payment":
                stageGuidance =
                    "Dispute raised before payment. Transaction can be modified or cancelled.";
                break;
            case "post_payment":
                stageGuidance =
                    "Dispute raised after payment but before delivery confirmation. Focus on delivery and product condition.";
                break;
            case "post_delivery":
                stageGuidance =
                    "Dispute raised after delivery confirmation. Product quality or description mismatch issue.";
                break;
        }
        res.status(201).json({
            status: "success",
            message: `Dispute raised successfully for ${matchingProducts.length} product(s)`,
            data: {
                dispute: newProductDispute,
                disputed_products_count: matchingProducts.length,
                dispute_stage,
                stage_guidance: stageGuidance,
                next_steps: {
                    buyer_can: dispute_raised_by === "seller"
                        ? ["propose_resolution", "request_mediator"]
                        : ["wait_for_seller_resolution"],
                    seller_can: dispute_raised_by === "buyer"
                        ? ["propose_resolution", "request_mediator"]
                        : ["wait_for_buyer_resolution"],
                },
            },
        });
    }
    catch (error) {
        console.error("Error raising dispute:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.raiseDispute = raiseDispute;
/**
 * Propose a resolution (SIMPLIFIED - Text only)
 */
const proposeResolution = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.params;
    const { proposal_description } = req.body;
    (0, validation_utilities_1.validateFormFields)({ proposal_description }, next);
    if (!(proposal_description === null || proposal_description === void 0 ? void 0 : proposal_description.trim())) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Proposal description is required"));
    }
    const userEmail = (0, exports.getUserEmailFromToken)(req);
    if (!userEmail) {
        return next((0, errorHandling_middleware_1.errorHandler)(401, "Authentication required"));
    }
    try {
        const dispute = yield productDispute_model_1.default.findOne({
            transaction_id,
        }).populate("transaction");
        if (!dispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Dispute not found"));
        }
        // Authorization
        if (userEmail !== dispute.buyer_email &&
            userEmail !== dispute.vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Not authorized to propose resolution"));
        }
        // Check if dispute can accept proposals
        if (!["processing", "resolving"].includes(dispute.dispute_status)) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Cannot propose resolution: Status is ${dispute.dispute_status}`));
        }
        // Check if mediator is involved
        if (dispute.dispute_resolution_method === "mediator") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot propose: Mediator is handling this dispute"));
        }
        // Check if there's already a pending proposal
        const pendingProposal = dispute.resolution_proposals.find((p) => p.status === "pending");
        if (pendingProposal) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "A resolution proposal is already pending. Wait for response."));
        }
        const proposed_by = userEmail === dispute.buyer_email ? "buyer" : "seller";
        // Create simple text-based proposal
        const newProposal = {
            proposed_by,
            proposed_by_email: userEmail,
            proposal_date: new Date(),
            proposal_type: "description_only",
            resolution_description: proposal_description.trim(),
            proposal_description: proposal_description.trim(),
            status: "pending",
        };
        // Add proposal to dispute
        dispute.resolution_proposals.push(newProposal);
        dispute.dispute_status = "resolving";
        dispute.dispute_resolution_method = "dispute_parties";
        yield dispute.save();
        // Send notifications
        try {
            const productSummary = dispute.product_name;
            const otherPartyEmail = proposed_by === "buyer" ? dispute.vendor_email : dispute.buyer_email;
            yield (0, productDispute_mail_1.sendResolutionProposedToSeller)(proposed_by === "buyer" ? otherPartyEmail : userEmail, productSummary, proposed_by, dispute.resolution_proposals.length);
            yield (0, productDispute_mail_1.sendResolutionProposedToBuyer)(proposed_by === "seller" ? otherPartyEmail : userEmail, productSummary, proposed_by, dispute.resolution_proposals.length);
        }
        catch (emailError) {
            console.error("Error sending proposal emails:", emailError);
        }
        res.status(200).json({
            status: "success",
            message: "Resolution proposed successfully. Awaiting response.",
            data: {
                dispute,
                proposal_number: dispute.resolution_proposals.length,
                rejections_remaining: dispute.max_rejections - dispute.rejection_count,
                dispute_stage: dispute.dispute_stage,
            },
        });
    }
    catch (error) {
        console.error("Error proposing resolution:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.proposeResolution = proposeResolution;
/**
 * Respond to a resolution proposal (SIMPLIFIED - With response description)
 */
const respondToResolution = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.params;
    const { action, response_description } = req.body;
    (0, validation_utilities_1.validateFormFields)({ action }, next);
    if (!["accept", "reject"].includes(action)) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Action must be 'accept' or 'reject'"));
    }
    if (!(response_description === null || response_description === void 0 ? void 0 : response_description.trim())) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Response description is required (explain why you're accepting/rejecting)"));
    }
    const userEmail = (0, exports.getUserEmailFromToken)(req);
    if (!userEmail) {
        return next((0, errorHandling_middleware_1.errorHandler)(401, "Authentication required"));
    }
    try {
        const dispute = yield productDispute_model_1.default.findOne({
            transaction_id,
        }).populate("transaction");
        if (!dispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Dispute not found"));
        }
        // Authorization
        if (userEmail !== dispute.buyer_email &&
            userEmail !== dispute.vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Not authorized to respond"));
        }
        // Find pending proposal
        const pendingProposal = dispute.resolution_proposals.find((p) => p.status === "pending");
        if (!pendingProposal) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "No pending resolution proposal found"));
        }
        // Verify responder is not the proposer
        if (pendingProposal.proposed_by_email === userEmail) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot respond to your own proposal"));
        }
        if (action === "accept") {
            // ACCEPT RESOLUTION
            pendingProposal.status = "accepted";
            pendingProposal.responded_by = userEmail;
            pendingProposal.response_date = new Date();
            pendingProposal.response_description = response_description.trim();
            // Mark dispute as resolved
            dispute.dispute_status = "resolved";
            dispute.resolved_at = new Date();
            dispute.resolution_summary = `Resolved by mutual agreement. Proposal ${dispute.resolution_proposals.length} accepted.`;
            // Update transaction dispute status
            yield productsTransaction_model_1.default.findOneAndUpdate({ transaction_id }, { $set: { dispute_status: "resolved" } }, { new: true });
            yield dispute.save();
            // Send notifications
            try {
                yield Promise.all([
                    (0, productDispute_mail_1.sendResolutionAcceptedMailToBuyer)(dispute.buyer_email, dispute.product_name),
                    (0, productDispute_mail_1.sendResolutionAcceptedMailToSeller)(dispute.vendor_email, dispute.product_name),
                ]);
            }
            catch (emailError) {
                console.error("Error sending acceptance emails:", emailError);
            }
            res.status(200).json({
                status: "success",
                message: "Resolution accepted. Dispute resolved successfully!",
                data: { dispute },
            });
        }
        else {
            // REJECT RESOLUTION
            pendingProposal.status = "rejected";
            pendingProposal.responded_by = userEmail;
            pendingProposal.response_date = new Date();
            pendingProposal.response_description = response_description.trim();
            dispute.rejection_count += 1;
            // Check for auto-escalation
            if (dispute.rejection_count >= dispute.max_rejections) {
                dispute.dispute_status = "escalated_to_mediator";
                dispute.dispute_resolution_method = "mediator";
                dispute.resolution_summary = `Auto-escalated to mediator after ${dispute.max_rejections} rejections`;
                yield dispute.save();
                // Send auto-escalation emails
                try {
                    yield Promise.all([
                        (0, productDispute_mail_1.sendAutoEscalationMailToBuyer)(dispute.buyer_email, dispute.product_name, dispute.rejection_count),
                        (0, productDispute_mail_1.sendAutoEscalationMailToSeller)(dispute.vendor_email, dispute.product_name, dispute.rejection_count),
                    ]);
                }
                catch (emailError) {
                    console.error("Error sending escalation emails:", emailError);
                }
                res.status(200).json({
                    status: "success",
                    message: `Resolution rejected. Dispute automatically escalated to mediator after ${dispute.max_rejections} rejections.`,
                    data: {
                        dispute,
                        auto_escalated: true,
                    },
                });
            }
            // Not yet at max rejections - return to processing
            dispute.dispute_status = "processing";
            yield dispute.save();
            // Send rejection notifications
            try {
                const rejectorRole = userEmail === dispute.buyer_email ? "buyer" : "seller";
                yield Promise.all([
                    (0, productDispute_mail_1.sendResolutionRejectedToBuyer)(dispute.buyer_email, dispute.product_name, rejectorRole, dispute.rejection_count, dispute.max_rejections),
                    (0, productDispute_mail_1.sendResolutionRejectedToSeller)(dispute.vendor_email, dispute.product_name, rejectorRole, dispute.rejection_count, dispute.max_rejections),
                ]);
            }
            catch (emailError) {
                console.error("Error sending rejection emails:", emailError);
            }
            res.status(200).json({
                status: "success",
                message: `Resolution rejected. ${dispute.max_rejections - dispute.rejection_count} attempts remaining before auto-escalation.`,
                data: {
                    dispute,
                    rejection_count: dispute.rejection_count,
                    rejections_remaining: dispute.max_rejections - dispute.rejection_count,
                    can_propose_again: true,
                },
            });
        }
    }
    catch (error) {
        console.error("Error responding to resolution:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.respondToResolution = respondToResolution;
/**
 * Request mediator involvement
 */
const requestMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.params;
    const userEmail = (0, exports.getUserEmailFromToken)(req);
    if (!userEmail) {
        return next((0, errorHandling_middleware_1.errorHandler)(401, "Authentication required"));
    }
    try {
        const dispute = yield productDispute_model_1.default.findOne({ transaction_id });
        if (!dispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Dispute not found"));
        }
        // Authorization
        if (userEmail !== dispute.buyer_email &&
            userEmail !== dispute.vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Not authorized"));
        }
        // Check if already escalated
        if (dispute.dispute_resolution_method === "mediator") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Mediator already involved"));
        }
        // Check if dispute is resolved or cancelled
        if (["resolved", "cancelled"].includes(dispute.dispute_status)) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Cannot request mediator: Dispute is ${dispute.dispute_status}`));
        }
        const requested_by = userEmail === dispute.buyer_email ? "buyer" : "seller";
        dispute.dispute_status = "escalated_to_mediator";
        dispute.dispute_resolution_method = "mediator";
        dispute.mediator_requested_by = requested_by;
        dispute.mediator_requested_at = new Date();
        yield dispute.save();
        // Send notifications
        try {
            yield Promise.all([
                (0, productDispute_mail_1.sendMediatorRequestedMailToBuyer)(dispute.buyer_email, dispute.product_name, requested_by),
                (0, productDispute_mail_1.sendMediatorRequestedMailToSeller)(dispute.vendor_email, dispute.product_name, requested_by),
            ]);
        }
        catch (emailError) {
            console.error("Error sending mediator request emails:", emailError);
        }
        res.status(200).json({
            status: "success",
            message: "Mediator requested successfully. A mediator will be assigned soon.",
            data: {
                dispute,
                requested_by,
            },
        });
    }
    catch (error) {
        console.error("Error requesting mediator:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.requestMediator = requestMediator;
/**
 * Cancel dispute (mutual agreement)
 */
const cancelDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.params;
    const userEmail = (0, exports.getUserEmailFromToken)(req);
    if (!userEmail) {
        return next((0, errorHandling_middleware_1.errorHandler)(401, "Authentication required"));
    }
    try {
        const dispute = yield productDispute_model_1.default.findOne({ transaction_id });
        if (!dispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Dispute not found"));
        }
        // Authorization
        if (userEmail !== dispute.buyer_email &&
            userEmail !== dispute.vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Not authorized"));
        }
        // Check status
        if (dispute.dispute_status === "resolved") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Dispute is already resolved"));
        }
        if (dispute.dispute_status === "cancelled") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Dispute is already cancelled"));
        }
        // Don't allow if mediator involved
        if (dispute.dispute_resolution_method === "mediator" && dispute.mediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot cancel: Mediator is assigned"));
        }
        // Update transaction
        yield productsTransaction_model_1.default.findOneAndUpdate({ transaction_id }, { $set: { dispute_status: "none" } }, { new: true });
        // Update dispute
        dispute.dispute_status = "cancelled";
        yield dispute.save();
        // Send notifications
        try {
            yield Promise.all([
                (0, productDispute_mail_1.sendDisputeCancelledMailToBuyer)(dispute.buyer_email, dispute.product_name),
                (0, productDispute_mail_1.sendDisputeCancelledMailToSeller)(dispute.vendor_email, dispute.product_name),
            ]);
        }
        catch (emailError) {
            console.error("Error sending cancellation emails:", emailError);
        }
        res.status(200).json({
            status: "success",
            message: "Dispute cancelled successfully. Transaction can proceed normally.",
            data: { dispute },
        });
    }
    catch (error) {
        console.error("Error cancelling dispute:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.cancelDispute = cancelDispute;
/**
 * Get all disputes for a user
 */
const getAllDisputesByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_email } = req.params;
        if (!user_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "User email is required"));
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Optional filter by dispute stage
        const stage = req.query.stage;
        const stageFilter = stage ? { dispute_stage: stage } : {};
        const total = yield productDispute_model_1.default.countDocuments(Object.assign({ $or: [{ vendor_email: user_email }, { buyer_email: user_email }] }, stageFilter));
        const disputes = yield productDispute_model_1.default.find(Object.assign({ $or: [{ vendor_email: user_email }, { buyer_email: user_email }] }, stageFilter))
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("transaction user mediator");
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            status: "success",
            message: disputes.length > 0
                ? "Disputes fetched successfully"
                : "No disputes found",
            data: { disputes },
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
        console.error("Error fetching disputes:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.getAllDisputesByUser = getAllDisputesByUser;
/**
 * Get single dispute details with full resolution history
 */
const getDisputeDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transaction_id } = req.params;
        const dispute = yield productDispute_model_1.default.findOne({ transaction_id }).populate("transaction user mediator");
        if (!dispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Dispute not found"));
        }
        const userEmail = (0, exports.getUserEmailFromToken)(req);
        // Authorization check
        if (userEmail !== dispute.buyer_email &&
            userEmail !== dispute.vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Not authorized to view this dispute"));
        }
        res.status(200).json({
            status: "success",
            message: "Dispute details fetched successfully",
            data: {
                dispute,
                resolution_history: dispute.resolution_proposals,
                dispute_stage: dispute.dispute_stage,
                transaction_state: dispute.transaction_state_snapshot,
                can_propose: dispute.dispute_status === "processing" &&
                    dispute.dispute_resolution_method !== "mediator",
                can_respond: dispute.resolution_proposals.some((p) => p.status === "pending"),
                can_request_mediator: ![
                    "resolved",
                    "cancelled",
                    "escalated_to_mediator",
                ].includes(dispute.dispute_status),
            },
        });
    }
    catch (error) {
        console.error("Error fetching dispute details:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.getDisputeDetails = getDisputeDetails;
