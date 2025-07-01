"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mediator_controller_1 = require("./mediator.controller");
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";
const mediatorRouter = (0, express_1.Router)();
// we need a middleware that checks if you should be in here
mediatorRouter.route("/onboard-mediator").post(mediator_controller_1.onboardAMediator);
mediatorRouter.route("/mediator-login").post(mediator_controller_1.mediatorLogin);
mediatorRouter.route("/fetch-all-mediators").get(mediator_controller_1.getAllMediators);
mediatorRouter.route("/involve-a-mediator/:dispute_id").put(mediator_controller_1.involveAMediator);
mediatorRouter
    .route("/fetch-all-mediator-dispute/:mediator_email")
    .get(mediator_controller_1.getAllDisputeForAMediator);
exports.default = mediatorRouter;
