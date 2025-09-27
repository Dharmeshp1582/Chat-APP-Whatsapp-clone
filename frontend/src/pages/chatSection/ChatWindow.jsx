import React, { useRef, useState } from 'react'
import { useThemeStore } from '../../store/themeStore';
import { useUserStore } from '../../store/useUserStore';


const isValidate = (date) =>{
  return date instanceof Date && !isNaN(date);
}

const ChatWindow = () => {

  const [message,setMessage] = useState("");
  const [showEmojiPicker,setShowEmojiPicker] = useState(false);
  const [showFileMenu,setShowFileMenu] = useState(false);
  const [filePreview,setFilePreview] = useState(null);
  const [selectedFile,setSelectedFile] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const {theme} = useThemeStore();
  const {user} = useUserStore();

  return (
    <div>ChatWindow</div>
  )
}

export default ChatWindow