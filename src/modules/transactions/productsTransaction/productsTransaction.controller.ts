import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { validateProductFields } from "./productsTransaction.validation";
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
import { errorHandler } from "../../../middlewares/errorHandling.middleware";

import ProductTransaction from "./productsTransaction.model";
import {
  paymentForEscrowProductTransaction,
  verifyPaymentForEscrowProductTransaction,
} from "./productsTransaction.paystack";
import {
  sendEscrowInitiationEmailToInitiator,
  sendEscrowInitiationEmailToVendor,
  sendShippingDetailsEmailToInitiator,
  sendShippingDetailsEmailToVendor,
  sendSuccessfulEscrowEmailToInitiator,
  sendSuccessfulEscrowEmailToVendor,
  sendTransactionEditNotificationToVendor,
  sendTransactionEditConfirmationToBuyer,
} from "./productTransaction.mail";
import ShippingDetails from "./shippingDetails.model";
import ProductDispute from "../../disputes/productsDispute/productDispute.model";

export const initiateEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    vendor_name,
    vendor_phone_number,
    buyer_email,
    vendor_email,
    transaction_type,
    products,
    signed_escrow_doc,
    delivery_address,
  } = req.body;

  validateProductFields(
    {
      vendor_name,
      vendor_phone_number,
      vendor_email,
      transaction_type,
      products,
      delivery_address,
    },
    next
  );

  try {
    const user = await IndividualUser.findOne({ email: buyer_email });

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    if (buyer_email === vendor_email) {
      return next(
        errorHandler(404, "You cannot initiate an escrow with yourself")
      );
    }

    const transaction_id = uuidv4();
    const sum_total = products.reduce(
      (sum: number, p: { price: number; quantity: number }) =>
        sum + p.price * p.quantity,
      0
    );
    const commission = sum_total * 0.01; // 1% commission
    const transaction_total = sum_total + commission; // Sum total plus 1% commission

    const newTransaction = new ProductTransaction({
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

    await newTransaction.save();
    await sendEscrowInitiationEmailToVendor(
      transaction_id,
      vendor_name,
      vendor_email,
      products,
      sum_total,
      transaction_total
    );

    res.json({
      status: "success",
      message: "Transaction initiated, awaiting seller confirmation.",
      transaction_id,
      sum_total,
      transaction_total,
      commission, // Optionally include commission for transparency
    });
  } catch (error) {
    return next(errorHandler(500, "server error"));
  }
};

// Add this to your productsTransaction.controller.ts file

export const editEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { transaction_id } = req.params;
  const {
    buyer_email,
    vendor_name,
    vendor_phone_number,
    vendor_email,
    transaction_type,
    products,
    signed_escrow_doc,
    delivery_address,
  } = req.body;

  if (!transaction_id) {
    return next(errorHandler(400, "Transaction ID is required"));
  }

  if (!buyer_email) {
    return next(errorHandler(400, "Buyer email is required"));
  }

  try {
    // Find the transaction
    const transaction = await ProductTransaction.findOne({ transaction_id });

    if (!transaction) {
      return next(errorHandler(404, "Transaction not found"));
    }

    // Verify the buyer email matches
    if (transaction.buyer_email !== buyer_email) {
      return next(
        errorHandler(
          403,
          "Unauthorized: You can only edit your own transactions"
        )
      );
    }

    // Check if transaction can be edited
    if (transaction.seller_confirmed) {
      return next(
        errorHandler(
          400,
          "Cannot edit transaction: Seller has already confirmed this transaction"
        )
      );
    }

    if (transaction.verified_payment_status) {
      return next(
        errorHandler(
          400,
          "Cannot edit transaction: Payment has already been made"
        )
      );
    }

    if (
      transaction.transaction_status !== "processing" &&
      transaction.transaction_status !== "awaiting_payment"
    ) {
      return next(
        errorHandler(
          400,
          `Cannot edit transaction: Current status is ${transaction.transaction_status}`
        )
      );
    }

    // Validate updated fields if provided
    const fieldsToValidate: any = {};
    if (vendor_name) fieldsToValidate.vendor_name = vendor_name;
    if (vendor_phone_number)
      fieldsToValidate.vendor_phone_number = vendor_phone_number;
    if (vendor_email) fieldsToValidate.vendor_email = vendor_email;
    if (transaction_type) fieldsToValidate.transaction_type = transaction_type;
    if (products) fieldsToValidate.products = products;
    if (delivery_address) fieldsToValidate.delivery_address = delivery_address;

    if (Object.keys(fieldsToValidate).length > 0) {
      validateProductFields(fieldsToValidate, next);
    }

    // Calculate new totals if products are updated
    let sum_total = transaction.sum_total;
    let commission = transaction.sum_total * 0.01;
    let transaction_total = transaction.transaction_total;

    if (products && products.length > 0) {
      sum_total = products.reduce(
        (sum: number, p: { price: number; quantity: number }) =>
          sum + p.price * p.quantity,
        0
      );
      commission = sum_total * 0.01;
      transaction_total = sum_total + commission;
    }

    // Prepare update object
    const updateData: any = {
      ...(vendor_name && { vendor_name }),
      ...(vendor_phone_number && { vendor_phone_number }),
      ...(vendor_email && { vendor_email }),
      ...(transaction_type && { transaction_type }),
      ...(products && { products }),
      ...(signed_escrow_doc && { signed_escrow_doc }),
      ...(delivery_address && { delivery_address }),
      ...(products && {
        sum_total,
        transaction_total,
      }),
      updated_at: new Date(),
    };

    // Update the transaction
    const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
      transaction._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return next(errorHandler(500, "Failed to update transaction"));
    }

    // Send notification emails about the edit
    const emailVendor = vendor_email || transaction.vendor_email;
    const emailVendorName = vendor_name || transaction.vendor_name;
    const emailProducts = products || transaction.products;
    const emailSumTotal = sum_total;
    const emailTransactionTotal = transaction_total;

    await sendTransactionEditNotificationToVendor(
      transaction_id,
      emailVendorName,
      emailVendor,
      emailProducts,
      emailSumTotal,
      emailTransactionTotal
    );

    await sendTransactionEditConfirmationToBuyer(
      buyer_email,
      transaction_id,
      emailVendorName,
      emailProducts,
      emailSumTotal,
      emailTransactionTotal
    );

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
  } catch (error) {
    console.error("editEscrowProductTransaction error:", error);
    return next(errorHandler(500, "Server error"));
  }
};

