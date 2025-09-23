import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/db.js'
import authRouter from './routes/auth.route.js'
import bodyParser from 'body-parser'
import chatRouter from './routes/chat.route.js'

const app = express()

const PORT = process.env.PORT || 5000

await connectDB()

//middlewares
app.use(express.json())//parse body data
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(cors())

//Routes 
app.use('/api/auth',authRouter)
app.use('/api/chat',chatRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})