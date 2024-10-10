import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload } from "jsonwebtoken";

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
import { sendVerificationEmail } from "../../../utilities/email.utils";
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
      const transaction_id: string = await uuidv4(); // Generate a random UUID
      console.log(transaction_id);

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
        status: "success",
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
        status: "success",
        message: "Payment has been successfully verified.",
      });
    }
  } catch (error: string | unknown) {
    console.log(error);
    // return next(errorHandler(500, "server error"));
    return next(errorHandler(500, "server error"));
  }
};

export const getSingleEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const user = res.locals.user;
    const { transaction_id } = req.params;

    // console.log(user);

    if (!transaction_id) {
      return next(errorHandler(400, "transaction ID is required"));
    }

    const transaction = await Product.findOne({
      transaction_id: transaction_id,
      // user_id: user?._id,
    });

    console.log(transaction?.vendor_email);

    if (!transaction) {
      return next(errorHandler(404, "transaction not found"));
    } else {
      res.json({
        transaction,
        status: "success",
        message: "transaction fetched successfully",
      });
    }
  } catch (error: string | unknown) {
    console.log(error);
    // return next(errorHandler(500, "server error"));
    return next(errorHandler(500, "server error"));
  }
};

export const getAllEscrowProductTransactionByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const user = res?.locals?.user;
    const { buyer_email } = req.params;

    // console.log("user", user);

    if (!buyer_email) {
      return next(errorHandler(400, "Buyer email is required"));
    }

    // const transaction = await Product.find();
    // const transactions = await Product.$where({ buyer_email: buyer_email });

    // db.student.find({
    //   $where: function () {
    //     return this.name === "Mickel";
    //   },
    // });

    const transactions = await Product.find({ buyer_email: buyer_email });

    // console.log(transactions);

    // const { reference } = req.body;

    // const transaction = await Product.findOne({
    //   transaction_id: reference,
    //   verified_payment_status: false,
    // });

    if (!transactions || transactions.length === 0) {
      return next(
        errorHandler(404, "you don't have any transactions at this time")
      );
    } else {
      res.json({
        transactions,
        status: "success",
        message: "all transactions fetched successfully",
      });
    }
  } catch (error: string | unknown) {
    console.log(error);
    // return next(errorHandler(500, "server error"));
    return next(errorHandler(500, "server error"));
  }
};

export const BuyerConfirmEscrowProductTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // when the mail link is clicked
  // we need to check if they have an account, if they do,
  // we redirect them to login if they weren't previously logged in and lead them straight to the page to confirm escrow
  // we need to check if they have an account, if they don't,
  // they are redirected to a signup
  // they signup and are redirected to the page for confirming the escrow
  // when they accept/confirm, a message/popup to tell the seller the next steps.
  // mail is sent to the buyer that the seller has agreed and will be sending the goods
  // the mail contains a link to the page where the buyer can click on so that they are redirected to where they can confirm that they like the product and close the escrow.

  const { transaction_id } = req.body;

  const user = res?.locals?.user;

  if (!user) {
    // res.json({
    //   status: "error",
    //   message: "all transactions fetched successfully",
    //   signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup`,
    // });

    // res.status(401).json({
    //   status: "error",
    //   message: "Unauthorized. Please log in to confirm the escrow transaction.",
    //   login_link: `/login?redirect=/confirm-escrow/${transaction_id}`,
    // });

    res.status(401).json({
      status: "error",
      message: "Unauthorized. Please log in to confirm the escrow transaction.",
      login_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/login?redirect=/confirm-escrow/${transaction_id}`,
    });
  }

  const transaction = await Product.findOne({
    transaction_id: transaction_id,
    // user_id: user?._id,
  });

  if (!transaction) {
    return next(errorHandler(404, "Transaction not found."));
  }

  const vendor_email = transaction?.vendor_email;

  console.log(vendor_email);

  const userAlreadyExist = await IndividualUser.findOne({
    vendor_email: vendor_email,
  });

  // const user = res.locals.user;

  if (!userAlreadyExist) {
    res.status(401).json({
      status: "error",
      message:
        "You do not have an account, please proceed to the signup page to create an account.",
      signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup?redirect=/confirm-escrow/${transaction_id}`,
    });
  }

  if (!user?.email_verified) {
    const verificationToken = jwt.sign(
      { vendor_email },
      process.env.JWT_SECRET as string,
      { expiresIn: 60 * 60 }
    );
    await sendVerificationEmail(vendor_email, verificationToken);
    res.status(200).json({
      status: "false",
      message:
        "Account is unverified! Verfication email sent. verify account to continue",
    });
  }

  // we need to fetch the details from the product document probably by hitting the getbytransactionid endpoint
  // when vendor clicks on agree, they are redirected to a form to fill in the shipping details -> a summary is given and is contained in the mail sent to the buyer
  // LET'S ADD DELIVERY ADDRESS
  // when vendor agrees, the buyer and seller get a mail
};
