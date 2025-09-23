import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/db.js'
import authRouter from './routes/auth.route.js'
import bodyParser from 'body-parser'
import chatRouter from './routes/chat.route.js'
import http from 'http'
import initializeSocket from './services/socket.service.js'
import statusRouter from './routes/status.route.js'

const app = express()

const PORT = process.env.PORT || 5000

await connectDB()

//middlewares
app.use(express.json())//parse body data
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
}
app.use(cors(corsOptions))

//create server 
const server = http.createServer(app)

const io = initializeSocket(server)

//apply socket middleware before routes
app.use((req, res, next) => {
  req.io = io;
  req.socketUserMap = io.socketUserMap
  next();
})

//Routes 
app.use('/api/auth',authRouter)
app.use('/api/chat',chatRouter)
app.use('/api/status',statusRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})