import {io} from 'socket.io-client';
import { useUserStore } from '../store/useUserStore';


let socket = null;


export const initializeSocket = () =>{
  if(socket) return socket;
  
  const user = useUserStore.getState().user;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL
    
  socket = io(BACKEND_URL,{withCredentials:true,
    transports: ['websocket', 'polling'], // Add other transports as needed,
    reconnectionAttempts: 5,
    reconnectionDelay:1000
  });


//connection events 

socket.on("connect",()=>{
  console.log('socket connected');
  socket.emit("user connected",user._id);
});

socket.on("connection_error",(error)=> {
  console.log('socket connection error',error);
})


//disconnect events
socket.on("disconnect",(reason)=>{
   console.log("socket disconnected",reason);
});

return socket;

}



export const getSocket = () => {
  if(!socket){ 
    return initializeSocket();}
  return socket;
}

export const disconnectSocket = () => {
  if(socket) {socket.disconnect();
  socket = null;}
}