import React, { useRef, useState } from 'react'
import {format} from "date-fns"
import { FaCheck, FaCheckDouble, FaPlus, FaSmile } from 'react-icons/fa';
import {HiDotsVertical} from 'react-icons/hi'

const MessageBubble = ({message,theme,currentUser,deletedMessage,onReact}) => {

  console.log("Messages are : ",message)

  const [showEmojiPicker,setShowEmojiPicker] = useState(false);
  const [showReactions,setShowReactions] = useState(false);
  const messageRef = useRef(null);
  const [showOptions,setShowOptions] = useState(false)
  const optionRef = useRef(null); 

  const emojiPickerRef = useRef(null);
  const reactionMenuRef = useRef(null);
  const isUserMessage = message.sender._id === currentUser?._id;

  const bubbleClass = isUserMessage ? "chat-end" : "chat-start";

  const bubbleContentClass = isUserMessage ? `chat-bubble md:max-w-[50%] min-w-[130px] ${theme === 'dark' ? "bg-[#144d38] text-white" : "bg-[#d9fdd3] text-black"}` : `chat-bubble md:max-w-[50%] min-w-[130px] ${theme === 'dark' ? "bg-[#144d38] text-white" : "bg-white text-black"}`

  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const handleReact = (emoji) => {
    onReact(message._id,emoji);
    setShowEmojiPicker(false);
    setShowReactions(false);
  };

  if(message === 0) {
    return;
  }
  return (
    <div className={`chat ${bubbleClass}`}>
   <div className={`${bubbleContentClass} relative group`} ref={messageRef}>
       <div className='flex justify-center gap-2'>
   {message.contentType === "text" && <p className='mr-2'>{message.content}</p>}
   {message.contentType === "image" && <div>
    <img className='rounded-lg max-w-xs' src={message.imageOrVideoUrl} alt="Media" />
    <p className='mt-1'>{message.content}</p>
   </div>}
       </div>

       <div className='self-end flex items-center justify-end gap-1 text-xs opacity-60 mt-2 ml-2'>
        <span>
          {format(new Date(message.createdAt),"HH:mm")}
        </span>

        {isUserMessage && (
          <>
            {message.messageStatus === "send" && <FaCheck size={12}/>}
            {message.messageStatus === "delivered" && <FaCheckDouble size={12} className='text-gray-300'/>}
            {message.messageStatus === "read" && <FaCheckDouble size={12} className='text-blue-900'/>}
            
          </>
        )}
       </div>

       <div className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20'>
    <button className={`p-2 rounded-full ${theme === 'dark' ? "bg-[#202c33] hover:bg-[#202c33]/80" : "bg-white hover:bg-gray-100"} shadow-lg`} onClick={()=>setShowReactions(true)}>
      <HiDotsVertical size={20} onClick={()=>setShowOptions(!showOptions)} className={`p-1 rounded-full ${theme === 'dark' ? "text-gray-300 " : "text-gray-600 "}`}/>
    </button>
       </div>

       <div className={`absolute ${isUserMessage ? "-left-10":"-right-10"} top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-20`}>
   <button>
    <FaSmile className={`${theme === "dark"? "text-gray-300" : "text-gray-600"}}`} />
   </button>
       </div>

       {showReactions && (
        <div className={`absolute -top-8 ${isUserMessage ? "-left-0":"-left-36"} transform -translate-x-1/2 flex items-center bg-[#202c33]/90 rounded-full px-2 py-1.5 gap-1 shadow-lg z-50`} ref={reactionMenuRef}>
            {quickReactions.map((emoji,index) => (
              <button key={index} className='hover:scale-125 transition-transform p-1' onClick={() => handleReact(emoji)}>
                {emoji}
              </button>
            ))}
            <div className='w-[1px] h-5 bg-gray-600 mx-1'>
   <button className='hover:bg-[#ffffff1a] rounded-full p-1 ' onClick={()=>setShowEmojiPicker(!showEmojiPicker)}>
    <FaPlus className='w-4 h-4 text-gray-300' />
   </button>
            </div>
        </div>
       )}
   </div>
    </div>
  )
}

export default MessageBubble