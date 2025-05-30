import { Request, Response, NextFunction } from "express";
import { validateFormFields } from "../../../utilities/validation.utilities";
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
import ProductTransaction from "../../transactions/productsTransaction/productsTransaction.model";
import ProductDispute from "./productDispute.model";
import { errorHandler } from "../../../middlewares/errorHandling.middleware";
import { error, log } from "console";
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

export const raiseDispute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // dispute form
  const {
    transaction_id, // prefill this
    buyer_email, // prefill this
    vendor_email, // prefill this
    product_name,
    product_image,
    reason_for_dispute,
    dispute_description,
  } = req.body;

  validateFormFields(
    {
      product_name,
      product_image,
      transaction_id, // prefill this
      reason_for_dispute,
      dispute_description,
    },
    next
  );

  try {
    // find the user who initiated the transaction
    const user = await IndividualUser.findOne({ email: buyer_email });
    //   find the transaction by id
    const transaction = await ProductTransaction.findOne({
      transaction_id: transaction_id,
    });

    const transactionStatus: string | undefined =
      transaction?.transaction_status as string | undefined;

    // log("transaction", transaction);
    // log("user", user);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    } else if (!transaction) {
      return next(errorHandler(404, "Transaction not found"));
    } else if (buyer_email === vendor_email) {
      return next(
        errorHandler(400, "You cannot raise a dispute against yourself")
      );
    } else if (transactionStatus === "completed") {
      return next(
        errorHandler(
          400,
          "You cannot raise a dispute for this transaction because it has already been completed"
        )
      );
    } else if (transactionStatus === "cancelled") {
      return next(
        errorHandler(
          400,
          "You cannot raise a dispute for this transaction because it has already been cancelled"
        )
      );
    } else if (transactionStatus === "inDispute") {
      return next(
        errorHandler(
          400,
          "You cannot raise a dispute for this transaction because it is already in dispute"
        )
      );
    }

    // we want to update the transaction status to "inDispute" when a dispute is raised
    const updateProductTransactionStatus =
      await ProductTransaction.findByIdAndUpdate(
        transaction._id,
        { transaction_status: "inDispute" },
        { new: true } // to return the updated document
      );

    if (!updateProductTransactionStatus) {
      return next(errorHandler(500, "Failed to update transaction status"));
    }

    // detaiils of the dispute saved to DB
    const newProductDispute = new ProductDispute({
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

    await newProductDispute.save();

    // send mail to the buyer that the seller has raised a dispute

    res.json({
      status: "success",
      message: "Dispute has been raised successfully",
    });
  } catch (error: string | unknown) {
    console.log("error", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

// FLIP SIDE OF THE LOGIC
// buyer rejects the goods, then fills the dispute form and send to the seller
/*
    1. accepts:- fills the dispute resolution form
    2. rejects:- 
        a. cancels the escrow initiated - who bears the consequence 
        b. involves a mediator
            - mediator receives mail
        
    
 */

// cancel escrow function
export const cancelEscrow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

// resolve dispute
export const resolveDispute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
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

// involve a mediator

export const involveAMediator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
