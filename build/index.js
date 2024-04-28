"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const dbconn_config_1 = __importDefault(require("./config/dbconn.config"));
const organizationAuth_route_1 = __importDefault(require("./modules/authentication/organizationUserAuth/organizationAuth.route"));
const individualAuth_route_1 = __importDefault(require("./modules/authentication/individualUserAuth/individualAuth.route"));
const googleOrganizationUserAuth_route_1 = __importDefault(require("./modules/authentication/organizationUserAuth/googleOrganizationUserAuth.route"));
const googleIndividualUserAuth_route_1 = __importDefault(require("./modules/authentication/individualUserAuth/googleIndividualUserAuth.route"));
const errorHandler_util_1 = require("./utilities/errorHandler.util");
const swagger_1 = require("./swagger");
const deserializeUser_middleware_1 = __importDefault(require("./middlewares/deserializeUser.middleware"));
const protectRoutes_middleware_1 = __importDefault(require("./middlewares/protectRoutes.middleware"));
const individualUsers_route_1 = __importDefault(require("./modules/users/individualUsers/individualUsers.route"));
// const swaggerJsDoc = require("swagger-jsdoc")
// const swaggerUi = require('swagger-ui-express')
// import { options } from "./modules/authentication/individualUserAuth/individualAuthSwagger";
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use(deserializeUser_middleware_1.default);
//import organizationRoute from './modules/authentication/organizationUserAuth/individualAuth.route'
//import individualRoute from './modules/authentication/individualUserAuth/individualAuth.route';
app.use((0, cors_1.default)({
    origin: "*",
    credentials: false,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    return res.json({ msg: "welcome to doshbox api production" });
});
app.use("/organization", organizationAuth_route_1.default);
app.use("/api/individual", individualAuth_route_1.default);
app.use("/api/auth/org", googleOrganizationUserAuth_route_1.default);
app.use("/api/auth/ind", googleIndividualUserAuth_route_1.default);
app.use("/api/user", protectRoutes_middleware_1.default, individualUsers_route_1.default);
app.use(errorHandler_util_1.errorHandler);
const spec = (0, swagger_jsdoc_1.default)(swagger_1.options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(spec));
app.get("/api/me", protectRoutes_middleware_1.default, (req, res) => {
    console.log(`Logged in user: ${res.locals.user}`);
    return res.status(200).json({
        message: "Logged in user profile",
        data: res.locals.user,
    });
});
// =======
// const swaggerUiSetup = swaggerUi.setup(specs);
// app.use("/api-docs", swaggerUi.serve, swaggerUiSetup);
const PORT = process.env.PORT;
(0, dbconn_config_1.default)()
    .then(() => {
    try {
        console.log("connected to mongoose");
        app.listen(PORT, () => {
            console.log(`server is running on http://localhost:${PORT}`);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        throw new Error(error);
    }
})
    .catch((error) => {
    throw new Error(error);
});
// app.listen(`${PORT}`, () =>{
//     console.log(`listening on port ${PORT}`);
// })
