import express from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'

const usersRouter = express.Router()

usersRouter.post('/login', loginValidator, loginController)
/***
 * Description : Register a new user
 * Path : /users/register
 * Method : POST
 * Body : { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerValidator, registerController)

export default usersRouter
