"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const individualUserAuth_controller_1 = require("../individualUserAuth/individualUserAuth.controller");
const router = (0, express_1.Router)();
// routes
router.route("/register").post(individualUserAuth_controller_1.individualUserRegistration);
exports.default = router;
