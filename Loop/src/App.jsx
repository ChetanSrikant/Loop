import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate'
import Login from './pages/Login/Login'
import Chat from './pages/Chat/Chat'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/Chat' element={<Chat/>}/>
        <Route path='/profile' element={<ProfileUpdate/>}/>
      </Routes>
    </>
  )
}

export default App
