import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  content: {
    type: String,
  },
  imageOrVideoUrl: {
    type: String,
  },
  contentType:{
    type:String,
    enum:["text","image","video"]
  },
   reactions: {
    type: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String },
      },
    ],
    default: [],
  },
  messageStatus:{
    type:String,
   default:'send'
  }
},{timestamps:true})

const Message = mongoose.model("Message", messageSchema);
export default Message