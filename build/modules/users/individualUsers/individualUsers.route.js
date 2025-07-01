"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
require("./individualUsers.controller");
const router = (0, express_1.Router)();
// router.get("/my-profile", getIndividualUser);
// router.patch("/update-my-profile", updateIndividualUser);
exports.default = router;
