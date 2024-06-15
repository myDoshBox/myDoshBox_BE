import { Router } from "express";
import { getAllUsers, getUserById, updateUserById } from './getOrganizationUser.controller';

const organizationUsersRoutes = Router();

// Route to get all users
organizationUsersRoutes.route("/orguser").get(getAllUsers);

// Route to get a single user by ID
organizationUsersRoutes.route("/orguser/:id").get(getUserById);

// Route to update a user by ID
organizationUsersRoutes.route("/orguser/:id").patch(updateUserById);

export default organizationUsersRoutes;