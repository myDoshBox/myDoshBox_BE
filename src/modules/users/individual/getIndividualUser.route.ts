import { Router } from "express";
import { getAllUsers, getUserById, updateUserById } from './getIndividualUser.controller';

const individualUsersRoutes = Router();

// Route to get all users
individualUsersRoutes.route("/").get(getAllUsers);

// Route to get a single user by ID
individualUsersRoutes.route("/:id").get(getUserById);

// Route to update a user by ID
individualUsersRoutes.route("/:id").patch(updateUserById);

export default individualUsersRoutes;
