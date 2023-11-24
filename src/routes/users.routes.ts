import express from 'express'
import { loginController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRouter = express.Router()

usersRouter.post('/login', loginValidator, loginController)

export default usersRouter
