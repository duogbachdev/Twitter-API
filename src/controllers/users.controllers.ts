import { Request, Response } from 'express'
import userService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'duogbachdev' && password === 123456) {
    return res.status(200).json({
      message: 'Login successful'
    })
  }

  return res.status(400).json({
    message: 'Login failed'
  })
}
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  // const { email, password } = req.body
  try {
    const result = await userService.register(req.body)

    return res.json({
      message: 'Resgister successful',
      result
    })
  } catch (error) {
    return res.status(400).json({
      message: 'Resgister failed'
    })
  }
}
