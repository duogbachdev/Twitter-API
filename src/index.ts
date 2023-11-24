import express from 'express'
import usersRouter from '~/routes/users.routes'

const app = express()
const port = 3000

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use(express.json())
app.use('/users', usersRouter)
