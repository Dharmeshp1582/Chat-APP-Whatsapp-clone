import twilio from 'twilio'

//Define Twilio credentials for env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;



const client = twilio(accountSid, authToken); 


//send otp to phone number 
const sendOtpToPhoneNumber = async(phoneNumber) =>{
  try {
    console.log("sending otp to number",phoneNumber);

    if(!phoneNumber){
      throw new Error("Phone number is required")
    }
    const response = await client.verify.v2.services(serviceSid)
    .verifications
    .create({to: phoneNumber, channel: 'sms'});
    console.log('Otp response',response)
    return response;
  } catch (error) {
    console.log(error)
    throw new Error('Failed to send otp to phone number');
  }
}


//
const verifyOtp = async(phoneNumber,otp) =>{
  try {
    console.log("This is my otp",otp);
    console.log("This is my phoneNumber",phoneNumber);
    const response = await client.verify.v2.services(serviceSid)
    .verificationChecks
    .create({to: phoneNumber, code: otp});
    console.log('Otp response',response)
    return response;
  } catch (error) {
    console.log(error)
    throw new Error('Failed to Verify otp');
  }
}



// export as object
export const twilioService = {
  sendOtpToPhoneNumber,
  verifyOtp
}