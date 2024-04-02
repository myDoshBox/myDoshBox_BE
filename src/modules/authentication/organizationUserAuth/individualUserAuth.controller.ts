import oranizationUserModel from "./oranizationUserModel";
import { Request, Response } from "express";


export const organizationRegister = async (req: Request, res: Response): Promise<Response> => {
    const { email, password, phone } = req.body;
    const organizationExist = await oranizationUserModel.findOne({ email });
    if (organizationExist) return res.status(400).json({ message: "Organization already exists!" });

    const organization = new oranizationUserModel({ name, email, password, phone });
    await organization.save();
    return res.json({ message: "Organization registration successful" });
};

