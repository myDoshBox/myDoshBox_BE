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

export const getUserEmailFromToken = (req: any): string | null => {
  const email = req.user?.email;

  if (!email || email === "unknown") {
    console.error("❌ No email found in req.user");
    console.error("❌ User ID:", req.user?.id);
    console.error("❌ This should have been set by verifyAuth middleware");
    return null;
  }

  console.log("✅ Email found from req.user:", email);
  return email;
};

/**
 * ALTERNATIVE: More detailed version with fallback
 * Use this if you need extra debugging or fallback logic
 */
export const getUserEmailFromTokenDetailed = async (
  req: any,
): Promise<string | null> => {
  // First try: Get from req.user (set by verifyAuth)
  const emailFromReqUser = req.user?.email;

  if (emailFromReqUser && emailFromReqUser !== "unknown") {
    console.log("✅ Email found in req.user:", emailFromReqUser);
    return emailFromReqUser;
  }

  // Log warning if email is missing
  console.warn(
    "⚠️ Email not found in req.user, this indicates an issue with verifyAuth",
  );
  console.warn("⚠️ req.user:", JSON.stringify(req.user, null, 2));

  // Return null - don't try to fetch from DB again as verifyAuth should have done this
  return null;
};

// Helper to determine dispute stage
const determineDisputeStage = (
  transaction: any,
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
  next: NextFunction,
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
    next,
  );

  if (!dispute_description?.trim() || !reason_for_dispute?.trim()) {
    return next(
      errorHandler(400, "Fields cannot be empty or contain only whitespace"),
    );
  }

  if (!product_name && !disputed_products) {
    return next(
      errorHandler(
        400,
        "Either product_name/product_image or disputed_products array is required",
      ),
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
        errorHandler(400, "You cannot raise a dispute against yourself"),
      );
    }

    if (user_email !== buyer_email && user_email !== vendor_email) {
      return next(
        errorHandler(403, "You are not authorized to raise a dispute"),
      );
    }

    const transactionStatus = transaction.transaction_status;
    if (transactionStatus === "completed") {
      return next(
        errorHandler(400, "Cannot raise dispute: Transaction completed"),
      );
    }

    if (transactionStatus === "cancelled") {
      return next(
        errorHandler(400, "Cannot raise dispute: Transaction cancelled"),
      );
    }

    if (transaction.dispute_status === "processing") {
      return next(
        errorHandler(400, "Transaction already has an active dispute"),
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
          errorHandler(400, "disputed_products must be a non-empty array"),
        );
      }
      for (const dp of disputed_products) {
        if (!dp.name || !dp.image) {
          return next(
            errorHandler(400, "Each product must have 'name' and 'image'"),
          );
        }
      }
      productsToDispute = disputed_products;
    }

    const matchingProducts = transaction.products.filter((p) =>
      productsToDispute.some((dp) => dp.name === p.name),
    );

    if (matchingProducts.length === 0) {
      return next(
        errorHandler(
          400,
          "None of the provided products match the transaction",
        ),
      );
    }

    const existingDispute = await ProductDispute.findOne({ transaction_id });
    if (existingDispute) {
      return next(
        errorHandler(400, "A dispute already exists for this transaction"),
      );
    }

    const dispute_stage = determineDisputeStage(transaction);

    // ✅ ONLY update transaction's dispute_status flag (not transaction_status)
    const updatedTransaction = await ProductTransaction.findByIdAndUpdate(
      transaction._id,
      { $set: { dispute_status: "In_Dispute" } },
      { new: true, runValidators: true },
    );

    if (!updatedTransaction) {
      return next(
        errorHandler(500, "Failed to update transaction dispute status"),
      );
    }

    const productSummary =
      matchingProducts.length === 1
        ? matchingProducts[0].name
        : `${matchingProducts.length} Products`;

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
      dispute_stage,
      transaction_state_snapshot: {
        buyer_initiated: transaction.buyer_initiated,
        seller_confirmed: transaction.seller_confirmed,
        verified_payment_status: transaction.verified_payment_status,
        shipping_submitted: transaction.shipping_submitted,
        buyer_confirm_status: transaction.buyer_confirm_status,
      },
      dispute_status: "In_Dispute",
      dispute_resolution_method: "unresolved",
      resolution_proposals: [],
      rejection_count: 0,
      max_rejections: 3,
    });

    await newProductDispute.save();

    try {
      await Promise.all([
        sendDisputeMailToBuyer(
          buyer_email,
          productSummary,
          dispute_description.trim(),
        ),
        sendDisputeMailToSeller(
          vendor_email,
          productSummary,
          dispute_description.trim(),
        ),
      ]);
    } catch (emailError) {
      console.error("Error sending dispute emails:", emailError);
    }

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
 * Request mediator involvement
 */
