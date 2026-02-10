import { Request, Response, NextFunction } from "express";
import { validateFormFields } from "../../utilities/validation.utilities";
import MediatorModel, { IMediator } from "../mediator/mediator.model";
import { errorHandler } from "../../middlewares/errorHandling.middleware";
import {
  sendMediatorInvolvementMailToMediator,
  sendMediatorLoginDetailsMail,
  sendResolutionMailToBuyer,
  sendResolutionMailToSeller,
} from "../mediator/mediator.mail";
import bcrypt from "bcrypt";
import { bulkSyncToAnalytics } from "./Analytics/analyticsSync.utils";

/**
 * Onboard a new mediator to the system
 * Only accessible by admin users
 */
export const onboardAMediator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    first_name,
    middle_name,
    last_name,
    mediator_email,
    mediator_phone_number,
    password,
  } = req.body;

  // Log which admin is performing this action
  console.log(
    `Admin ${req.user?.email} is onboarding mediator: ${mediator_email}`,
  );

  validateFormFields(
    {
      first_name,
      last_name,
      mediator_email,
      password,
    },
    next,
  );

  try {
    // Check if mediator already exists
    const findMediator = await MediatorModel.findOne({
      mediator_email: mediator_email,
    });

    if (findMediator) {
      return next(
        errorHandler(400, "Mediator already exist, please proceed to login"),
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new mediator
    const addNewMediatorToSystem = new MediatorModel({
      first_name,
      middle_name,
      last_name,
      mediator_email,
      mediator_phone_number,
      password: hashedPassword,
      onboarded_by: req.user?.id, // Track which admin onboarded this mediator
    });

    await addNewMediatorToSystem.save();

    // Send login credentials email
    await sendMediatorLoginDetailsMail(first_name, mediator_email, password);

    res.status(201).json({
      status: "success",
      message: "Mediator has been added successfully and a mail sent",
      data: {
        mediator: {
          id: addNewMediatorToSystem._id,
          first_name: addNewMediatorToSystem.first_name,
          last_name: addNewMediatorToSystem.last_name,
          email: addNewMediatorToSystem.mediator_email,
          phone_number: addNewMediatorToSystem.mediator_phone_number,
        },
        onboarded_by: req.user?.email,
      },
    });
  } catch (error: unknown) {
    console.error("Error adding mediator: ", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const getAllMediators = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log(`Admin ${req.user?.email} is fetching all mediators`);

    const fetchAllMediators = await MediatorModel.find()
      .select("-password")
      .sort({ createdAt: -1 });

    if (fetchAllMediators?.length === 0) {
      return next(errorHandler(404, "No mediators present in the system"));
    }

    res.status(200).json({
      status: "success",
      message: "All mediators fetched successfully",
      results: fetchAllMediators.length,
      data: {
        mediators: fetchAllMediators,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching mediators: ", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const getMediatorById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { mediatorId } = req.params;

    const mediator =
      await MediatorModel.findById(mediatorId).select("-password");

    if (!mediator) {
      return next(errorHandler(404, "Mediator not found"));
    }

    res.status(200).json({
      status: "success",
      message: "Mediator fetched successfully",
      data: {
        mediator,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching mediator: ", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const updateMediator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { mediatorId } = req.params;

    console.log("📦 Received body:", req.body);
    console.log("🔑 Body keys:", Object.keys(req.body || {}));

    const updateData = req.body || {};

    // Prevent password updates through this endpoint
    if ("password" in updateData) {
      delete updateData.password;
    }

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return next(errorHandler(400, "No update data provided"));
    }

    const updatedMediator = await MediatorModel.findByIdAndUpdate(
      mediatorId,
      updateData,
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedMediator) {
      return next(errorHandler(404, "Mediator not found"));
    }

    res.status(200).json({
      status: "success",
      message: "Mediator updated successfully",
      data: {
        mediator: updatedMediator,
      },
    });
  } catch (error: unknown) {
    console.error("Error updating mediator: ", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const deleteMediator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { mediatorId } = req.params;

    const mediator = await MediatorModel.findByIdAndDelete(mediatorId);

    if (!mediator) {
      return next(errorHandler(404, "Mediator not found"));
    }

    console.log(
      `Admin ${req.user?.email} deleted mediator: ${mediator.mediator_email}`,
    );

    res.status(200).json({
      status: "success",
      message: "Mediator deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting mediator: ", error);
    return next(errorHandler(500, "Internal server error"));
  }
};
