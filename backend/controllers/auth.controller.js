

// send otp 

import User from "../models/user.model.js";
import { sendOtpToEmail } from "../services/email.service.js";
import { otpGenerate } from "../utils/otpGenerate.js";
import { response } from "../utils/responseHandler.js";
import {twilioService} from '../services/twilio.service.js'
import { generateJwtToken } from "../utils/generateJwtToken.js";
import { uploadFileOnCloudinary } from "../configs/cloudinary.config.js";

export const sendOtp = async(req,res) => {
    const {phoneNumber, phoneSuffix,email} = req.body;

    const otp = otpGenerate();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);// 5 minutes

    let user;
    try{
      if(email){
        user = await User.findOne({email});

        if(!user){
          user = new User({email})
        }
        user.emailOtp = otp;
        user.emailOtpExpiry = expiry;
        await user.save();
       await sendOtpToEmail(email,otp);
        return response(res,200,'Otp sent successfully',{email});
      }
      if(!phoneNumber || !phoneSuffix){
        return response(res,400,'Phone number and phone suffix is required');
      }
      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;

      user = await User.findOne({phoneNumber});
      if(!user){
        user = await new User({phoneNumber,phoneSuffix});
      }

     await twilioService.sendOtpToPhoneNumber(fullPhoneNumber);
      await user.save();

    
      return response(res,200,'Otp sent successfully',user);
  } catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }
}


// verify otp

export const verifyOtp = async(req,res) => {
  const {phoneNumber, phoneSuffix,email,otp} = req.body;

  try {
    let user;
    if(email){
      user = await User.findOne({email});
      if(!user){
        return response(res,400,'User not found');
      }
      const now = new Date();
      if(!user.emailOtp || String(user.emailOtp) !== String(otp) || now > new Date(user.emailOtpExpiry)){
        return response(res,400,'Invalid otp');
      }
      user.isVerified = true;
      user.emailOtp = null;
      user.emailOtpExpiry = null;
      await user.save();
    }else{
      if(!phoneNumber || !phoneSuffix){
        return response(res,400,'Phone number and phone suffix is required');
      }
      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
      user = await User.findOne({phoneNumber});
      if(!user){
        return response(res,400,'User not found');
      }
      const result = await twilioService.verifyOtp(fullPhoneNumber,otp);
      if(result.status !=='approved'){
        return response(res,400,'Invalid otp');
      }
      user.isVerified = true;
      await user.save();
    }

    const token = generateJwtToken(user?._id);

    res.cookie('auth_token',token,{httpOnly:true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return response(res,200,'Otp verified successfully',{ token ,user});
    
  } catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }

}



export const updateProfile = async (req,res) => {
  const {username,agreed, about} = req.body;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    const file = req.file;
    if(!user){
      return response(res,400,'User not found');
    }
    if(file){
      const uploadResult = await uploadFileOnCloudinary(file); 
      console.log(uploadResult)
      user.profilePicture = uploadResult?.secure_url;
    }else if(req.body.profilePicture){
   user.profilePicture = req.body.profilePicture;
    }

    if(username){
      user.username = username;
    }
    if(agreed){
      user.agreed = agreed;
    }
    if(about){
      user.about = about;
    }
    await user.save();
    // console.log(user)
    return response(res,200,'Profile updated successfully',user);
    
  } catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }
}

export const checkAuthenticate = async(req,res) => {
  try {
    const userId = req.user.userId;
    if(!userId){
      return response(res,400,'Unauthorized ! please login before access our app');
    }
    const user = await User.findById(userId);
    if(!user){
      return response(res,400,'User not found');
    }
    return response(res,200,'User authenticated successfully',user);
    
  } catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }
}


export const logout = async(req,res) => {
  try {
    res.clearCookie('auth_token',"",{expires: new Date(0)});
    return response(res,200,'User Logout successfully');
    
  } catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }
}