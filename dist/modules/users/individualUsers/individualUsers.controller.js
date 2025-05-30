"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIndividualUser = exports.getIndividualUser = void 0;
const individualUserAuth_model1_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model1"));
const organizationAuth_model_1 = __importDefault(require("../../authentication/organizationUserAuth/organizationAuth.model"));
/** GET: http://localhost:5000/users/user/:user_id */
const getIndividualUser = async (req, res) => {
    // console.log(res.locals.user);
    return res.status(200).json({
        status: true,
        message: "Logged in user profile",
        data: res.locals.user,
    });
};
exports.getIndividualUser = getIndividualUser;
/** GET: http://localhost:5000/users */
// export const getAllIndividualUsers = async (req: Request, res: Response) => {};
//  * @param: {
//  * "id": "<userid>"
//  * }
//  *
//  * body: {
//  * "email": "kor@gmail.com",
//  * "phonenum": "1232455",
//  * "username": "jane doe",
//  * "fullname": "Ada Jones"
//  * }
//  */
/** PUT: http://localhost:5000/users/updateuser
 * @param: {
 * "id": "<userid>"
 * }
 *
 * body: {
 * "email": "kor@gmail.com",
 * "phonenum": "1232455",
 * "username": "jane doe",
 * "fullname": "Ada Jones"
 * }
 */
const updateIndividualUser = async (req, res) => {
    const { userData } = res.locals.user;
    const { phone_number, name, contact_email, contact_number } = req.body;
    if (userData.role === "ind") {
        const updatedUser = await individualUserAuth_model1_1.default.findOneAndUpdate({ email: userData.email }, { name, phone_number });
        return res.status(200).json({
            message: "Individual user sucessfully updated",
            updatedUser,
        });
    }
    else if (userData.role === "org") {
        const updatedUser = await organizationAuth_model_1.default.findOneAndUpdate({ organization_email: userData.organization_email }, { contact_email, contact_number }, { new: true });
        return res.status(200).json({
            message: "Organization user sucessfully updated",
            updatedUser,
        });
    }
};
exports.updateIndividualUser = updateIndividualUser;
/** DELETE: http://localhost:5000/users/deleteuser */
// export const deleteIndividualUser = async (req: Request, res: Response) => {};
