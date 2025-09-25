import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/user-login/Login'
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute, PublicRoute } from './Protected';
import HomePage from './components/HomePage';

const App = () => {
  return (
    <>
    <Toaster position="top-right" reverseOrder={false} autoClose={2000} /> 
      <Routes>
      <Route element={<PublicRoute />}>
          <Route path='/user-login' element={<Login />} />
      </Route>


      <Route element={<ProtectedRoute />}>
       <Route path='/' element={<HomePage />} />
     </Route>
      </Routes>
    </>
  )
}

export default App