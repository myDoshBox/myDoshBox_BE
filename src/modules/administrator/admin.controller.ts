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

// this works but its not returning any response in its body
export const onboardAMediator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    first_name,
    middle_name,
    last_name,
    mediator_email,
    mediator_phone_number,
    password,
  } = req.body;

  validateFormFields(
    {
      first_name,
      // middle_name,
      last_name,
      mediator_email,
      // mediator_phone_number,
      password,
    },
    next
  );

  try {
    // check if mediator exist
    const findMediator = await MediatorModel.findOne({
      mediator_email: mediator_email,
    });
    // console.log(findMediator);

    if (findMediator) {
      return next(
        errorHandler(400, "Mediator already exist, please proceed to login")
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    // console.log(hashedPassword);

    const addNewMediatorToSystem = new MediatorModel({
      first_name,
      // middle_name,
      last_name,
      mediator_email,
      mediator_phone_number,
      password: hashedPassword,
    });

    await addNewMediatorToSystem.save();

    await sendMediatorLoginDetailsMail(first_name, mediator_email, password);

    res.status(200).json({
      // addNewMediatorToSystem,
      status: "success",
      message: "Mediator has been added successfully and a mail sent",
    });
  } catch (error: unknown) {
    console.error("Error adding mediator: ", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

export const getAllMediators = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const fetchAllMediators = await MediatorModel.find()
    .select("-password")
    .sort({ createdAt: -1 });

  if (fetchAllMediators?.length === 0) {
    return next(errorHandler(404, "no mediators present in the system"));
  } else {
    res.json({
      fetchAllMediators,
      status: "success",
      message: "All mediators fetched successfully",
    });
  }
};
