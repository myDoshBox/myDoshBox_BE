"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const RaiseDispute = (req, res, next) => {
    // dispute form
    const {} = req.body;
};
// buyer rejects the goods, then fills the dispute form and send to the seller
/*
    1. accepts:- fills the dispute resolution form
    2. rejects:-
        a. cancels the escrow initiated - who bears the consequence
        b. involves a mediator
            - mediator receives mail
        
    
 */
