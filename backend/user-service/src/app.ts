import express from 'express'
import cors from 'cors'
import { usersRouter } from './routes/users.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'user-service' })
})

app.use('/api', usersRouter)

export { app }
