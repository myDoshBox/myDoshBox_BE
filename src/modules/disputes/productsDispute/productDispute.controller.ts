import { Request, Response, NextFunction } from "express";
import { validateFormFields } from "../../../utilities/validation.utilities";
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
// - the popup with 2 buttons to "resolve" or "involve a mediator"
// - onclick of resolve, a form is filled and buyer is alerted
// - onclick of "involve a meditator", a form is filled and mediator gets a mail

export const RaiseDispute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // dispute form
  const {
    transaction_id, // prefill this
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

  // try {

  // } catch (error) {

  // }
};

// buyer rejects the goods, then fills the dispute form and send to the seller
/*
    1. accepts:- fills the dispute resolution form
    2. rejects:- 
        a. cancels the escrow initiated - who bears the consequence 
        b. involves a mediator
            - mediator receives mail
        
    
 */
