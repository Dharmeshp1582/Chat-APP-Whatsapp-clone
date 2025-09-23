import { Server } from "socket.io";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

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
    console.log(`User connected: ${socket.id}`)
    let userId = null;

    //handle user online connection and mark them online in db
    socket.on("user connected",async(connectingUserId)=>{
      try {
        userId = connectingUserId;
        onlineUsers.set(userId, socket.id);
        socket.join(userId);// join a personal room identified by userId
        // console.log(`User online: ${userId}`);

        //update user status to online in db
        await User.findByIdAndUpdate(userId,{isOnline:true,lastSeen:new Date()});

        //notify all clients about the updated online users list
        io.emit("user_status",{userId,isOnline:true}); 
      } catch (error) {
        console.error("Error updating user status:",error);
      }
    })

    //return online status  of requested user
    socket.on("get_user_status",async(requestedUserId,callback)=>{
    
      const isOnline = onlineUsers.has(requestedUserId);
      callback({userId:requestedUserId,isOnline,lastSeen:isOnline?new Date():null,});
    })
    //forward message to the recipient if online

    socket.on("send_message",async(message)=>{
     try {
      const receiverSocketId = onlineUsers.get(message.receiver?._id);

      if(receiverSocketId){
        io.to(receiverSocketId).emit("receive_message",message);
      }
     } catch (error) {
      console.error("Error forwarding message:",error);
      socket.emit("message_error","Failed to send message. Please try again.");
     }
    })

    //update message as read and notify sender
    socket.on("message_read",async({messageIds,senderId})=>{
      try{
await Message.updateMany({_id:{$in:messageIds}},{$set:{messageStatus:"read"}});

        const senderSocketId = onlineUsers.get(senderId);
        if(senderSocketId){
          messageIds.forEach(messageId=>{
            io.to(senderSocketId).emit("message_status_update",{messageId,messageStatus:"read"});
          })
        }
      }catch{
       console.log("Error updating message status to read",error);
      }
    
    })
    //handle typing indicator
    socket.on("typing_start",({conversationId,receiverId})=>{
       if(!userId || !receiverId || !conversationId) return;

       if(!typingUsers.has(userId)) typingUsers.set(userId,{});

       const userTyping = typingUsers.get(userId);
       userTyping[conversationId] = true;
       //clear any existing timeout to avoid premature removal

       if(userTyping[`${conversationId}_timeout`]){ clearTimeout(userTyping[`${conversationId}_timeout`]);}

       //auto stop after 3 seconds of inactivity

        userTyping[`${conversationId}_timeout`] = setTimeout(()=>{
          userTyping[conversationId] = false;
          socket.to(receiverId).emit("user_typing",{userId,conversationId,isTyping:false});
        },3000)

        //notify receiver about status of typing
        socket.to(receiverId).emit("user_typing",{userId,conversationId,isTyping:true});
    })

    //handle typing stop
    socket.on("typing_stop",({conversationId,receiverId})=>{
      if(!userId || !receiverId || !conversationId) return;

      if(typingUsers.has(userId)){
        const userTyping = typingUsers.get(userId);
        userTyping[conversationId] = false;
        //clear any existing timeout to avoid premature removal
        if(userTyping[`${conversationId}_timeout`]){ clearTimeout(userTyping[`${conversationId}_timeout`]);
        delete userTyping[`${conversationId}_timeout`];
        }
      };
      //notify receiver about status of typing
      socket.to(receiverId).emit("user_typing",{userId,conversationId,isTyping:false});
    })

    //add or update reaction on message 

    socket.on("add_reaction",async({messageId,emoji,userId,reactionUserId})=>{
      try {
        const message = await Message.findById(messageId);

        if(!message) return;

        const existingIndex = message.reactions.findIndex(
          (r) => r.user.toString() === reactionUserId
        )

        if(existingIndex > -1){
          const existing = message.reactions(existingIndex)
          if(existing.emoji === emoji){
            //remove same reaction
            message.reactions.splice(existingIndex,1)
          }else{
            message.reactions(existingIndex).emoji = emoji;
          }
        }else{
          //add new reactions 
          message.reactions.push({user: reactionUserId,emoji})
        }

        await message.save();

        const populateMessage = await Message.findOne(message?._id).populate("sender","username profilePicture").populate("receiver","username profilePicture").populate("reactions.user","username")

        const reactionUpdated = {
          messageId,
          reactions:populateMessage.reactions,
        }

        const senderSocket = onlineUsers.get(populateMessage.sender._id.toString());

        const receiverSocket = onlineUsers.get(populateMessage.receiver._id.toString());
        if(senderSocket){
          io.to(senderSocket).emit("reaction_update",reactionUpdated);
        }

        if(receiverSocket){
          io.to(receiverSocket).emit("reaction_update",reactionUpdated);
        } 
      } catch (error) {
        console.error("Error adding reaction:",error);
      }
    })
    //handle disconnection and mark user offline

  const handleDisconnected =async (userId)=> {
    if(!userId) return;

    try {
      onlineUsers.delete(userId);

      //clear all typing timeout
     if(typingUsers.has(userId)){
      const userTyping = typingUsers.get(userId);
      Object.keys(userTyping).forEach(key => {
      if(key.endsWith("_timeout")){
        clearTimeout(userTyping[key]);
      }
      delete userTyping[key];
     })
    }
    await User.findByIdAndUpdate(userId,{isOnline:false,lastSeen:new Date()},{new:true});

    io.emit("user_status",{userId,isOnline:false,
      lastSeen:new Date()
    }); 

    socket.leave(userId);
    console.log(`user ${userId} disconnected`, userId);
    } catch (error) {
      console.log("error Handling disconnection",error);
    }
  }

  //disconnection event 
  socket.on("disconnect",()=>handleDisconnected);
  })  

  //attach the online user map to the socket server for external user
  io.socketsUserMap = onlineUsers;

  return io;
};

export default initializeSocket;