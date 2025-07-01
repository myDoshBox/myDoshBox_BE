"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getOrganizationUser_controller_1 = require("./getOrganizationUser.controller");
const organizationUsersRoutes = (0, express_1.Router)();
// Route to get all users
organizationUsersRoutes.route("/orguser").get(getOrganizationUser_controller_1.getAllUsers);
// Route to get a single user by ID
organizationUsersRoutes.route("/orguser/:id").get(getOrganizationUser_controller_1.getUserById);
// Route to update a user by ID
organizationUsersRoutes.route("/orguser/:id").patch(getOrganizationUser_controller_1.updateUserById);
exports.default = organizationUsersRoutes;
