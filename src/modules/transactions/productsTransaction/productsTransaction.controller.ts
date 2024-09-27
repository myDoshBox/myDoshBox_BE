import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { validateProductFields } from "./productsTransaction.validation";

// import { Product } from "../models/Product"; // Import the Product model
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1"; // Import the User model
// import { OrganizationUser } from "../../authentication/organizationUserAuth/organizationAuth.model"; // Import the User model
import { errorHandler } from "../../../middlewares/errorHandling.middleware"; // Import your CustomError class
import Product from "./productsTransaction.model";
// import axios from "axios";
import {
  paymentForEscrowProductTransaction,
  verifyPaymentForEscrowProductTransaction,
} from "./productsTransaction.paystack";
import {
  sendEscrowInitiationEmailToInitiator,
  sendEscrowInitiationEmailToVendor,
} from "./productTransaction.mail";
// import {
//   sendEscrowInitiationEmail,
//   sendEscrowInitiationEmailToVendor,
// } from "./productTransaction.mail";
// import { sendEmail } from "../utils/email"; // Import your email utility

export const initiateEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    // transaction_id,
    vendor_phone_number,
    buyer_email, // get it from the frontend
    vendor_email,
    transaction_type,
    product_name,
    // product_category,
    product_quantity,
    product_price,
    transaction_total,
    product_image,
    product_description,
    signed_escrow_doc,
    // transaction_status,
    // payment_status,
    // profit_made,
  } = req.body;

  // Validate required fields
  validateProductFields(
    {
      // transaction_id,
      vendor_phone_number,
      // buyer_email,
      vendor_email,
      transaction_type,
      product_name,
      // product_category,
      product_quantity,
      product_price,
      transaction_total,
      product_image,
      product_description,
      // signed_escrow_doc,
      // transaction_status,
      // payment_status,
      // profit_made,
    },
    next
  );

  try {
    // Find the user who initiated the transaction
    // const user = req.user;
    const user = await IndividualUser.findOne({ email: buyer_email }); // Assuming req.user is populated with authenticated user's info

    console.log("user", user);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    } else {
      // buyer pays for the escrow
      const transaction_id: string = uuidv4(); // Generate a random UUID
      const data = {
        reference: transaction_id,
        amount: product_price,
        email: buyer_email,
      };

      const buyerPaysForEscrow = await paymentForEscrowProductTransaction(data);

      console.log(buyerPaysForEscrow);

      // details are saved in the db

      const newTransaction = new Product({
        transaction_id,
        vendor_phone_number,
        buyer_email,
        vendor_email,
        transaction_type,
        product_name,
        // product_category,
        product_quantity,
        product_price,
        transaction_total,
        product_image,
        product_description,
        signed_escrow_doc,
        // transaction_status,
        // verified_payment_status: false,
        // profit_made,
        // user: user?.email,
      });

      await newTransaction.save();

      // send response
      res.json({
        buyerPaysForEscrow,
        status: "successful",
        message:
          "You have successfully initiated an escrow, please proceed to make payment.",
      });
    }
  } catch (error: string | unknown) {
    console.log(error);
    // return next(errorHandler(500, "server error"));
    return next(errorHandler(500, "server error"));
  }
};

export const verifyEscrowProductTransactionPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reference } = req.body;

    const transaction = await Product.findOne({
      transaction_id: reference,
      verified_payment_status: false,
    });

    if (!transaction) {
      return next(
        errorHandler(
          404,
          "transaction not found or your transaction has been verified"
        )
      );
    } else {
      await verifyPaymentForEscrowProductTransaction(reference);

      // console.log(verifyTransaction);
      // console.log(reference);

      await Product.updateOne(
        { transaction_id: reference },
        {
          transaction_status: true,
          verified_payment_status: true,
        }
      );

      // THIS IS WHEN WE SEND THE MESSAGES, NOT DURING INITIATION

      // pull out the content of the product table for mail delivery

      const {
        buyer_email,
        transaction_id,
        vendor_email,
        product_name,
        product_price,
      } = transaction;

      // const findProductDetails = await Product.findOne({
      //   email: buyer_email,
      // });

      // const buyer_email =

      // Send email to the initiator
      await sendEscrowInitiationEmailToInitiator(buyer_email, transaction_id);

      // await sendEscrowInitiationEmail(user?.email, transaction_id);

      // Send email to the vendor
      await sendEscrowInitiationEmailToVendor(
        transaction_id,
        vendor_email,
        product_name,
        product_price
      );

      // send response
      res.json({
        status: "successful",
        message: "Payment has been successfully verified.",
      });
    }
  } catch (error: string | unknown) {
    console.log(error);
    // return next(errorHandler(500, "server error"));
    return next(errorHandler(500, "server error"));
  }
};

export const confirmEscrowProductTransaction = async () => {
  // when the mail link is clicked
  // they are redirected to a signup
  // they signup and are redirected to the page for confirming the escrow
  // when they accept/confirm, a message/popup to tell the seller the next steps.
  // mail is sent to the buyer that the seller has agreed and will be sending the goods
  // the mail contains a link to the page where the buyer can click on so that they are redirected to where they can confirm that they like the product and close the escrow.
};

export const getSingleEscrowProductTransaction = async () => {};

export const getAllEscrowProductTransaction = async () => {};
