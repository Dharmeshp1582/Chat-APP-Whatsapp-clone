

const handleVideoCallEvent = async (socket, io, onlineUsers) => {

  //initiate video call event handler

  socket.on("initiate_call",  ({callerId,receiverId,callType,callerInfo}) => {
    
    const receiverSocketId = onlineUsers.get(receiverId);
    if(receiverSocketId) {
     const callId = `${callerId}-${receiverId}-${Date.now()}`;

     io.to(receiverSocketId).emit("incoming_call", {callerId,callerName:callerInfo.username,callerAvatar:callerInfo.profilePicture,callId,callType});
    }else{
      console.log(`server: receiver ${receiverId} is not online`);
      socket.emit("call_failed", {reason:"Receiver is offline"});
    }
  });


  //Accept call
   socket.on("accept_call",  ({callerId,callId,receiverInfo}) => {
    
    const callerSocketId = onlineUsers.get(callerId);
    if(callerSocketId) {

     io.to(callerSocketId).emit("call_accepted", {callerName:receiverInfo.username,callerAvatar:receiverInfo.profilePicture,callId});
    }else{
      console.log(`server: Caller ${callerId} not Found`);
    }
  });

  // reject call 
   socket.on("reject_call",  ({callerId,callId}) => {
    
    const callerSocketId = onlineUsers.get(callerId);
    if(callerSocketId) {

     io.to(callerSocketId).emit("call_rejected", {callId});
    }
  });


  // end call 
   socket.on("end_call",  ({callId,participantId}) => {
    
    const participantSocketId = onlineUsers.get(participantId);
    if(participantSocketId) {

     io.to(participantSocketId).emit("call_ended", {callId});
    }
  });

  // webRtc signaling event with proper userId 
  socket.on("webrtc_offer",  ({offer, receiverId, callId}) => {
     const receiverSocketId = onlineUsers.get(receiverId);

     if(receiverSocketId) {
      io.to(receiverSocketId).emit("webrtc_offer", {offer,
        senderId: socket.userId,
        callId
      });
     }else{
      console.log(`server: Offer forwarded to receiver `);
     }
  })

}