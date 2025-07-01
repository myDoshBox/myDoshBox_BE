"use strict";
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
exports.sellerResolveDispute = exports.buyerResolveDispute = exports.cancelEscrow = exports.getAllDisputes = exports.raiseDispute = void 0;
const validation_utilities_1 = require("../../../utilities/validation.utilities");
const individualUserAuth_model1_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model1"));
const productsTransaction_model_1 = __importDefault(require("../../transactions/productsTransaction/productsTransaction.model"));
const productDispute_model_1 = __importDefault(require("./productDispute.model"));
const errorHandling_middleware_1 = require("../../../middlewares/errorHandling.middleware");
// import productTransaction from "../../transactions/productsTransaction/productsTransaction.model";
// seller rejects escrow initiated
/*
    1. accepts:- buyer are given their "create transaction" form to edit
    2. rejects:-
        a. cancels the escrow initiated
        b. involves a mediator
            - mediator receives mail
    
 */
// seller fills the "raise dispute form"
// - buyer gets an email
// - goes to the platform "dispute interface" and "view details"
// - the popup with 3 buttons to "cancel transaction" "resolve" or "involve a mediator"
// - onclick of cancel transaction, the buyer is alerted and the transaction_status on transaction table is set to "cancelled" and dispute status is set to "resolved"
// - onclick of resolve, the transaction form that the buyer filled is shown to the buyer to edit and resubmit, then seller is alerted via email.
/////// - if the seller still refuses, the only option left is to involve a mediator
/////// - if the seller agrees, the normal transaction process continues
// - onclick of "involve a meditator", a form is filled and mediator gets a mail
const raiseDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // dispute form
    const { transaction_id, // prefill this
    buyer_email, // prefill this
    vendor_email, // prefill this
    product_name, product_image, reason_for_dispute, dispute_description, } = req.body;
    (0, validation_utilities_1.validateFormFields)({
        product_name,
        product_image,
        transaction_id, // prefill this
        reason_for_dispute,
        dispute_description,
    }, next);
    try {
        // find the user who initiated the transaction
        const user = yield individualUserAuth_model1_1.default.findOne({ email: buyer_email });
        //   find the transaction by id
        const transaction = yield productsTransaction_model_1.default.findOne({
            transaction_id: transaction_id,
        });
        const transactionStatus = transaction === null || transaction === void 0 ? void 0 : transaction.transaction_status;
        // log("transaction", transaction);
        // log("user", user);
        if (!user) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "User not found"));
        }
        else if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        else if (buyer_email === vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot raise a dispute against yourself"));
        }
        else if (transactionStatus === "completed") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot raise a dispute for this transaction because it has already been completed"));
        }
        else if (transactionStatus === "cancelled") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot raise a dispute for this transaction because it has already been cancelled"));
        }
        else if (transactionStatus === "inDispute") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot raise a dispute for this transaction because it is already in dispute"));
        }
        // else {
        // we want to update the transaction status to "inDispute" when a dispute is raised
        const updateProductTransactionStatus = yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, { $set: { transaction_status: "inDispute" } }, { new: true, useFindAndModify: true } // to return the updated document
        );
        if (!updateProductTransactionStatus) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction status"));
        }
        // detaiils of the dispute saved to DB
        const newProductDispute = new productDispute_model_1.default({
            user: user,
            transaction: transaction,
            transaction_id,
            product_name,
            product_image,
            buyer_email,
            vendor_email,
            reason_for_dispute,
            dispute_description,
        });
        yield newProductDispute.save();
        // send mail to the buyer that the seller has raised a dispute
        res.json({
            status: "success",
            message: "Dispute has been raised successfully",
        });
        // }
    }
    catch (error) {
        console.log("error", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.raiseDispute = raiseDispute;
// FLIP SIDE OF THE LOGIC
// buyer rejects the goods, then fills the dispute form and send to the seller
/*
    1. accepts:- fills the dispute resolution form
    2. rejects:-
        a. cancels the escrow initiated - who bears the consequence
        b. involves a mediator
            - mediator receives mail
        
    
 */
const getAllDisputes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_email } = req.params;
        if (!user_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "User email is required"));
        }
        const fetchDisputeDetails = yield productDispute_model_1.default.find({
            $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
        }).sort({ createdAt: -1 });
        if (!fetchDisputeDetails || (fetchDisputeDetails === null || fetchDisputeDetails === void 0 ? void 0 : fetchDisputeDetails.length) === 0) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "No disputes found for this user"));
        }
        else {
            res.json({
                fetchDisputeDetails,
                status: "success",
                message: "all disputes have been fetched successfully",
            });
        }
    }
    catch (error) {
        console.log("error", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.getAllDisputes = getAllDisputes;
// cancel escrow function
const cancelEscrow = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.body;
    if (!transaction_id)
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
    try {
        const fetchProductDetails = yield productsTransaction_model_1.default.findOne({
            transaction_id: transaction_id,
        });
        const productTransactionStatus = fetchProductDetails === null || fetchProductDetails === void 0 ? void 0 : fetchProductDetails.transaction_status;
        const fetchDisputeDetails = yield productDispute_model_1.default.findOne({
            transaction_id: transaction_id,
        });
        const productDisputeStatus = fetchDisputeDetails === null || fetchDisputeDetails === void 0 ? void 0 : fetchDisputeDetails.dispute_status;
        if (productTransactionStatus === "cancelled") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "This transaction cannot be cancelled because it has already been cancelled"));
        }
        else if (productTransactionStatus === "completed") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "This transaction cannot be cancelled because it has already been completed"));
        }
        else if (productDisputeStatus === "resolved") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "This transaction cannot be cancelled because it has already been resolved"));
        }
        // else if (productTransactionStatus === "processing" || productTransactionStatus === "inDispute" || productDisputeStatus === "processing") {
        //   const updateProductTransactionStatus =
        // }
        // update the product transaction status to "cancelled"
        const updateProductTransactionStatus = yield productsTransaction_model_1.default.findByIdAndUpdate(fetchProductDetails === null || fetchProductDetails === void 0 ? void 0 : fetchProductDetails._id, { transaction_status: "cancelled" }, { new: true } // to return the updated document
        );
        if (!updateProductTransactionStatus) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction status"));
        }
        // update the dispute status to "cancelled"
        const updateProductDisputeStatus = yield productDispute_model_1.default.findByIdAndUpdate(fetchDisputeDetails === null || fetchDisputeDetails === void 0 ? void 0 : fetchDisputeDetails._id, { dispute_status: "cancelled" }, { new: true } // to return the updated document
        );
        if (!updateProductDisputeStatus) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update dispute status"));
        }
        // send mail to the buyer and seller that the dispute has been cancelled
        res.json({
            status: "success",
            message: "Dispute has been cancelled successfully",
        });
    }
    catch (error) {
        console.log("error", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
    // try {
    //   const fetchProductDetails = await ProductDispute.aggregate([
    //     {
    //       $lookup: {
    //         from: "products",
    //         localField: "product",
    //         foreignField: "_id",
    //         as: "productDetails",
    //       },
    //     },
    //     { $unwind: "$productDetails" },
    //     {
    //       $match: {
    //         "productDetails.transaction_id": transaction_id,
    //       },
    //     },
    //     {
    //       $project: {
    //         transaction_status: "$productDetails.transaction_status",
    //         product_id: "$productDetails._id",
    //         vendor_email: "$vendor_email",
    //         buyer_email: "$buyer_email",
    //         product_name: "$productDetails.product_name",
    //       },
    //     },
    //   ]);
    //   if (!fetchProductDetails || fetchProductDetails.length === 0) {
    //     return next(errorHandler(404, "Dispute details not found"));
    //   }
    //   const {
    //     transaction_status,
    //     product_id,
    //     vendor_email,
    //     buyer_email,
    //     product_name,
    //   } = fetchProductDetails[0];
    //   const fetchDisputeDetails = ProductDispute.findOne({
    //     transaction_id: transaction_id,
    //   });
    //   console.log(fetchDisputeDetails);
    //   if (transaction_status === "cancelled") {
    //     return next(
    //       errorHandler(
    //         400,
    //         "This transaction cannot be cancelled because it has already been cancelled"
    //       )
    //     );
    //   } else if (transaction_status === "completed") {
    //     return next(
    //       errorHandler(
    //         400,
    //         "This transaction cannot be cancelled because it has already been completed"
    //       )
    //     );
    //   }
    //   // else if (fetchDisputeDetails === "") {
    //   // }
    // } catch (error: string | unknown) {
    //   console.log("error", error);
    //   return next(errorHandler(500, "Internal server error"));
    // }
});
exports.cancelEscrow = cancelEscrow;
// byuer resolve dispute
const buyerResolveDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // when buyer clicks on the resolution button, they get the form that they used in initializing transaction for an update requested in the dispute
    // every field in the form should be prefilled
    const { transaction_id, vendor_name, vendor_phone_number, vendor_email, transaction_type, product_name, product_quantity, product_price, transaction_total, product_image, product_description, signed_escrow_doc, delivery_address, } = req.body;
    // const { transaction_id } = req.params;
    try {
        const userResolvingDispute = yield productsTransaction_model_1.default.findOne({
            transaction_id: transaction_id,
            // transaction_status: "inDispute",
        });
        const transactionStatus = userResolvingDispute === null || userResolvingDispute === void 0 ? void 0 : userResolvingDispute.transaction_status;
        console.log("transactionStatus", transactionStatus);
        console.log("userResolvingDispute", userResolvingDispute);
        res.json({
            status: "success",
            message: "Dispute resolution form fetched successfully",
            // userResolvingDispute,
        });
    }
    catch (error) {
        console.log("error", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.buyerResolveDispute = buyerResolveDispute;
// export const buyerResolveDispute = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const {
//     transaction_id,
//     vendor_name,
//     vendor_phone_number,
//     vendor_email,
//     transaction_type,
//     product_name,
//     product_quantity,
//     product_price,
//     transaction_total,
//     product_image,
//     product_description,
//     signed_escrow_doc,
//     delivery_address,
//   } = req.body;
//   // Validate required fields
//   if (!transaction_id) {
//     return next(errorHandler(400, "Transaction ID is required"));
//   }
//   validateProductFields(
//     {
//       vendor_name,
//       vendor_phone_number,
//       vendor_email,
//       transaction_type,
//       product_name,
//       product_quantity,
//       product_price,
//       transaction_total,
//       product_image,
//       product_description,
//       delivery_address,
//     },
//     next
//   );
//   try {
//     // Find the user (buyer) who is resolving the dispute
//     const user = await IndividualUser.findOne({
//       email: req.user?.email || req.body.buyer_email,
//     });
//     if (!user) {
//       return next(errorHandler(404, "User not found"));
//     }
//     // Find the transaction by transaction_id and verify it belongs to the buyer
//     const transaction = await ProductTransaction.findOne({
//       transaction_id,
//       buyer_email: user.email,
//     });
//     if (!transaction) {
//       return next(
//         errorHandler(
//           404,
//           "Transaction not found or you are not authorized to update it"
//         )
//       );
//     }
//     // Check if transaction_status is 'inDispute'
//     if (transaction.transaction_status !== "inDispute") {
//       return next(
//         errorHandler(
//           400,
//           `Cannot resolve dispute: Transaction is in '${transaction.transaction_status}' status. Only transactions in 'inDispute' status can be updated.`
//         )
//       );
//     }
//     // Prevent buyer from updating their own email or vendor's email to match
//     if (vendor_email === user.email) {
//       return next(
//         errorHandler(400, "Vendor email cannot be the same as buyer email")
//       );
//     }
//     // Update transaction fields (only those provided in the request)
//     transaction.vendor_name = vendor_name || transaction.vendor_name;
//     transaction.vendor_phone_number =
//       vendor_phone_number || transaction.vendor_phone_number;
//     transaction.vendor_email = vendor_email || transaction.vendor_email;
//     transaction.transaction_type =
//       transaction_type || transaction.transaction_type;
//     transaction.product_name = product_name || transaction.product_name;
//     transaction.product_quantity =
//       product_quantity || transaction.product_quantity;
//     transaction.product_price = product_price || transaction.product_price;
//     transaction.transaction_total =
//       transaction_total || transaction.transaction_total;
//     transaction.product_image = product_image || transaction.product_image;
//     transaction.product_description =
//       product_description || transaction.product_description;
//     transaction.signed_escrow_doc =
//       signed_escrow_doc || transaction.signed_escrow_doc;
//     transaction.delivery_address =
//       delivery_address || transaction.delivery_address;
//     // Optionally update dispute-related status (e.g., mark as resolved)
//     transaction.transaction_status = "dispute_resolved"; // Adjust status as per your schema
//     // Save the updated transaction
//     await transaction.save();
//     // Send response
//     res.json({
//       status: "success",
//       message: "Transaction updated successfully to resolve dispute",
//       transaction,
//     });
//   } catch (error: string | unknown) {
//     console.error(error);
//     return next(errorHandler(500, "Server error"));
//   }
// };
// seller resolve dispute
const sellerResolveDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { });
exports.sellerResolveDispute = sellerResolveDispute;
// export const resolveDispute = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // dispute resolution form
//   const { transaction_id, resolution_description } = req.body;
//   validateFormFields(
//     {
//       transaction_id,
//       resolution_description,
//     },
//     next
//   );
//   try {
//     // find the transaction by id
//     const transaction = await ProductTransaction.findOne({
//       transaction_id: transaction_id,
//     });
//     if (!transaction) {
//       return next(errorHandler(404, "Transaction not found"));
//     }
//     // update the transaction status to "resolved"
//     const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
//       transaction._id,
//       { transaction_status: "resolved" },
//       { new: true }
//     );
//     if (!updatedTransaction) {
//       return next(errorHandler(500, "Failed to update transaction status"));
//     }
//     // send mail to the buyer and seller that the dispute has been resolved
//     res.json({
//       status: "success",
//       message: "Dispute has been resolved successfully",
//     });
//   } catch (error: string | unknown) {
//     console.log("error", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };
