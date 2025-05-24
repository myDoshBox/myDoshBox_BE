import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { createSessionAndSendTokens } from "../../../utilities/createSessionAndSendToken.util";
// import { validateProductFields } from "./productsTransaction.validation";
import { validateFormFields } from "../../../utilities/validation.utilities";

// import { Product } from "../models/Product"; // Import the Product model
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1"; // Import the User model
// import { OrganizationUser } from "../../authentication/organizationUserAuth/organizationAuth.model"; // Import the User model
import { errorHandler } from "../../../middlewares/errorHandling.middleware"; // Import your CustomError class
import ProductTransaction from "./productsTransaction.model";
// import axios from "axios";
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
} from "./productTransaction.mail";
// import { sendVerificationEmail } from "../../../utilities/email.utils";
import ShippingDetails from "./shippingDetails.model";
import { noSQLJoinType } from "./productsTransaction.interfaces";
// import mongoose, { SchemaTypes } from "mongoose";
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
    vendor_name,
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
    delivery_address,
    // transaction_status,
    // payment_status,
    // profit_made,
  } = req.body;

  // Validate required fields
  validateFormFields(
    {
      // transaction_id,
      vendor_name,
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
      delivery_address,
      // transaction_status,
      // payment_status,
      // profit_made,
    },
    next
  );

  try {
    // Find the user who initiated the transaction
    // const user = req.user;
    const user = await IndividualUser.findOne({ email: buyer_email }); //

    // check if buyer email and vendor email is the same: if it is, we want to tell them that they can't sell to themselves if not we proceed

    // console.log("user", user);

    // WE ARE GOING TO USE THIS LOGIC AS A PERSON CANNOT INITIATE ESCROW WITH THEMSELVES
    // if (!user) {
    //   return next(errorHandler(404, "User not found"));
    // } else if (buyer_email === vendor_email) {
    //   return next(
    //     errorHandler(404, "You cannot initiate an escrow with yourself")
    //   );
    // } else {
    //   // buyer pays for the escrow
    //   const transaction_id: string = await uuidv4(); // Generate a random UUID
    //   // console.log(transaction_id);

    //   const data = {
    //     reference: transaction_id,
    //     amount: transaction_total,
    //     email: buyer_email,
    //   };

    //   // console.log("trans_id_b4_pay", data?.reference);

    //   const buyerPaysForEscrow = await paymentForEscrowProductTransaction(data);

    //   // console.log(buyerPaysForEscrow);

    //   // details are saved in the db

    //   const newTransaction = new Product({
    //     user: user,
    //     transaction_id,
    //     vendor_name,
    //     vendor_phone_number,
    //     buyer_email,
    //     vendor_email,
    //     transaction_type,
    //     product_name,
    //     // product_category,
    //     product_quantity,
    //     product_price,
    //     transaction_total,
    //     product_image,
    //     product_description,
    //     signed_escrow_doc,
    //     delivery_address,
    //     // transaction_status,
    //     // verified_payment_status: false,
    //     // profit_made,
    //     // user: user?.email,
    //   });

    //   await newTransaction.save();

    //   // send response
    //   res.json({
    //     buyerPaysForEscrow,
    //     status: "success",
    //     message:
    //       "You have successfully initiated an escrow, please proceed to make payment.",
    //   });
    // }

    if (!user) {
      return next(errorHandler(404, "User not found"));
    } else if (buyer_email === vendor_email) {
      return next(
        errorHandler(404, "You cannot initiate an escrow with yourself")
      );
    } else {
      // buyer pays for the escrow
      const transaction_id: string = await uuidv4(); // Generate a random UUID
      // console.log(transaction_id);

      const data = {
        reference: transaction_id,
        amount: transaction_total,
        email: buyer_email,
      };

      // console.log("trans_id_b4_pay", data?.reference);

      const buyerPaysForEscrow = await paymentForEscrowProductTransaction(data);

      // console.log(buyerPaysForEscrow);

      // details are saved in the db

      const newTransaction = new ProductTransaction({
        user: user,
        transaction_id,
        vendor_name,
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
        delivery_address,
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

    console.log("reference", reference);

    const transaction = await ProductTransaction.findOne({
      transaction_id: reference,
      verified_payment_status: false,
    });
    // console.log("transaction_id", transaction?.transaction_id);

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

      // console.log("trans_1", transaction);

      // await Product.updateOne({
      //   transaction_id: reference,
      //   // transaction_status: true,
      //   verified_payment_status: true,
      // });

      // const newTerr = await Product.findOneAndUpdate(
      //   { _id: transaction?._id },
      //   // {
      //   //   transaction_id: reference,
      //   // }
      //   {
      //     verified_payment_status: true,
      //   },
      //   { new: true }
      // );

      // if (transaction?.verified_payment_status === false) {
      //   return next(
      //     errorHandler(401, "this transaction has not been successful")
      //   );
      // } else {
      // console.log("newTerr", newTerr);

      // THIS IS WHEN WE SEND THE MESSAGES, NOT DURING INITIATION

      // pull out the content of the product table for mail delivery

      const {
        buyer_email,
        transaction_id,
        vendor_name,
        vendor_email,
        product_name,
        product_price,
        transaction_total,
      } = transaction;

      // console.log(transaction);

      // const findProductDetails = await Product.findOne({
      //   email: buyer_email,
      // });

      // const buyer_email =

      // Send email to the initiator
      await sendEscrowInitiationEmailToInitiator(
        buyer_email,
        transaction_id,
        transaction_total
      );

      // await sendEscrowInitiationEmail(user?.email, transaction_id);

      // Send email to the vendor
      await sendEscrowInitiationEmailToVendor(
        transaction_id,
        vendor_name,
        vendor_email,
        product_name,
        product_price
      );

      // send response
      res.json({
        status: "success",
        message: "Payment has been successfully verified.",
      });
      // }
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

    const transaction = await ProductTransaction.findOne({
      transaction_id: transaction_id,
      // user_id: user?._id,
    });

    console.log(transaction);

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
    // const { buyer_email } = req.params;
    const { user_email } = req.params;

    // console.log("buyer_email", buyer_email);
    console.log("user_email", user_email);

    // if (!buyer_email) {
    //   return next(errorHandler(400, "Buyer email is required"));
    // }
    if (!user_email) {
      return next(errorHandler(400, "user email is required"));
    }

    // const transaction = await Product.find();
    // const transactions = await Product.$where({ buyer_email: buyer_email });

    // db.student.find({
    //   $where: function () {
    //     return this.name === "Mickel";
    //   },
    // });

    // USE THE USERS EMAIL ATTACHED TO THE PRODUCT INSTEAD OF BUYER OR SELLER

    const transactions = await ProductTransaction.find({
      $or: [
        { vendor_email: user_email }, // Age greater than 30
        { buyer_email: user_email }, // OR City is New York
      ],
    }).sort({ createdAt: -1 });

    // Find products where the user (buyer or seller) email matches
    // const transactions = await Product.find({
    //   "user.email": user_email, // assuming you have `user` populated in your product schema with `email`
    // })
    //   .populate({
    //     path: "user",
    //     select: "email", // populating the user field to get email
    //   })
    //   .sort({ createdAt: -1 });

    // const transactions = await Product.find({ buyer_email: buyer_email }).sort({
    //   createdAt: -1,
    // });

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

export const sellerConfirmsEscrowProductTransaction = async (
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

  try {
    // const user = res?.locals?.user;

    // if (!user) {
    //   // res.json({
    //   //   status: "error",
    //   //   message: "all transactions fetched successfully",
    //   //   signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup`,
    //   // });

    //   // res.status(401).json({
    //   //   status: "error",
    //   //   message: "Unauthorized. Please log in to confirm the escrow transaction.",
    //   //   login_link: `/login?redirect=/confirm-escrow/${transaction_id}`,
    //   // });

    //   res.status(401).json({
    //     status: "error",
    //     message: "Unauthorized. Please log in to confirm the escrow transaction.",
    //     login_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/login?redirect=/confirm-escrow/${transaction_id}`,
    //   });
    // }

    const transaction = await ProductTransaction.findOne({
      transaction_id: transaction_id,
      // user_id: user?._id,
    });

    const transactionWithConfirmationStatus = await ProductTransaction.findOne({
      transaction_id: transaction_id,
      seller_confirm_status: false,
      // user_id: user?._id,
    });

    // if (!transaction) {
    //   return next(errorHandler(404, "Transaction not found."));
    // }

    const transactionId = transaction?.transaction_id;
    const sellerConfirmStatus =
      transactionWithConfirmationStatus?.seller_confirm_status;

    // if transactionId !== transaction_id from req.body: invalid transaction
    // if transactionId === transaction_id && seller_confirm_status === true: this transaction has been confirmed
    // else: continue with the logic

    if (transactionId !== transaction_id) {
      next(errorHandler(404, "Invalid transaction."));
    } else if (sellerConfirmStatus !== false) {
      next(errorHandler(404, "This transaction has been confirmed."));
    } else {
      const vendor_email = transaction?.vendor_email;

      console.log("vendor_email", vendor_email);

      const checkIfUserExists = await IndividualUser.findOne({
        email: vendor_email,
      });

      // const user = res.locals.user;

      if (!checkIfUserExists) {
        res.status(401).json({
          status: "error",
          message:
            "You do not have an account, please proceed to the signup page to create an account.",
          // signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup?redirect=/confirm-escrow/${transaction_id}`,
          // signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup`,
        });
      }

      // THIS MAIL SENDS EVEN THOUGH THE PERSON IS VERIFIED. LOGIN ALREADY TAKES CARE OF THIS
      // if (!checkIfUserExists?.email_verified) {
      //   const verificationToken = jwt.sign(
      //     { vendor_email },
      //     process.env.JWT_SECRET as string,
      //     { expiresIn: 60 * 60 }
      //   );
      //   await sendVerificationEmail(vendor_email, verificationToken);
      //   return res.status(200).json({
      //     status: "false",
      //     message:
      //       "Account is unverified! Verfication email sent. verify account to continue",
      //   });
      // }

      // if (checkIfUserExists) {
      //   res.status(401).json({
      //     status: "error",
      //     message:
      //       "You do not have an account, please proceed to the signup page to create an account.",
      //     // signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup?redirect=/confirm-escrow/${transaction_id}`,
      //     signup_link: `${process.env.LOCAL_FRONTEND_BASE_URL}/signup`,
      //   });
      // }

      res.json({
        transaction,
        status: "success",
        message: "transaction fetched successfully",
      });
    }

    // we need to fetch the details from the product document probably by hitting the getbytransactionid endpoint
  } catch (error) {
    res.status(500).json({ message: "Error Logging in user", error });
  }
};

export const sellerFillOutShippingDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // when they accept/confirm, a message/popup to tell the seller the next steps.
  // mail is sent to the buyer that the seller has agreed and will be sending the goods
  // the mail contains a link to the page where the buyer can click on so that they are redirected to where they can confirm that they like the product and close the escrow.

  // when vendor clicks on agree, they are redirected to a form to fill in the shipping details -> a summary is given and is contained in the mail sent to the buyer

  // when vendor agrees, the buyer and seller get a mail

  const {
    shipping_company,
    delivery_person_name,
    delivery_person_number,
    delivery_person_email,
    delivery_date,
    pick_up_address,
    transaction_id,
  } = req.body;

  try {
    validateFormFields(
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

    const getTransaction = await ProductTransaction.findOne({
      transaction_id: transaction_id,
      seller_confirm_status: false,
    });

    const transactionId = getTransaction?.transaction_id;
    const sellerConfirmStatus = getTransaction?.seller_confirm_status;
    const buyer_email = getTransaction?.buyer_email;
    const vendor_name = getTransaction?.vendor_name;
    const vendor_email = getTransaction?.vendor_email;
    const product_name = getTransaction?.product_name;

    console.log("Buyer Email 1:", buyer_email);
    console.log("Vendor Email 1:", vendor_email);

    // if (!transactionId || !vendorName || !vendorEmail || !productName) {
    //   console.log("Error: Missing required fields to send the email");
    //   return; // Exit the function early or handle the error
    // }

    const user = await IndividualUser.findOne({
      email: vendor_email,
    });

    if (transactionId !== transaction_id && sellerConfirmStatus !== false) {
      return next(
        errorHandler(404, "This Transaction has been previously confirmed.")
      );
    } else {
      const newShippingDetails = new ShippingDetails({
        user: user,
        product: getTransaction,
        transaction_id: transactionId,
        shipping_company,
        delivery_person_name,
        delivery_person_number,
        delivery_person_email,
        delivery_date,
        pick_up_address,
        buyer_email,
        vendor_email,
      });

      console.log("Buyer Email 2:", buyer_email);
      console.log("Vendor Email 2:", vendor_email);

      await newShippingDetails.save();

      // THE seller_confirm_status WILL BE UPDATED TO TRUE AFTER IT HAS BEEN SAVED SO THAT USERS CANNOT RECONFIRM IT
      const updatedConfirmationStatus =
        await ProductTransaction.findOneAndUpdate(
          { _id: getTransaction?._id },
          {
            seller_confirm_status: true,
          },
          { new: true }
        );

      console.log("updatedConfirmationStatus", updatedConfirmationStatus);

      // WE CANNOT SEND SHIPPING DETAILS TWICE
      // send mail to initiator with shipping details
      await sendShippingDetailsEmailToInitiator(
        buyer_email,
        shipping_company,
        delivery_person_name,
        delivery_person_number,
        delivery_date,
        pick_up_address
      );

      // send mail to seller about waiting for delivery to get to buyer
      await sendShippingDetailsEmailToVendor(
        transactionId,
        vendor_name,
        vendor_email,
        product_name
      );

      console.log("Buyer Email Last:", buyer_email);
      console.log("Vendor Email Last:", vendor_email);

      res.json({
        newShippingDetails,
        status: "success",
        message: "you have successfully started an order",
      });
    }

    // check if the transaction id exist
    // extract the transaction_id and pass it in to save
    // send mail to both users
  } catch (error) {
    res.status(500).json({ message: "Error Logging in user", error });
  }
};

export const getAllShippingDetailsForBuyer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const user = res?.locals?.user;
    // const { buyer_email, vendor_email } = req.params;
    const { buyer_email } = req.params;

    console.log("Buyer Email:", buyer_email);
    // console.log("Vendor Email:", vendor_email);

    // if (!buyer_email || !vendor_email) {
    //   return next(errorHandler(400, "Buyer email or vendor email is required"));
    // }

    if (!buyer_email) {
      return next(errorHandler(400, "Buyer email is required"));
    }

    // Create filter conditions for the query based on provided emails
    const matchByMails: noSQLJoinType = {};

    if (buyer_email) {
      // matchByMails["product.buyer_email"] = buyer_email as string;
      matchByMails["product.buyer_email"] = buyer_email;
    }

    // if (vendor_email) {
    //   // matchByMails["product.vendor_email"] = buyer_email as string;
    //   matchByMails["product.vendor_email"] = buyer_email;
    // }

    // Use aggregate to join ShippingDetails with Product collection

    const transactions = await ShippingDetails.aggregate([
      {
        $lookup: {
          from: "products", // name of the 'Product' collection
          localField: "product", // field in ShippingDetails that references Product
          foreignField: "_id", // field in Product collection
          as: "product",
        },
      },
      { $unwind: "$product" }, // Unwind to access product details directly,
      { $match: matchByMails }, // Filter based on buyer or vendor email,
      { $sort: { createdAt: -1 } }, // Sort by creation date
    ]);

    // console.log(transactions);

    if (!transactions || transactions.length === 0) {
      return next(
        errorHandler(404, "you don't have any shipping history at this time")
      );
    } else {
      res.json({
        transactions,
        status: "success",
        message: "all shipping details fetched successfully",
      });
    }
  } catch (error: string | unknown) {
    console.log(error);
    // return next(errorHandler(500, "server error"));
    return next(errorHandler(500, "server error"));
  }
};

export const getAllShippingDetailsForVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const user = res?.locals?.user;
    // const { buyer_email, vendor_email } = req.params;
    const { vendor_email } = req.params;

    console.log("Vendor Email:", vendor_email);
    // console.log("Vendor Email:", vendor_email);

    // if (!buyer_email || !vendor_email) {
    //   return next(errorHandler(400, "Buyer email or vendor email is required"));
    // }

    if (!vendor_email) {
      return next(errorHandler(400, "Vendor email is required"));
    }

    // Create filter conditions for the query based on provided emails
    const matchByMails: noSQLJoinType = {};

    if (vendor_email) {
      // matchByMails["product.buyer_email"] = buyer_email as string;
      matchByMails["product.vendor_email"] = vendor_email;
    }

    // if (vendor_email) {
    //   // matchByMails["product.vendor_email"] = buyer_email as string;
    //   matchByMails["product.vendor_email"] = buyer_email;
    // }

    // Use aggregate to join ShippingDetails with Product collection

    const transactions = await ShippingDetails.aggregate([
      {
        $lookup: {
          from: "products", // name of the 'Product' collection
          localField: "product", // field in ShippingDetails that references Product
          foreignField: "_id", // field in Product collection
          as: "product",
        },
      },
      { $unwind: "$product" }, // Unwind to access product details directly,
      { $match: matchByMails }, // Filter based on buyer or vendor email,
      { $sort: { createdAt: -1 } }, // Sort by creation date
    ]);

    // console.log(transactions);

    if (!transactions || transactions.length === 0) {
      return next(
        errorHandler(404, "you don't have any shipping history at this time")
      );
    } else {
      res.json({
        transactions,
        status: "success",
        message: "all shipping details fetched successfully",
      });
    }
  } catch (error: string | unknown) {
    console.log(error);
    // return next(errorHandler(500, "server error"));
    return next(errorHandler(500, "server error"));
  }
};

// export const getAllShippingDetails = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // const user = res?.locals?.user;
//     const { buyer_email, vendor_email } = req.params;

//     console.log("Buyer Email:", buyer_email);
//     console.log("Vendor Email:", vendor_email);

//     // console.log("user", user);

//     if (!buyer_email || !vendor_email) {
//       return next(errorHandler(400, "Buyer email or vendor email is required"));
//     }

//     // Create filter conditions for the query based on provided emails
//     const matchByMails: noSQLJoinType = {};

//     if (buyer_email) {
//       // matchByMails["product.buyer_email"] = buyer_email as string;
//       matchByMails["product.buyer_email"] = buyer_email;
//     }

//     if (vendor_email) {
//       // matchByMails["product.vendor_email"] = buyer_email as string;
//       matchByMails["product.vendor_email"] = buyer_email;
//     }

//     // Use aggregate to join ShippingDetails with Product collection

//     const transactions = await ShippingDetails.aggregate([
//       {
//         $lookup: {
//           from: "products", // name of the 'Product' collection
//           localField: "product", // field in ShippingDetails that references Product
//           foreignField: "_id", // field in Product collection
//           as: "product",
//         },
//       },
//       { $unwind: "$product" }, // Unwind to access product details directly,
//       { $match: matchByMails }, // Filter based on buyer or vendor email,
//       { $sort: { createdAt: -1 } }, // Sort by creation date
//     ]);

//     if (!transactions || transactions.length === 0) {
//       return next(
//         errorHandler(404, "you don't have any shipping history at this time")
//       );
//     } else {
//       res.json({
//         transactions,
//         status: "success",
//         message: "all shipping details fetched successfully",
//       });
//     }
//   } catch (error: string | unknown) {
//     console.log(error);
//     // return next(errorHandler(500, "server error"));
//     return next(errorHandler(500, "server error"));
//   }
// };

export const getAllShippingDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const user = res?.locals?.user;
    // const { buyer_email, vendor_email } = req.params;
    const { user_email } = req.params;

    console.log("user Email:", user_email);
    // console.log("Vendor Email:", vendor_email);

    // console.log("user", user);

    // if (!buyer_email || !vendor_email) {
    //   return next(errorHandler(400, "Buyer email or vendor email is required"));
    // }
    if (!user_email) {
      return next(errorHandler(400, "User email is required"));
    }

    // Create filter conditions for the query based on provided emails
    // const matchByMails: noSQLJoinType = {};

    // if (buyer_email || vendor_email) {
    //   // matchByMails["product.buyer_email"] = buyer_email as string;
    //   // matchByMails["product.buyer_email"] = buyer_email;

    //   // matchByMails["$or"] = [];
    //   const matchByMails: { $or?: { [key: string]: string }[] } = {};

    //   matchByMails.$or = matchByMails.$or || [];

    //   if (buyer_email) {
    //     matchByMails["$or"].push({ "product.buyer_email": buyer_email });
    //   }

    //   if (vendor_email) {
    //     matchByMails["$or"].push({ "product.vendor_email": vendor_email });
    //   }
    // }

    if (user_email) {
      // matchByMails["product.buyer_email"] = buyer_email as string;
      // matchByMails["product.buyer_email"] = buyer_email;

      // matchByMails["$or"] = [];
      const matchByMails: { $or?: { [key: string]: string }[] } = {};

      matchByMails.$or = matchByMails.$or || [];

      if (user_email) {
        matchByMails["$or"].push({ "product.buyer_email": user_email });
      }
    }

    // if (vendor_email) {
    //   // matchByMails["product.vendor_email"] = buyer_email as string;
    //   matchByMails["product.vendor_email"] = buyer_email;
    // }

    // Use aggregate to join ShippingDetails with Product collection
    // const transactions = await Product.find({
    //   $or: [
    //     { vendor_email: user_email }, // Age greater than 30
    //     { buyer_email: user_email }, // OR City is New York
    //   ],
    // }).sort({ createdAt: -1 });

    const transactions = await ShippingDetails.aggregate([
      {
        $match: {
          $or: [
            { vendor_email: user_email }, // Age greater than 30
            { buyer_email: user_email }, // OR City is New York
          ],
        },
      }, // Filter based on buyer or vendor email,
      {
        $lookup: {
          from: "products", // name of the 'Product' collection
          localField: "product", // field in ShippingDetails that references Product
          foreignField: "_id", // field in Product collection
          as: "product",
        },
      },
      { $unwind: "$product" }, // Unwind to access product details directly,
      { $sort: { createdAt: -1 } }, // Sort by creation date
    ]);

    if (!transactions || transactions.length === 0) {
      res.json({
        transactions: [],
        status: "success",
        message: "you do not have any shipping detail at this time",
      });
    } else {
      res.json({
        transactions,
        status: "success",
        message: "all shipping details fetched successfully",
      });
    }
  } catch (error: string | unknown) {
    console.log(error);
    // return next(errorHandler(500, "server error"));
    return next(errorHandler(500, "server error"));
  }
};

// export const buyerConProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // when buyer agrees that product has been received by pressing an agree button
//   // const { transaction_id } = req.params;
//   const { _id } = req.params;

//   if (!_id) {
//     return next(errorHandler(400, "Transaction ID is required"));
//   }

//   // console.log(transaction_id);

//   // Find the ShippingDetails record by transaction_id and ensure transaction_status is 'processing'
//   try {
//     // const fetchShippingDetails = await ShippingDetails.findOne({
//     //   transaction_id,
//     //   // "product.transaction_status": "processing",
//     // }).populate("product");

//     // // Find the ShippingDetails by its ID and populate the Product details
//     // const fetchShippingDetails = await ShippingDetails.findById(_id).populate({
//     //   path: "product", // Field in ShippingDetails that refers to Product
//     //   model: "Product", // Ensure it refers to the 'Product' collection
//     //   select: "transaction_status", // Only populate needed fields
//     // }); // Assuming 'product' is the field referencing Product model in ShippingDetails

//     // const fetchShippingDetails = await ShippingDetails.aggregate([
//     //   {
//     //     $lookup: {
//     //       from: "products", // name of the 'Product' collection
//     //       localField: "product", // field in ShippingDetails that references Product
//     //       foreignField: "_id", // field in Product collection
//     //       as: "product",
//     //     },
//     //   },
//     //   { $unwind: "$product" }, // Unwind to access product details directly, // Sort by creation date
//     // ]);

