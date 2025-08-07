"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productDispute_controller_1 = require("./productDispute.controller");
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";
const escrowProductDisputeRouter = (0, express_1.Router)();
// we need a middleware that checks if you should be in here
escrowProductDisputeRouter
    .route("/raise-dispute/:transaction_id")
    .post(productDispute_controller_1.raiseDispute);
escrowProductDisputeRouter
    .route("/fetch-all-dispute/:user_email")
    .get(productDispute_controller_1.getAllDisputesByUser);
escrowProductDisputeRouter
    .route("/buyer-resolve-conflict/:transaction_id")
    .put(productDispute_controller_1.buyerResolveDispute);
escrowProductDisputeRouter
    .route("/seller-resolve-conflict/:transaction_id")
    .put(productDispute_controller_1.sellerResolveDispute);
exports.default = escrowProductDisputeRouter;
