import { Request, Response, NextFunction } from "express";
import { validateFormFields } from "../../../utilities/validation.utilities";
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
import ProductTransaction from "../../transactions/productsTransaction/productsTransaction.model";
import { errorHandler } from "../../../middlewares/errorHandling.middleware";
import { log } from "console";
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

    log("transaction", transaction);

    if (!user || !transaction) {
      return next(errorHandler(404, "User or transaction not found"));
    } else if (buyer_email === vendor_email) {
      return next(
        errorHandler(400, "You cannot raise a dispute against yourself")
      );
    }
    // else if (transaction.transaction_status === "cancelled") {
    //   return next(
    //     errorHandler(400, "This transaction has already been cancelled")
    //   );
    // }
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
