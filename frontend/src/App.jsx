import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/user-login/Login'
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute, PublicRoute } from './Protected';
import HomePage from './components/HomePage';
import UserDetails from './components/UserDetails';
import Status from './pages/statusSection/Status';
import Setting from './pages/settingSection/Setting';
import { useUserStore } from './store/useUserStore';
import { disconnectSocket, initializeSocket } from './services/chat.service';

const App = () => {

  const {user} = useUserStore();

  useEffect(() => {
    if(user?._id){
      const socket = initializeSocket();
    }

  return () => {
    disconnectSocket();
  }
  },[user])

  return (
    <>
    <Toaster position="top-right" reverseOrder={false} autoClose={2000} /> 
      <Routes>
      <Route element={<PublicRoute />}>
          <Route path='/user-login' element={<Login />} />
      </Route>


      <Route element={<ProtectedRoute />}>
       <Route path='/' element={<HomePage />} />
       <Route path='/user-profile' element={<UserDetails />} />
       <Route path='/status' element={<Status />} />
       <Route path='/setting' element={<Setting />} />
     </Route>
      </Routes>
    </>
  )
}

export default App