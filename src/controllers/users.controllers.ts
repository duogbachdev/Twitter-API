import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'duogbachdev' && password === 123456) {
    return res.status(200).json({
      message: 'Login successful'
    })
  }

  return res.status(400).json({
    error: 'Login failed'
  })
}
export const registerController = (req: Request, res: Response) => {
  const { email, password } = req.body
  databaseService.users.insertOne(new User(email, password))

  return res.status(400).json({
    error: 'Login failed'
  })
}