//     // Find the ShippingDetails by its ID and populate the Product details
//     const fetchShippingDetails = await ShippingDetails.findById(_id).populate(
//       "product"
//     ); // Assuming 'product' is the field referencing Product model in ShippingDetails

//     console.log(fetchShippingDetails?.product);

//     // const tran = fetchShippingDetails?.product;

//     // type ProductDetails = {
//     //   transaction_status: string;
//     // };

//     // const { transaction_status }: ProductDetails = tran;

//     // if (!transaction_status) {
//     //   return next(
//     //     errorHandler(
//     //       404,
//     //       "No shipping details found or transaction already completed"
//     //     )
//     //   );
//     // }

//     // define type
//     // type ProductDetails = {
//     //   transaction_status: string;
//     // };

//     // const productDetails = fetchShippingDetails?.product;

//     // const productDetails = fetchShippingDetails?.product;

//     // const { transaction_status } = productDetails;

//     // console.log(transaction_status);

//     // if (transaction_status !== "processing") {
//     //   return next(
//     //     errorHandler(
//     //       400,
//     //       "This transaction has already been completed successfully"
//     //     )
//     //   );
//     // }

//     // a pop that says thank you for using our service,
//     // transaction_status in product table is updated from processing to successful, we want to identify the particular product to update by getting the transaction_id from the product table through the shipping table and the corresponding shipping id.
//     // Update the transaction_status in the Product table to 'successful'
//     // const updatedProduct = await Product.findOneAndUpdate(
//     //   { transaction_id },
//     //   { $set: { transaction_status: "successful" } },
//     //   { new: true }
//     // );

