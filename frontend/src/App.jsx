import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/user-login/Login'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/user-login' element={<Login />} />
      </Routes>
    </>
  )
}

export default App