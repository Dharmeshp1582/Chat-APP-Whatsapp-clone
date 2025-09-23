import express from 'express'
import { createStatus, deleteStatus, getStatus, viewStatus } from '../controllers/status.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { multerMiddleware } from '../configs/cloudinary.config.js'

const statusRouter = express.Router()

statusRouter.post('/',authMiddleware,multerMiddleware,createStatus)
statusRouter.get('/',authMiddleware,getStatus)


statusRouter.get('/:statusId/view',authMiddleware,viewStatus)
statusRouter.get('/:statusId',authMiddleware,deleteStatus)


export default statusRouter