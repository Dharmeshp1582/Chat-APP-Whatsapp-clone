import React, { useCallback, useEffect } from 'react'
import useVideoCallStore from '../../store/videoCallStore'
import { useUserStore } from '../../store/useUserStore';
import VideoCallModel from './VideoCallModel';

const VideoCallManager = ({socket}) => {

  const {setIncomingCall,setCurrentCall,setCallType,setCallModelOpen,setCallStatus,endCall} = useVideoCallStore();

  const {user} = useUserStore();

  useEffect(()=>{
    if(!socket){
      return;
    }


    //handle incoming call 
    const handleIncomingCall = ({callerId,callerName,callerAvatar,callId,callType}) => {
      setIncomingCall({callerId,callerName,callerAvatar,callId,callType});
      setCallType(callType);
      setCallModelOpen(true);
      setCallStatus("ringing");
    }

    const handleCallEnded = ({reason}) =>{
      setCallStatus("failed")
      setTimeout(() => {
       endCall();  
      },2000)
    }

    socket.on("incoming_call",handleIncomingCall);
    socket.on("call_failed",handleCallEnded);

    return () => {//on page unmount
      socket.off("incoming_call",handleIncomingCall);
      socket.off("call_failed",handleCallEnded);
    }
  },[socket,setIncomingCall,setCallType,setCallModelOpen,setCallStatus,endCall]);

  //memorise function to initiate the call 

  const initiateCall = useCallback((receiverId,receiverName,receiverAvatar,callType="video") => {
    const callId = `${user?._id}-${receiverId}-${Date.now()}`;//unique call id

    const callData = {
      callId,
      participantId:receiverId,
      participantName:receiverName,
      participantAvatar:receiverAvatar
    }
    setCurrentCall(callData);
    setCallType(callType);
    setCallModelOpen(true);
    setCallStatus("calling");

    //initiate the call 
    socket.emit("initiate_call", {callerId:user?._id,receiverId,callType,callerInfo:{
      username:user?.username,
      profilePicture:user?.profilePicture
    }});
  },[user,socket,setCurrentCall,setCallType,setCallModelOpen,setCallStatus]);

  // expose the initiate call function to other components
  useEffect(() => {
    useVideoCallStore.getState().initiateCall = initiateCall
  }, [initiateCall]);

  return <VideoCallModel socket={socket}   />
}

export default VideoCallManager