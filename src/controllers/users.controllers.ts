import { Request, Response } from 'express'

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
