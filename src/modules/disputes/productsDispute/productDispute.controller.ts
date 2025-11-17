// import { Request, Response, NextFunction } from "express";
// import { validateFormFields } from "../../../utilities/validation.utilities";
// import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
// import ProductTransaction from "../../transactions/productsTransaction/productsTransaction.model";
// import ProductDispute from "./productDispute.model";
// import { errorHandler } from "../../../middlewares/errorHandling.middleware";
// import {
//   BuyerResolveDisputeParams,
//   BuyerResolveDisputeBody,
//   BuyerResolveDisputeResponse,
//   SellerResolveDisputeParams,
//   SellerResolveDisputeResponse,
//   SellerResolveDisputeBody,
// } from "./productDispute.interface";
// import { log } from "console";
// import {
//   sendBuyerResolutionMailToBuyer,
//   sendBuyerResolutionMailToSeller,
//   sendDisputeMailToBuyer,
//   sendDisputeMailToSeller,
//   sendSellerResolutionMailToBuyer,
//   sendSellerResolutionMailToSeller,
// } from "./productDispute.mail";

// export const raiseDispute = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const {
//     transaction_id,
//     user_email,
//     buyer_email,
//     vendor_name,
//     vendor_email,
//     vendor_phone_number,
//     product_name,
//     product_image,
//     reason_for_dispute,
//     dispute_description,
//   } = req.body;

//   let dispute_raised_by = req?.body?.dispute_raised_by;

//   validateFormFields(
//     {
//       product_name,
//       product_image,
//       transaction_id,
//       reason_for_dispute,
//       dispute_description,
//     },
//     next
//   );

//   try {
//     const user = await IndividualUser.findOne({ email: user_email });
//     console.log("user_email", user_email);

//     const transaction = await ProductTransaction.findOne({
//       transaction_id: transaction_id,
//     });

//     const transactionStatus: string | undefined =
//       transaction?.transaction_status as string | undefined;

//     if (!user) {
//       return next(errorHandler(404, "User not found"));
//     } else if (!transaction) {
//       return next(errorHandler(404, "Transaction not found"));
//     } else if (buyer_email === vendor_email) {
//       return next(
//         errorHandler(400, "You cannot raise a dispute against yourself")
//       );
//     } else if (transactionStatus === "completed") {
//       return next(
//         errorHandler(
//           400,
//           "You cannot raise a dispute for this transaction because it has already been completed"
//         )
//       );
//     } else if (transactionStatus === "cancelled") {
//       return next(
//         errorHandler(
//           400,
//           "You cannot raise a dispute for this transaction because it has already been cancelled"
//         )
//       );
//     } else if (transactionStatus === "inDispute") {
//       return next(
//         errorHandler(
//           400,
//           "You cannot raise a dispute for this transaction because it is already in dispute"
//         )
//       );
//     }

//     if (user_email === vendor_email) {
//       dispute_raised_by = "seller";
//     } else if (user_email === buyer_email) {
//       dispute_raised_by = "buyer";
//     }

//     const updateProductTransactionStatus =
//       await ProductTransaction.findByIdAndUpdate(
//         transaction._id,
//         { $set: { transaction_status: "inDispute" } },
//         { new: true }
//       );

//     if (!updateProductTransactionStatus) {
//       return next(errorHandler(500, "Failed to update transaction status"));
//     }

//     // Populate products array from transaction, filtered by product_name and product_image
//     const matchingProducts = transaction.products.filter(
//       (p) => p.name === product_name && p.image === product_image
//     );
//     if (matchingProducts.length === 0) {
//       return next(
//         errorHandler(400, "Provided product details do not match transaction")
//       );
//     }

//     const newProductDispute = new ProductDispute({
//       user,
//       transaction: transaction._id,
//       mediator: null,
//       transaction_id,
//       buyer_email,
//       vendor_name,
//       vendor_email,
//       vendor_phone_number,
//       product_name,
//       product_image,
//       products: matchingProducts.map((p) => ({
//         name: p.name,
//         quantity: p.quantity,
//         price: p.price,
//         image: p.image,
//         description: p.description,
//       })),
//       reason_for_dispute,
//       dispute_description,
//       dispute_raised_by,
//       dispute_raised_by_email: user_email,
//     });

//     await newProductDispute.save();