export const sellerConfirmsAnEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { transaction_id, confirmation, vendor_email } = req.body;

  // Validate required fields
  if (!transaction_id || typeof confirmation !== "boolean" || !vendor_email) {
    return next(
      errorHandler(
        400,
        "Transaction ID, confirmation, and vendor email are required"
      )
    );
  }

  try {
    const transaction = await ProductTransaction.findOne({ transaction_id });

    if (!transaction) {
      return next(errorHandler(404, "Transaction not found"));
    }

    // Check if the transaction is in a valid state for confirmation
    if (!transaction.buyer_initiated || transaction.seller_confirmed) {
      return next(
        errorHandler(400, "Invalid transaction state for confirmation")
      );
    }

    // Verify the vendor email matches the transaction's vendor_email
    if (transaction.vendor_email !== vendor_email) {
      return next(errorHandler(403, "Unauthorized: Incorrect vendor email"));
    }

    if (confirmation) {
      const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
        transaction._id,
        {
          seller_confirmed: true,
          transaction_status: "awaiting_payment",
        },
        { new: true }
      );

      if (!updatedTransaction) {
        return next(errorHandler(500, "Failed to update transaction"));
      }

      // Updated call with all required parameters and 'accepted' status
      await sendEscrowInitiationEmailToInitiator(
        transaction.buyer_email,
        transaction.transaction_id,
        transaction.transaction_total,
        transaction.vendor_name,
        transaction.products,
        transaction.sum_total,
        "accepted"
      );

      res.json({
        status: "success",
        message: "Seller confirmed, buyer notified to proceed with payment.",
        transaction_id: updatedTransaction.transaction_id,
      });
    } else {
      const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
        transaction._id,
        {
          seller_confirmed: false,
          transaction_status: "declined",
        },
        { new: true }
      );

      if (!updatedTransaction) {
        return next(errorHandler(500, "Failed to update transaction"));
      }

      // Updated call with all required parameters and 'rejected' status
      await sendEscrowInitiationEmailToInitiator(
        transaction.buyer_email,
        transaction.transaction_id,
        transaction.transaction_total,
        transaction.vendor_name,
        transaction.products,
        transaction.sum_total,
        "rejected"
      );

      res.json({
        status: "success",
        message: "Seller declined the transaction.",
        transaction_id: updatedTransaction.transaction_id,
      });
    }
  } catch (error) {
    return next(errorHandler(500, "Server error"));
  }
};

export const verifyEscrowProductTransactionPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { transaction_id, buyer_email, reference } = req.body;

  if (!transaction_id || !buyer_email) {
    return next(
      errorHandler(400, "Transaction ID and buyer email are required")
    );
  }

  try {
    const transaction = await ProductTransaction.findOne({ transaction_id });

    if (!transaction) return next(errorHandler(404, "Transaction not found"));

    if (transaction.buyer_email !== buyer_email) {
      return next(errorHandler(403, "Unauthorized: Incorrect buyer email"));
    }

    // STEP 1: INITIATE PAYMENT
    if (!reference) {
      if (!transaction.buyer_initiated) {
        return next(
          errorHandler(
            400,
            "Cannot proceed Payment!!..Buyer has not initiated the transaction"
          )
        );
      }

      if (!transaction.seller_confirmed) {
        return next(
          errorHandler(
            400,
            "Cannot proceed Payment!!..Seller has not confirmed the transaction"
          )
        );
      }

      if (transaction.verified_payment_status) {
        return next(errorHandler(400, "Payment has already been verified"));
      }

      // Generate unique reference
      const paymentReference = `${transaction.transaction_id}-${Date.now()}`;

      const paystackResponse = await paymentForEscrowProductTransaction({
        reference: paymentReference,
        amount: Number(transaction.transaction_total),
        email: buyer_email,
      });

      if (paystackResponse.status && paystackResponse.data.authorization_url) {
        // Store payment reference in transaction
        await ProductTransaction.findByIdAndUpdate(transaction._id, {
          payment_reference: paymentReference,
          payment_initiated_at: new Date(),
        });

        return res.json({
          status: "success",
          message:
            "Payment initiation successful. Please complete the payment on Paystack.",
          authorization_url: paystackResponse.data.authorization_url,
          reference: paymentReference,
        });
      }

      return next(errorHandler(500, "Failed to initiate Paystack payment"));
    }

    // STEP 2: VERIFY PAYMENT
    if (transaction.payment_reference !== reference) {
      return next(errorHandler(400, "Invalid payment reference"));
    }

    if (transaction.verified_payment_status) {
      return next(errorHandler(400, "Payment already verified"));
    }

    const verificationResponse = await verifyPaymentForEscrowProductTransaction(
      reference
    );

    if (
      verificationResponse.status &&
      verificationResponse.data.status === "success"
    ) {
      const paidAmount = verificationResponse.data.amount / 100;
      const expectedAmount = Number(transaction.transaction_total);

      if (Math.abs(paidAmount - expectedAmount) > 0.01) {
        return next(
          errorHandler(
            400,
            `Amount mismatch: Expected ${expectedAmount}, got ${paidAmount}`
          )
        );
      }

      const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
        transaction._id,
        {
          verified_payment_status: true,
          transaction_status: "payment_verified", // NEW STATUS
          payment_verified_at: new Date(),
        },
        { new: true }
      );

      if (!updatedTransaction) {
        return next(errorHandler(500, "Failed to update transaction"));
      }

      try {
        await sendEscrowInitiationEmailToVendor(
          transaction.transaction_id,
          transaction.vendor_name,
          transaction.vendor_email,
          transaction.products,
          transaction.sum_total,
          transaction.transaction_total
        );
      } catch (err) {
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

    return next(errorHandler(400, "Payment verification failed"));
  } catch (error) {
    console.error("verifyEscrowProductTransactionPayment error:", error);
    return next(errorHandler(500, "Server error"));
  }
};

