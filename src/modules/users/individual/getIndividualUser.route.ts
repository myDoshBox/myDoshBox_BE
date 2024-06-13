import { Router } from "express";
import { getAllUsers, getUserById, updateUserById } from './getIndividualUser.controller';

const individualUsersRoutes = Router();

// Route to get all users
individualUsersRoutes.route("/users").get(getAllUsers);

// Route to get a single user by ID
individualUsersRoutes.route("/users/:id").get(getUserById);

// Route to update a user by ID
individualUsersRoutes.route("/users/:id").patch(updateUserById);

export default individualUsersRoutes;
