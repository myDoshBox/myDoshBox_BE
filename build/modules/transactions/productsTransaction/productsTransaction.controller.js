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
exports.cancelEscrowProductTransaction = exports.buyerConfirmsProduct = exports.getAllShippingDetailsWithAggregation = exports.getAllShippingDetails = exports.getAllEscrowProductTransactionByUser = exports.sellerFillOutShippingDetails = exports.verifyEscrowProductTransactionPayment = exports.sellerConfirmsAnEscrowProductTransaction = exports.initiateEscrowProductTransaction = void 0;
const uuid_1 = require("uuid");
const productsTransaction_validation_1 = require("./productsTransaction.validation");
const individualUserAuth_model1_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model1"));
const errorHandling_middleware_1 = require("../../../middlewares/errorHandling.middleware");
const productsTransaction_model_1 = __importDefault(require("./productsTransaction.model"));
const productsTransaction_paystack_1 = require("./productsTransaction.paystack");
const productTransaction_mail_1 = require("./productTransaction.mail");
const shippingDetails_model_1 = __importDefault(require("./shippingDetails.model"));
const productDispute_model_1 = __importDefault(require("../../disputes/productsDispute/productDispute.model"));
const initiateEscrowProductTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendor_name, vendor_phone_number, buyer_email, vendor_email, transaction_type, products, signed_escrow_doc, delivery_address, } = req.body;
    (0, productsTransaction_validation_1.validateProductFields)({
        vendor_name,
        vendor_phone_number,
        vendor_email,
        transaction_type,
        products,
        delivery_address,
    }, next);
    try {
        const user = yield individualUserAuth_model1_1.default.findOne({ email: buyer_email });
        if (!user) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "User not found"));
        }
        if (buyer_email === vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "You cannot initiate an escrow with yourself"));
        }
        const transaction_id = (0, uuid_1.v4)();
        const sum_total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const commission = sum_total * 0.01; // 1% commission
        const transaction_total = sum_total + commission; // Sum total plus 1% commission
        const newTransaction = new productsTransaction_model_1.default({
            user,
            transaction_id,
            vendor_name,
            vendor_phone_number,
            buyer_email,
            vendor_email,
            transaction_type,
            products,
            sum_total,
            transaction_total,
            signed_escrow_doc,
            delivery_address,
            buyer_initiated: true,
        });
        yield newTransaction.save();
        yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToVendor)(transaction_id, vendor_name, vendor_email, products, sum_total, transaction_total);
        res.json({
            status: "success",
            message: "Transaction initiated, awaiting seller confirmation.",
            transaction_id,
            sum_total,
            transaction_total,
            commission, // Optionally include commission for transparency
        });
    }
    catch (error) {
        return next((0, errorHandling_middleware_1.errorHandler)(500, "server error"));
    }
});
exports.initiateEscrowProductTransaction = initiateEscrowProductTransaction;
const sellerConfirmsAnEscrowProductTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id, confirmation, vendor_email } = req.body;
    // Validate required fields
    if (!transaction_id || typeof confirmation !== "boolean" || !vendor_email) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID, confirmation, and vendor email are required"));
    }
    try {
        const transaction = yield productsTransaction_model_1.default.findOne({ transaction_id });
        if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        // Check if the transaction is in a valid state for confirmation
        if (!transaction.buyer_initiated || transaction.seller_confirmed) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Invalid transaction state for confirmation"));
        }
        // Verify the vendor email matches the transaction's vendor_email
        if (transaction.vendor_email !== vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Unauthorized: Incorrect vendor email"));
        }
        if (confirmation) {
            const updatedTransaction = yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, {
                seller_confirmed: true,
                transaction_status: "awaiting_payment",
            }, { new: true });
            if (!updatedTransaction) {
                return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction"));
            }
            // Updated call with all required parameters and 'accepted' status
            yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToInitiator)(transaction.buyer_email, transaction.transaction_id, transaction.transaction_total, transaction.vendor_name, transaction.products, transaction.sum_total, "accepted");
            res.json({
                status: "success",
                message: "Seller confirmed, buyer notified to proceed with payment.",
                transaction_id: updatedTransaction.transaction_id,
            });
        }
        else {
            const updatedTransaction = yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, {
                seller_confirmed: false,
                transaction_status: "declined",
            }, { new: true });
            if (!updatedTransaction) {
                return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction"));
            }
            // Updated call with all required parameters and 'rejected' status
            yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToInitiator)(transaction.buyer_email, transaction.transaction_id, transaction.transaction_total, transaction.vendor_name, transaction.products, transaction.sum_total, "rejected");
            res.json({
                status: "success",
                message: "Seller declined the transaction.",
                transaction_id: updatedTransaction.transaction_id,
            });
        }
    }
    catch (error) {
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.sellerConfirmsAnEscrowProductTransaction = sellerConfirmsAnEscrowProductTransaction;
const verifyEscrowProductTransactionPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id, buyer_email, reference } = req.body;
    if (!transaction_id || !buyer_email) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID and buyer email are required"));
    }
    try {
        const transaction = yield productsTransaction_model_1.default.findOne({ transaction_id });
        if (!transaction)
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        if (!transaction.buyer_initiated ||
            !transaction.seller_confirmed ||
            transaction.verified_payment_status) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Invalid transaction state for payment verification"));
        }
        if (transaction.buyer_email !== buyer_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Unauthorized: Incorrect buyer email"));
        }
        // STEP 1: INITIATE PAYMENT
        if (!reference) {
            const paystackResponse = yield (0, productsTransaction_paystack_1.paymentForEscrowProductTransaction)({
                reference: transaction.transaction_id,
                amount: Number(transaction.transaction_total),
                email: buyer_email,
            });
            if (paystackResponse.status && paystackResponse.data.authorization_url) {
                return res.json({
                    status: "success",
                    message: "Payment initiation successful. Please complete the payment on Paystack.",
                    authorization_url: paystackResponse.data.authorization_url,
                    transaction_id: transaction.transaction_id,
                });
            }
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to initiate Paystack payment"));
        }
        // STEP 2: VERIFY PAYMENT
        const verificationResponse = yield (0, productsTransaction_paystack_1.verifyPaymentForEscrowProductTransaction)(reference);
        if (verificationResponse.status &&
            verificationResponse.data.status === "success" &&
            verificationResponse.data.amount / 100 ===
                Number(transaction.transaction_total)) {
            const updatedTransaction = yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, {
                verified_payment_status: true,
                transaction_status: "awaiting_shipping",
            }, { new: true });
            if (!updatedTransaction)
                return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction"));
            try {
                yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToVendor)(transaction.transaction_id, transaction.vendor_name, transaction.vendor_email, transaction.products, transaction.sum_total, transaction.transaction_total);
            }
            catch (err) {
                console.error("Failed to send vendor email:", err);
            }
            return res.json({
                status: "success",
                message: "Payment has been successfully verified.",
                sum_total: transaction.sum_total,
                transaction_total: transaction.transaction_total,
                transaction_id: updatedTransaction.transaction_id,
            });
        }
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Payment verification failed"));
    }
    catch (error) {
        console.error("verifyEscrowProductTransactionPayment error:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.verifyEscrowProductTransactionPayment = verifyEscrowProductTransactionPayment;
const sellerFillOutShippingDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { shipping_company, delivery_person_name, delivery_person_number, delivery_person_email, delivery_date, pick_up_address, transaction_id, } = req.body;
    // Validate input fields
    (0, productsTransaction_validation_1.validateProductFields)({
        shipping_company,
        delivery_person_name,
        delivery_person_number,
        delivery_person_email,
        delivery_date,
        pick_up_address,
    }, next);
    try {
        // Ensure transaction exists and is in correct state
        const transaction = yield productsTransaction_model_1.default.findOne({
            transaction_id,
            verified_payment_status: true,
            shipping_submitted: false,
        });
        if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Invalid transaction state for shipping"));
        }
        // Get vendor user info
        const user = yield individualUserAuth_model1_1.default.findOne({
            email: transaction.vendor_email,
        });
        if (!user) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Vendor not found"));
        }
        //Create shipping record
        const newShippingDetails = new shippingDetails_model_1.default({
            user,
            product: transaction,
            transaction_id,
            shipping_company,
            delivery_person_name,
            delivery_person_number,
            delivery_person_email,
            delivery_date,
            pick_up_address,
            buyer_email: transaction.buyer_email,
            vendor_email: transaction.vendor_email,
        });
        yield newShippingDetails.save();
        // Mark transaction as having shipping info submitted
        transaction.shipping_submitted = true;
        yield transaction.save();
        yield (0, productTransaction_mail_1.sendShippingDetailsEmailToInitiator)(transaction.buyer_email, shipping_company, delivery_person_name, delivery_person_number, delivery_date, pick_up_address);
        yield (0, productTransaction_mail_1.sendShippingDetailsEmailToVendor)(transaction.transaction_id, transaction.vendor_name, transaction.vendor_email, transaction.products.map((p) => p.name).join(", "));
        res.status(200).json({
            status: "success",
            message: "Shipping details submitted successfully",
            newShippingDetails,
        });
    }
    catch (error) {
        console.error("Error in sellerFillOutShippingDetails:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.sellerFillOutShippingDetails = sellerFillOutShippingDetails;
const getAllEscrowProductTransactionByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_email } = req.params;
        if (!user_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "user email is required"));
        }
        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
        const skip = (page - 1) * limit;
        // Fetch total count for pagination metadata
        const total = yield productsTransaction_model_1.default.countDocuments({
            $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
        });
        // Fetch paginated transactions
        const transactions = yield productsTransaction_model_1.default.find({
            $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        if (!transactions || transactions.length === 0) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "you don't have any transactions at this time"));
        }
        // Calculate total pages
        const totalPages = Math.ceil(total / limit);
        res.json({
            transactions,
            status: "success",
            message: "all transactions fetched successfully",
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
        return next((0, errorHandling_middleware_1.errorHandler)(500, "server error"));
    }
});
exports.getAllEscrowProductTransactionByUser = getAllEscrowProductTransactionByUser;
const getAllShippingDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_email } = req.params;
        if (!user_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "User email is required"));
        }
        // Pagination and search parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";
        // Fetch total count for pagination metadata
        const total = yield shippingDetails_model_1.default.countDocuments(Object.assign({ $or: [{ vendor_email: user_email }, { buyer_email: user_email }] }, (search && {
            $or: [
                { shipping_company: { $regex: search, $options: "i" } },
                { delivery_person_name: { $regex: search, $options: "i" } },
                { buyer_email: { $regex: search, $options: "i" } },
            ],
        })));
        // Fetch paginated and filtered transactions
        const transactions = yield shippingDetails_model_1.default.find(Object.assign({ $or: [{ vendor_email: user_email }, { buyer_email: user_email }] }, (search && {
            $or: [
                { shipping_company: { $regex: search, $options: "i" } },
                { delivery_person_name: { $regex: search, $options: "i" } },
                { buyer_email: { $regex: search, $options: "i" } },
            ],
        })))
            .populate({
            path: "product",
            model: "ProductTransaction",
        })
            .populate("user")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        if (!transactions || transactions.length === 0) {
            return res.json({
                transactions: [],
                status: "success",
                message: "You do not have any shipping details at this time",
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
        // Calculate total pages
        const totalPages = Math.ceil(total / limit);
        res.json({
            transactions,
            status: "success",
            message: "All shipping details fetched successfully",
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
        console.error("Error in getAllShippingDetails:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.getAllShippingDetails = getAllShippingDetails;
// ALTERNATIVE: If you prefer aggregation, use the correct collection name
const getAllShippingDetailsWithAggregation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_email } = req.params;
        if (!user_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "User email is required"));
        }
        const transactions = yield shippingDetails_model_1.default.aggregate([
            {
                $match: {
                    $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
                },
            },
            {
                $lookup: {
                    from: "producttransactions", // Changed from "products" - use the actual collection name
                    localField: "product",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } }, // Added preserveNullAndEmptyArrays
            { $sort: { createdAt: -1 } },
        ]);
        if (!transactions || transactions.length === 0) {
            return res.json({
                transactions: [],
                status: "success",
                message: "You do not have any shipping details at this time",
            });
        }
        res.json({
            transactions,
            status: "success",
            message: "All shipping details fetched successfully",
        });
    }
    catch (error) {
        console.error("Error in getAllShippingDetails:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.getAllShippingDetailsWithAggregation = getAllShippingDetailsWithAggregation;
const buyerConfirmsProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transaction_id } = req.body;
        if (!transaction_id) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
        }
        console.log(`Processing confirmation for transaction_id: ${transaction_id}`);
        // Check for existing dispute
        const disputeDetails = yield productDispute_model_1.default.findOne({ transaction_id });
        console.log(`Dispute details found: ${disputeDetails ? "Yes" : "No"}`);
        // Fetch product transaction details directly
        const fetchProductDetails = yield productsTransaction_model_1.default.findOne({
            transaction_id,
        });
        if (!fetchProductDetails) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        console.log("Product transaction found:", JSON.stringify(fetchProductDetails, null, 2));
        const { transaction_status, _id: product_id, vendor_name, vendor_email, buyer_email, products, } = fetchProductDetails;
        // Get product name from the first product
        const product_name = products && products.length > 0 ? products[0].name : "Product";
        // Check if transaction is already completed
        if (transaction_status === "completed") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "This transaction is already completed"));
        }
        // Check if transaction is in processing status (with or without trailing space)
        const isPending = (transaction_status === null || transaction_status === void 0 ? void 0 : transaction_status.trim().toLowerCase()) === "processing";
        if (!isPending && transaction_status !== "completed") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Transaction status is ${transaction_status}. Only processing transactions can be confirmed.`));
        }
        // Update ProductTransaction status to completed and set buyer_confirm_status to true
        const updateProductTransactionStatus = yield productsTransaction_model_1.default.findByIdAndUpdate(product_id, {
            transaction_status: "completed",
            buyer_confirm_status: true,
        }, { new: true });
        if (!updateProductTransactionStatus) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update product status"));
        }
        console.log(`Updated ProductTransaction ${product_id} to completed with buyer confirmation`);
        // Resolve dispute if exists and not already resolved
        if (disputeDetails && disputeDetails.dispute_status !== "resolved") {
            yield productDispute_model_1.default.findByIdAndUpdate(disputeDetails._id, { dispute_status: "resolved" }, { new: true });
            console.log(`Resolved dispute for transaction ${transaction_id}`);
        }
        // Send confirmation emails
        yield (0, productTransaction_mail_1.sendSuccessfulEscrowEmailToInitiator)(transaction_id, vendor_name, buyer_email, product_name);
        yield (0, productTransaction_mail_1.sendSuccessfulEscrowEmailToVendor)(transaction_id, vendor_name, vendor_email, product_name);
        console.log(`Emails sent for transaction ${transaction_id}`);
        res.json({
            status: "success",
            message: "Escrow has been completed successfully.",
            data: {
                transaction_id,
                transaction_status: "completed",
                buyer_confirm_status: true,
            },
        });
    }
    catch (error) {
        console.error("Error in buyerConfirmsProduct:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.buyerConfirmsProduct = buyerConfirmsProduct;
const cancelEscrowProductTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { transaction_id } = req.params;
    if (!transaction_id) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
    }
    try {
        const fetchProductDetails = yield productsTransaction_model_1.default.findOne({
            transaction_id,
        });
        if (!fetchProductDetails) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        const productTransactionStatus = (_a = fetchProductDetails.transaction_status) === null || _a === void 0 ? void 0 : _a.trim();
        const fetchDisputeDetails = yield productDispute_model_1.default.findOne({
            transaction_id,
        });
        const productDisputeStatus = fetchDisputeDetails === null || fetchDisputeDetails === void 0 ? void 0 : fetchDisputeDetails.dispute_status;
        if (productTransactionStatus === "cancelled") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "This transaction has already been cancelled"));
        }
        if (productTransactionStatus === "completed") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "This transaction has already been completed"));
        }
        if (productDisputeStatus === "resolved") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "This transaction has already been resolved"));
        }
        const updateProductTransactionStatus = yield productsTransaction_model_1.default.findByIdAndUpdate(fetchProductDetails._id, { transaction_status: "cancelled" }, { new: true });
        if (!updateProductTransactionStatus) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction status"));
        }
        if (fetchDisputeDetails) {
            yield productDispute_model_1.default.findByIdAndUpdate(fetchDisputeDetails._id, { dispute_status: "cancelled" }, { new: true });
        }
        res.json({
            status: "success",
            message: "Transaction has been cancelled successfully",
        });
    }
    catch (error) {
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.cancelEscrowProductTransaction = cancelEscrowProductTransaction;