//     // const updateProductTransactionStatus = await Product.findOneAndUpdate(
//     //   { _id: fetchShippingDetails?._id },
//     //   {
//     //     transaction_status: "completed",
//     //   },
//     //   { new: true }
//     // );

//     // if (!updateProductTransactionStatus) {
//     //   return next(errorHandler(500, "Failed to update product status"));
//     // }

//     // send message to buyer for successful escrow run
//     // send message to seller about buyer's satisfaction and to expect their money soon (24hrs)

//     // find the reference from paystack and use it to release money to seller
//     // Handle Paystack reference and payment release (this requires Paystack API integration)
//     // Example:
//     // const paystackResponse = await paystackReleaseMoneyToSeller(product.paystack_reference);

//     res.json({
//       status: "success",
//       message: "Product transaction has been completed successfully",
//       // updateProductTransactionStatus,
//     });
//   } catch (error) {
//     console.log("Error:", error);
//     return next(errorHandler(500, "Server error"));
//   }
// };

// interface ShippingDetailsWithProduct {
//   transaction_status: string;
//   product_id: string;
//   transaction_id: string;
//   vendor_name: string;
//   vendor_email: string;
//   buyer_email: string;
//   product_name: string;
// }

// export const buyerConfirmsProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { transaction_id } = req.body;

//   console.log("transaction_id", transaction_id);

//   // const { transaction_id } = req.params;

