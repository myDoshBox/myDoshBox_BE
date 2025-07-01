import { Request, Response, NextFunction } from "express";
import { validateFormFields } from "../../utilities/validation.utilities";
import MediatorModel, { IMediator } from "./mediator.model";
import { errorHandler } from "../../middlewares/errorHandling.middleware";
import { sendMediatorLoginDetailsMail } from "./mediator.mail";
import bcrypt from "bcrypt";
import { createSessionAndSendTokens } from "../../utilities/createSessionAndSendToken.util";
import {
  GetAllDisputeForAMediatorParams,
  GetAllDisputeForAMediatorResponse,
  MediatorLoginBody,
  MediatorLoginResponse,
} from "./mediator.interface";
import ProductDispute from "../disputes/productsDispute/productDispute.model";

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
        errorHandler(204, "Mediator already exist, please proceed to login")
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

    res.json({
      // addNewMediatorToSystem,
      status: "success",
      message: "Mediator has been added successfully and a mail sent",
    });
  } catch (error: unknown) {
    console.error("Error adding mediator: ", error);
    return next(errorHandler(500, "Internal server error"));
  }
};

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
      return next(errorHandler(401, "Invalid email or password"));
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

export const involveAMediator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

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
export const resolveDispute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
