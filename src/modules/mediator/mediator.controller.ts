import { Request, Response, NextFunction } from "express";
import { validateFormFields } from "../../utilities/validation.utilities";
import MediatorModel, { IMediator } from "./mediator.model";
import { errorHandler } from "../../middlewares/errorHandling.middleware";
import {
  sendMediatorInvolvementMailToMediator,
  sendMediatorLoginDetailsMail,
  sendResolutionMailToBuyer,
  sendResolutionMailToSeller,
} from "./mediator.mail";
import bcrypt from "bcrypt";
import { createSessionAndSendTokens } from "../../utilities/createSessionAndSendToken.util";
import {
  GetAllDisputeForAMediatorParams,
  GetAllDisputeForAMediatorResponse,
  MediatorLoginBody,
  MediatorLoginResponse,
  InvolveAMediatorParams,
  InvolveAMediatorResponse,
  ResolveDisputeParams,
  ResolveDisputeBody,
  ResolveDisputeResponse,
} from "./mediator.interface";
import ProductDispute from "../disputes/productsDispute/productDispute.model";
// import ProductResolution from "../disputes/productsDispute/productResolution.model";
import {
  sendMediatorInvolvementMailToBuyer,
  sendMediatorInvolvementMailToSeller,
} from "../disputes/productsDispute/productDispute.mail";

// move unboard and get all mediator to admin module//

// this works but its not returning any response in its body
// export const onboardAMediator = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const {
//     first_name,
//     middle_name,
//     last_name,
//     mediator_email,
//     mediator_phone_number,
//     password,
//   } = req.body;

//   validateFormFields(
//     {
//       first_name,
//       // middle_name,
//       last_name,
//       mediator_email,
//       // mediator_phone_number,
//       password,
//     },
//     next
//   );

//   try {
//     // check if mediator exist
//     const findMediator = await MediatorModel.findOne({
//       mediator_email: mediator_email,
//     });
//     // console.log(findMediator);

//     if (findMediator) {
//       return next(
//         errorHandler(400, "Mediator already exist, please proceed to login")
//       );
//     }

//     const hashedPassword = bcrypt.hashSync(password, 10);
//     // console.log(hashedPassword);

//     const addNewMediatorToSystem = new MediatorModel({
//       first_name,
//       // middle_name,
//       last_name,
//       mediator_email,
//       mediator_phone_number,
//       password: hashedPassword,
//     });

//     await addNewMediatorToSystem.save();

//     await sendMediatorLoginDetailsMail(first_name, mediator_email, password);

//     res.status(200).json({
//       // addNewMediatorToSystem,
//       status: "success",
//       message: "Mediator has been added successfully and a mail sent",
//     });
//   } catch (error: unknown) {
//     console.error("Error adding mediator: ", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };
// export const getAllMediators = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const fetchAllMediators = await MediatorModel.find()
//     .select("-password")
//     .sort({ createdAt: -1 });

//   if (fetchAllMediators?.length === 0) {
//     return next(errorHandler(404, "no mediators present in the system"));
//   } else {
//     res.json({
//       fetchAllMediators,
//       status: "success",
//       message: "All mediators fetched successfully",
//     });
//   }
// };

export const mediatorLogin = async (
  req: Request<{}, {}, MediatorLoginBody>,
  res: Response<MediatorLoginResponse>,
  next: NextFunction
): Promise<void> => {
  const { mediator_email, password } = req.body;

  validateFormFields(
    {
      mediator_email,
      password,
    },
    next
  );

  try {
    const mediatorToLogin = await MediatorModel.findOne({
      mediator_email,
    }).select("+password");

    if (!mediatorToLogin) {
      return next(errorHandler(401, "Invalid email"));
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      mediatorToLogin?.password
    );

    if (!isPasswordValid) {
      return next(errorHandler(401, "invalid password"));
    }

    const { password: _, ...mediatorWithoutPassword } =
      mediatorToLogin.toObject();

    const sessionResponse = await createSessionAndSendTokens({
      user: mediatorWithoutPassword,
      userAgent: req.get("user-agent") || "",
      role: "mediator",
      message: "Mediator successfully logged in",
    });

    res.status(200).json({
      status: sessionResponse.status,
      message: sessionResponse.message,
      user: sessionResponse.user,
      accessToken: sessionResponse.accessToken,
      refreshToken: sessionResponse.refreshToken,
    });
  } catch (error: unknown) {
    console.error("Error logging in: ", error);
    return next(errorHandler(500, "Internal server error"));
  }

  // You can now use mediatorWithoutPassword as needed
};

