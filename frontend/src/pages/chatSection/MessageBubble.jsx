import React, { useRef, useState } from "react";
import { format } from "date-fns";
import {
  FaCheck,
  FaCheckDouble,
  FaPlus,
  FaRegCopy,
  FaSmile,
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import useOutsideclick from "../../hooks/useOutsideclick";
import EmojiPicker from "emoji-picker-react";
import { RxCross2 } from "react-icons/rx";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";

const MessageBubble = ({
  message,
  theme,
  currentUser,
  deleteMessage,
  onReact,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const messageRef = useRef(null);
  const optionRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const reactionMenuRef = useRef(null);

  const isUserMessage = message.sender._id === currentUser?._id;

  const bubbleClass = isUserMessage ? "chat-end" : "chat-start";

  const bubbleContentClass = isUserMessage
    ? `chat-bubble md:max-w-[50%] min-w-[130px] ${
        theme === "dark" ? "bg-[#144d38] text-white" : "bg-[#d9fdd3] text-black"
      }`
    : `chat-bubble md:max-w-[50%] min-w-[130px] ${
        theme === "dark" ? "bg-[#144d38] text-white" : "bg-white text-black"
      }`;

  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const handleReact = (emoji) => {
    onReact(message._id, emoji);
    setShowEmojiPicker(false);
    setShowReactions(false);
  };

  useOutsideclick(emojiPickerRef, () => {
    if (showEmojiPicker) setShowEmojiPicker(false);
  });

  useOutsideclick(reactionMenuRef, () => {
    if (showReactions) setShowReactions(false);
  });

  useOutsideclick(optionRef, () => {
    if (showOptions) setShowOptions(false);
  });

  if (!message) return null;

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={`chat ${bubbleClass}`}>
      <div className={`${bubbleContentClass} relative group`} ref={messageRef}>
        <div className="flex justify-center gap-2">
          {message.contentType === "text" && (
            <p className="mr-2">{message.content}</p>
          )}
          {message.contentType === "image" && (
            <div>
              <img
                className="rounded-lg max-w-xs"
                src={message.imageOrVideoUrl}
                alt="image-video"
              />
              <p className="mt-1">{message.content}</p>
            </div>
          )}

          {message.contentType === "video" && (
            <div>
              <video controls
                className="rounded-lg max-w-xs"
                src={message.imageOrVideoUrl}
                alt="image-video"
              />
              <p className="mt-1">{message.content}</p>
            </div>
          )}
        </div>

        {/* Time + status */}
        <div className="self-end flex items-center justify-end gap-1 text-xs opacity-60 mt-2 ml-2">
          <span>{format(new Date(message.createdAt), "HH:mm")}</span>

          {isUserMessage && (
            <>
              {message.messageStatus === "send" && <FaCheck size={12} />}
              {message.messageStatus === "delivered" && (
                <FaCheckDouble size={12} className="text-gray-300" />
              )}
              {message.messageStatus === "read" && (
                <FaCheckDouble size={12} className="text-blue-900" />
              )}
            </>
          )}
        </div>

        {/* Options (3-dots) */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            className="mt-1"
            onClick={() => setShowOptions((prev) => !prev)} // ✅ toggle showOptions
          >
            <HiDotsVertical
              size={22}
              className={`p-1 rounded-full ${
                theme === "dark" ? "text-gray-300 " : "text-gray-600 "
              }`}
            />
          </button>
        </div>

        {/* Reaction button */}
        <div
          className={`absolute ${
            isUserMessage ? "-left-10" : "-right-10"
          } top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-20`}
        >
          <button
            className={`p-2 rounded-full ${
              theme === "dark"
                ? "bg-[#202c33] hover:bg-[#202c33]/80"
                : "bg-white cursor-pointer"
            } shadow-lg`}
            onClick={() => setShowReactions(true)}
          >
            <FaSmile
              className={`${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        {/* Quick reactions bar */}
        {showReactions && (
          <div
            className={`absolute -top-8 ${
              isUserMessage ? "left-0" : "left-36"
            } transform -translate-x-1/2 flex items-center bg-[#202c33]/90 rounded-full px-2 py-1.5 gap-1 shadow-lg z-50`}
            ref={reactionMenuRef}
          >
            {quickReactions.map((emoji, index) => (
              <button
                key={index}
                className="hover:scale-125 transition-transform p-1"
                onClick={() => handleReact(emoji)}
              >
                {emoji}
              </button>
            ))}
            <div className="w-[1px] h-5 bg-gray-600 mx-4" />
            <button
              className="hover:bg-[#ffffff1a] rounded-full p-1"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FaPlus className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        )}

        {/* Full emoji picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute left-0 right-0 mb-6 z-50"
          >
            <div className="relative">
              <EmojiPicker
                onEmojiClick={(emojiObject) => handleReact(emojiObject.emoji)}
                theme={theme}
              />
              <button
                className="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setShowEmojiPicker(false)}
              >
                <RxCross2 />
              </button>
            </div>
          </div>
        )}

        {/* Grouped reactions display */}
        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div
            className={`absolute -bottom-5 ${
              isUserMessage ? "right-2" : "left-2"
            } ${theme === "dark" ? "bg-[#2a3942]" : "bg-gray-200"} 
            rounded-full px-2 shadow-md flex gap-2`}
          >
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <span
                key={emoji}
                className="flex items-center gap-1 text-sm px-1"
              >
                {emoji} {count > 1 && <span className="text-xs">x{count}</span>}
              </span>
            ))}
          </div>
        )}

        {showOptions && (
          <div
            ref={optionRef}
            className={`absolute top-8 right-1 z-50 w-36 rounded-xl shadow-lg py-2 text-sm ${
              theme === "dark"
                ? "bg-[#1d1f1f] text-white"
                : "bg-gray-100 text-black"
            }`}
          >
            <button
              className="flex items-center w-full px-4 py-2 gap-3 rounded-lg"
              onClick={() => {
                if (message.contentType === "text") {
                  navigator.clipboard
                    .writeText(message.content)
                    .then(() => toast.success("Message copied to clipboard!"))
                    .catch(() => toast.error("Failed to copy message"));
                }
                setShowOptions(false);
              }}
            >
              <FaRegCopy size={14} />
              <span>Copy</span>
            </button>

            {isUserMessage && (
              <button
                className="flex items-center w-full px-4 py-2 gap-3 rounded-lg text-red-600"
                onClick={() => {
                  deleteMessage(message?._id)
                    .then(() => toast.success("Message Deleted Successfully!"))
                    .catch(() => toast.error("Failed to Delete message"));
                  setShowOptions(false);
                }}
              >
                <MdDelete className="text-red-600" size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
