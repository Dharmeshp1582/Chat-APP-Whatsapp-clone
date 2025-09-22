import express from 'express'
import { checkAuthenticate, logout, sendOtp, updateProfile, verifyOtp } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { multerMiddleware } from '../configs/cloudinary.config.js'

const authRouter = express.Router()

authRouter.post('/send-otp',sendOtp)
authRouter.post('/verify-otp',verifyOtp)
authRouter.get('/logout',logout)


//  protected routes 
authRouter.put('/update-profile',authMiddleware,multerMiddleware,updateProfile)
authRouter.get('/check-auth',authMiddleware,checkAuthenticate)

export default authRouter