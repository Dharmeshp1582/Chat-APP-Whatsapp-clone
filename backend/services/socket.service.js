import { Server } from "socket.io";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import handleVideoCallEvent from "./video-call-events.js";

const onlineUsers = new Map();
const typingUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
    pingTimeout: 60000, // disconnect inactive users after 60s
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    let userId = null;

    // ✅ Mark user online
    socket.on("user_connected", async (connectingUserId) => {
      try {
        userId = connectingUserId;
        socket.userId = userId;
        onlineUsers.set(userId, socket.id);
        socket.join(userId);

        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        io.emit("user_status", { userId, isOnline: true });
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    });

    // ✅ Get user status
    socket.on("get_user_status", async (requestedUserId, callback) => {
      const isOnline = onlineUsers.has(requestedUserId);
      callback({
        userId: requestedUserId,
        isOnline,
        lastSeen: isOnline ? new Date() : null,
      });
    });

    // ✅ Forward message if receiver online
    socket.on("send_message", async (message) => {
      try {
        const receiverSocketId = onlineUsers.get(message.receiver?._id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }
      } catch (error) {
        console.error("Error forwarding message:", error);
        socket.emit("message_error", "Failed to send message. Please try again.");
      }
    });

    // ✅ Mark messages as read
    socket.on("message_read", async ({ messageIds, senderId }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { messageStatus: "read" } }
        );

        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          messageIds.forEach((messageId) => {
            io.to(senderSocketId).emit("message_status_update", {
              messageId,
              messageStatus: "read",
            });
          });
        }
      } catch (error) {
        console.error("Error updating message status to read", error);
      }
    });

    // ✅ Typing start
    socket.on("typing_start", ({ conversationId, receiverId }) => {
      if (!userId || !receiverId || !conversationId) return;

      if (!typingUsers.has(userId)) typingUsers.set(userId, {});
      const userTyping = typingUsers.get(userId);
      userTyping[conversationId] = true;

      // Clear timeout if exists
      if (userTyping[`${conversationId}_timeout`]) {
        clearTimeout(userTyping[`${conversationId}_timeout`]);
      }

      // Auto stop after 3s
      userTyping[`${conversationId}_timeout`] = setTimeout(() => {
        userTyping[conversationId] = false;
        socket
          .to(receiverId)
          .emit("user_typing", { userId, conversationId, isTyping: false });
      }, 3000);

      socket
        .to(receiverId)
        .emit("user_typing", { userId, conversationId, isTyping: true });
    });

    // ✅ Typing stop
    socket.on("typing_stop", ({ conversationId, receiverId }) => {
      if (!userId || !receiverId || !conversationId) return;

      if (typingUsers.has(userId)) {
        const userTyping = typingUsers.get(userId);
        userTyping[conversationId] = false;

        if (userTyping[`${conversationId}_timeout`]) {
          clearTimeout(userTyping[`${conversationId}_timeout`]);
          delete userTyping[`${conversationId}_timeout`];
        }
      }
      socket
        .to(receiverId)
        .emit("user_typing", { userId, conversationId, isTyping: false });
    });

    // ✅ Add or Update Reaction
   // ✅ Add or Update Reaction
// ✅ Add or Update Reaction
socket.on("add_reaction", async ({ messageId, emoji, userId: reactionUserId }) => {
  try {
    // 1️⃣ Fetch message
    const message = await Message.findById(messageId);
    if (!message) {
      console.warn("⚠️ Message not found:", messageId);
      return;
    }

    // 2️⃣ Check if user already reacted
    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === reactionUserId
    );

    if (existingIndex > -1) {
      const existing = message.reactions[existingIndex];

      if (existing.emoji === emoji) {
        // 🗑 Same emoji → remove reaction
        message.reactions.splice(existingIndex, 1);
      } else {
        // 🔁 Different emoji → update
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      // ➕ New reaction
      message.reactions.push({ userId: reactionUserId, emoji });
    }

    // 3️⃣ Save updated message
    await message.save();

    // 4️⃣ Populate message for UI
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture")
      .populate("reactions.userId", "username");

    console.log(
      "✅ reaction_update emitting for:",
      message._id,
      populatedMessage.reactions
    );

    // 5️⃣ Prepare data
    const reactionUpdated = {
      messageId: message._id.toString(),
      reactions: populatedMessage.reactions,
    };

    // 6️⃣ Emit to sender & receiver
    const senderSocket = onlineUsers.get(populatedMessage.sender._id.toString());
    const receiverSocket = onlineUsers.get(populatedMessage.receiver._id.toString());

    if (senderSocket) io.to(senderSocket).emit("reaction_update", reactionUpdated);
    if (receiverSocket) io.to(receiverSocket).emit("reaction_update", reactionUpdated);
  } catch (error) {
    console.error("❌ Error adding reaction:", error);
  }
});

// handle videocall events 
handleVideoCallEvent(socket, io, onlineUsers);


    // ✅ Handle disconnect
    const handleDisconnected = async (userId) => {
      if (!userId) return;
      try {
        onlineUsers.delete(userId);

        // Clear typing timeouts
        if (typingUsers.has(userId)) {
          const userTyping = typingUsers.get(userId);
          Object.keys(userTyping).forEach((key) => {
            if (key.endsWith("_timeout")) clearTimeout(userTyping[key]);
            delete userTyping[key];
          });
        }

        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        io.emit("user_status", { userId, isOnline: false, lastSeen: new Date() });
        socket.leave(userId);
        console.log(`User ${userId} disconnected`);
      } catch (error) {
        console.error("Error handling disconnection:", error);
      }
    };

    socket.on("disconnect", () => handleDisconnected(userId));
  });

  io.socketsUserMap = onlineUsers;
  return io;
};

export default initializeSocket;
