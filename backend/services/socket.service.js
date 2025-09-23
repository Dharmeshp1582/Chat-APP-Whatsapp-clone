import { Server } from "socket.io";

//map to store online users => userId, socketId

const onlineUsers = new Map();

//map to track typing status -> userId, => conversation: boolean
const typingUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST","PUT","DELETE","OPTIONS"],
    },
    pingTimeout: 60000,//disconnect inactive users or socket after 60 seconds
  });

  //when a new connection is established
  io.on('connection', (socket) => {

  })
}