"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dbconn_config_1 = __importDefault(require("./config/dbconn.config"));
const organizationAuth_route_1 = __importDefault(require("./modules/authentication/organizationUserAuth/organizationAuth.route"));
const googleOrganizationUserAuth_route_1 = __importDefault(require("./modules/authentication/organizationUserAuth/googleOrganizationUserAuth.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.get("/", (req, res) => {
    return res.json({ msg: "welcome to doshbox api" });
});
app.use("/api/organization", organizationAuth_route_1.default);
app.use("/auth", googleOrganizationUserAuth_route_1.default);
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
