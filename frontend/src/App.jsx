import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/user-login/Login";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute, PublicRoute } from "./Protected";
import HomePage from "./components/HomePage";
import UserDetails from "./components/UserDetails";
import Status from "./pages/statusSection/Status";
import Setting from "./pages/settingSection/Setting";
import { useUserStore } from "./store/useUserStore";
import { disconnectSocket, initializeSocket, getSocket } from "./services/chat.service";
import { useChatStore } from "./store/chatStore";
import Help from "./components/Help";

const App = () => {
  const { user } = useUserStore();
  const { setCurrentUser, initsocketListeners, cleanup } = useChatStore();

  useEffect(() => {
    if (!user?._id) return;

    const socket = initializeSocket();

    socket.on("connect", () => {
      console.log("✅ Socket connected in App.jsx:", socket.id);

      // ✅ Tell backend this user is online
      socket.emit("user_connected", user._id);

      // ✅ Set current user in store & setup listeners
      setCurrentUser(user);
      initsocketListeners();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    // ✅ Optional: handle reconnect (keeps user online after refresh or network drop)
    socket.io.on("reconnect", () => {
      console.log("♻️ Socket reconnected:", socket.id);
      socket.emit("user_connected", user._id);
    });

    // ✅ Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket + store");
      cleanup();
      disconnectSocket();
    };
  }, [user, setCurrentUser, initsocketListeners, cleanup]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} autoClose={2000} />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/user-login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/user-profile" element={<UserDetails />} />
          <Route path="/status" element={<Status />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/help" element={<Help />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