//     await Promise.all([
//       sendDisputeMailToBuyer(buyer_email, product_name, dispute_description),
//       sendDisputeMailToSeller(vendor_email, product_name, dispute_description),
//     ]);

//     res.json({
//       status: "success",
//       message: "Dispute has been raised successfully",
//     });
//   } catch (error: string | unknown) {
//     console.log("error", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };

// export const getAllDisputesByUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { user_email } = req.params;

//     if (!user_email) {
//       return next(errorHandler(400, "User email is required"));
//     }

//     const fetchDisputeDetails = await ProductDispute.find({
//       $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
//     }).sort({ createdAt: -1 });

//     if (!fetchDisputeDetails || fetchDisputeDetails?.length === 0) {
//       return next(errorHandler(404, "No disputes found for this user"));
//     } else {
//       res.json({
//         fetchDisputeDetails,
//         status: "success",
//         message: "all disputes have been fetched successfully",
//       });
//     }
//   } catch (error: string | unknown) {
//     console.log("error", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };

// export const buyerResolveDispute = async (
//   req: Request<BuyerResolveDisputeParams, {}, BuyerResolveDisputeBody>,
//   res: Response<BuyerResolveDisputeResponse>,
//   next: NextFunction
// ): Promise<void> => {
//   const {
//     vendor_name,
//     vendor_phone_number,
//     vendor_email,
//     transaction_type,
//     product_name,
//     product_quantity,
//     product_price,
//     transaction_total,
//     product_image,
//     product_description,
//     signed_escrow_doc,
//     delivery_address,
//   } = req.body;

//   const { transaction_id } = req.params;

//   try {
//     const productDetails = await ProductTransaction.findOne({
//       transaction_id: transaction_id,
//       transaction_status: "inDispute",
//     });

//     const disputeDetails = await ProductDispute.findOne({
//       transaction_id: transaction_id,
//     });

//     if (!productDetails) {
//       return next(errorHandler(404, "No dispute found for this transaction"));
//     } else if (!disputeDetails) {
//       return next(errorHandler(404, "Dispute does not exist"));
//     }

//     if (
//       !["Not in Dispute", "processing"].includes(disputeDetails.dispute_status)
//     ) {
//       return next(
//         errorHandler(
//           400,
//           `Cannot update dispute: Current status is ${disputeDetails.dispute_status}`
//         )
//       );
//     }

//     if (
//       disputeDetails.dispute_resolution_method === "mediator" &&
//       disputeDetails.mediator
//     ) {
//       return next(
//         errorHandler(
//           400,
//           "Cannot resolve dispute: A mediator is assigned to this dispute"
//         )
//       );
//     }

//     const updatedProducts = productDetails.products.map((p) => {
//       if (p.name === product_name) {
//         return {
//           ...p,
//           quantity: product_quantity || p.quantity,
//           price: product_price || p.price,
//           image: product_image || p.image,
//           description: product_description || p.description,
//         };
//       }
//       return p;
//     });

