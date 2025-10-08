import React, { useEffect, useMemo, useRef } from 'react'
import useVideoCallStore from '../../store/videoCallStore';
import { useUserStore } from '../../store/useUserStore';
import { useThemeStore } from '../../store/themeStore';

const VideoCallModel = ({socket}) => {

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {currentCall,incomingCall,isCallActive,localStream,remoteStream,isVideoEnabled,isAudioEnabled,peerConnection,iceCandidatesQueue,isCallModelOpen,callStatus,setIncomingCall,setCurrentCall,setCallType,setCallModelOpen,setCallStatus,endCall,setCallActive,setLocalStream,setRemoteStream,setPeerConnection,addIceCandidate,processQueuedIceCandidate,toggleVideo, toggleAudio,clearIncomingCall} = useVideoCallStore();

  const {user} = useUserStore();

  const {theme} = useThemeStore();

  const rtcConfiguration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
      {
        urls: "stun:stun1.l.google.com:19302",
      },
      {
        urls: "stun:stun2.l.google.com:19302",
      },
    ],
  };

  //memorize display the user info and it is prevent the unnecessary re-rendering
  const displayInfo = useMemo(()=>{
    if(incomingCall && !isCallActive){
      return {
        name: incomingCall.callerName,
        avatar: incomingCall.callerAvatar,
      }
    }else if(currentCall){
      return {
        name: currentCall.participantName,
        avatar: currentCall.participantAvatar,
      }
    }

    return null;
  },[incomingCall,isCallActive,currentCall])


  //connection detection 
  useEffect(()=>{
    if(peerConnection && remoteStream){
      console.log("Both peer connection and remote stream are available");
      setCallStatus("connected");
      setCallActive(true);
    }
  },[peerConnection,remoteStream,setCallStatus,setCallActive])

  //set up local video stream when local stream change 
  useEffect(()=>{
    if(localVideoRef.current && localStream){
      localVideoRef.current.srcObject = localStream;
    }
  },[localStream]);

  //set up remote video stream when remote stream change 
  useEffect(()=>{
    if(remoteVideoRef.current && remoteStream){
      remoteVideoRef.current.srcObject = remoteStream;
    }
  },[remoteStream]);

  

  return (
    <div>

    </div>
  )
}

export default VideoCallModel