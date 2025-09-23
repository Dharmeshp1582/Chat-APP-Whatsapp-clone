import { uploadFileOnCloudinary } from "../configs/cloudinary.config.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { response } from "../utils/responseHandler.js";


export const sendMessage = async (req,res) => {
  try {
    const {senderId,receiverId, content, messageStatus} = req.body;

    const file = req.file;

    const participants = [senderId,receiverId].sort();

    //check if conversation already exists

    let conversation = await Conversation.findOne({participants: participants});

    if(!conversation){
      conversation = await Conversation.create({participants,
      });
      await conversation.save();
    }

    let imageOrVideoUrl = null;

    let contentType = null;

    //handle file upload

    if(file){
      const uploadFile = await uploadFileOnCloudinary(file);

      if(!uploadFile?.secure_url){
        return response(res,400,'Failed to upload Media');
      };
      imageOrVideoUrl = uploadFile?.secure_url;
      
      if(file.mimetype.startsWith('image')){
        contentType = 'image';
      }else if(file.mimetype.startsWith('video')){
       contentType = 'video'; 
      }else{
        return response(res,400,'Unsupported file type');
      }
    }else if(content?.trim()){
   contentType = 'text';
    }else{
      return response(res,400,'Message content is required');
    }

    const message = new Message({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content,
      imageOrVideoUrl,
      contentType,
      messageStatus
    });

    await message.save();

    if(message?.content){
    conversation.lastMessage = message?._id;
    }

    conversation.unreadCount += 1;

    await conversation.save();

    const populatedMessage = await Message.findOne({_id: message?._id}).populate('sender',"username profilePicture").populate('receiver',"username profilePicture");

    return response(res,200,'Message sent successfully',populatedMessage);
  } catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }
}



//get all conversation 

export const getConversation = async(req,res) => {

  const userId = req.user.userId;

  try {
    let conversation = await Conversation.find({participants:userId}).populate("participants","username profilePicture isOnline lastSeen").populate({
      path:"lastMessage",populate:{
        path:"sender receiver",
        select:"username profilePicture"
      }
    }).sort({updatedAt:-1});

    return response(res,200,'Getting users  conversation successfully',conversation);
  } catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }
}


//get message of specific conversation

export const getMessage = async(req,res) => {
  const {conversationId} = req.params;
  const userId = req.user.userId;

  try {
    const conversation = await Conversation.findById(conversationId)

    if(!conversation){
      return response(res,400,'Conversation not found');
    }

    if(!conversation.participants.includes(userId)){
      return response(res,400,'Not Authorized ! You are not part of this conversation');
    }

    const messages = await Message.find({conversation:conversationId}).populate('sender',"username profilePicture").populate('receiver',"username profilePicture").sort({createdAt:1});

   await Message.updateMany(
  {
    conversation: conversationId,
    receiver: userId,
    messageStatus: { $in: ['send', 'delivered'] }
  },
  {
    $set: { messageStatus: 'read' }
  }
);

    
    conversation.unreadCount = 0;

    await conversation.save();

    return response(res,200,'Getting users  Messages successfully',messages);
  } catch (error) {
    console.log(error)
    return response(res,500,'Internal server error');
  }
}



export const markAsRead = async(req,res) => {
  const {messageIds} = req.body;

  const userId = req.user.userId;

  try {
    //get relevant messages
    let messages = await Message.find({_id:{$in:messageIds},
    receiver: userId,})

    await Message.updateMany({_id:{$in:messageIds},
    receiver: userId,
    },
  {
    $set:{messageStatus:'read'}
  })

  return response(res,200,'Messages marked as read successfully',messages);
  } catch (error) {
    return response(res,500,'Internal server error');
  }
}

export const deleteMessage = async(req,res) => {
  const {messageId} = req.params;

  const userId = req.user.userId;

  try {
    const message = await Message.findById(messageId);

    if(!message){
      return response(res,400,'Message not found');
    }

   if (message.sender.toString() !== userId) {
  return response(res, 400, "Not Authorized to delete this message");
}


    await message.deleteOne();


    return response(res,200,'Message deleted successfully');
  } catch (error) {
    return response(res,500,'Internal server error');
  }

}