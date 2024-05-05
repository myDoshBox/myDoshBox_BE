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
const organizationAuth_route_1 = __importDefault(require("./modules/authentication/organizationUserAuth/organizationUser/organizationAuth.route"));
const individualAuth_route_1 = __importDefault(require("./modules/authentication/individualUserAuth/individualUser/individualAuth.route"));
const googleOrganizationUserAuth_route_1 = __importDefault(require("./modules/authentication/organizationUserAuth/googleOrganizationUser/googleOrganizationUserAuth.route"));
const googleIndividualUserAuth_route_1 = __importDefault(require("./modules/authentication/individualUserAuth/googleIndividualUser/googleIndividualUserAuth.route"));
const errorHandler_util_1 = require("./utilities/errorHandler.util");
const devSwagger_1 = require("./devSwagger");
const deserializeUser_middleware_1 = __importDefault(require("./middlewares/deserializeUser.middleware"));
const protectRoutes_middleware_1 = __importDefault(require("./middlewares/protectRoutes.middleware"));
const individualUsers_route_1 = __importDefault(require("./modules/users/individualUsers/individualUsers.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use(deserializeUser_middleware_1.default);
app.use((0, cors_1.default)({
    origin: "*",
    credentials: false,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    return res.json({ msg: "welcome to doshbox api test" });
});
app.use("/auth/organization", organizationAuth_route_1.default);
app.use("/auth/individual", individualAuth_route_1.default);
app.use("/auth/organization", googleOrganizationUserAuth_route_1.default);
app.use("/auth/individual", googleIndividualUserAuth_route_1.default);
app.use("/user", protectRoutes_middleware_1.default, individualUsers_route_1.default);
app.use(errorHandler_util_1.errorHandler);
//
// const swaggerDocumentOne = require("./swagger-one.json");
// const swaggerDocumentTwo = require("./swagger-two.json");
// var options = {};
// app.use(
//   "/api-docs-one",
//   swaggerUi.serveFiles(swaggerDocumentOne, options),
//   swaggerUi.setup(swaggerDocumentOne)
// );
// app.use(
//   "/api-docs-two",
//   swaggerUi.serveFiles(swaggerDocumentTwo, options),
//   swaggerUi.setup(swaggerDocumentTwo)
// );
//
// let options = {};
const spec = (0, swagger_jsdoc_1.default)(devSwagger_1.options);
// const prodSpec = swaggerJSDOC(prodOptions);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(spec));
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(prodSpec));
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