//   // if (!transaction_id) {
//   //   return next(errorHandler(400, "Transaction ID is required"));
//   // }

//   if (!transaction_id || !mongoose.Types.ObjectId.isValid(transaction_id)) {
//     return next(errorHandler(400, "Invalid or missing Transaction ID"));
//   }
//   // if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
//   //   return next(errorHandler(400, "Invalid or missing Transaction ID"));
//   // }

//   // try {
//   // Find the ShippingDetails by its ID and populate the Product details
//   // const fetchShippingDetails = await ShippingDetails?.aggregate([
//   //   { $match: { _id: mongoose.Types.ObjectId.createFromHexString(_id) } },

//   //   {
//   //     $lookup: {
//   //       from: "products", // Join with the 'products' collection
//   //       localField: "product", // Field in ShippingDetails referring to Product
//   //       foreignField: "_id", // The _id field in the Product collection
//   //       as: "productDetails", // Name of the new field containing joined data
//   //     },
//   //   },

//   //   { $unwind: "$productDetails" }, // Unwind since it's an array (1 product for each ShippingDetails)

//   //   {
//   //     $project: {
//   //       transaction_status: "$productDetails.transaction_status", // Select transaction_status
//   //       product_id: "$productDetails._id",
//   //       transaction_id: "$productDetails.transaction_id",
//   //       vendor_name: "$productDetails.vendor_name",
//   //       buyer_email: "$productDetails.buyer_email",
//   //       product_name: "$productDetails.product_name",
//   //       vendor_email: "$productDetails.vendor_email",
//   //     },
//   //   },
//   // ]);

//   try {
//     // Find the ShippingDetails by its ID and populate the Product details
//     const fetchShippingDetails: ShippingDetailsWithProduct[] | null =
//       await ShippingDetails?.aggregate([
//         // { $match: { _id: new mongoose.Types.ObjectId(_id) } }, // Changed the validation

//         { $match: { "product.transaction_id": transaction_id } }, // Match based on transaction_id

//         {
//           $lookup: {
//             from: "products",
//             localField: "product",
//             foreignField: "_id",
//             as: "productDetails",
//           },
//         },

//         { $unwind: "$productDetails" },

//         {
//           $project: {
//             transaction_status: "$productDetails.transaction_status",
//             product_id: "$productDetails._id",
//             transaction_id: "$productDetails.transaction_id",
//             vendor_name: "$productDetails.vendor_name",
//             buyer_email: "$productDetails.buyer_email",
//             product_name: "$productDetails.product_name",
//             vendor_email: "$productDetails.vendor_email",
//           },
//         },
//       ]);

//     // Log to verify what product contains
//     // console.log("Populated product:", fetchShippingDetails);

//     if (!fetchShippingDetails || !fetchShippingDetails[0]) {
//       return next(
//         errorHandler(
//           404,
//           "No shipping details found or transaction already completed"
//         )
//       );
//     }

//     const {
//       transaction_status,
//       product_id,
//       transaction_id,
//       vendor_name,
//       vendor_email,
//       buyer_email,
//       product_name,
//     } = fetchShippingDetails[0];

//     if (transaction_status !== "processing") {
//       return next(errorHandler(400, "This transaction has been completed"));
//     }

//     // Update the transaction status of the Product
//     const updateProductTransactionStatus = await Product.findByIdAndUpdate(
//       product_id,
//       { transaction_status: "completed" },
//       { new: true }
//     );

//     console.log(
//       "updateProductTransactionStatus",
//       updateProductTransactionStatus
//     );

//     if (!updateProductTransactionStatus) {
//       return next(errorHandler(500, "Failed to update product status"));
//     }

//     // send message to buyer for successful escrow run
//     await sendSuccessfulEscrowEmailToInitiator(
//       transaction_id,
//       vendor_name,
//       buyer_email,
//       product_name
//     );
//     // send message to seller about buyer's satisfaction and to expect their money soon (24hrs)

//     await sendSuccessfulEscrowEmailToVendor(
//       transaction_id,
//       vendor_name,
//       vendor_email,
//       product_name
//     );

//     // find the reference from paystack and use it to release money to seller
//     // Handle Paystack reference and payment release (this requires Paystack API integration)
//     // Example:
//     // const paystackResponse = await paystackReleaseMoneyToSeller(product.paystack_reference);

//     // send response
//     res.json({
//       status: "success",
//       message: "Escrow has been completed successfully.",
//     });
//   } catch (error) {
//     console.log("Error:", error);
//     return next(errorHandler(500, "Server error"));
//   }
// };

