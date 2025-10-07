import React, { useEffect, useState } from 'react'
import { useUserStore } from '../store/useUserStore';
import { useThemeStore } from '../store/themeStore';
import { set } from 'date-fns';
import { updateUserProfile } from '../services/user.service';
import toast from 'react-hot-toast';
import Layout from './Layout';
import { motion } from 'motion/react';
import { FaCamera, FaCheck, FaPencilAlt, FaSmile } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import EmojiPicker from 'emoji-picker-react';

const UserDetails = () => {

  const [name,setName] = useState("");
  const [about,setAbout] = useState("");
  const [profilePicture,setProfilePicture] = useState(null);
  const [preview,setPreview] = useState(null);
  const [loading,setLoading] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [showNameEmoji, setShowNameEmoji] = useState(false);
  const [showAboutEmoji, setShowAboutEmoji] = useState(false);

  const {user,setUser} = useUserStore();
  const {theme} = useThemeStore();

  useEffect(()=>{
   if(user){
    setName(user.username || "");
    setAbout(user.about || "");
   }
  },[user])

   const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(file){
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
   }

   const handleSave = async(field) => {
    try {
      setLoading(true);
      const formData = new FormData();

      if(field === 'name'){
        formData.append('username',name);
        setIsEditingName(false);
        setShowNameEmoji(false);
      }else if(field === 'about'){
        formData.append('about',about);
        setIsEditingAbout(false);
        setShowAboutEmoji(false);
      }

      if(profilePicture && field === 'profilePicture'){
        formData.append('media',profilePicture);
      }

      const updated = await updateUserProfile(formData);
      setUser(updated?.data);
      setProfilePicture(null);
      setPreview(null);
      toast.success("Profile updated successfully");
      setLoading(false);
    } catch (error) {
      console.error(error)
      toast.error("Failed to update profile");
    }
   }

   const handleEmojiSelect = (emoji,field) => {
    if(field === 'name'){
      setName((prev) => prev + emoji.emoji);
      setShowNameEmoji(false);
    }else{
      setAbout((prev) => prev + emoji.emoji);
      setShowAboutEmoji(false);
    }
   }

  return (
    <Layout>
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}} className={`w-full min-h-screen flex border-r ${theme === 'dark' ? ' bg-[rgb(17,27,33)] border-gray-600 text-white' : ' bg-gray-100 border-gray-200 text-black'}`}>

<div className='w-full rounded-lg p-6'>
  <div className='flex items-center mb-6'>
    <h1 className='text-2xl font-bold'>
    Profile
    </h1>
  </div>

  <div className='space-y-6'>
   <div className='flex flex-col items-center'>
   <div className='relative group'>

<img src={preview || user?.profilePicture} alt="profile picture" className='w-52 h-52 object-cover rounded-full mb-2' />

<label htmlFor='profileUpload' className='absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300 ease-in-out'>
  <div className='text-white text-center '>
    <FaCamera className=' mx-auto w-8 h-8 mb-2' />
    <span className='text-sm'>Change</span>
  </div>
  <input type="file" id='profileUpload' onChange={handleImageChange} className='hidden' accept='image/*'/>
</label>
   </div>
   </div>

   {preview && (
    <div className='flex justify-center gap-4 mt-4'>
    <button onClick={() => handleSave('profilePicture')} className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded'>
      {loading ? "Saving..." : "Change"}
    </button>

     <button onClick={() => {setProfilePicture(null)
      setPreview(null)}}className='bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded'>Discard</button>
    </div>
   )}

 <div className={`relative p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-sm rounded-lg`}>
   <label htmlFor='name' className='block text-sm font-medium mb-1 text-gray-500 text-start'>Your Name</label>

   <div className='flex items-center'>
   {
    isEditingName ? (
      <input type="text" id='name' value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}/>
    ):(
      <span className='w-full px-3 py-2'>
     {user?.username || name}
      </span>
    )
   }

   {isEditingName ? (
   <>
  <button onClick={() => handleSave("name")} className='ml-2 focus:outline-none'>
    <FaCheck className='h-5 w-5 text-green-500'/>
  </button>

  <button onClick={() => setShowNameEmoji(!showNameEmoji)} className='ml-2 focus:outline-none'>
    <FaSmile className='h-5 w-5 text-yellow-500'/>
  </button>

  <button onClick={() => {setIsEditingName(false);setShowNameEmoji(false);}} className='ml-2 focus:outline-none'>
    <MdCancel className='h-5 w-5 text-gray-500'/>
  </button>
   </>
   ):(
  <button onClick={() => setIsEditingName(!isEditingName)} className='ml-2 focus:outline-none'>
    <FaPencilAlt className='h-5 w-5 text-gray-500'/>
  </button>
   )}

   </div>

   {showNameEmoji && (
    <div className='absolute -top-80 z-10'> 
    <EmojiPicker onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, "name")}
 />
    </div>
   )}
 </div>

 {/* for about  */}
<div className={`relative p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-sm rounded-lg`}>
  <label htmlFor='about' className='block text-sm font-medium mb-1 text-gray-500 text-start'>
    About
  </label>

  <div className='flex items-center'>
    {isEditingAbout ? (
      <input
        type="text"
        id='about'
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
          theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'
        }`}
      />
    ) : (
      <span className='w-full px-3 py-2'>
        {user?.about || about || "Hey there! I'm using WhatsApp 👋"}
      </span>
    )}

    {isEditingAbout ? (
      <>
        <button onClick={() => handleSave("about")} className='ml-2 focus:outline-none'>
          <FaCheck className='h-5 w-5 text-green-500' />
        </button>

        <button onClick={() => setShowAboutEmoji(!showAboutEmoji)} className='ml-2 focus:outline-none'>
          <FaSmile className='h-5 w-5 text-yellow-500' />
        </button>

        <button onClick={() => { setIsEditingAbout(false); setShowAboutEmoji(false); }} className='ml-2 focus:outline-none'>
          <MdCancel className='h-5 w-5 text-gray-500' />
        </button>
      </>
    ) : (
      <button onClick={() => setIsEditingAbout(true)} className='ml-2 focus:outline-none'>
        <FaPencilAlt className='h-5 w-5 text-gray-500' />
      </button>
    )}
  </div>

  {showAboutEmoji && (
    <div
      className='absolute -top-80 z-10'
      onClick={(e) => e.stopPropagation()}
    >
      <EmojiPicker
        onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, "about")}
        theme={theme === "dark" ? "dark" : "light"}
      />
    </div>
  )}
</div>


  </div>
</div>
    </motion.div>

    </Layout>
  )
}

export default UserDetails