export const involveAMediator = async (
  req: Request<InvolveAMediatorParams>,
  res: Response<InvolveAMediatorResponse>,
  next: NextFunction
) => {
  const { transaction_id } = req.params;

  if (!transaction_id) {
    return next(errorHandler(400, "Transaction ID is required"));
  }

  try {
    const dispute = await ProductDispute.findOne({ transaction_id }).populate(
      "transaction user mediator"
    );

    if (!dispute) {
      return next(errorHandler(400, "Dispute not found"));
    }

    if (
      dispute?.dispute_status === "resolved" ||
      dispute?.dispute_status === "cancelled"
    ) {
      return next(
        errorHandler(
          400,
          `Cannot involve a mediator: Dispute is ${dispute?.dispute_status}`
        )
      );
    }

    // Check if a mediator is already assigned
    let currentMediator: IMediator | null = null;
    let needsReassignment = false;

    if (dispute?.mediator) {
      // Fetch the current mediator's open disputes

      // currentMediator = await MediatorModel.findById(dispute?.mediator)
      //   .select("-password")
      //   .populate({
      //     path: "disputes",
      //     match: { dispute_status: { $in: ["processing", "resolving"] } },
      //   });

      // if (currentMediator && (currentMediator.dispute?.length || 0) >= 5) {
      //   needsReassignment = true;
      // }

      return next(
        errorHandler(400, "A mediator is already assigned to this dispute")
      );
    }

    // find a mediator with fewer than 5 open disputes
    const mediators = await MediatorModel.find()
      .select("-password")
      .populate({
        path: "disputes",
        match: { dispute_status: { $in: ["processing", "resolving"] } },
      });

    // const availableMediator = mediators.find(
    //   (mediator: IMediator) =>
    //     (mediator.dispute?.length || 0) < 5 &&
    //     (mediator?._id as string).toString() !== dispute.mediator?.toString()
    // );
    const availableMediator = mediators.find(
      (mediator: IMediator) =>
        (mediator.dispute?.length || 0) < 5 &&
        (mediator?._id as string).toString() !== dispute.mediator?.toString() &&
        mediator.mediator_email !== dispute.buyer_email &&
        mediator.mediator_email !== dispute.vendor_email
    );

    // find a mediator with fewer than 5 open disputes
    // const availableMediator = mediators.find(
    //   (mediator: IMediator) =>
    //     (mediator?.dispute?.length || 0) < 5 &&
    //     mediator?._id !== dispute?.mediator
    // );

    if (!availableMediator) {
      return next(
        errorHandler(
          404,
          "No available mediators with fewer than 5 open disputes"
        )
      );
    }

    // Update ProductDispute with mediator and resolution method
    // const updatedDispute = await ProductDispute.findOneAndUpdate(
    //   { _id: dispute?._id },

    //   {
    //     $set: {
    //       mediator: availableMediator?._id,
    //       dispute_resolution_method: "mediator",
    //       dispute_status: "resolving",
    //     },
    //   },

    //   { new: true, runValidators: true }
    // ).populate("transaction user mediator");

    const updatedDispute = await ProductDispute.findByIdAndUpdate(
      { _id: dispute?._id },

      {
        $set: {
          mediator: availableMediator?._id,
          dispute_resolution_method: "mediator",
          dispute_status: "resolving",
        },
      },

      { new: true, runValidators: true }
    ).populate("transaction user mediator");

    if (!updatedDispute) {
      return next(errorHandler(500, "Failed to update dispute with mediator"));
    }

    // Update Mediator with the dispute
    // const updatedMediator = await MediatorModel.findByIdAndUpdate(
    //   availableMediator?._id,
    //   { $addToSet: { disputes: dispute?._id } },
    //   { new: true, runValidators: true }
    // ).select("-password");

    // if (!updatedMediator) {
    //   return next(errorHandler(500, "Failed to update mediator with dispute"));
    // }
    const updatedMediator = await MediatorModel.findByIdAndUpdate(
      availableMediator._id,
      { $addToSet: { disputes: dispute._id } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedMediator) {
      return next(errorHandler(500, "Failed to update mediator with dispute"));
    }

    // Create a ProductResolution document
    // const newResolution = new ProductResolution({
    //   dispute: dispute?._id,
    //   dispute_id: dispute?.transaction_id,
    //   resolution_description: "Mediation initiated for dispute",
    //   resolution_status: "processing",
    // });

    // await newResolution.save();

    // send email to mediator
    let mediator_email = updatedMediator?.mediator_email;
    let mediator_first_name = updatedMediator?.first_name;
    let buyer_email = updatedDispute?.buyer_email;
    let vendor_email = updatedDispute?.vendor_email;
    let product_name = updatedDispute?.product_name;

    // Send emails
    try {
      await Promise.all([
        sendMediatorInvolvementMailToMediator(
          mediator_email,
          mediator_first_name
        ),
        sendMediatorInvolvementMailToBuyer(buyer_email, product_name),
        sendMediatorInvolvementMailToSeller(vendor_email, product_name),
      ]);
      console.log("Emails sent to mediator, buyer, and seller");
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Continue despite email failure
    }

    res.status(200).json({
      status: "success",
      message: "Mediator assigned to dispute successfully",
      data: {
        dispute: updatedDispute,
        mediator: updatedMediator.toObject(),
      },
    });
  } catch (error: unknown) {
    console.error("Error involving mediator:", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const getAllDisputeForAMediator = async (
  req: Request<GetAllDisputeForAMediatorParams>,
  res: Response<GetAllDisputeForAMediatorResponse>,
  next: NextFunction
): Promise<void> => {
  const { mediator_email } = req.params;

  // Find mediator by email
  const mediator = await MediatorModel.findOne({ mediator_email }).select(
    "-password"
  );
  console.log("Found Mediator:", mediator);

  if (!mediator) {
    return next(errorHandler(404, "Mediator not found"));
  }

  // Find all disputes assigned to the mediator
  const disputes = await ProductDispute.find({ mediator: mediator._id })
    .sort({ createdAt: -1 })
    .populate("transaction user"); // Populate transaction and user details

  console.log("Found Disputes:", disputes);

  if (disputes.length === 0) {
    return next(errorHandler(404, "No disputes assigned to this mediator"));
  }

  // Convert mediator to plain object to ensure password is excluded
  const mediatorWithoutPassword = mediator.toObject();

  res.status(200).json({
    status: "success",
    message: "Disputes fetched successfully for mediator",
    data: {
      mediator: mediatorWithoutPassword,
      disputes,
    },
  });
};

// to resolve a dispute, you have to fetch all the details of the transaction in dispute such as the transaction_id, buyer_email, vendor_email, product_name, product_image, reason_for_dispute, dispute_description, and dispute_status

// trigger mails for both buyers and sellers after the dispute is resolved
// and then update the dispute status to resolved
// and then update the transaction status to completed
export const mediatorResolveDispute = async (
  req: Request<ResolveDisputeParams, {}, ResolveDisputeBody>,
  res: Response<ResolveDisputeResponse>,
  next: NextFunction
): Promise<void> => {
  const { transaction_id } = req.params;
  const { dispute_fault, resolution_description } = req.body;

  if (!transaction_id) {
    return next(errorHandler(400, "Transaction ID is required"));
  }

  if (!dispute_fault || !["buyer", "seller"].includes(dispute_fault)) {
    return next(errorHandler(400, "Fault must be either a buyer or seller"));
  }

  if (!resolution_description) {
    return next(errorHandler(400, "Resolution description must be provided"));
  }

  try {
    const dispute = await ProductDispute.findOne({ transaction_id }).populate(
      "transaction user mediator"
    );

    if (!dispute) {
      return next(errorHandler(400, "dispute not raised for this transaction"));
    }

    if (!dispute?.mediator) {
      return next(
        errorHandler(400, "No mediator has been assigned to this dispute")
      );
    }

    if (dispute?.dispute_status !== "resolving") {
      return next(
        errorHandler(
          400,
          `Cannot resolve dispute as it is in ${dispute?.dispute_status}`
        )
      );
    }

    const updatedDispute = await ProductDispute.findByIdAndUpdate(
      dispute?._id,
      {
        $set: {
          dispute_status: "resolved",
          dispute_fault,
          resolution_description,
        },
      },
      { new: true, runValidators: true }
    ).populate("transaction user mediator");

    if (!updatedDispute) {
      return next(errorHandler(400, "dispute not resolved successfully"));
    }

    let buyer_email = updatedDispute?.buyer_email;
    let vendor_email = updatedDispute?.vendor_email;
    let product_name = updatedDispute?.product_name;
    let resolution_description_result = updatedDispute?.resolution_description;
    let dispute_fault_result = updatedDispute?.dispute_fault;

    await Promise.all([
      sendResolutionMailToBuyer(
        buyer_email,
        product_name,
        resolution_description_result,
        dispute_fault_result
      ),

      sendResolutionMailToSeller(
        vendor_email,
        product_name,
        resolution_description_result,
        dispute_fault_result
      ),
    ]);

    res.status(200).json({
      status: "success",
      message: "Dispute resolved successfully",
      data: {
        dispute: updatedDispute,
      },
    });
  } catch (error: unknown) {
    console.error("Error resolving dispute", error);
    return next(errorHandler(500, "Internal Server Error"));
  }
};
