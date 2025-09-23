import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { deleteMessage, getConversation, getMessage, markAsRead, sendMessage } from "../controllers/chat.controller.js";
import { multerMiddleware } from "../configs/cloudinary.config.js";


const chatRouter = express.Router();


chatRouter.post('/send-message',authMiddleware,multerMiddleware,sendMessage)
chatRouter.get('/conversations',authMiddleware,getConversation)
chatRouter.get('/conversations/:conversationId/messages',authMiddleware,getMessage)
chatRouter.put('/messages/read',authMiddleware,markAsRead)
chatRouter.delete('/messages/:messageId',authMiddleware,deleteMessage)

export default chatRouter;