import { Router } from "express";
import { getAllUsers, getUserById, updateUserById } from './getIndividualUser.controller';

const individualUsersRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: user
 *   description: An API endpoints to get either all or single user(s), and update a user
 */

/**
 * @swagger
 * /user/induser:
 *   get:
 *     summary: Get all users
 *     tags: [user]
 *     responses:
 *       '200':
 *         description: The list of all Users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IndividualUserSignup'
 *       '401':
 *         $ref: '#/components/responses/401'
 *       '404':
 *         $ref: '#/components/responses/404'
 */
individualUsersRoutes.route("/induser").get(getAllUsers);

/**
 * @swagger
 * /user/induser/{id}:
 *   get:
 *     summary: Get a user
 *     tags: [user]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id of a user
 *     responses:
 *       '200':
 *         description: A single User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IndividualUserSignup'
 *       '401':
 *         $ref: '#/components/responses/401'
 *       '404':
 *         $ref: '#/components/responses/404'
 */
individualUsersRoutes.route("/induser/:id").get(getUserById);

/**
 * @swagger
 * /user/induser/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [user]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Update a user via user's Id
 *     responses:
 *       '200':
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IndividualUserSignup'
 *       '401':
 *         $ref: '#/components/responses/401'
 *       '404':
 *         $ref: '#/components/responses/404'
 */
individualUsersRoutes.route("/induser/:id").patch(updateUserById);

export default individualUsersRoutes;
