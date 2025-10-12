import React, { useEffect, useMemo, useRef } from "react";
import useVideoCallStore from "../../store/videoCallStore";
import { useUserStore } from "../../store/useUserStore";
import { useThemeStore } from "../../store/themeStore";
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaTimes, FaVideo, FaVideoSlash } from "react-icons/fa";

const VideoCallModel = ({ socket }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    currentCall,
    incomingCall,
    isCallActive,
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    peerConnection,
    iceCandidatesQueue,
    isCallModelOpen,
    callStatus,
    setIncomingCall,
    setCurrentCall,
    setCallType,
    setCallModelOpen,
    setCallStatus,
    endCall,
    setCallActive,
    setLocalStream,
    setRemoteStream,
    setPeerConnection,
    addIceCandidate,
    processQueuedIceCandidate,
    toggleVideo,
    toggleAudio,
    clearIncomingCall,
    callType,
  } = useVideoCallStore();

  const { user } = useUserStore();

  const { theme } = useThemeStore();

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
  const displayInfo = useMemo(() => {
    if (incomingCall && !isCallActive) {
      return {
        name: incomingCall.callerName,
        avatar: incomingCall.callerAvatar,
      };
    } else if (currentCall) {
      return {
        name: currentCall.participantName,
        avatar: currentCall.participantAvatar,
      };
    }

    return null;
  }, [incomingCall, isCallActive, currentCall]);

  //connection detection
  useEffect(() => {
    if (peerConnection && remoteStream) {
      console.log("Both peer connection and remote stream are available");
      setCallStatus("connected");
      setCallActive(true);
    }
  }, [peerConnection, remoteStream, setCallStatus, setCallActive]);

  //set up local video stream when local stream change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  //set up remote video stream when remote stream change
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  //initialize media stream
  const initializeMedia = async (video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 640, height: 480 } : false,
        audio: true,
      });
      console.log("local media stream", stream.getTracks());
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Media stream error", error);
      throw error;
    }
  };

  //create peer connection
  const createPeerConnection = async ({ stream, role }) => {
  const pc = new RTCPeerConnection(rtcConfiguration);
  console.log("Peer connection created", pc);

  try {
    // add local tracks
    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log(`${role} adding ${track.kind} track:`, track.id.slice(0, 8));
        pc.addTrack(track, stream);
      });
    }

    // handle ice candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        const participantId = currentCall?.participantId || incomingCall?.callerId;
        const callId = currentCall?.callId || incomingCall?.callId;
        if (participantId && callId) {
          socket.emit("webrtc_ice_candidate", {
            candidate: event.candidate,
            receiverId: participantId,
            callId,
          });
        }
      }
    };

    // handle remote stream
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        const newStream = new MediaStream([event.track]);
        setRemoteStream(newStream);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Peer connection state change", pc.connectionState);
      if (pc.connectionState === "failed") {
        setCallStatus("failed");
        setTimeout(handleEndCall, 2000);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`${role} ice connection state change`, pc.iceConnectionState);
    };

    pc.onsignalingstatechange = () => {
      console.log(`${role} signaling state change`, pc.signalingState);
    };

    setPeerConnection(pc);
    return pc;
  } catch (error) {
    console.error("Peer connection error", error);
    throw error;
  }
};


  //caller initiaze call after acceptence
  const initializeCallerCall = async () => {
    try {
      setCallStatus("connecting");

      //get media
      const stream = await initializeMedia(callType === "video");

      //create peer connection with offer
      const pc = await createPeerConnection({ stream, role: "CALLER" })
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === "video",
      });
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", {
        offer,
        receiverId: currentCall?.participantId,
        callId: currentCall?.callId,
      });
    } catch (error) {
      console.error("Initialize caller call error", error);
      setCallStatus("failed");
      setTimeout(handleEndCall, 2000);
    }
  };

  //receiver answer the call
  const handleAnswerCall = async () => {
    try {
      setCallStatus("connecting");
      // get media
      const stream = await initializeMedia(callType === "video");

      // create peer connection with answer
     await createPeerConnection({ stream, role: "RECEIVER" });
      socket.emit("accept_call", {
        callerId: incomingCall?.callerId,
        callId: incomingCall?.callId,
        receiverInfo: {
          username: user?.username,
          profilePicture: user?.profilePicture,
        },
      });

      setCurrentCall({
        callId: incomingCall?.callId,
        participantId: incomingCall?.callerId,
        participantName: incomingCall?.callerName,
        participantAvatar: incomingCall?.callerAvatar,
      });

      clearIncomingCall();
    } catch (error) {
      console.error("Receiver answer call error", error);
      setCallStatus("failed");
      handleEndCall();
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      socket.emit("reject_call", {
        callerId: incomingCall?.callerId,
        callId: incomingCall?.callId,
      });
    }
    endCall();
  };

  const handleEndCall = () => {
    const participantId = currentCall?.participantId || incomingCall?.callerId;
    const callId = currentCall?.callId || incomingCall?.callId;
    if (participantId && callId) {
      socket.emit("end_call", { participantId, callId });
    }
    endCall();
  };

  //socket event listeners
  useEffect(() => {
    if (!socket) return;

    //call accepted start caller flow
    const handleCallAccepted = ({ receiverName }) => {
      if (currentCall) {
        setTimeout(() => {
          initializeCallerCall();
        }, 500);
      }
    };

    const handleCallRejected = () => {
      setCallStatus("rejected");
      setTimeout(endCall, 2000);
    };

    const handleCallEnded = () => {
      endCall();
    };

   const waitForPeerConnection = async (timeout = 2000) => {
  const interval = 100;
  let waited = 0;
  while (!peerConnection && waited < timeout) {
    await new Promise((res) => setTimeout(res, interval));
    waited += interval;
  }
  return peerConnection;
};

const handleWebRTCOFFER = async ({ offer, senderId, callId }) => {
  const pc = await waitForPeerConnection();
  if (!pc) {
    console.error("PeerConnection was never initialized before offer arrived.");
    setCallStatus("failed");
    return;
  }

  try {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    await processQueuedIceCandidate();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("webrtc_answer", { answer, receiverId: senderId, callId });
  } catch (error) {
    console.error("Failed to handle webrtc_offer", error);
    setCallStatus("failed");
  }
};


    //receiver answer(caller)
    const handleWebRTCAnswer = async ({ answer, senderId, callId }) => {
      if (!peerConnection) return;

      if (peerConnection.signaLingState === "closed") {
        console.log("Answer received after peer connection closed");
        return;
      }
      try {
        //current caller signaling
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        //process queued the ice candidates
        await processQueuedIceCandidate();

        //check receiver ice connection state
        const receivers = peerConnection.getReceivers();
        console.log("Receivers", receivers);
      } catch (error) {
        console.log("caller answer error", error);
      }
    };

    //receiver ice candidates
    const handleWebRTCIceCandidates = async ({ candidate, senderId }) => {
      if (peerConnection && peerConnection.signalingState !== "closed") {
        if (peerConnection.remoteDescription) {
          try {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
            console.log("ICE candidate Added", candidate);
          } catch (error) {
            console.log("ICE candidate error", error);
          }
        } else {
          console.log(
            "queuing ICE candidate received before remote description"
          );
          addIceCandidate(candidate);
        }
      }
    };

    //register all events listeners
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);
    socket.on("webrtc_offer", handleWebRTCOFFER);
    socket.on("webrtc_answer", handleWebRTCAnswer);
    socket.on("webrtc_ice_candidate", handleWebRTCIceCandidates);

    console.log("Socket Listener registered");
    return () => {
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
      socket.off("webrtc_offer", handleWebRTCOFFER);
      socket.off("webrtc_answer", handleWebRTCAnswer);
      socket.off("webrtc_ice_candidate", handleWebRTCIceCandidates);
    };
  }, [socket, peerConnection, currentCall, incomingCall, user]);

  if (!isCallModelOpen && !incomingCall) return null;

  const shouldShowActiveCall =
    isCallActive || callStatus === "calling" || callStatus === "connecting";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
      <div
        className={`relative w-full h-full max-w-4xl max-h-3xl rounded-lg overflow-hidden ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        {/* incoming call UI */}
        {incomingCall && !isCallActive && (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-center mb-8">
              <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4 overflow-hidden">
                {/* image shown*/}
                <img
                  src={displayInfo?.avatar}
                  alt={displayInfo?.name}
                  className="w-full h-full object-cover" onError={(e)=> e.target.src = "/placeholder.svg"}
                />
              </div>
              <h2
                className={`text-2xl font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {displayInfo?.name}
              </h2>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Incoming {callType} call....
              </p>
            </div>

            <div className="flex space-x-6">
              {/* call buttons */}
              <button
                onClick={handleRejectCall}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
              >
                <FaPhoneSlash className="w-6 h-6" />
              </button>

              <button
                onClick={handleAnswerCall}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white"
              >
                <FaVideo className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Active call UI */}
        {shouldShowActiveCall && (
          <div className="relative w-full h-full">
            {callType === "video" && (
  <video
    className={`w-full h-full object-cover bg-gray-800 ${
      remoteStream ? "block" : "hidden"
    }`}
    ref={remoteVideoRef}
    autoPlay
    playsInline
  />
)}


        {/* Avatar /status display  */}
       {(!remoteStream || callStatus === "calling" || callStatus === "connecting") && (
  <div className="w-full h-full bg-gray-800 flex items-center justify-center flex-col text-center">
    <div className="w-32 h-32 rounded-full bg-gray-600 mx-auto mb-4 overflow-hidden">
      <img
        src={displayInfo?.avatar}
        alt={displayInfo?.name}
        className="w-full h-full object-cover"
        onError={(e) => (e.target.src = "/placeholder.svg")}
      />
    </div>
    <p className="text-white text-xl mb-2">
      {callStatus === "calling"
        ? `Calling ${displayInfo?.name}...`
        : callStatus === "connecting"
        ? "Connecting..."
        : displayInfo?.name}
    </p>

    {/* Show local preview if available */}
    {localStream && callType === "video" && (
      <div className="mt-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white">
        <video
          className="w-full h-full object-cover"
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
        />
      </div>
    )}
  </div>
)}


           {/* local video (picture in picture) */}
           {callType === "video" && localStream && (
           <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
             <video
              className="w-full h-full object-cover "
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
            />
           </div>
          )}

          {/* call status */}
          <div className="absolute top-4 left-4">
            <div className={`px-4 py-2 rounded-full ${theme === 'dark'? "bg-gray-800":"bg-white"} bg-opacity-75`}>
              <p className={`text-sm ${theme === 'dark'? "text-white" :"text-gray-900" }`}>
                {callStatus === "connected" ? "Connected" : callStatus}
              </p>
            </div>
          </div>

          {/* call controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
         <div className="flex space-x-4 ">
          {callType === "video" && (
            <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoEnabled === 'dark'? "bg-gray-600 hover:bg-gray-700 text-white":"bg-red-500 hover:bg-red-600 text-white "} bg-opacity-75`}>
              {isVideoEnabled ? <FaVideo className="w-5 h-5"/> : <FaVideoSlash className="w-5 h-5"/>}
            </button>
          )}


          <button onClick={toggleAudio} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isAudioEnabled === 'dark'? "bg-gray-600 hover:bg-gray-700 text-white":"bg-red-500 hover:bg-red-600 text-white "} bg-opacity-75`}>
              {isAudioEnabled ? <FaMicrophone className="w-5 h-5"/> : <FaMicrophoneSlash className="w-5 h-5"/>}
            </button>

            <button
                onClick={handleEndCall}
                className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
              >
                <FaPhoneSlash className="w-5 h-5" />
              </button>
         </div>
          </div>
           </div>
        )}

{callStatus === "calling" && (
      <button
                onClick={handleEndCall}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-500 hover:bg-gray-600 rounded-full flex items-center justify-center text-white"
              >
                <FaTimes className="w-5 h-5" />
              </button>
)}
      </div>
    </div>
  );
};

export default VideoCallModel;
