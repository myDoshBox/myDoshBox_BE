"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const individualUserAuth_model1_1 = __importDefault(require("../modules/authentication/individualUserAuth/individualUserAuth.model1"));
const organizationAuth_model_1 = __importDefault(require("../modules/authentication/organizationUserAuth/organizationAuth.model"));
const protectRoutes = async (req, res, next) => {
    const user = res.locals.user;
    if (!user) {
        return res.sendStatus(403);
    }
    try {
        const userExists = user.role === "ind" || user.role === "g-ind"
            ? await individualUserAuth_model1_1.default.findOne({ email: user.userData.email })
            : await organizationAuth_model_1.default.findOne({
                organization_email: user.userData.organization_email,
            });
        if (!userExists)
            return res.status(403).json({
                message: "User does not exist",
            });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        return res.status(500).json({
            message: error === null || error === void 0 ? void 0 : error.message,
        });
    }
    return next();
};
exports.default = protectRoutes;
