import React, { useEffect, useState } from 'react'
import { useLayoutStore } from '../store/layoutStore';
import { useLocation } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import Sidebar from './Sidebar';
import { motion,AnimatePresence } from 'motion/react';
import ChatWindow from '../pages/chatSection/ChatWindow';

const Layout = ({children,isThemeDialogOpen,toggleThemeDialog,isStatusPreviewOpen,statusPreviewContent}) => {

 const  selectedContact = useLayoutStore((state) => state.selectedContact);
 const  setSelectedContact = useLayoutStore((state) => state.setSelectedContact);
 
 const location = useLocation();
 const [isMobile,setIsMobile] = useState(window.innerWidth < 768);
const {theme,setTheme} = useThemeStore();

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  }
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
},[])

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#111b21] text-white' : 'bg-gray-100 text-black'} flex relative`}>
 {!isMobile && <Sidebar/> }

 <div className={`flex-1 flex overflow-hidden ${isMobile ? 'flex-col' : ''}`}>


 <AnimatePresence initial={false}>
  {(!selectedContact || !isMobile) && (
    <motion.div
      key="chatlist"
      initial={{ x: isMobile ? "-100%" : 0 }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "tween" }}
      className={`w-full md:w-2/5 h-full ${isMobile ? 'pb-16' : 'w-[30%] max-w-[400px]'}`}
    >
      {children}
    </motion.div>
  )}

  {(selectedContact || !isMobile) && (
    <motion.div
      key="chatWindow"
      initial={{ x: isMobile ? "-100%" : 0 }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "tween" }}
      className="flex-1 h-full"
    >
      <ChatWindow
        selectedContact={selectedContact}
        setSelectedContact={setSelectedContact}
        isMobile={isMobile}
      />
    </motion.div>
  )}
</AnimatePresence>


 </div>

 {isMobile && <Sidebar/>}

 {isThemeDialogOpen && (
  <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={toggleThemeDialog}>
  <div className={`${theme === 'dark' ? 'bg-[#202c33] text-white' : 'bg-white text-black'} p-6 rounded-lg w-full max-w-sm shadow-lg`}>
    <h2 className='text-2xl font-semibold mb-4'>Choose a Theme

    </h2>

    <div className='space-y-4'>
  <label className='flex items-center space-x-3 cursor-pointer' >
    <input type="radio" value='light' checked={theme === 'light'} onChange={() => setTheme('light')} className='from-radio text-blue-600'/>
    <span>Light</span>
  </label>


  <label className='flex items-center space-x-3 cursor-pointer' >
    <input type="radio" value='dark' checked={theme === 'dark'} onChange={() => setTheme('dark')} className='from-radio text-blue-600'/>
    <span>Dark</span>
  </label>
    </div>

    <button onClick={toggleThemeDialog} className='mt-6 px-4 py-2  w-full bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-200'>
      Close
    </button>
  </div>

  </div>
 )}

 {/* Status preview */}
 {isStatusPreviewOpen && (
  <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
    {statusPreviewContent}
  </div> 
 )}
    </div>
  )
}

export default Layout