// UPDATE sellerFillOutShippingDetails to change status
export const sellerFillOutShippingDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    shipping_company,
    delivery_person_name,
    delivery_person_number,
    delivery_person_email,
    delivery_date,
    pick_up_address,
    transaction_id,
  } = req.body;

  validateProductFields(
    {
      shipping_company,
      delivery_person_name,
      delivery_person_number,
      delivery_person_email,
      delivery_date,
      pick_up_address,
    },
    next
  );

  try {
    const transaction = await ProductTransaction.findOne({
      transaction_id,
      verified_payment_status: true,
      shipping_submitted: false,
    });

    if (!transaction) {
      return next(errorHandler(404, "Invalid transaction state for shipping"));
    }

    const user = await IndividualUser.findOne({
      email: transaction.vendor_email,
    });

    if (!user) {
      return next(errorHandler(404, "Vendor not found"));
    }

    const newShippingDetails = new ShippingDetails({
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

    await newShippingDetails.save();

    // UPDATE: Change status to in_transit
    transaction.shipping_submitted = true;
    transaction.transaction_status = "in_transit"; // NEW STATUS
    await transaction.save();

    await sendShippingDetailsEmailToInitiator(
      transaction.buyer_email,
      shipping_company,
      delivery_person_name,
      delivery_person_number,
      delivery_date,
      pick_up_address
    );

    await sendShippingDetailsEmailToVendor(
      transaction.transaction_id,
      transaction.vendor_name,
      transaction.vendor_email,
      transaction.products.map((p: { name: string }) => p.name).join(", ")
    );

    res.status(200).json({
      status: "success",
      message: "Shipping details submitted successfully",
      newShippingDetails,
    });
  } catch (error) {
    console.error("Error in sellerFillOutShippingDetails:", error);
    return next(errorHandler(500, "Server error"));
  }
};

export const paystackWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ⚠️ CRITICAL: Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    // Handle successful payment
    if (event.event === "charge.success") {
      const { reference, amount, status } = event.data;

      const transaction = await ProductTransaction.findOne({
        payment_reference: reference,
      });

      if (transaction && !transaction.verified_payment_status) {
        const expectedAmount = Number(transaction.transaction_total) * 100; // Convert to kobo

        if (amount === expectedAmount && status === "success") {
          await ProductTransaction.findByIdAndUpdate(transaction._id, {
            verified_payment_status: true,
            transaction_status: "awaiting_shipping",
            payment_verified_at: new Date(),
          });

          // Send notification emails
          await sendEscrowInitiationEmailToVendor(
            transaction.transaction_id,
            transaction.vendor_name,
            transaction.vendor_email,
            transaction.products,
            transaction.sum_total,
            transaction.transaction_total
          );
        }
      }
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook processing failed");
  }
};

export const getAllEscrowProductTransactionByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_email } = req.params;

    if (!user_email) {
      return next(errorHandler(400, "user email is required"));
    }

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Fetch total count for pagination metadata
    const total = await ProductTransaction.countDocuments({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
    });

    // Fetch paginated transactions with shipping details populated
    const transactions = await ProductTransaction.find({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
    })
      .populate({
        path: "shipping",
        model: "ShippingDetails",
        select:
          "_id shipping_company delivery_person_name delivery_person_number delivery_person_email delivery_date pick_up_address createdAt",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!transactions || transactions.length === 0) {
      return next(
        errorHandler(404, "you don't have any transactions at this time")
      );
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
  } catch (error) {
    console.error("getAllEscrowProductTransactionByUser error:", error);
    return next(errorHandler(500, "server error"));
  }
};

