

// send otp 

import User from "../models/user.model.js";
import { otpGenerate } from "../utils/otpGenerate.js";
import { response } from "../utils/responseHandler.js";

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

        return response(res,200,'Otp sent successfully',{email});
      }
      if(!phoneNumber || !phoneSuffix){
        return response(res,400,'Phone number and phone suffix is required');
      }
      const fullPhoneNumber = `${phoneNumber}${phoneSuffix}`;

      user = await User.findOne({phoneNumber});
      if(!user){
        user = await new User({phoneNumber,phoneSuffix});
      }

      await user.save();

      return response(res,200,'Otp sent successfully',user);
  } catch (error) {
    console.log(error)
    return response(res,500,'Something went wrong');
  }
}