//     const updateTransaction = await ProductTransaction.findByIdAndUpdate(
//       productDetails._id,
//       {
//         $set: {
//           vendor_name: vendor_name || productDetails.vendor_name,
//           vendor_phone_number:
//             vendor_phone_number || productDetails.vendor_phone_number,
//           vendor_email: vendor_email || productDetails.vendor_email,
//           transaction_type: transaction_type || productDetails.transaction_type,
//           products: updatedProducts,
//           transaction_total:
//             transaction_total || productDetails.transaction_total,
//           signed_escrow_doc:
//             signed_escrow_doc || productDetails.signed_escrow_doc,
//           delivery_address: delivery_address || productDetails.delivery_address,
//         },
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updateTransaction) {
//       return next(errorHandler(500, "Failed to update transaction"));
//     }

//     const updateDispute = await ProductDispute.findByIdAndUpdate(
//       disputeDetails._id,
//       {
//         $set: {
//           dispute_status: "resolving",
//           dispute_resolution_method:
//             disputeDetails.dispute_resolution_method || "dispute_parties",
//         },
//       },
//       { new: true, runValidators: true }
//     ).populate("transaction user mediator");

//     if (!updateDispute) {
//       return next(errorHandler(500, "Failed to update transaction"));
//     }

//     log("updatedTransaction", updateTransaction);
//     log("updateDispute", updateDispute);

//     await Promise.all([
//       sendBuyerResolutionMailToBuyer(updateDispute.buyer_email, product_name),
//       sendBuyerResolutionMailToSeller(updateDispute.vendor_email, product_name),
//     ]);

//     res.json({
//       status: "success",
//       message:
//         "Transaction form updated successfully and dispute is being resolved",
//       data: {
//         dispute: updateDispute,
//       },
//     });
//   } catch (error) {
//     console.log("error", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };

// export const sellerResolveDispute = async (
//   req: Request<
//     SellerResolveDisputeParams,
//     SellerResolveDisputeResponse,
//     SellerResolveDisputeBody
//   >,
//   res: Response<SellerResolveDisputeResponse>,
//   next: NextFunction
// ) => {
//   const { resolution_description } = req.body;
//   const { transaction_id } = req.params;

//   validateFormFields(
//     {
//       resolution_description,
//     },
//     next
//   );

//   try {
//     const disputeDetails = await ProductDispute.findOne({
//       transaction_id,
//     }).populate("transaction user");

//     const productDetails = await ProductTransaction.findOne({
//       transaction_id,
//       transaction_status: "inDispute",
//     });

//     if (!disputeDetails) {
//       return next(errorHandler(404, "Dispute does not exist"));
//     }

//     if (!productDetails) {
//       return next(errorHandler(404, "No dispute found for this transaction"));
//     }

//     if (disputeDetails.dispute_status === "resolved") {
//       return next(errorHandler(400, "This dispute has been resolved"));
//     }

//     if (disputeDetails.dispute_status === "cancelled") {
//       return next(errorHandler(400, "This dispute has been cancelled"));
//     }

//     const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
//       productDetails._id,
//       { $set: { transaction_status: "completed" } },
//       { new: true, runValidators: true }
//     );

//     if (!updatedTransaction) {
//       return next(errorHandler(500, "Failed to update transaction status"));
//     }

//     const updateDispute = await ProductDispute.findByIdAndUpdate(
//       disputeDetails._id,
//       {
//         $set: {
//           dispute_status: "resolving",
//           dispute_resolution_method:
//             disputeDetails.dispute_resolution_method || "dispute_parties",
//           resolution_description,
//         },
//       },
//       { new: true, runValidators: true }
//     ).populate("transaction user mediator");

//     if (!updateDispute) {
//       return next(errorHandler(500, "Failed to update transaction"));
//     }

//     // Use product_name from dispute instead of products array
//     await Promise.all([
//       sendSellerResolutionMailToBuyer(
//         updateDispute.buyer_email,
//         updateDispute.product_name
//       ),
//       sendSellerResolutionMailToSeller(
//         updateDispute.vendor_email,
//         updateDispute.product_name
//       ),
//     ]);

//     res.json({
//       status: "success",
//       message:
//         "Transaction form updated successfully and dispute is being resolved",
//       data: {
//         dispute: updateDispute,
//       },
//     });
//   } catch (error: string | unknown) {
//     console.log("error", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };

// productDispute.controller.ts - Simplified Version

import { Request, Response, NextFunction } from "express";
import { validateFormFields } from "../../../utilities/validation.utilities";
import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
import OrganizationUser from "../../authentication/organizationUserAuth/organizationAuth.model";
import ProductTransaction from "../../transactions/productsTransaction/productsTransaction.model";
import ProductDispute from "./productDispute.model";
import { errorHandler } from "../../../middlewares/errorHandling.middleware";
import {
  sendDisputeMailToBuyer,
  sendDisputeMailToSeller,
  sendResolutionProposedToBuyer,
  sendResolutionProposedToSeller,
  sendResolutionAcceptedMailToBuyer,
  sendResolutionAcceptedMailToSeller,
  sendResolutionRejectedToBuyer,
  sendResolutionRejectedToSeller,
  sendAutoEscalationMailToBuyer,
  sendAutoEscalationMailToSeller,
  sendMediatorRequestedMailToBuyer,
  sendMediatorRequestedMailToSeller,
  sendDisputeCancelledMailToBuyer,
  sendDisputeCancelledMailToSeller,
} from "./productDispute.mail";

import { IResolutionProposal } from "./productDispute.model";
// Helper to get user email from token
export const getUserEmailFromToken = (req: any): string | null => {
  const tokenUser = req.user;
  return (
    tokenUser?.userData?.email ||
    tokenUser?.userData?.organization_email ||
    tokenUser?.userData?.contact_email ||
    null
  );
};

// Helper to determine dispute stage
const determineDisputeStage = (
  transaction: any
): "pre_payment" | "post_payment" | "post_delivery" => {
  if (!transaction.verified_payment_status) {
    return "pre_payment";
  } else if (!transaction.buyer_confirm_status) {
    return "post_payment";
  } else {
    return "post_delivery";
  }
};

/**
 * Raise a new dispute
 */
export const raiseDispute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { transaction_id } = req.params;
  const {
    user_email,
    buyer_email,
    vendor_name,
    vendor_email,
    vendor_phone_number,
    product_name,
    product_image,
    disputed_products,
    reason_for_dispute,
    dispute_description,
  } = req.body;

  validateFormFields(
    {
      transaction_id,
      reason_for_dispute,
      dispute_description,
      user_email,
      buyer_email,
      vendor_email,
    },
    next
  );

  if (!dispute_description?.trim() || !reason_for_dispute?.trim()) {
    return next(
      errorHandler(400, "Fields cannot be empty or contain only whitespace")
    );
  }

  if (!product_name && !disputed_products) {
    return next(
      errorHandler(
        400,
        "Either product_name/product_image or disputed_products array is required"
      )
    );
  }

  try {
    const user =
      (await IndividualUser.findOne({ email: user_email })) ||
      (await OrganizationUser.findOne({ email: user_email }));

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const transaction = await ProductTransaction.findOne({ transaction_id });
    if (!transaction) {
      return next(errorHandler(404, "Transaction not found"));
    }

    if (buyer_email === vendor_email) {
      return next(
        errorHandler(400, "You cannot raise a dispute against yourself")
      );
    }

    if (user_email !== buyer_email && user_email !== vendor_email) {
      return next(
        errorHandler(403, "You are not authorized to raise a dispute")
      );
    }

    const transactionStatus = transaction.transaction_status;
    if (transactionStatus === "completed") {
      return next(
        errorHandler(400, "Cannot raise dispute: Transaction completed")
      );
    }

    if (transactionStatus === "cancelled") {
      return next(
        errorHandler(400, "Cannot raise dispute: Transaction cancelled")
      );
    }

    if (transaction.dispute_status === "active") {
      return next(
        errorHandler(400, "Transaction already has an active dispute")
      );
    }

    let dispute_raised_by: "buyer" | "seller";

    if (user_email === vendor_email) {
      dispute_raised_by = "seller";
    } else if (user_email === buyer_email) {
      dispute_raised_by = "buyer";
    } else {
      return next(errorHandler(403, "Unauthorized to raise this dispute"));
    }

    // NEW: Check if buyer is raising dispute - require payment verification
    // if (user_email === buyer_email && !transaction.verified_payment_status) {
    // if (user_email === buyer_email && !transaction.verified_payment_status) {
    //   console.log(user_email, "user_email");
    //   return next(
    //     errorHandler(
    //       400,
    //       "Buyer can only raise a dispute after payment has been verified"
    //     )
    //   );
    // }

    // Determine products to dispute
    let productsToDispute: Array<{ name: string; image: string }>;
    if (product_name) {
      if (!product_image) {
        return next(errorHandler(400, "product_image is required"));
      }
      productsToDispute = [{ name: product_name, image: product_image }];
    } else {
      if (!Array.isArray(disputed_products) || disputed_products.length === 0) {
        return next(
          errorHandler(400, "disputed_products must be a non-empty array")
        );
      }
      for (const dp of disputed_products) {
        if (!dp.name || !dp.image) {
          return next(
            errorHandler(400, "Each product must have 'name' and 'image'")
          );
        }
      }
      productsToDispute = disputed_products;
    }

    const matchingProducts = transaction.products.filter((p) =>
      productsToDispute.some((dp) => dp.name === p.name)
    );

    if (matchingProducts.length === 0) {
      return next(
        errorHandler(400, "None of the provided products match the transaction")
      );
    }

    const existingDispute = await ProductDispute.findOne({ transaction_id });
    if (existingDispute) {
      return next(
        errorHandler(400, "A dispute already exists for this transaction")
      );
    }

    // Determine dispute stage
    const dispute_stage = determineDisputeStage(transaction);

    // Update transaction
    const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
      transaction._id,
      { $set: { dispute_status: "active" } },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return next(
        errorHandler(500, "Failed to update transaction dispute status")
      );
    }

    const productSummary =
      matchingProducts.length === 1
        ? matchingProducts[0].name
        : `${matchingProducts.length} Products`;

    // Create dispute with transaction state snapshot
    const newProductDispute = new ProductDispute({
      user: user._id,
      transaction: transaction._id,
      mediator: null,
      transaction_id,
      buyer_email,
      vendor_name,
      vendor_email,
      vendor_phone_number,
      product_name: productSummary,
      product_image: matchingProducts[0].image,
      products: matchingProducts.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        image: p.image,
        description: p.description,
      })),
      reason_for_dispute: reason_for_dispute.trim(),
      dispute_description: dispute_description.trim(),
      dispute_raised_by,
      dispute_raised_by_email: user_email,
      dispute_stage, // NEW: Track stage
      transaction_state_snapshot: {
        buyer_initiated: transaction.buyer_initiated,
        seller_confirmed: transaction.seller_confirmed,
        verified_payment_status: transaction.verified_payment_status,
        shipping_submitted: transaction.shipping_submitted,
        buyer_confirm_status: transaction.buyer_confirm_status,
      },
      dispute_status: "processing",
      dispute_resolution_method: "unresolved",
      resolution_proposals: [],
      rejection_count: 0,
      max_rejections: 3,
    });

    await newProductDispute.save();

    // Send emails
    try {
      await Promise.all([
        sendDisputeMailToBuyer(
          buyer_email,
          productSummary,
          dispute_description.trim()
        ),
        sendDisputeMailToSeller(
          vendor_email,
          productSummary,
          dispute_description.trim()
        ),
      ]);
    } catch (emailError) {
      console.error("Error sending dispute emails:", emailError);
    }

    // Determine stage-specific guidance
    let stageGuidance = "";
    switch (dispute_stage) {
      case "pre_payment":
        stageGuidance =
          "Dispute raised before payment. Transaction can be modified or cancelled.";
        break;
      case "post_payment":
        stageGuidance =
          "Dispute raised after payment but before delivery confirmation. Focus on delivery and product condition.";
        break;
      case "post_delivery":
        stageGuidance =
          "Dispute raised after delivery confirmation. Product quality or description mismatch issue.";
        break;
    }

    res.status(201).json({
      status: "success",
      message: `Dispute raised successfully for ${matchingProducts.length} product(s)`,
      data: {
        dispute: newProductDispute,
        disputed_products_count: matchingProducts.length,
        dispute_stage,
        stage_guidance: stageGuidance,
        next_steps: {
          buyer_can:
            dispute_raised_by === "seller"
              ? ["propose_resolution", "request_mediator"]
              : ["wait_for_seller_resolution"],
          seller_can:
            dispute_raised_by === "buyer"
              ? ["propose_resolution", "request_mediator"]
              : ["wait_for_buyer_resolution"],
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error raising dispute:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

/**
 * Propose a resolution (SIMPLIFIED - Text only)
 */
export const proposeResolution = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { transaction_id } = req.params;
  const { proposal_description } = req.body;

  validateFormFields({ proposal_description }, next);

  if (!proposal_description?.trim()) {
    return next(errorHandler(400, "Proposal description is required"));
  }

  const userEmail = getUserEmailFromToken(req);
  if (!userEmail) {
    return next(errorHandler(401, "Authentication required"));
  }

  try {
    const dispute = await ProductDispute.findOne({
      transaction_id,
    }).populate("transaction");

    if (!dispute) {
      return next(errorHandler(404, "Dispute not found"));
    }

    // Authorization
    if (
      userEmail !== dispute.buyer_email &&
      userEmail !== dispute.vendor_email
    ) {
      return next(errorHandler(403, "Not authorized to propose resolution"));
    }

    // Check if dispute can accept proposals
    if (!["processing", "resolving"].includes(dispute.dispute_status)) {
      return next(
        errorHandler(
          400,
          `Cannot propose resolution: Status is ${dispute.dispute_status}`
        )
      );
    }

    // Check if mediator is involved
    if (dispute.dispute_resolution_method === "mediator") {
      return next(
        errorHandler(400, "Cannot propose: Mediator is handling this dispute")
      );
    }

    // Check if there's already a pending proposal
    const pendingProposal = dispute.resolution_proposals.find(
      (p) => p.status === "pending"
    );
    if (pendingProposal) {
      return next(
        errorHandler(
          400,
          "A resolution proposal is already pending. Wait for response."
        )
      );
    }

    const proposed_by = userEmail === dispute.buyer_email ? "buyer" : "seller";

    // Create simple text-based proposal
    const newProposal = {
      proposed_by,
      proposed_by_email: userEmail,
      proposal_date: new Date(),
      proposal_type: "description_only" as const,
      resolution_description: proposal_description.trim(),
      proposal_description: proposal_description.trim(),
      status: "pending" as const,
    } as IResolutionProposal;

    // Add proposal to dispute
    dispute.resolution_proposals.push(newProposal);
    dispute.dispute_status = "resolving";
    dispute.dispute_resolution_method = "dispute_parties";

    await dispute.save();

    // Send notifications
    try {
      const productSummary = dispute.product_name;
      const otherPartyEmail =
        proposed_by === "buyer" ? dispute.vendor_email : dispute.buyer_email;

      await sendResolutionProposedToSeller(
        proposed_by === "buyer" ? otherPartyEmail : userEmail,
        productSummary,
        proposed_by,
        dispute.resolution_proposals.length
      );

      await sendResolutionProposedToBuyer(
        proposed_by === "seller" ? otherPartyEmail : userEmail,
        productSummary,
        proposed_by,
        dispute.resolution_proposals.length
      );
    } catch (emailError) {
      console.error("Error sending proposal emails:", emailError);
    }

    res.status(200).json({
      status: "success",
      message: "Resolution proposed successfully. Awaiting response.",
      data: {
        dispute,
        proposal_number: dispute.resolution_proposals.length,
        rejections_remaining: dispute.max_rejections - dispute.rejection_count,
        dispute_stage: dispute.dispute_stage,
      },
    });
  } catch (error) {
    console.error("Error proposing resolution:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

/**
 * Respond to a resolution proposal (SIMPLIFIED - With response description)
 */
export const respondToResolution = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { transaction_id } = req.params;
  const { action, response_description } = req.body;

  validateFormFields({ action }, next);

  if (!["accept", "reject"].includes(action)) {
    return next(errorHandler(400, "Action must be 'accept' or 'reject'"));
  }

  if (!response_description?.trim()) {
    return next(
      errorHandler(
        400,
        "Response description is required (explain why you're accepting/rejecting)"
      )
    );
  }

  const userEmail = getUserEmailFromToken(req);
  if (!userEmail) {
    return next(errorHandler(401, "Authentication required"));
  }

  try {
    const dispute = await ProductDispute.findOne({
      transaction_id,
    }).populate("transaction");

    if (!dispute) {
      return next(errorHandler(404, "Dispute not found"));
    }

    // Authorization
    if (
      userEmail !== dispute.buyer_email &&
      userEmail !== dispute.vendor_email
    ) {
      return next(errorHandler(403, "Not authorized to respond"));
    }

    // Find pending proposal
    const pendingProposal = dispute.resolution_proposals.find(
      (p) => p.status === "pending"
    );

    if (!pendingProposal) {
      return next(errorHandler(404, "No pending resolution proposal found"));
    }

    // Verify responder is not the proposer
    if (pendingProposal.proposed_by_email === userEmail) {
      return next(errorHandler(400, "You cannot respond to your own proposal"));
    }

    if (action === "accept") {
      // ACCEPT RESOLUTION
      pendingProposal.status = "accepted";
      pendingProposal.responded_by = userEmail;
      pendingProposal.response_date = new Date();
      pendingProposal.response_description = response_description.trim();

      // Mark dispute as resolved
      dispute.dispute_status = "resolved";
      dispute.resolved_at = new Date();
      dispute.resolution_summary = `Resolved by mutual agreement. Proposal ${dispute.resolution_proposals.length} accepted.`;

      // Update transaction dispute status
      await ProductTransaction.findOneAndUpdate(
        { transaction_id },
        { $set: { dispute_status: "resolved" } },
        { new: true }
      );

      await dispute.save();

      // Send notifications
      try {
        await Promise.all([
          sendResolutionAcceptedMailToBuyer(
            dispute.buyer_email,
            dispute.product_name
          ),
          sendResolutionAcceptedMailToSeller(
            dispute.vendor_email,
            dispute.product_name
          ),
        ]);
      } catch (emailError) {
        console.error("Error sending acceptance emails:", emailError);
      }

      res.status(200).json({
        status: "success",
        message: "Resolution accepted. Dispute resolved successfully!",
        data: { dispute },
      });
    } else {
      // REJECT RESOLUTION
      pendingProposal.status = "rejected";
      pendingProposal.responded_by = userEmail;
      pendingProposal.response_date = new Date();
      pendingProposal.response_description = response_description.trim();

      dispute.rejection_count += 1;

      // Check for auto-escalation
      if (dispute.rejection_count >= dispute.max_rejections) {
        dispute.dispute_status = "escalated_to_mediator";
        dispute.dispute_resolution_method = "mediator";
        dispute.resolution_summary = `Auto-escalated to mediator after ${dispute.max_rejections} rejections`;

        await dispute.save();

        // Send auto-escalation emails
        try {
          await Promise.all([
            sendAutoEscalationMailToBuyer(
              dispute.buyer_email,
              dispute.product_name,
              dispute.rejection_count
            ),
            sendAutoEscalationMailToSeller(
              dispute.vendor_email,
              dispute.product_name,
              dispute.rejection_count
            ),
          ]);
        } catch (emailError) {
          console.error("Error sending escalation emails:", emailError);
        }

        res.status(200).json({
          status: "success",
          message: `Resolution rejected. Dispute automatically escalated to mediator after ${dispute.max_rejections} rejections.`,
          data: {
            dispute,
            auto_escalated: true,
          },
        });
      }

      // Not yet at max rejections - return to processing
      dispute.dispute_status = "processing";
      await dispute.save();

      // Send rejection notifications
      try {
        const rejectorRole =
          userEmail === dispute.buyer_email ? "buyer" : "seller";
        await Promise.all([
          sendResolutionRejectedToBuyer(
            dispute.buyer_email,
            dispute.product_name,
            rejectorRole,
            dispute.rejection_count,
            dispute.max_rejections
          ),
          sendResolutionRejectedToSeller(
            dispute.vendor_email,
            dispute.product_name,
            rejectorRole,
            dispute.rejection_count,
            dispute.max_rejections
          ),
        ]);
      } catch (emailError) {
        console.error("Error sending rejection emails:", emailError);
      }

      res.status(200).json({
        status: "success",
        message: `Resolution rejected. ${
          dispute.max_rejections - dispute.rejection_count
        } attempts remaining before auto-escalation.`,
        data: {
          dispute,
          rejection_count: dispute.rejection_count,
          rejections_remaining:
            dispute.max_rejections - dispute.rejection_count,
          can_propose_again: true,
        },
      });
    }
  } catch (error) {
    console.error("Error responding to resolution:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

/**
 * Request mediator involvement
 */
export const requestMediator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { transaction_id } = req.params;

  const userEmail = getUserEmailFromToken(req);
  if (!userEmail) {
    return next(errorHandler(401, "Authentication required"));
  }

  try {
    const dispute = await ProductDispute.findOne({ transaction_id });

    if (!dispute) {
      return next(errorHandler(404, "Dispute not found"));
    }

    // Authorization
    if (
      userEmail !== dispute.buyer_email &&
      userEmail !== dispute.vendor_email
    ) {
      return next(errorHandler(403, "Not authorized"));
    }

    // Check if already escalated
    if (dispute.dispute_resolution_method === "mediator") {
      return next(errorHandler(400, "Mediator already involved"));
    }

    // Check if dispute is resolved or cancelled
    if (["resolved", "cancelled"].includes(dispute.dispute_status)) {
      return next(
        errorHandler(
          400,
          `Cannot request mediator: Dispute is ${dispute.dispute_status}`
        )
      );
    }

    const requested_by = userEmail === dispute.buyer_email ? "buyer" : "seller";

    dispute.dispute_status = "escalated_to_mediator";
    dispute.dispute_resolution_method = "mediator";
    dispute.mediator_requested_by = requested_by;
    dispute.mediator_requested_at = new Date();

    await dispute.save();

    // Send notifications
    try {
      await Promise.all([
        sendMediatorRequestedMailToBuyer(
          dispute.buyer_email,
          dispute.product_name,
          requested_by
        ),
        sendMediatorRequestedMailToSeller(
          dispute.vendor_email,
          dispute.product_name,
          requested_by
        ),
      ]);
    } catch (emailError) {
      console.error("Error sending mediator request emails:", emailError);
    }

    res.status(200).json({
      status: "success",
      message:
        "Mediator requested successfully. A mediator will be assigned soon.",
      data: {
        dispute,
        requested_by,
      },
    });
  } catch (error) {
    console.error("Error requesting mediator:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

/**
 * Cancel dispute (mutual agreement)
 */
export const cancelDispute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { transaction_id } = req.params;

  const userEmail = getUserEmailFromToken(req);
  if (!userEmail) {
    return next(errorHandler(401, "Authentication required"));
  }

  try {
    const dispute = await ProductDispute.findOne({ transaction_id });

    if (!dispute) {
      return next(errorHandler(404, "Dispute not found"));
    }

    // Authorization
    if (
      userEmail !== dispute.buyer_email &&
      userEmail !== dispute.vendor_email
    ) {
      return next(errorHandler(403, "Not authorized"));
    }

    // Check status
    if (dispute.dispute_status === "resolved") {
      return next(errorHandler(400, "Dispute is already resolved"));
    }

    if (dispute.dispute_status === "cancelled") {
      return next(errorHandler(400, "Dispute is already cancelled"));
    }

    // Don't allow if mediator involved
    if (dispute.dispute_resolution_method === "mediator" && dispute.mediator) {
      return next(errorHandler(400, "Cannot cancel: Mediator is assigned"));
    }

    // Update transaction
    await ProductTransaction.findOneAndUpdate(
      { transaction_id },
      { $set: { dispute_status: "none" } },
      { new: true }
    );

    // Update dispute
    dispute.dispute_status = "cancelled";
    await dispute.save();

    // Send notifications
    try {
      await Promise.all([
        sendDisputeCancelledMailToBuyer(
          dispute.buyer_email,
          dispute.product_name
        ),
        sendDisputeCancelledMailToSeller(
          dispute.vendor_email,
          dispute.product_name
        ),
      ]);
    } catch (emailError) {
      console.error("Error sending cancellation emails:", emailError);
    }

    res.status(200).json({
      status: "success",
      message:
        "Dispute cancelled successfully. Transaction can proceed normally.",
      data: { dispute },
    });
  } catch (error) {
    console.error("Error cancelling dispute:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

/**
 * Get all disputes for a user
 */
export const getAllDisputesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_email } = req.params;

    if (!user_email) {
      return next(errorHandler(400, "User email is required"));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Optional filter by dispute stage
    const stage = req.query.stage as string;
    const stageFilter = stage ? { dispute_stage: stage } : {};

    const total = await ProductDispute.countDocuments({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
      ...stageFilter,
    });

    const disputes = await ProductDispute.find({
      $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
      ...stageFilter,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("transaction user mediator");

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: "success",
      message:
        disputes.length > 0
          ? "Disputes fetched successfully"
          : "No disputes found",
      data: { disputes },
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
    console.error("Error fetching disputes:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

/**
 * Get single dispute details with full resolution history
 */
export const getDisputeDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transaction_id } = req.params;

    const dispute = await ProductDispute.findOne({ transaction_id }).populate(
      "transaction user mediator"
    );

    if (!dispute) {
      return next(errorHandler(404, "Dispute not found"));
    }

    const userEmail = getUserEmailFromToken(req);

    // Authorization check
    if (
      userEmail !== dispute.buyer_email &&
      userEmail !== dispute.vendor_email
    ) {
      return next(errorHandler(403, "Not authorized to view this dispute"));
    }

    res.status(200).json({
      status: "success",
      message: "Dispute details fetched successfully",
      data: {
        dispute,
        resolution_history: dispute.resolution_proposals,
        dispute_stage: dispute.dispute_stage,
        transaction_state: dispute.transaction_state_snapshot,
        can_propose:
          dispute.dispute_status === "processing" &&
          dispute.dispute_resolution_method !== "mediator",
        can_respond: dispute.resolution_proposals.some(
          (p) => p.status === "pending"
        ),
        can_request_mediator: ![
          "resolved",
          "cancelled",
          "escalated_to_mediator",
        ].includes(dispute.dispute_status),
      },
    });
  } catch (error) {
    console.error("Error fetching dispute details:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};