export const getSingleEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transaction_id } = req.params;

    if (!transaction_id) {
      return next(errorHandler(400, "Transaction ID is required"));
    }

    // Find the transaction by transaction_id
    const transaction = await ProductTransaction.findOne({ transaction_id });

    if (!transaction) {
      return next(errorHandler(404, "Transaction not found"));
    }

    // Fetch related dispute details if any
    const disputeDetails = await ProductDispute.findOne({ transaction_id });

    // Fetch shipping details if any
    const shippingDetails = await ShippingDetails.findOne({ transaction_id });

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
      commission: transaction.sum_total * 0.01, // Calculate commission
      signed_escrow_doc: transaction.signed_escrow_doc,
      delivery_address: transaction.delivery_address,
      buyer_initiated: transaction.buyer_initiated,
      seller_confirmed: transaction.seller_confirmed,
      verified_payment_status: transaction.verified_payment_status,
      transaction_status: transaction.transaction_status,
      payment_reference: transaction.payment_reference,
      shipping_submitted: transaction.shipping_submitted,
      buyer_confirm_status: transaction.buyer_confirm_status,
      // createdAt: transaction.createdAt,
      // updatedAt: transaction.updatedAt,
      dispute_details: disputeDetails
        ? {
            reason_for_dispute: disputeDetails.reason_for_dispute,
            dispute_description: disputeDetails.dispute_description,
            dispute_status: disputeDetails.dispute_status,
            created_at: disputeDetails.createdAt,
            updated_at: disputeDetails.updatedAt,
          }
        : null,
      shipping_details: shippingDetails
        ? {
            shipping_company: shippingDetails.shipping_company,
            delivery_person_name: shippingDetails.delivery_person_name,
            delivery_person_number: shippingDetails.delivery_person_number,
            delivery_person_email: shippingDetails.delivery_person_email,
            delivery_date: shippingDetails.delivery_date,
            pick_up_address: shippingDetails.pick_up_address,
            // submitted_at: shippingDetails.createdAt,
          }
        : null,
    };

    res.json({
      status: "success",
      message: "Transaction details fetched successfully",
      data: transactionData,
    });
  } catch (error) {
    console.error("getSingleEscrowProductTransaction error:", error);
    return next(errorHandler(500, "Server error"));
  }
};

export const getAllShippingDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_email } = req.params;

    if (!user_email) {
      return next(errorHandler(400, "User email is required"));
    }

    // Pagination and search parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    // Fetch total count for pagination metadata
    const total = await ShippingDetails.countDocuments({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
      ...(search && {
        $or: [
          { shipping_company: { $regex: search, $options: "i" } },
          { delivery_person_name: { $regex: search, $options: "i" } },
          { buyer_email: { $regex: search, $options: "i" } },
        ],
      }),
    });

    // Fetch paginated and filtered transactions
    const transactions = await ShippingDetails.find({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
      ...(search && {
        $or: [
          { shipping_company: { $regex: search, $options: "i" } },
          { delivery_person_name: { $regex: search, $options: "i" } },
          { buyer_email: { $regex: search, $options: "i" } },
        ],
      }),
    })
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
  } catch (error) {
    console.error("Error in getAllShippingDetails:", error);
    return next(errorHandler(500, "Server error"));
  }
};

// ALTERNATIVE: If you prefer aggregation, use the correct collection name
export const getAllShippingDetailsWithAggregation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_email } = req.params;

    if (!user_email) {
      return next(errorHandler(400, "User email is required"));
    }

    const transactions = await ShippingDetails.aggregate([
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
  } catch (error) {
    console.error("Error in getAllShippingDetails:", error);
    return next(errorHandler(500, "Server error"));
  }
};

