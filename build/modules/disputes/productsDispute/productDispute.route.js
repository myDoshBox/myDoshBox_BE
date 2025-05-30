"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productDispute_controller_1 = require("./productDispute.controller");
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";
const escrowProductDisputeRouter = express_1.Router();
// we need a middleware that checks if you should be in here
escrowProductDisputeRouter
    .route("/raise-dispute/:transaction_id")
    .get(productDispute_controller_1.raiseDispute);
exports.default = escrowProductDisputeRouter;