export const requestMediator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { transaction_id } = req.params;

  const userEmail = await getUserEmailFromToken(req);
  if (!userEmail) {
    return next(errorHandler(401, "Authentication required"));
  }

  try {
    const dispute = await ProductDispute.findOne({ transaction_id });

    if (!dispute) {
      return next(errorHandler(404, "Dispute not found"));
    }

    if (
      userEmail !== dispute.buyer_email &&
      userEmail !== dispute.vendor_email
    ) {
      return next(errorHandler(403, "Not authorized"));
    }

    if (dispute.dispute_resolution_method === "mediator") {
      return next(errorHandler(400, "Mediator already involved"));
    }

    if (["resolved", "cancelled"].includes(dispute.dispute_status)) {
      return next(
        errorHandler(
          400,
          `Cannot request mediator: Dispute is ${dispute.dispute_status}`,
        ),
      );
    }

    const requested_by = userEmail === dispute.buyer_email ? "buyer" : "seller";

    // ✅ ONLY update dispute status (NOT transaction status)
    dispute.dispute_status = "escalated_to_mediator";
    dispute.dispute_resolution_method = "mediator";
    dispute.mediator_requested_by = requested_by;
    dispute.mediator_requested_at = new Date();

    await dispute.save();

    try {
      await Promise.all([
        sendMediatorRequestedMailToBuyer(
          dispute.buyer_email,
          dispute.product_name,
          requested_by,
        ),
        sendMediatorRequestedMailToSeller(
          dispute.vendor_email,
          dispute.product_name,
          requested_by,
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
  next: NextFunction,
): Promise<void> => {
  const { transaction_id } = req.params;

  const userEmail = await getUserEmailFromToken(req);
  if (!userEmail) {
    return next(errorHandler(401, "Authentication required"));
  }

  try {
    const dispute = await ProductDispute.findOne({ transaction_id });

    if (!dispute) {
      return next(errorHandler(404, "Dispute not found"));
    }

    if (
      userEmail !== dispute.buyer_email &&
      userEmail !== dispute.vendor_email
    ) {
      return next(errorHandler(403, "Not authorized"));
    }

    if (dispute.dispute_status === "resolved") {
      return next(errorHandler(400, "Dispute is already resolved"));
    }

    if (dispute.dispute_status === "cancelled") {
      return next(errorHandler(400, "Dispute is already cancelled"));
    }

    if (dispute.dispute_resolution_method === "mediator" && dispute.mediator) {
      return next(errorHandler(400, "Cannot cancel: Mediator is assigned"));
    }

    await ProductTransaction.findOneAndUpdate(
      { transaction_id },
      { $set: { dispute_status: "cancelled" } },
      { new: true },
    );

    dispute.dispute_status = "cancelled";
    await dispute.save();

    try {
      await Promise.all([
        sendDisputeCancelledMailToBuyer(
          dispute.buyer_email,
          dispute.product_name,
        ),
        sendDisputeCancelledMailToSeller(
          dispute.vendor_email,
          dispute.product_name,
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
  next: NextFunction,
) => {
  try {
    const { user_email } = req.params;

    if (!user_email) {
      return next(errorHandler(400, "User email is required"));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

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

// ========================================
// KEY FIXES FOR DISPUTE CONTROLLER
// ========================================

/**
 * Get single dispute details with full resolution history
 * FIXED: Proper user role determination and proposal filtering
 */
/**
 * Get single dispute details with full resolution history
 * FIXED: Better proposal detection
 */

/**
 * Propose a resolution
 * FIXED: Better validation and duplicate prevention
 */
// export const proposeResolution = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const { transaction_id } = req.params;
//   const { proposal_description } = req.body;

//   validateFormFields({ proposal_description }, next);

//   if (!proposal_description?.trim()) {
//     return next(errorHandler(400, "Proposal description is required"));
//   }

//   const userEmail = await getUserEmailFromToken(req);
//   if (!userEmail) {
//     return next(errorHandler(401, "Authentication required"));
//   }

//   try {
//     const dispute = await ProductDispute.findOne({
//       transaction_id,
//     }).populate("transaction");

//     if (!dispute) {
//       return next(errorHandler(404, "Dispute not found"));
//     }

//     const userEmailLower = userEmail.toLowerCase();
//     const buyerEmailLower = dispute.buyer_email.toLowerCase();
//     const vendorEmailLower = dispute.vendor_email.toLowerCase();

//     // ✅ FIX: Case-insensitive email comparison
//     if (
//       userEmailLower !== buyerEmailLower &&
//       userEmailLower !== vendorEmailLower
//     ) {
//       return next(errorHandler(403, "Not authorized to propose resolution"));
//     }

//     // ✅ FIX: Check status more clearly
//     if (!["In_Dispute", "resolving"].includes(dispute.dispute_status)) {
//       return next(
//         errorHandler(
//           400,
//           `Cannot propose resolution: Dispute status is ${dispute.dispute_status}`
//         )
//       );
//     }

//     if (dispute.dispute_resolution_method === "mediator") {
//       return next(
//         errorHandler(400, "Cannot propose: Mediator is handling this dispute")
//       );
//     }

//     // ✅ FIX: Check for existing pending proposals more carefully
//     const currentUserPendingProposal = dispute.resolution_proposals.find(
//       (p) => {
//         const proposalEmailLower = p.proposed_by_email.toLowerCase();
//         return p.status === "pending" && proposalEmailLower === userEmailLower;
//       }
//     );

//     if (currentUserPendingProposal) {
//       return next(
//         errorHandler(
//           400,
//           "You already have a pending proposal. Wait for response before proposing another."
//         )
//       );
//     }

//     // ✅ FIX: Check if there's a pending proposal from other party to respond to
//     const otherPartyPendingProposal = dispute.resolution_proposals.find((p) => {
//       const proposalEmailLower = p.proposed_by_email.toLowerCase();
//       return p.status === "pending" && proposalEmailLower !== userEmailLower;
//     });

//     if (otherPartyPendingProposal) {
//       return next(
//         errorHandler(
//           400,
//           "Please respond to the pending proposal before creating a new one"
//         )
//       );
//     }

//     const proposed_by = userEmailLower === buyerEmailLower ? "buyer" : "seller";

//     const newProposal = {
//       proposed_by,
//       proposed_by_email: userEmail,
//       proposal_date: new Date(),
//       proposal_type: "description_only" as const,
//       resolution_description: proposal_description.trim(),
//       proposal_description: proposal_description.trim(),
//       status: "pending" as const,
//     } as IResolutionProposal;

//     dispute.resolution_proposals.push(newProposal);
//     dispute.dispute_status = "resolving";
//     dispute.dispute_resolution_method = "dispute_parties";

//     await dispute.save();

//     // ✅ Send emails to the OTHER party
//     try {
//       const productSummary = dispute.product_name;

//       if (proposed_by === "buyer") {
//         await sendResolutionProposedToSeller(
//           dispute.vendor_email,
//           productSummary,
//           "buyer",
//           dispute.resolution_proposals.length
//         );
//       } else {
//         await sendResolutionProposedToBuyer(
//           dispute.buyer_email,
//           productSummary,
//           "seller",
//           dispute.resolution_proposals.length
//         );
//       }
//     } catch (emailError) {
//       console.error("Error sending proposal emails:", emailError);
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Resolution proposed successfully. Awaiting response.",
//       data: {
//         dispute,
//         proposal_number: dispute.resolution_proposals.length,
//         rejections_remaining: dispute.max_rejections - dispute.rejection_count,
//         dispute_stage: dispute.dispute_stage,
//         next_step: "waiting_for_response",
//         proposed_by: proposed_by,
//       },
//     });
//   } catch (error) {
//     console.error("Error proposing resolution:", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };
/**
 * Propose a resolution - FIXED VERSION
 */
/**
 * Propose a resolution - FIXED VERSION with correct TypeScript interface
 */
/**
 * Propose a resolution - FIXED VERSION with proper TypeScript
 */
export const proposeResolution = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { transaction_id } = req.params;
  const { proposal_description } = req.body;

  validateFormFields({ proposal_description }, next);

  if (!proposal_description?.trim()) {
    return next(errorHandler(400, "Proposal description is required"));
  }

  const userEmail = await getUserEmailFromToken(req);
  if (!userEmail) {
    return next(errorHandler(401, "Authentication required"));
  }

  try {
    const dispute = await ProductDispute.findOne({
      transaction_id,
    });

    if (!dispute) {
      return next(errorHandler(404, "Dispute not found"));
    }

    const userEmailLower = userEmail.toLowerCase();
    const buyerEmailLower = dispute.buyer_email.toLowerCase();
    const vendorEmailLower = dispute.vendor_email.toLowerCase();

    if (
      userEmailLower !== buyerEmailLower &&
      userEmailLower !== vendorEmailLower
    ) {
      return next(errorHandler(403, "Not authorized to propose resolution"));
    }

    if (!["In_Dispute", "resolving"].includes(dispute.dispute_status)) {
      return next(
        errorHandler(
          400,
          `Cannot propose resolution: Dispute status is ${dispute.dispute_status}`,
        ),
      );
    }

    if (dispute.dispute_resolution_method === "mediator") {
      return next(
        errorHandler(400, "Cannot propose: Mediator is handling this dispute"),
      );
    }

    // ✅ FIX: Check for existing pending proposals
    const currentUserPendingProposal = dispute.resolution_proposals.find(
      (p) => {
        const proposalEmailLower = p.proposed_by_email.toLowerCase();
        return p.status === "pending" && proposalEmailLower === userEmailLower;
      },
    );

    if (currentUserPendingProposal) {
      return next(
        errorHandler(
          400,
          "You already have a pending proposal. Wait for response before proposing another.",
        ),
      );
    }

    const otherPartyPendingProposal = dispute.resolution_proposals.find((p) => {
      const proposalEmailLower = p.proposed_by_email.toLowerCase();
      return p.status === "pending" && proposalEmailLower !== userEmailLower;
    });

    if (otherPartyPendingProposal) {
      return next(
        errorHandler(
          400,
          "Please respond to the pending proposal before creating a new one",
        ),
      );
    }

    const proposed_by = userEmailLower === buyerEmailLower ? "buyer" : "seller";

    // ✅ FIX: Use the correct interface that matches your model
    // Based on your model, it should be the simpler version without proposal_type
    const newProposal: IResolutionProposal = {
      proposed_by: proposed_by,
      proposed_by_email: userEmail,
      proposal_date: new Date(),
      proposal_description: proposal_description.trim(),
      status: "pending",
    };

    dispute.resolution_proposals.push(newProposal);
    dispute.dispute_status = "resolving";
    dispute.dispute_resolution_method = "dispute_parties";

    dispute.markModified("resolution_proposals");
    dispute.markModified("dispute_status");
    dispute.markModified("dispute_resolution_method");

    await dispute.save({ validateBeforeSave: true });

    const savedDispute = await ProductDispute.findOne({ transaction_id });

    console.log("✅ PROPOSAL SAVED - VERIFICATION:");
    if (savedDispute) {
      console.log("  - Dispute Status:", savedDispute.dispute_status);
      console.log(
        "  - Total Proposals:",
        savedDispute.resolution_proposals?.length || 0,
      );

      if (
        savedDispute.resolution_proposals &&
        savedDispute.resolution_proposals.length > 0
      ) {
        const latestProposal =
          savedDispute.resolution_proposals[
            savedDispute.resolution_proposals.length - 1
          ];
        console.log("  - Latest Proposal Status:", latestProposal.status);
        console.log(
          "  - Latest Proposal By:",
          latestProposal.proposed_by_email,
        );
      }
    } else {
      console.log("  - ERROR: Could not refetch saved dispute");
    }

    // ✅ FIX: Send email to the OTHER party
    try {
      const productSummary = dispute.product_name;
      const proposalNumber =
        savedDispute?.resolution_proposals?.length ||
        dispute.resolution_proposals.length;

      if (proposed_by === "buyer") {
        // Buyer proposed → Notify SELLER to respond
        await sendResolutionProposedToSeller(
          dispute.vendor_email,
          productSummary,
          "buyer",
          proposalNumber,
        );
        console.log("✅ Email sent to SELLER:", dispute.vendor_email);
      } else {
        // Seller proposed → Notify BUYER to respond
        await sendResolutionProposedToBuyer(
          dispute.buyer_email,
          productSummary,
          "seller",
          proposalNumber,
        );
        console.log("✅ Email sent to BUYER:", dispute.buyer_email);
      }
    } catch (emailError) {
      console.error("❌ Error sending proposal emails:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      status: "success",
      message: "Resolution proposed successfully. Awaiting response.",
      data: {
        dispute: savedDispute || dispute,
        proposal_number:
          savedDispute?.resolution_proposals?.length ||
          dispute.resolution_proposals.length,
        rejections_remaining: dispute.max_rejections - dispute.rejection_count,
        dispute_stage: dispute.dispute_stage,
        dispute_status: savedDispute?.dispute_status || "resolving",
        next_step: "waiting_for_response",
        proposed_by: proposed_by,
        latest_proposal: newProposal,
      },
    });
  } catch (error) {
    console.error("❌ Error proposing resolution:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const respondToResolution = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
        "Response description is required (explain why you're accepting/rejecting)",
      ),
    );
  }

  const userEmail = await getUserEmailFromToken(req);
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

    const userEmailLower = userEmail.toLowerCase();
    const buyerEmailLower = dispute.buyer_email.toLowerCase();
    const vendorEmailLower = dispute.vendor_email.toLowerCase();

    // ✅ FIX: Case-insensitive authorization check
    if (
      userEmailLower !== buyerEmailLower &&
      userEmailLower !== vendorEmailLower
    ) {
      return next(errorHandler(403, "Not authorized to respond"));
    }

    // ✅ FIX: Find pending proposal from the OTHER party with case-insensitive comparison
    const pendingProposal = dispute.resolution_proposals.find((p) => {
      const proposalEmailLower = p.proposed_by_email.toLowerCase();
      return p.status === "pending" && proposalEmailLower !== userEmailLower;
    });

    if (!pendingProposal) {
      return next(
        errorHandler(
          404,
          "No pending resolution proposal found from the other party",
        ),
      );
    }

    const responderRole =
      userEmailLower === buyerEmailLower ? "buyer" : "seller";

    if (action === "accept") {
      // ACCEPT RESOLUTION
      pendingProposal.status = "accepted";
      pendingProposal.responded_by = userEmail;
      pendingProposal.response_date = new Date();
      pendingProposal.response_description = response_description.trim();

      dispute.dispute_status = "resolved";
      dispute.resolved_at = new Date();
      dispute.resolution_summary = `Resolved by mutual agreement. Proposal ${dispute.resolution_proposals.length} accepted by ${responderRole}.`;

      // Update transaction's dispute_status flag
      await ProductTransaction.findOneAndUpdate(
        { transaction_id },
        { $set: { dispute_status: "resolved" } },
        { new: true },
      );

      await dispute.save();

      try {
        await Promise.all([
          sendResolutionAcceptedMailToBuyer(
            dispute.buyer_email,
            dispute.product_name,
          ),
          sendResolutionAcceptedMailToSeller(
            dispute.vendor_email,
            dispute.product_name,
          ),
        ]);
      } catch (emailError) {
        console.error("Error sending acceptance emails:", emailError);
      }

      res.status(200).json({
        status: "success",
        message: "Resolution accepted. Dispute resolved successfully!",
        data: {
          dispute,
          resolved_by: responderRole,
        },
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

        try {
          await Promise.all([
            sendAutoEscalationMailToBuyer(
              dispute.buyer_email,
              dispute.product_name,
              dispute.rejection_count,
            ),
            sendAutoEscalationMailToSeller(
              dispute.vendor_email,
              dispute.product_name,
              dispute.rejection_count,
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
            rejected_by: responderRole,
          },
        });
      } else {
        dispute.dispute_status = "resolving";
        await dispute.save();

        try {
          await Promise.all([
            sendResolutionRejectedToBuyer(
              dispute.buyer_email,
              dispute.product_name,
              responderRole,
              dispute.rejection_count,
              dispute.max_rejections,
            ),
            sendResolutionRejectedToSeller(
              dispute.vendor_email,
              dispute.product_name,
              responderRole,
              dispute.rejection_count,
              dispute.max_rejections,
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
            current_status: "resolving",
            rejected_by: responderRole,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error responding to resolution:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const getDisputeDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { transaction_id } = req.params;

    const dispute = await ProductDispute.findOne({ transaction_id }).populate(
      "transaction user mediator",
    );

    if (!dispute) {
      return next(errorHandler(404, "Dispute not found"));
    }

    const userEmail = await getUserEmailFromToken(req);

    if (!userEmail) {
      return next(errorHandler(401, "Authentication required"));
    }

    // ✅ FIX: Proper user role determination
    const userEmailLower = userEmail.toLowerCase();
    const buyerEmailLower = dispute.buyer_email.toLowerCase();
    const vendorEmailLower = dispute.vendor_email.toLowerCase();

    const isBuyer = userEmailLower === buyerEmailLower;
    const isSeller = userEmailLower === vendorEmailLower;

    if (!isBuyer && !isSeller) {
      return next(errorHandler(403, "Not authorized to view this dispute"));
    }

    const userRole = isBuyer ? "buyer" : "seller";

    console.log("🔍 BACKEND DEBUG - Proposal Detection:", {
      userEmail,
      userRole,
      totalProposals: dispute.resolution_proposals.length,
      allProposals: dispute.resolution_proposals.map((p) => ({
        proposed_by: p.proposed_by,
        proposed_by_email: p.proposed_by_email,
        status: p.status,
        isCurrentUser: p.proposed_by_email.toLowerCase() === userEmailLower,
      })),
    });

    // ✅ FIX: Find pending proposal that the CURRENT USER should respond to
    // (proposals from the OTHER party that are pending)
    const pendingProposalForCurrentUser = dispute.resolution_proposals.find(
      (proposal) => {
        const proposalEmailLower = proposal.proposed_by_email.toLowerCase();
        const isFromOtherParty = proposalEmailLower !== userEmailLower;
        const isPending = proposal.status === "pending";

        return isFromOtherParty && isPending;
      },
    );

    // ✅ FIX: Check if current user has a pending proposal (waiting for response)
    const currentUserPendingProposal = dispute.resolution_proposals.find(
      (proposal) => {
        const proposalEmailLower = proposal.proposed_by_email.toLowerCase();
        const isFromCurrentUser = proposalEmailLower === userEmailLower;
        const isPending = proposal.status === "pending";

        return isFromCurrentUser && isPending;
      },
    );

    console.log("🔍 BACKEND DEBUG - Proposal Results:", {
      pendingProposalForCurrentUser: pendingProposalForCurrentUser
        ? {
            proposed_by: pendingProposalForCurrentUser.proposed_by,
            proposed_by_email: pendingProposalForCurrentUser.proposed_by_email,
            status: pendingProposalForCurrentUser.status,
          }
        : null,
      currentUserPendingProposal: currentUserPendingProposal
        ? {
            proposed_by: currentUserPendingProposal.proposed_by,
            proposed_by_email: currentUserPendingProposal.proposed_by_email,
            status: currentUserPendingProposal.status,
          }
        : null,
    });

    // ✅ FIX: Better permission determination
    const canPropose =
      (dispute.dispute_status === "In_Dispute" ||
        dispute.dispute_status === "resolving") &&
      dispute.dispute_resolution_method !== "mediator" &&
      !currentUserPendingProposal && // Can't propose if already waiting for response
      !pendingProposalForCurrentUser; // Can't propose if need to respond first

    const canRespond = !!pendingProposalForCurrentUser;

    const canRequestMediator =
      !["resolved", "cancelled", "escalated_to_mediator"].includes(
        dispute.dispute_status,
      ) && dispute.dispute_resolution_method !== "mediator";

    const canCancelDispute =
      !["resolved", "cancelled"].includes(dispute.dispute_status) &&
      dispute.dispute_resolution_method !== "mediator";

    // ✅ FIX: Add detailed status information for frontend
    const statusInfo = {
      dispute_status: dispute.dispute_status,
      is_mediator_involved: dispute.dispute_resolution_method === "mediator",
      has_pending_proposal: !!pendingProposalForCurrentUser,
      has_user_pending_proposal: !!currentUserPendingProposal,
      rejection_count: dispute.rejection_count,
      max_rejections: dispute.max_rejections,
      rejections_remaining: dispute.max_rejections - dispute.rejection_count,
    };

    res.status(200).json({
      status: "success",
      message: "Dispute details fetched successfully",
      data: {
        dispute,
        resolution_history: dispute.resolution_proposals,
        dispute_stage: dispute.dispute_stage,
        transaction_state: dispute.transaction_state_snapshot,

        // ✅ User identification
        user_email: userEmail,
        user_role: userRole,
        is_buyer: isBuyer,
        is_seller: isSeller,

        // ✅ Action permissions
        can_propose: canPropose,
        can_respond: canRespond,
        can_request_mediator: canRequestMediator,
        can_cancel_dispute: canCancelDispute,

        // ✅ Proposal context
        pending_proposal_for_user: pendingProposalForCurrentUser || null,
        current_user_pending_proposal: currentUserPendingProposal || null,

        // ✅ Status information
        status_info: statusInfo,
      },
    });
  } catch (error) {
    console.error("Error fetching dispute details:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};