export const buyerConfirmsProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return next(errorHandler(400, "Transaction ID is required"));
    }

    console.log(
      `Processing confirmation for transaction_id: ${transaction_id}`
    );

    // Check for existing dispute
    const disputeDetails = await ProductDispute.findOne({ transaction_id });
    console.log(`Dispute details found: ${disputeDetails ? "Yes" : "No"}`);

    // Fetch product transaction details directly
    const fetchProductDetails = await ProductTransaction.findOne({
      transaction_id,
    });

    if (!fetchProductDetails) {
      return next(errorHandler(404, "Transaction not found"));
    }

    console.log(
      "Product transaction found:",
      JSON.stringify(fetchProductDetails, null, 2)
    );

    const {
      transaction_status,
      _id: product_id,
      vendor_name,
      vendor_email,
      buyer_email,
      products,
    } = fetchProductDetails;

    // Get product name from the first product
    const product_name =
      products && products.length > 0 ? products[0].name : "Product";

    // Check if transaction is already completed
    if (transaction_status === "completed") {
      return next(errorHandler(400, "This transaction is already completed"));
    }

    // Check if transaction is in processing status (with or without trailing space)
    // Convert safely for comparison
    const normalizedStatus = transaction_status?.trim().toLowerCase();

    // Only allow confirmation when item is in transit
    const isInTransit = normalizedStatus === "in_transit";

    if (!isInTransit) {
      return next(
        errorHandler(
          400,
          `Transaction status is currently '${transaction_status}'. You can only confirm delivery when the item is in transit.`
        )
      );
    }

    // Update ProductTransaction status to completed and set buyer_confirm_status to true
    const updateProductTransactionStatus =
      await ProductTransaction.findByIdAndUpdate(
        product_id,
        {
          transaction_status: "completed",
          buyer_confirm_status: true,
        },
        { new: true }
      );

    if (!updateProductTransactionStatus) {
      return next(errorHandler(500, "Failed to update product status"));
    }

    console.log(
      `Updated ProductTransaction ${product_id} to completed with buyer confirmation`
    );

    // Resolve dispute if exists and not already resolved
    if (disputeDetails && disputeDetails.dispute_status !== "resolved") {
      await ProductDispute.findByIdAndUpdate(
        disputeDetails._id,
        { dispute_status: "resolved" },
        { new: true }
      );
      console.log(`Resolved dispute for transaction ${transaction_id}`);
    }

    // Send confirmation emails
    await sendSuccessfulEscrowEmailToInitiator(
      transaction_id,
      vendor_name,
      buyer_email,
      product_name
    );
    await sendSuccessfulEscrowEmailToVendor(
      transaction_id,
      vendor_name,
      vendor_email,
      product_name
    );
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
  } catch (error) {
    console.error("Error in buyerConfirmsProduct:", error);
    return next(errorHandler(500, "Server error"));
  }
};

export const cancelEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { transaction_id } = req.params;

  if (!transaction_id) {
    return next(errorHandler(400, "Transaction ID is required"));
  }

  try {
    const fetchProductDetails = await ProductTransaction.findOne({
      transaction_id,
    });

    if (!fetchProductDetails) {
      return next(errorHandler(404, "Transaction not found"));
    }

    const productTransactionStatus =
      fetchProductDetails.transaction_status?.trim();

    const fetchDisputeDetails = await ProductDispute.findOne({
      transaction_id,
    });
    const productDisputeStatus = fetchDisputeDetails?.dispute_status;

    if (productTransactionStatus === "cancelled") {
      return next(
        errorHandler(400, "This transaction has already been cancelled")
      );
    }
    if (productTransactionStatus === "completed") {
      return next(
        errorHandler(400, "This transaction has already been completed")
      );
    }
    if (productDisputeStatus === "resolved") {
      return next(
        errorHandler(400, "This transaction has already been resolved")
      );
    }

    const updateProductTransactionStatus =
      await ProductTransaction.findByIdAndUpdate(
        fetchProductDetails._id,
        { transaction_status: "cancelled" },
        { new: true }
      );

    if (!updateProductTransactionStatus) {
      return next(errorHandler(500, "Failed to update transaction status"));
    }

    if (fetchDisputeDetails) {
      await ProductDispute.findByIdAndUpdate(
        fetchDisputeDetails._id,
        { dispute_status: "cancelled" },
        { new: true }
      );
    }

    res.json({
      status: "success",
      message: "Transaction has been cancelled successfully",
    });
  } catch (error) {
    return next(errorHandler(500, "Internal server error"));
  }
};

export const getPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transaction_id } = req.params;

    if (!transaction_id) {
      return next(errorHandler(400, "Transaction ID is required"));
    }

    const transaction = await ProductTransaction.findOne({ transaction_id });

    if (!transaction) {
      return next(errorHandler(404, "Transaction not found"));
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
  } catch (error) {
    console.error("getPaymentStatus error:", error);
    return next(errorHandler(500, "Server error"));
  }
};