export const buyerConfirmsProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { transaction_id } = req.body;

  if (!transaction_id) {
    return next(errorHandler(400, "Transaction ID is required"));
  }

  try {
    // Find the ShippingDetails entry by looking up the transaction_id in the Product
    const fetchShippingDetails = await ShippingDetails.aggregate([
      {
        $lookup: {
          from: "products", // The product collection
          localField: "product", // ShippingDetails field that links to Product
          foreignField: "_id", // _id in Product collection
          as: "productDetails", // Resulting array of products
        },
      },
      { $unwind: "$productDetails" }, // Flatten the result array to object
      {
        $match: {
          "productDetails.transaction_id": transaction_id, // Match transaction_id
        },
      },
      {
        $project: {
          transaction_status: "$productDetails.transaction_status",
          product_id: "$productDetails._id",
          vendor_name: "$productDetails.vendor_name",
          buyer_email: "$productDetails.buyer_email",
          product_name: "$productDetails.product_name",
          vendor_email: "$productDetails.vendor_email",
        },
      },
    ]);

    if (!fetchShippingDetails || fetchShippingDetails.length === 0) {
      return next(
        errorHandler(404, "No shipping details found or transaction completed")
      );
    }

    const {
      transaction_status,
      product_id,
      vendor_name,
      vendor_email,
      buyer_email,
      product_name,
    } = fetchShippingDetails[0];

    if (transaction_status !== "processing") {
      return next(errorHandler(400, "This transaction is already completed"));
    }

    // Update the transaction status of the product to "completed"
    const updateProductTransactionStatus =
      await ProductTransaction.findByIdAndUpdate(
        product_id,
        { transaction_status: "completed" },
        { new: true }
      );

    if (!updateProductTransactionStatus) {
      return next(errorHandler(500, "Failed to update product status"));
    }

    // Send success emails
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

    res.json({
      status: "success",
      message: "Escrow has been completed successfully.",
    });
  } catch (error) {
    console.log("Error:", error);
    return next(errorHandler(500, "Server error"));
  }
};

// export const buyerConfirmsProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // Destructure transaction_id from req.body correctly
//   const { transaction_id } = req.body;

//   console.log(transaction_id);

//   if (!transaction_id) {
//     return next(errorHandler(400, "Transaction ID is required"));
//   }

//   try {
//     // Find the ShippingDetails by transaction_id in the Product details
//     const fetchShippingDetails: ShippingDetailsWithProduct[] | null =
//       await ShippingDetails?.aggregate([
//         { $match: { "product.transaction_id": transaction_id } }, // Match based on transaction_id

//         {
//           $lookup: {
//             from: "products",
//             localField: "product",
//             foreignField: "_id",
//             as: "productDetails",
//           },
//         },

//         { $unwind: "$productDetails" },

//         {
//           $project: {
//             transaction_status: "$productDetails.transaction_status",
//             product_id: "$productDetails._id",
//             transaction_id: "$productDetails.transaction_id",
//             vendor_name: "$productDetails.vendor_name",
//             buyer_email: "$productDetails.buyer_email",
//             product_name: "$productDetails.product_name",
//             vendor_email: "$productDetails.vendor_email",
//           },
//         },
//       ]);

//     console.log("fetchShippingDetails:", fetchShippingDetails);

//     if (!fetchShippingDetails || !fetchShippingDetails[0]) {
//       return next(
//         errorHandler(
//           404,
//           "No shipping details found or transaction already completed"
//         )
//       );
//     }

//     const {
//       transaction_status,
//       product_id,
//       vendor_name,
//       vendor_email,
//       buyer_email,
//       product_name,
//     } = fetchShippingDetails[0];

//     if (transaction_status !== "processing") {
//       return next(errorHandler(400, "This transaction has been completed"));
//     }

//     // Update the transaction status of the Product
//     const updateProductTransactionStatus = await Product.findByIdAndUpdate(
//       product_id,
//       { transaction_status: "completed" },
//       { new: true }
//     );

//     if (!updateProductTransactionStatus) {
//       return next(errorHandler(500, "Failed to update product status"));
//     }

//     // Send emails to buyer and vendor
//     await sendSuccessfulEscrowEmailToInitiator(
//       transaction_id,
//       vendor_name,
//       buyer_email,
//       product_name
//     );
//     await sendSuccessfulEscrowEmailToVendor(
//       transaction_id,
//       vendor_name,
//       vendor_email,
//       product_name
//     );

//     res.json({
//       status: "success",
//       message: "Escrow has been completed successfully.",
//     });
//   } catch (error) {
//     console.log("Error:", error);
//     return next(errorHandler(500, "Server error"));
//   }
// };
