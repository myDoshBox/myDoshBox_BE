"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIndividualUser = exports.updateIndividualUser = exports.getAllIndividualUsers = exports.getIndividualUser = void 0;
/** GET: http://localhost:5000/users/user/:user_id */
const getIndividualUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.getIndividualUser = getIndividualUser;
/** GET: http://localhost:5000/users */
const getAllIndividualUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.getAllIndividualUsers = getAllIndividualUsers;
//  * @param: {
//  * "id": "<userid>"
//  * }
//  *
//  * body: {
//  * "email": "kor@gmail.com",
//  * "phonenum": "1232455",
//  * "username": "jane doe",
//  * "fullname": "Ada Jones"
//  * }
//  */
/** PUT: http://localhost:5000/users/updateuser
 * @param: {
 * "id": "<userid>"
 * }
 *
 * body: {
 * "email": "kor@gmail.com",
 * "phonenum": "1232455",
 * "username": "jane doe",
 * "fullname": "Ada Jones"
 * }
 */
const updateIndividualUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.updateIndividualUser = updateIndividualUser;
/** DELETE: http://localhost:5000/users/deleteuser */
const deleteIndividualUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.deleteIndividualUser = deleteIndividualUser;
