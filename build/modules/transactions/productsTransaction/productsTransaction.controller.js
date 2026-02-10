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
exports.getVendorBankDetails = exports.buyerConfirmsProduct = exports.getPaymentStatus = exports.cancelEscrowProductTransaction = exports.getAllShippingDetailsWithAggregation = exports.getAllShippingDetails = exports.getSingleEscrowProductTransaction = exports.getAllEscrowProductTransactionByUser = exports.paystackWebhook = exports.sellerFillOutShippingDetails = exports.verifyEscrowProductTransactionPayment = exports.sellerConfirmsAnEscrowProductTransaction = exports.editEscrowProductTransaction = exports.initiateEscrowProductTransaction = void 0;
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const productsTransaction_validation_1 = require("./productsTransaction.validation");
const individualUserAuth_model1_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model1"));
const organizationAuth_model_1 = __importDefault(require("../../authentication/organizationUserAuth/organizationAuth.model"));
const errorHandling_middleware_1 = require("../../../middlewares/errorHandling.middleware");
const ManualPayment_mail_1 = require("./Payouts/ManualPayment.mail");
const payout_model_1 = __importDefault(require("./Payouts/payout.model"));
const productsTransaction_model_1 = __importDefault(require("./productsTransaction.model"));
const productsTransaction_paystack_1 = require("./productsTransaction.paystack");
const productTransaction_mail_1 = require("./productTransaction.mail");
const shippingDetails_model_1 = __importDefault(require("./shippingDetails.model"));
const productDispute_model_1 = __importDefault(require("../../disputes/productsDispute/productDispute.model"));
const productsTransaction_paystack_2 = require("./productsTransaction.paystack");
const getVendorBankDetails = (vendor_email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let vendor = yield individualUserAuth_model1_1.default.findOne({ email: vendor_email });
        if (vendor && vendor.bank_details) {
            return vendor.bank_details;
        }
        vendor = yield organizationAuth_model_1.default.findOne({
            $or: [
                { organization_email: vendor_email },
                { contact_email: vendor_email },
            ],
        });
        if (vendor && vendor.bank_details) {
            return vendor.bank_details;
        }
        return null;
    }
    catch (error) {
        console.error("Error fetching vendor bank details:", error);
        return null;
    }
});
exports.getVendorBankDetails = getVendorBankDetails;
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
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot initiate an escrow with yourself"));
        }
        const vendorBankDetails = yield getVendorBankDetails(vendor_email);
        if (!vendorBankDetails ||
            !vendorBankDetails.account_number ||
            !vendorBankDetails.bank_code) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot initiate transaction: Vendor has not set up bank details. Please ask the vendor to add their bank information in their profile settings."));
        }
        console.log("✅ Vendor bank details validated:", {
            account_name: vendorBankDetails.account_name,
            bank_name: vendorBankDetails.bank_name,
        });
        const transaction_id = (0, uuid_1.v4)();
        const sum_total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const commission = sum_total * 0.01; // 1% commission
        const transaction_total = sum_total + commission;
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
            vendor_bank_details: vendorBankDetails,
        });
        yield newTransaction.save();
        yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToVendor)(transaction_id, vendor_name, vendor_email, products, sum_total, transaction_total);
        res.json({
            status: "success",
            message: "Transaction initiated successfully. Vendor bank details verified.",
            transaction_id,
            sum_total,
            transaction_total,
            commission,
            vendor_bank_verified: true,
        });
    }
    catch (error) {
        console.error("Error initiating transaction:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.initiateEscrowProductTransaction = initiateEscrowProductTransaction;
const editEscrowProductTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.params;
    const { buyer_email, vendor_name, vendor_phone_number, vendor_email, transaction_type, products, signed_escrow_doc, delivery_address, } = req.body;
    if (!transaction_id) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
    }
    if (!buyer_email) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Buyer email is required"));
    }
    try {
        // Find the transaction
        const transaction = yield productsTransaction_model_1.default.findOne({ transaction_id });
        if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        // Verify the buyer email matches
        if (transaction.buyer_email !== buyer_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Unauthorized: You can only edit your own transactions"));
        }
        // Check if transaction can be edited
        if (transaction.seller_confirmed) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot edit transaction: Seller has already confirmed this transaction"));
        }
        if (transaction.verified_payment_status) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot edit transaction: Payment has already been made"));
        }
        if (transaction.transaction_status !== "processing" &&
            transaction.transaction_status !== "awaiting_payment") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Cannot edit transaction: Current status is ${transaction.transaction_status}`));
        }
        // Validate updated fields if provided
        const fieldsToValidate = {};
        if (vendor_name)
            fieldsToValidate.vendor_name = vendor_name;
        if (vendor_phone_number)
            fieldsToValidate.vendor_phone_number = vendor_phone_number;
        if (vendor_email)
            fieldsToValidate.vendor_email = vendor_email;
        if (transaction_type)
            fieldsToValidate.transaction_type = transaction_type;
        if (products)
            fieldsToValidate.products = products;
        if (delivery_address)
            fieldsToValidate.delivery_address = delivery_address;
        if (Object.keys(fieldsToValidate).length > 0) {
            (0, productsTransaction_validation_1.validateProductFields)(fieldsToValidate, next);
        }
        // Calculate new totals if products are updated
        let sum_total = transaction.sum_total;
        let commission = transaction.sum_total * 0.01;
        let transaction_total = transaction.transaction_total;
        if (products && products.length > 0) {
            sum_total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
            commission = sum_total * 0.01;
            transaction_total = sum_total + commission;
        }
        // Prepare update object
        const updateData = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (vendor_name && { vendor_name })), (vendor_phone_number && { vendor_phone_number })), (vendor_email && { vendor_email })), (transaction_type && { transaction_type })), (products && { products })), (signed_escrow_doc && { signed_escrow_doc })), (delivery_address && { delivery_address })), (products && {
            sum_total,
            transaction_total,
        })), { updated_at: new Date() });
        // Update the transaction
        const updatedTransaction = yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, updateData, { new: true, runValidators: true });
        if (!updatedTransaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction"));
        }
        // Send notification emails about the edit
        const emailVendor = vendor_email || transaction.vendor_email;
        const emailVendorName = vendor_name || transaction.vendor_name;
        const emailProducts = products || transaction.products;
        const emailSumTotal = sum_total;
        const emailTransactionTotal = transaction_total;
        yield (0, productTransaction_mail_1.sendTransactionEditNotificationToVendor)(transaction_id, emailVendorName, emailVendor, emailProducts, emailSumTotal, emailTransactionTotal);
        yield (0, productTransaction_mail_1.sendTransactionEditConfirmationToBuyer)(buyer_email, transaction_id, emailVendorName, emailProducts, emailSumTotal, emailTransactionTotal);
        res.json({
            status: "success",
            message: "Transaction updated successfully. Vendor has been notified.",
            data: {
                transaction_id: updatedTransaction.transaction_id,
                sum_total: updatedTransaction.sum_total,
                transaction_total: updatedTransaction.transaction_total,
                vendor_name: updatedTransaction.vendor_name,
                vendor_email: updatedTransaction.vendor_email,
                products: updatedTransaction.products,
                transaction_status: updatedTransaction.transaction_status,
            },
        });
    }
    catch (error) {
        console.error("editEscrowProductTransaction error:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.editEscrowProductTransaction = editEscrowProductTransaction;
const sellerConfirmsAnEscrowProductTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id, confirmation, vendor_email } = req.body;
    if (!transaction_id || typeof confirmation !== "boolean" || !vendor_email) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID, confirmation, and vendor email are required"));
    }
    try {
        const transaction = yield productsTransaction_model_1.default.findOne({ transaction_id });
        if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        if (!transaction.buyer_initiated || transaction.seller_confirmed) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Invalid transaction state for confirmation"));
        }
        if (transaction.vendor_email !== vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Unauthorized: Incorrect vendor email"));
        }
        if (confirmation) {
            if (!transaction.vendor_bank_details ||
                !transaction.vendor_bank_details.account_number ||
                !transaction.vendor_bank_details.bank_code) {
                // Try to fetch fresh bank details
                const freshBankDetails = yield getVendorBankDetails(vendor_email);
                if (!freshBankDetails ||
                    !freshBankDetails.account_number ||
                    !freshBankDetails.bank_code) {
                    return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot confirm transaction: Your bank details are incomplete. Please update your bank information in your profile before accepting this transaction."));
                }
                transaction.set("vendor_bank_details", freshBankDetails);
            }
            transaction.seller_confirmed = true;
            transaction.transaction_status = "awaiting_payment";
            const updatedTransaction = yield transaction.save();
            yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToInitiator)(transaction.buyer_email, transaction.transaction_id, transaction.transaction_total, transaction.vendor_name, transaction.products, transaction.sum_total, "accepted");
            res.json({
                status: "success",
                message: "Transaction confirmed. Buyer notified to proceed with payment.",
                transaction_id: updatedTransaction.transaction_id,
                bank_details_verified: true,
            });
        }
        else {
            transaction.seller_confirmed = false;
            transaction.transaction_status = "declined";
            const updatedTransaction = yield transaction.save();
            yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToInitiator)(transaction.buyer_email, transaction.transaction_id, transaction.transaction_total, transaction.vendor_name, transaction.products, transaction.sum_total, "rejected");
            res.json({
                status: "success",
                message: "Transaction declined.",
                transaction_id: updatedTransaction.transaction_id,
            });
        }
    }
    catch (error) {
        console.error("Error in seller confirmation:", error);
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
        if (transaction.buyer_email !== buyer_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(403, "Unauthorized: Incorrect buyer email"));
        }
        // STEP 1: INITIATE PAYMENT
        if (!reference) {
            if (!transaction.buyer_initiated) {
                return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot proceed Payment!!..Buyer has not initiated the transaction"));
            }
            if (!transaction.seller_confirmed) {
                return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot proceed Payment!!..Seller has not confirmed the transaction"));
            }
            if (transaction.verified_payment_status) {
                return next((0, errorHandling_middleware_1.errorHandler)(400, "Payment has already been verified"));
            }
            // Generate unique reference
            const paymentReference = `${transaction.transaction_id}-${Date.now()}`;
            const paystackResponse = yield (0, productsTransaction_paystack_1.paymentForEscrowProductTransaction)({
                reference: paymentReference,
                amount: Number(transaction.transaction_total),
                email: buyer_email,
            });
            if (paystackResponse.status && paystackResponse.data.authorization_url) {
                // Store payment reference in transaction
                yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, {
                    payment_reference: paymentReference,
                    payment_initiated_at: new Date(),
                });
                return res.json({
                    status: "success",
                    message: "Payment initiation successful. Please complete the payment on Paystack.",
                    authorization_url: paystackResponse.data.authorization_url,
                    reference: paymentReference,
                });
            }
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to initiate Paystack payment"));
        }
        // STEP 2: VERIFY PAYMENT
        if (transaction.payment_reference !== reference) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Invalid payment reference"));
        }
        if (transaction.verified_payment_status) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Payment already verified"));
        }
        const verificationResponse = yield (0, productsTransaction_paystack_1.verifyPaymentForEscrowProductTransaction)(reference);
        if (verificationResponse.status &&
            verificationResponse.data.status === "success") {
            const paidAmount = verificationResponse.data.amount / 100;
            const expectedAmount = Number(transaction.transaction_total);
            if (Math.abs(paidAmount - expectedAmount) > 0.01) {
                return next((0, errorHandling_middleware_1.errorHandler)(400, `Amount mismatch: Expected ${expectedAmount}, got ${paidAmount}`));
            }
            const updatedTransaction = yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, {
                verified_payment_status: true,
                transaction_status: "payment_verified", // NEW STATUS
                payment_verified_at: new Date(),
            }, { new: true });
            if (!updatedTransaction) {
                return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction"));
            }
            try {
                yield (0, productTransaction_mail_1.sendPaymentVerifiedEmailToVendor)(transaction.transaction_id, transaction.vendor_name, transaction.vendor_email, transaction.products, transaction.sum_total);
            }
            catch (err) {
                console.error("Failed to send vendor email:", err);
            }
            return res.json({
                status: "success",
                message: "Payment verified successfully.",
                data: {
                    transaction_id: updatedTransaction.transaction_id,
                    sum_total: transaction.sum_total,
                    transaction_total: transaction.transaction_total,
                    transaction_status: updatedTransaction.transaction_status,
                },
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
// UPDATE sellerFillOutShippingDetails to change status
const sellerFillOutShippingDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { shipping_company, delivery_person_name, delivery_person_number, delivery_person_email, delivery_date, pick_up_address, transaction_id, } = req.body;
    (0, productsTransaction_validation_1.validateProductFields)({
        shipping_company,
        delivery_person_name,
        delivery_person_number,
        delivery_person_email,
        delivery_date,
        pick_up_address,
    }, next);
    try {
        const transaction = yield productsTransaction_model_1.default.findOne({
            transaction_id,
            verified_payment_status: true,
            shipping_submitted: false,
        });
        if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Invalid transaction state for shipping"));
        }
        const user = yield individualUserAuth_model1_1.default.findOne({
            email: transaction.vendor_email,
        });
        if (!user) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Vendor not found"));
        }
        const newShippingDetails = new shippingDetails_model_1.default({
            user,
            product: transaction._id, // Links to the transaction
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
        console.log(`✅ Shipping details created: ${newShippingDetails._id}`);
        // ✅ CRITICAL: Update the transaction with the shipping reference
        // Use mongoose.Types.ObjectId to ensure proper typing
        transaction.set("shipping", newShippingDetails._id);
        transaction.shipping_submitted = true;
        transaction.transaction_status = "in_transit";
        const updatedTransaction = yield transaction.save();
        console.log(`✅ Transaction updated with shipping ID: ${updatedTransaction.shipping}`);
        yield (0, productTransaction_mail_1.sendShippingDetailsEmailToInitiator)(transaction.buyer_email, shipping_company, delivery_person_name, delivery_person_number, delivery_date, pick_up_address);
        yield (0, productTransaction_mail_1.sendShippingDetailsEmailToVendor)(transaction.transaction_id, transaction.vendor_name, transaction.vendor_email, transaction.products.map((p) => p.name).join(", "));
        res.status(200).json({
            status: "success",
            message: "Shipping details submitted successfully",
            data: {
                shipping_details: newShippingDetails,
                transaction_id: updatedTransaction.transaction_id,
                transaction_status: updatedTransaction.transaction_status,
            },
        });
    }
    catch (error) {
        console.error("Error in sellerFillOutShippingDetails:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.sellerFillOutShippingDetails = sellerFillOutShippingDetails;
const paystackWebhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ⚠️ CRITICAL: Verify webhook signature
        const hash = crypto_1.default
            .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (hash !== req.headers["x-paystack-signature"]) {
            return res.status(400).send("Invalid signature");
        }
        const event = req.body;
        // Handle successful payment
        if (event.event === "charge.success") {
            const { reference, amount, status } = event.data;
            const transaction = yield productsTransaction_model_1.default.findOne({
                payment_reference: reference,
            });
            if (transaction && !transaction.verified_payment_status) {
                const expectedAmount = Number(transaction.transaction_total) * 100; // Convert to kobo
                if (amount === expectedAmount && status === "success") {
                    yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, {
                        verified_payment_status: true,
                        transaction_status: "awaiting_shipping",
                        payment_verified_at: new Date(),
                    });
                    // Send notification emails
                    yield (0, productTransaction_mail_1.sendEscrowInitiationEmailToVendor)(transaction.transaction_id, transaction.vendor_name, transaction.vendor_email, transaction.products, transaction.sum_total, transaction.transaction_total);
                }
            }
        }
        res.status(200).send("Webhook received");
    }
    catch (error) {
        console.error("Webhook error:", error);
        res.status(500).send("Webhook processing failed");
    }
});
exports.paystackWebhook = paystackWebhook;
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
        // Fetch paginated transactions with shipping details populated
        const transactions = yield productsTransaction_model_1.default.find({
            $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
        })
            .populate({
            path: "shipping",
            model: "ShippingDetails",
            select: "_id shipping_company delivery_person_name delivery_person_number delivery_person_email delivery_date pick_up_address createdAt",
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        if (!transactions || transactions.length === 0) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "you don't have any transactions at this time"));
        }
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
        console.error("getAllEscrowProductTransactionByUser error:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "server error"));
    }
});
exports.getAllEscrowProductTransactionByUser = getAllEscrowProductTransactionByUser;
const getSingleEscrowProductTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transaction_id } = req.params;
        if (!transaction_id) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
        }
        // ✅ Populate the shipping reference field
        const transaction = yield productsTransaction_model_1.default.findOne({
            transaction_id,
        }).populate({
            path: "shipping",
            model: "ShippingDetails",
            select: "shipping_company delivery_person_name delivery_person_number delivery_person_email delivery_date pick_up_address createdAt",
        });
        if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        // Fetch related dispute details if any
        const disputeDetails = yield productDispute_model_1.default.findOne({ transaction_id });
        // ✅ Type guard to check if shipping is populated
        const isShippingPopulated = (shipping) => {
            return (shipping &&
                typeof shipping === "object" &&
                "shipping_company" in shipping);
        };
        // Prepare response data
        const transactionData = {
            transaction_id: transaction.transaction_id,
            vendor_name: transaction.vendor_name,
            vendor_phone_number: transaction.vendor_phone_number,
            buyer_email: transaction.buyer_email,
            vendor_email: transaction.vendor_email,
            transaction_type: transaction.transaction_type,
            products: transaction.products,
            sum_total: transaction.sum_total,
            transaction_total: transaction.transaction_total,
            commission: transaction.sum_total * 0.01,
            signed_escrow_doc: transaction.signed_escrow_doc,
            delivery_address: transaction.delivery_address,
            buyer_initiated: transaction.buyer_initiated,
            seller_confirmed: transaction.seller_confirmed,
            verified_payment_status: transaction.verified_payment_status,
            transaction_status: transaction.transaction_status,
            payment_reference: transaction.payment_reference,
            shipping_submitted: transaction.shipping_submitted,
            buyer_confirm_status: transaction.buyer_confirm_status,
            dispute_details: disputeDetails
                ? {
                    reason_for_dispute: disputeDetails.reason_for_dispute,
                    dispute_description: disputeDetails.dispute_description,
                    dispute_status: disputeDetails.dispute_status,
                    created_at: disputeDetails.createdAt,
                    updated_at: disputeDetails.updatedAt,
                }
                : null,
            shipping_details: isShippingPopulated(transaction.shipping)
                ? {
                    shipping_company: transaction.shipping.shipping_company,
                    delivery_person_name: transaction.shipping.delivery_person_name,
                    delivery_person_number: transaction.shipping.delivery_person_number,
                    delivery_person_email: transaction.shipping.delivery_person_email,
                    delivery_date: transaction.shipping.delivery_date,
                    pick_up_address: transaction.shipping.pick_up_address,
                    submitted_at: transaction.shipping.createdAt,
                }
                : null,
        };
        res.json({
            status: "success",
            message: "Transaction details fetched successfully",
            data: transactionData,
        });
    }
    catch (error) {
        console.error("getSingleEscrowProductTransaction error:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.getSingleEscrowProductTransaction = getSingleEscrowProductTransaction;
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
const getPaymentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transaction_id } = req.params;
        if (!transaction_id) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
        }
        const transaction = yield productsTransaction_model_1.default.findOne({ transaction_id });
        if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        return res.json({
            status: "success",
            message: "Payment status fetched successfully",
            data: {
                transaction_id: transaction.transaction_id,
                payment_reference: transaction.payment_reference || null,
                verified_payment_status: transaction.verified_payment_status,
                transaction_status: transaction.transaction_status,
                amount: transaction.transaction_total,
                buyer_email: transaction.buyer_email,
                vendor_email: transaction.vendor_email,
            },
        });
    }
    catch (error) {
        console.error("getPaymentStatus error:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.getPaymentStatus = getPaymentStatus;
// AUtomated
// export const buyerConfirmsProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const { transaction_id } = req.body;
//     if (!transaction_id) {
//       return next(errorHandler(400, "Transaction ID is required"));
//     }
//     console.log(`🔄 Processing buyer confirmation: ${transaction_id}`);
//     // ============================================
//     // FETCH AND VALIDATE TRANSACTION
//     // ============================================
//     const transaction = await ProductTransaction.findOne({ transaction_id });
//     if (!transaction) {
//       return next(errorHandler(404, "Transaction not found"));
//     }
//     const {
//       transaction_status,
//       _id: product_id,
//       vendor_name,
//       vendor_email,
//       buyer_email,
//       products,
//       sum_total,
//       verified_payment_status,
//       vendor_bank_details,
//       payment_released,
//     } = transaction;
//     const product_name = products?.[0]?.name || "Product";
//     // ============================================
//     // VALIDATION CHECKS
//     // ============================================
//     if (transaction_status === "completed") {
//       return next(errorHandler(400, "Transaction already completed"));
//     }
//     if (!verified_payment_status) {
//       return next(errorHandler(400, "Payment has not been verified"));
//     }
//     if (transaction_status?.trim().toLowerCase() !== "in_transit") {
//       return next(
//         errorHandler(
//           400,
//           `Cannot confirm delivery. Transaction status is '${transaction_status}'. Item must be in transit.`,
//         ),
//       );
//     }
//     // ✅ IDEMPOTENCY: Prevent duplicate releases
//     if (payment_released) {
//       return next(errorHandler(400, "Payment already released"));
//     }
//     // ✅ CRITICAL: Validate bank details exist
//     if (
//       !vendor_bank_details?.account_number ||
//       !vendor_bank_details?.bank_code
//     ) {
//       return next(
//         errorHandler(
//           500,
//           "Cannot release payment: Vendor bank details are missing. Please contact support.",
//         ),
//       );
//     }
//     // Check for active disputes
//     const activeDispute = await ProductDispute.findOne({
//       transaction_id,
//       dispute_status: "In_Dispute",
//     });
//     if (activeDispute) {
//       return next(
//         errorHandler(
//           400,
//           "Cannot complete: Active dispute exists. Please resolve the dispute first.",
//         ),
//       );
//     }
//     // ============================================
//     // PREPARE PAYMENT RELEASE
//     // ============================================
//     const vendorPayout = sum_total; // Vendor gets full sum_total
//     const vendorPayoutInKobo = Math.round(vendorPayout * 100);
//     console.log(`💰 Preparing payment release:
//       - Sum Total: ₦${sum_total}
//       - Vendor Payout: ₦${vendorPayout}
//       - Bank: ${vendor_bank_details.bank_name}
//       - Account: ${vendor_bank_details.account_number}
//     `);
//     // ============================================
//     // CREATE TRANSFER RECIPIENT
//     // ============================================
//     let recipientCode = transaction.vendor_recipient_code;
//     if (!recipientCode) {
//       console.log("👤 Creating transfer recipient...");
//       const recipientResponse = await createTransferRecipient({
//         account_name: vendor_bank_details.account_name,
//         account_number: vendor_bank_details.account_number,
//         bank_code: vendor_bank_details.bank_code,
//         email: vendor_email,
//       });
//       if (
//         !recipientResponse.status ||
//         !recipientResponse.data?.recipient_code
//       ) {
//         console.error(
//           "❌ Recipient creation failed:",
//           recipientResponse.message,
//         );
//         return next(
//           errorHandler(
//             500,
//             `Failed to create payment recipient: ${recipientResponse.message || "Unknown error"}`,
//           ),
//         );
//       }
//       recipientCode = recipientResponse.data.recipient_code;
//       transaction.vendor_recipient_code = recipientCode;
//       await transaction.save();
//       console.log(`✅ Recipient created: ${recipientCode}`);
//     }
//     // ============================================
//     // INITIATE TRANSFER
//     // ============================================
//     console.log("💸 Initiating transfer...");
//     const transferResponse = await initiateTransfer({
//       amount: vendorPayoutInKobo,
//       recipient: recipientCode,
//       reason: `Escrow release - ${product_name} (${transaction_id})`,
//       reference: `TRF-${transaction_id}-${Date.now()}`,
//     });
//     if (!transferResponse.status || !transferResponse.data?.reference) {
//       console.error("❌ Transfer failed:", transferResponse.message);
//       return next(
//         errorHandler(
//           500,
//           `Payment transfer failed: ${transferResponse.message || "Unknown error"}`,
//         ),
//       );
//     }
//     const transferRef = transferResponse.data.reference;
//     console.log(`✅ Transfer initiated: ${transferRef}`);
//     // ============================================
//     // UPDATE TRANSACTION
//     // ============================================
//     const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
//       product_id,
//       {
//         transaction_status: "completed",
//         buyer_confirm_status: true,
//         payment_released: true,
//         payment_released_at: new Date(),
//         transfer_reference: transferRef,
//         transfer_status: "pending",
//         transfer_amount: vendorPayout,
//       },
//       { new: true },
//     );
//     if (!updatedTransaction) {
//       console.error(
//         `❌ CRITICAL: Transfer ${transferRef} initiated but DB update failed`,
//       );
//       return next(
//         errorHandler(
//           500,
//           "Payment initiated but system update failed. Please contact support immediately.",
//         ),
//       );
//     }
//     // ============================================
//     // RESOLVE DISPUTES
//     // ============================================
//     const existingDispute = await ProductDispute.findOne({ transaction_id });
//     if (existingDispute && existingDispute.dispute_status !== "resolved") {
//       await ProductDispute.findByIdAndUpdate(existingDispute._id, {
//         dispute_status: "resolved",
//         resolved_at: new Date(),
//         resolution_summary: "Auto-resolved on buyer confirmation",
//       });
//     }
//     // ============================================
//     // SEND NOTIFICATIONS
//     // ============================================
//     try {
//       await Promise.all([
//         sendSuccessfulEscrowEmailToInitiator(
//           transaction_id,
//           vendor_name,
//           buyer_email,
//           product_name,
//         ),
//         sendSuccessfulEscrowEmailToVendor(
//           transaction_id,
//           vendor_name,
//           vendor_email,
//           product_name,
//           vendorPayout.toString(),
//         ),
//       ]);
//       console.log("✅ Notification emails sent");
//     } catch (emailError) {
//       console.error("⚠️ Email sending failed (non-critical):", emailError);
//     }
//     // ============================================
//     // SUCCESS RESPONSE
//     // ============================================
//     res.json({
//       status: "success",
//       message: "Transaction completed! Payment is being transferred to vendor.",
//       data: {
//         transaction_id,
//         transaction_status: "completed",
//         buyer_confirm_status: true,
//         payment_released: true,
//         transfer_reference: transferRef,
//         transfer_status: "pending",
//         vendor_payout: vendorPayout,
//         estimated_delivery: "Vendor will receive funds within 24 hours",
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error in buyerConfirmsProduct:", error);
//     return next(errorHandler(500, "Server error"));
//   }
// };
// ============================================
// UPDATED buyerConfirmsProduct WITH FALLBACK
// ============================================
// This version handles the case where Paystack transfers aren't enabled
const buyerConfirmsProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { transaction_id } = req.body;
        if (!transaction_id) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
        }
        console.log(`🔄 Processing buyer confirmation: ${transaction_id}`);
        // ============================================
        // FETCH AND VALIDATE TRANSACTION
        // ============================================
        const transaction = yield productsTransaction_model_1.default.findOne({ transaction_id });
        if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        const { transaction_status, _id: product_id, vendor_name, vendor_email, buyer_email, products, sum_total, verified_payment_status, } = transaction;
        const product_name = ((_a = products === null || products === void 0 ? void 0 : products[0]) === null || _a === void 0 ? void 0 : _a.name) || "Product";
        // ============================================
        // VALIDATION CHECKS
        // ============================================
        if (transaction_status === "completed") {
            // Check if payout already exists
            const existingPayout = yield payout_model_1.default.findOne({ transaction_id });
            if (existingPayout) {
                return res.json({
                    status: "success",
                    message: "Transaction already completed",
                    data: {
                        transaction_id,
                        transaction_status: "completed",
                        buyer_confirm_status: true,
                        payout: {
                            payout_status: existingPayout.payout_status,
                            payout_method: existingPayout.payout_method,
                            payout_amount: existingPayout.payout_amount,
                            transfer_reference: existingPayout.transfer_reference,
                        },
                    },
                });
            }
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction already completed"));
        }
        if (!verified_payment_status) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Payment has not been verified"));
        }
        if ((transaction_status === null || transaction_status === void 0 ? void 0 : transaction_status.trim().toLowerCase()) !== "in_transit") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Cannot confirm delivery. Transaction status is '${transaction_status}'. Item must be in transit.`));
        }
        // Check if payout already exists (prevent duplicate payouts)
        const existingPayout = yield payout_model_1.default.findOne({ transaction_id });
        if (existingPayout) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Payout already initiated with status: ${existingPayout.payout_status}`));
        }
        // Check for active disputes
        const activeDispute = yield productDispute_model_1.default.findOne({
            transaction_id,
            dispute_status: "In_Dispute",
        });
        if (activeDispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot complete: Active dispute exists. Please resolve the dispute first."));
        }
        // ============================================
        // FETCH VENDOR BANK DETAILS
        // ============================================
        console.log(`🔍 Fetching fresh vendor bank details for: ${vendor_email}`);
        const freshVendorBankDetails = yield getVendorBankDetails(vendor_email);
        if (!(freshVendorBankDetails === null || freshVendorBankDetails === void 0 ? void 0 : freshVendorBankDetails.account_number) ||
            !(freshVendorBankDetails === null || freshVendorBankDetails === void 0 ? void 0 : freshVendorBankDetails.bank_code)) {
            console.error("❌ Fresh bank details validation failed:", {
                vendor_email: vendor_email,
                has_bank_details: !!freshVendorBankDetails,
                has_account_number: !!(freshVendorBankDetails === null || freshVendorBankDetails === void 0 ? void 0 : freshVendorBankDetails.account_number),
                has_bank_code: !!(freshVendorBankDetails === null || freshVendorBankDetails === void 0 ? void 0 : freshVendorBankDetails.bank_code),
            });
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot release payment: Vendor bank details are incomplete. Please ask the vendor to update their bank information in their profile settings."));
        }
        console.log("✅ Fresh bank details validated:", {
            vendor_email: vendor_email,
            account_name: freshVendorBankDetails.account_name,
            bank_name: freshVendorBankDetails.bank_name,
            account_number: freshVendorBankDetails.account_number,
        });
        const vendor_bank_details = freshVendorBankDetails;
        // ============================================
        // CALCULATE PAYOUT AMOUNT
        // ============================================
        const vendorPayout = sum_total;
        const vendorPayoutInKobo = Math.round(vendorPayout * 100);
        console.log(`💰 Preparing payout:
      - Sum Total: ₦${sum_total}
      - Vendor Payout: ₦${vendorPayout}
      - Bank: ${vendor_bank_details.bank_name}
      - Account: ${vendor_bank_details.account_number}
    `);
        // ============================================
        // CREATE PAYOUT RECORD
        // ============================================
        const newPayout = new payout_model_1.default({
            transaction: product_id,
            transaction_id,
            vendor_email,
            vendor_name,
            payout_amount: vendorPayout,
            original_sum_total: sum_total,
            vendor_bank_details: {
                account_name: vendor_bank_details.account_name,
                account_number: vendor_bank_details.account_number,
                bank_code: vendor_bank_details.bank_code,
                bank_name: vendor_bank_details.bank_name,
            },
            payout_status: "pending_initiation",
            payout_method: "automatic", // Will change to manual if needed
            initiated_by_buyer_confirmation: true,
            buyer_confirmation_date: new Date(),
        });
        yield newPayout.save();
        console.log(`✅ Payout record created: ${newPayout._id}`);
        // ============================================
        // UPDATE TRANSACTION TO COMPLETED
        // ============================================
        const updatedTransaction = yield productsTransaction_model_1.default.findByIdAndUpdate(product_id, {
            transaction_status: "completed",
            buyer_confirm_status: true,
        }, { new: true });
        if (!updatedTransaction) {
            // Rollback payout creation if transaction update fails
            yield payout_model_1.default.findByIdAndDelete(newPayout._id);
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction. Please contact support."));
        }
        console.log(`✅ Transaction marked as completed: ${transaction_id}`);
        // ============================================
        // ATTEMPT AUTOMATIC TRANSFER
        // ============================================
        let transferSuccessful = false;
        let transferRef = null;
        let transferError = null;
        try {
            // Step 1: Create recipient if needed
            let recipientCode = transaction.vendor_recipient_code;
            if (!recipientCode) {
                console.log("👤 Creating transfer recipient...");
                const recipientResponse = yield (0, productsTransaction_paystack_2.createTransferRecipient)({
                    account_name: vendor_bank_details.account_name,
                    account_number: vendor_bank_details.account_number,
                    bank_code: vendor_bank_details.bank_code,
                    email: transaction.vendor_email,
                });
                if (!recipientResponse.status ||
                    !((_b = recipientResponse.data) === null || _b === void 0 ? void 0 : _b.recipient_code)) {
                    throw new Error(recipientResponse.message || "Failed to create recipient");
                }
                recipientCode = recipientResponse.data.recipient_code;
                // Store recipient code in both transaction and payout
                yield productsTransaction_model_1.default.findByIdAndUpdate(product_id, {
                    vendor_recipient_code: recipientCode,
                });
                newPayout.vendor_recipient_code = recipientCode;
                yield newPayout.save();
                console.log(`✅ Recipient created: ${recipientCode}`);
            }
            else {
                // Use existing recipient code
                newPayout.vendor_recipient_code = recipientCode;
                yield newPayout.save();
            }
            // Step 2: Initiate transfer
            console.log("💸 Initiating transfer...");
            transferRef = `TRF-${transaction_id}-${Date.now()}`;
            const transferResponse = yield (0, productsTransaction_paystack_2.initiateTransfer)({
                amount: vendorPayoutInKobo,
                recipient: recipientCode,
                reason: `Escrow release - ${product_name} (${transaction_id})`,
                reference: transferRef,
            });
            if (!transferResponse.status || !((_c = transferResponse.data) === null || _c === void 0 ? void 0 : _c.reference)) {
                throw new Error(transferResponse.message || "Transfer initiation failed");
            }
            transferRef = transferResponse.data.reference;
            transferSuccessful = true;
            // Update payout with transfer details
            yield newPayout.markAsTransferInitiated(transferRef, recipientCode);
            console.log(`✅ Transfer initiated: ${transferRef}`);
        }
        catch (error) {
            transferError = error.message || "Transfer failed";
            console.error("❌ Automatic transfer failed:", transferError);
            // Check if it's the "third party payouts" error or similar
            if (transferError.includes("third party payouts") ||
                transferError.includes("cannot initiate") ||
                transferError.includes("not enabled")) {
                console.log("⚠️ Transfers not enabled - marking for manual payout");
                yield newPayout.markAsManualPayoutRequired(`Automatic transfers not available: ${transferError}`);
            }
            else {
                // Other errors - mark as failed but allow retry
                yield newPayout.markAsTransferFailed(transferError);
            }
        }
        // ============================================
        // RESOLVE DISPUTES
        // ============================================
        const existingDispute = yield productDispute_model_1.default.findOne({ transaction_id });
        if (existingDispute && existingDispute.dispute_status !== "resolved") {
            yield productDispute_model_1.default.findByIdAndUpdate(existingDispute._id, {
                dispute_status: "resolved",
                resolved_at: new Date(),
                resolution_summary: "Auto-resolved on buyer confirmation",
            });
            console.log(`✅ Dispute auto-resolved: ${existingDispute._id}`);
        }
        // ============================================
        // SEND NOTIFICATIONS
        // ============================================
        try {
            if (transferSuccessful) {
                // Automatic transfer initiated
                yield Promise.all([
                    (0, productTransaction_mail_1.sendSuccessfulEscrowEmailToInitiator)(transaction_id, vendor_name, buyer_email, product_name),
                    (0, productTransaction_mail_1.sendSuccessfulEscrowEmailToVendor)(transaction_id, vendor_name, vendor_email, product_name, vendorPayout.toString()),
                ]);
                // Mark notifications as sent
                newPayout.buyer_notified = true;
                newPayout.buyer_notified_at = new Date();
                newPayout.vendor_notified = true;
                newPayout.vendor_notified_at = new Date();
                yield newPayout.save();
            }
            else {
                // Manual payout required
                yield Promise.all([
                    (0, ManualPayment_mail_1.sendBuyerConfirmationEmail)(buyer_email, transaction_id, vendor_name),
                    (0, ManualPayment_mail_1.sendVendorManualPayoutEmail)(vendor_email, vendor_name, transaction_id, vendorPayout),
                    (0, ManualPayment_mail_1.sendAdminManualPayoutAlert)(transaction_id, vendor_name, vendorPayout, vendor_bank_details),
                ]);
                // Mark notifications as sent
                newPayout.buyer_notified = true;
                newPayout.buyer_notified_at = new Date();
                newPayout.vendor_notified = true;
                newPayout.vendor_notified_at = new Date();
                newPayout.admin_notified = true;
                newPayout.admin_notified_at = new Date();
                yield newPayout.save();
            }
            console.log("✅ Notification emails sent");
        }
        catch (emailError) {
            console.error("⚠️ Email sending failed (non-critical):", emailError);
        }
        // ============================================
        // FETCH LATEST PAYOUT STATUS
        // ============================================
        const latestPayout = yield payout_model_1.default.findOne({ transaction_id });
        // ============================================
        // RESPONSE TO USER
        // ============================================
        if (transferSuccessful && transferRef) {
            // SUCCESS: Automatic transfer
            res.json({
                status: "success",
                message: "Product confirmation received! Payment transfer has been initiated to the vendor.",
                data: {
                    transaction_id,
                    transaction_status: "completed",
                    buyer_confirm_status: true,
                    payout: {
                        payout_id: latestPayout === null || latestPayout === void 0 ? void 0 : latestPayout._id,
                        payout_status: latestPayout === null || latestPayout === void 0 ? void 0 : latestPayout.payout_status,
                        payout_method: "automatic",
                        payout_amount: vendorPayout,
                        transfer_reference: transferRef,
                        estimated_delivery: "Vendor will receive funds within 24-48 hours after payment processor settlement.",
                    },
                    next_steps: "You will receive a confirmation email once the vendor receives the payment.",
                },
            });
        }
        else {
            // FALLBACK: Manual payout
            res.json({
                status: "success",
                message: "Product confirmation received! Payment will be processed manually and transferred to the vendor within 24-48 hours.",
                data: {
                    transaction_id,
                    transaction_status: "completed",
                    buyer_confirm_status: true,
                    payout: {
                        payout_id: latestPayout === null || latestPayout === void 0 ? void 0 : latestPayout._id,
                        payout_status: latestPayout === null || latestPayout === void 0 ? void 0 : latestPayout.payout_status,
                        payout_method: "manual",
                        payout_amount: vendorPayout,
                        manual_payout_reason: latestPayout === null || latestPayout === void 0 ? void 0 : latestPayout.manual_payout_reason,
                        estimated_delivery: "Our team will process the vendor payout within 24-48 business hours.",
                    },
                    next_steps: "Our support team has been notified and will complete the payout shortly. Both you and the vendor will receive confirmation emails.",
                },
            });
        }
    }
    catch (error) {
        console.error("❌ Error in buyerConfirmsProduct:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Server error"));
    }
});
exports.buyerConfirmsProduct = buyerConfirmsProduct;
