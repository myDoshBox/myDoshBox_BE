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
exports.raiseDispute = void 0;
const validation_utilities_1 = require("../../../utilities/validation.utilities");
const individualUserAuth_model1_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model1"));
const productsTransaction_model_1 = __importDefault(require("../../transactions/productsTransaction/productsTransaction.model"));
const errorHandling_middleware_1 = require("../../../middlewares/errorHandling.middleware");
const console_1 = require("console");
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
const raiseDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // dispute form
    const { transaction_id, // prefill this
    buyer_email, // prefill this
    vendor_email, // prefill this
    product_name, product_image, reason_for_dispute, dispute_description, } = req.body;
    validation_utilities_1.validateFormFields({
        product_name,
        product_image,
        transaction_id,
        reason_for_dispute,
        dispute_description,
    }, next);
    try {
        // find the user who initiated the transaction
        const user = yield individualUserAuth_model1_1.default.findOne({ email: buyer_email });
        //   find the transaction by id
        const transaction = yield productsTransaction_model_1.default.findOne({
            transaction_id: transaction_id,
        });
        console_1.log("transaction", transaction);
        if (!user || !transaction) {
            return next(errorHandling_middleware_1.errorHandler(404, "User or transaction not found"));
        }
        else if (buyer_email === vendor_email) {
            return next(errorHandling_middleware_1.errorHandler(400, "You cannot raise a dispute against yourself"));
        }
        // else if (transaction.transaction_status === "cancelled") {
        //   return next(
        //     errorHandler(400, "This transaction has already been cancelled")
        //   );
        // }
    }
    catch (error) {
        console.log("error", error);
        return next(errorHandling_middleware_1.errorHandler(500, "Internal server error"));
    }
});
exports.raiseDispute = raiseDispute;
// FLIP SIDE OF THE LOGIC
// buyer rejects the goods, then fills the dispute form and send to the seller
/*
    1. accepts:- fills the dispute resolution form
    2. rejects:-
        a. cancels the escrow initiated - who bears the consequence
        b. involves a mediator
            - mediator receives mail
        
    
 */
