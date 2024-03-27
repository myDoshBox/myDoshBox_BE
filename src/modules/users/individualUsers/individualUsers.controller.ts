/** GET: http://localhost:5000/users/user/:user_id */
export const getIndividualUser = async (req: Request, res: Response) => {};

/** GET: http://localhost:5000/users */
export const getAllIndividualUsers = async (req: Request, res: Response) => {};
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
export const updateIndividualUser = async (req: Request, res: Response) => {};

/** DELETE: http://localhost:5000/users/deleteuser */
export const deleteIndividualUser = async (req: Request, res: Response) => {};
