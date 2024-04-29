"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const individualUsers_controller_1 = require("./individualUsers.controller");
const router = (0, express_1.Router)();
router.get("/my-profile", individualUsers_controller_1.getIndividualUser);
router.patch("/update-my-profile", individualUsers_controller_1.updateIndividualUser);
exports.default = router;
