

import { uploadFileOnCloudinary } from "../configs/cloudinary.config.js";
import Status from "../models/status.model.js";
import { response } from "../utils/responseHandler.js";


export const createStatus = async (req,res) => {
  try {
    const { content, contentType} = req.body;
   const userId = req.user.userId;
    const file = req.file;

    let mediaUrl = null;

    let finalContentType = contentType || 'text';
    //handle file upload

    if(file){
      const uploadFile = await uploadFileOnCloudinary(file);

      if(!uploadFile?.secure_url){
        return response(res,400,'Failed to upload Media');
      };
      mediaUrl = uploadFile?.secure_url;
      
      if(file.mimetype.startsWith('image')){
        finalContentType = 'image';
      }else if(file.mimetype.startsWith('video')){
       finalContentType = 'video'; 
      }else{
        return response(res,400,'Unsupported file type');
      }
    }else if(content?.trim()){
   finalContentType = 'text';
    }else{
      return response(res,400,'Message content is required');
    }

    const expiresAt = new Date(); 
    
    expiresAt.setHours(expiresAt.getHours() + 24)// 24 hours from now

    const status = new Status({
      user: userId,
      content: mediaUrl || content,
      contentType: finalContentType,
    });

    await status.save();

    const populatedStatus = await Status.findOne({_id: status?._id}).populate('user',"username profilePicture").populate('viewers',"username profilePicture");

    return response(res,200,'Status Uploaded successfully',populatedStatus);
  } catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }
}


export const getStatus = async (req,res) => {
  try {
    const status = await Status.find({expiresAt:{$gte:new Date()}}).populate('user',"username profilePicture").populate('viewers',"username profilePicture").sort({createdAt:-1})
    return response(res,200,'status retrieved successfully',status);
  } catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }
}

export const viewStatus = async (req,res) => {
  const {statusId} = req.params;
  const userId = req.user.userId;

  try {
   const status = await Status.findById(statusId)

   if(!status){
    return response(res,400,'Status not found');
   }

   if(!status.viewers.includes(userId)){
    status.viewers.push(userId)
    await status.save();

  
    const updatedStatus = await Status.findById(statusId).populate('user',"username profilePicture").populate('viewers',"username profilePicture");

  }else{
    console.log('user already viewed this status')
  }
  return response(res,200,'Status viewed successfully',updatedStatus); 
  
} catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }
}


export const deleteStatus = async (req,res) => {
  const {statusId} = req.params;
  const userId = req.user.userId;

  try {
    const status = await Status.findById(statusId)

    if(!status){
      return response(res,400,'Status not found');
     }

     if(status.user.toString() !== userId){
      return response(res,400,'Not authorized to delete this status');
     }
     await status.deleteOne();
     return response(res,200,'Status deleted successfully');
  } catch (error) {
    return response(res,500,'Internal server error');
  }
}