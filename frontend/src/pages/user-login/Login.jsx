import React, { useState } from 'react'
import { useLoginStore } from '../../store/useLoginStore';
import Flag from 'react-world-flags'
import Countries from '../../utils/Countries';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup'
import {useNavigate} from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { set, useForm } from 'react-hook-form';
import { useThemeStore } from '../../store/themeStore';
import {motion} from 'motion/react'
import { FaArrowLeft, FaChevronDown, FaPlus, FaUser, FaWhatsapp } from 'react-icons/fa';
import Spinner from '../../utils/Spinner';
import { sendOtp, updateUserProfile, verifyOtp } from '../../services/user.service';
import toast from 'react-hot-toast';



//validation schema 
const loginValidationSchema = yup.object().shape({
 phoneNumber: yup
  .string()
  .nullable()
  .notRequired()
  .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
  .transform((value, originalValue) =>
    originalValue?.trim() === '' ? null : value
  ),
  email: yup.string()
  .nullable()
  .notRequired()
  .email('Invalid email format')
  .transform((value, originalValue) => originalValue?.trim() === '' ? null : value)
  .test('at-least-one', 'Either email or phone number is required', function (value) {
    const { phoneNumber } = this.parent;
    return !!(value || phoneNumber);
  }),
});

const otpValidationSchema = yup.object().shape({
  otp: yup.string().length(6, 'OTP must be exactly 6 digits').required("otp is required"),
});

const profileValidationSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  agreed: yup.boolean().oneOf([true], 'You must accept the terms and conditions to proceed').required('You must accept the terms and conditions to proceed'),
})



  const avatars = [
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
]


const Login = () => {

  const {step,setStep,setUserPhoneData,userPhoneData,resetLoginStore} = useLoginStore(); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(Countries[0]);
  const [otp, setOtp] = useState(['', '', '', '','','']);
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [error, setError] = useState('');
  const [showDropdown,setShowDropdown] = useState(false);
  const [searchTern,setSearchTern] = useState("")
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();
  const {setUser} = useUserStore();
  const {theme,setTheme} = useThemeStore() 


  const {register:loginRegister,handleSubmit:handleLoginSubmit,formState:{errors: loginErrors}} = useForm({
    resolver:yupResolver(loginValidationSchema)
  })

  const {handleSubmit:handleOtpSubmit,formState:{errors: otpErrors},
setValue: setOtpValue} = useForm({
    resolver:yupResolver(otpValidationSchema)
  })


  const {register:profileRegister,handleSubmit:handleProfileSubmit,formState:{errors: profileErrors},watch} = useForm({
    resolver:yupResolver(profileValidationSchema)
  })

  const onLoginSubmit = async() => {
    try {
      setLoading(true)
      if(email){
        const response = await sendOtp(null,null,email);
        if(response.status === 'success'){
          // Handle success
          toast.success("OTP sent successfully to your email")
          setUserPhoneData({email})
          setStep(2)
        }
      }else{
        const response = await sendOtp(phoneNumber,selectedCountry.dialCode,null);
        if(response.status === 'success'){
          // Handle success
          toast.success("OTP sent successfully to your phoneNumber")
          setUserPhoneData({phoneNumber,phoneSuffix:selectedCountry.dialCode})
          setStep(2)
        }
      }
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || 'Failed to send otp. Please try again.');
    }finally{
      setLoading(false);
    }
  }


  const onOtpSubmit = async() => {
 try {
  setLoading(true)
  if(!userPhoneData){
   throw new Error("User phone data is missing")
  }

  const otpString = otp.join('');
  let response;
  if (userPhoneData?.email) {
  response = await verifyOtp({
    email: userPhoneData.email,
    otp: otpString,
  });
} else {
  response = await verifyOtp({
    phoneNumber: userPhoneData.phoneNumber,
    phoneSuffix: userPhoneData.phoneSuffix,
    otp: otpString,
  });
}


  if(response.status === 'success'){
   toast.success("OTP verified successfully")
   console.log(response)
   const user = response.data?.user;
   console.log("user", user)
   if(user?.username && user?.profilePicture){
  setUser(user); 
  navigate('/');
}
else{
    setStep(3) //complete profile step
   }
  }
 } catch (error) {
  console.log(error);
  setError(error?.response?.data?.message || 'Failed to verify otp. Please try again.');
 } finally {
  setLoading(false);
 }
  }


  const handleFileChange = (e)=> {
    const file = e.target.files[0];
    if(file){
      setProfilePictureFile(file);
    setProfilePicture(URL.createObjectURL(file)); 
    }
  }

  const onProfileSubmit = async(data) => {
   try {
    setLoading(true)
    const formData = new FormData();
    formData.append('username',data.username);
    formData.append('agreed',data.agreed);
    if(profilePictureFile){
      formData.append('media',profilePictureFile);
    }else{
      formData.append('profilePicture',selectedAvatar);
    }

    await updateUserProfile(formData);
    toast.success("Welcome back to WhatsApp")
    navigate('/');
    resetLoginStore();

   } catch (error) {
    console.log(error);
    setError(error?.response?.data?.message || 'Failed to update profile. Please try again.');
   } finally {
    setLoading(false);
   }
  }

  const handleOtpChange = (value, index) => {
const newOtp = [...otp];
newOtp[index] = value ;
setOtp(newOtp);
setOtpValue('otp', newOtp.join(''));

//focus next input
if(value && index < 5){
  document.getElementById(`otp-${index + 1}`).focus();
  }
}

const handleBack = () => {
  setStep(1);
  setUserPhoneData(null);
  setOtp(['', '', '', '','','']);
  setError('');
}

  const ProgressBar = () => {
   return( <div className={`w-full ${theme === 'dark'? "bg-gray-700":"bg-gray-200"} rounded-full h-2.5 mb-6`} >

    <div className='bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out' style={{width: `${(step/ 3) * 100}%`}}>

    </div>

    </div>
  )}

  const filterCountry = Countries.filter(
    (country)=> 
      country.name.toLowerCase().includes(searchTern.toLowerCase()) || country.dialCode.includes(searchTern)
  )


  return (
    <div className={`min-h-screen ${theme === 'dark'? "bg-gray-900":"bg-gradient-to-br from-green-400 to-blue-500"} flex items-center justify-center p-4 overflow-hidden`}>

    <motion.div initial={{opacity:0, y:-50}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className={` ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-md relative z-10`}>

<motion.div initial={{scale:0}} animate={{scale:1}} transition={{duration:0.2,type:'spring',stiffness:260,damping:20}} className='w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 cursor-pointer'>
<FaWhatsapp style={{color:'white'}} className='w-16 h-16 text-white'/>
</motion.div>

<h1 className={`text-3xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
  WhatsApp Login
</h1>
<ProgressBar/>

{error &&  <p className='text-red-500 text-center mb-4'>{error}</p> }



    {step ===1 && (
      <form onSubmit={handleLoginSubmit(onLoginSubmit) } className='space-y-4'>
        <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Enter your phone number to receive otp</p>

        <div className='relative'>
        <div className='flex'>
        <div className='relative w-1/3'>
  <button
  type="button"
  className={`flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center ${
    theme === 'dark'
      ? 'text-white bg-gray-700 border-gray-600'
      : 'text-gray-900 bg-gray-100 hover:bg-gray-300 border-gray-300'
  } rounded-s-lg border focus:ring-4 focus:outline-none focus:ring-gray-100`}
  onClick={() => setShowDropdown(!showDropdown)}
>
  <Flag code={selectedCountry.alpha2} style={{ width: 20, height: 15, marginRight: 6 }} />
  {selectedCountry.dialCode}
  <FaChevronDown className="ml-2" />
</button>

  {showDropdown && <div className={`absolute z-10 w-full mt-1 ${theme === 'dark' ? "bg-gray-700 border-gray-300": "bg-white border-gray-300" } border rounded-md shadow-lg max-h-60 overflow-auto`}>
<div className={`sticky top-0 ${theme === 'dark'?"bg-gray-700":"bg-white"} p-2`}>
 <input type="text" placeholder='search countries...' value={searchTern} onChange={(e)=>setSearchTern(e.target.value)} className={`w-full px-2 py-1 border ${theme === 'dark'? "bg-gray-600 border-gray-500 text-white":"bg-white border-gray-300 " } rounded-md text-sm focus:ring-2 focus:ring-green-500`}  />
</div>
{filterCountry.map((country)=> (
  <button key={country.alpha2} type='button' className={`w-full text-left px-3 py-2 ${theme === 'dark' ? "hover:bg-gray-600": "hover:bg-gray-100" } focus:outline-none focus:bg-gray-100`} onClick={() => {
  setSelectedCountry(country);
  setShowDropdown(false);
}}
>
    <Flag code={country.alpha2} style={{ width: 15, height: 15 }} /> ({country.dialCode}) {country.name}
  </button>
))}
  </div> }
        </div>
        <input type="text" {...loginRegister('phoneNumber')}
        value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={`w-2/3 px-4 py-2 border ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white " : "bg-white border-gray-300 "} rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none ${loginErrors.phoneNumber ? 'border-red-500' : '' }`} placeholder='Phone Number ' />

        </div>
        {loginErrors.phoneNumber && <p className='text-red-500 text-sm mt-1'>{loginErrors.phoneNumber.message}</p>}

        </div>

        {/* divider for email */}

        <div className='flex items-center my-4'>
         <div className='flex-grow h-px bg-gray-300'/>
      <span className='mx-3 text-gray-500 text-sm font-medium'>
        or
      </span>
        <div className='flex-grow h-px bg-gray-300'/>
       

        </div>

      {/* Email input box */}

      <div className={`flex items-center border rounded-md px-3 py-2 ${theme === 'dark' ? "bg-gray-700 border-gray-600 " : "bg-white border-gray-300 "} focus-within:ring-2 focus-within:ring-green-500 ${loginErrors.email ? 'border-red-500' : '' }`}>
        <FaUser className={`mr-2 text-gray-400 ${theme === 'dark' ? "text-gray-400": "text-gray-500" }`}/>

         <input type="email" {...loginRegister('email')} placeholder='Email Address (optional)' value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-transparent focus:outline-none ${theme === 'dark' ? "text-white placeholder-gray-400": "bg-black" } ${loginErrors.email ? 'border-red-500' : '' }`} />

         {loginErrors.email && <p className='text-red-500 text-sm mt-1'>{loginErrors.email.message}</p>}
        
      </div>
       <button type='submit' className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors duration-300 cursor-pointer' >{loading ? <Spinner /> : 'Send OTP'}</button>
      </form>
    )}

    {step === 2 && (
      <form onSubmit={handleOtpSubmit(onOtpSubmit)} className='space-y-4'>
        <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Please Enter the 6-digit OTP sent to your {userPhoneData ? userPhoneData.phoneSuffix : "Email"} {" "} {userPhoneData.phoneNumber && userPhoneData.phoneNumber}</p>

        <div className='flex justify-between'>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              className={`w-12 h-12 text-center border ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${otpErrors.otp ? 'border-red-500' : '' }`}
            />
          ))}

           </div>
          {otpErrors.otp && <p className='text-red-500 text-sm mt-1'>{otpErrors.otp.message}</p>}
          <button type='submit' className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors duration-300 cursor-pointer' >{loading ? <Spinner /> : 'Verify OTP'}
          </button>


          <button type='button' onClick={handleBack} className={`w-full mt-2 ${theme === 'dark' ? "text-gray-300 bg-gray-700 hover:text-white": "text-gray-700 hover:text-gray-900"}  py-2 rounded-md transition hover:bg-gray-300 flex items-center justify-center duration-300 cursor-pointer`} >
            <FaArrowLeft className='mr-2'/>
            Wrong number? Go back 
          </button>
       
      </form>
    )}

    {step === 3 && (
      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className='space-y-4'>

        <div className='flex  flex-col items-center mb-4 '>
       <div className='relative w-24 h-24 mb-2'>
        <img src={profilePicture || selectedAvatar} alt="Profile" className='w-full h-full rounded-full object-cover ' />
        <label htmlFor='profilePicture' className='absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition duration-300 cursor-pointer'>
          <FaPlus className='w-4 h-4'/>
        </label>
        <input type='file' id='profilePicture' className='hidden' accept='image/*' onChange={handleFileChange} />
       </div>

       <p className={`text-sm ${theme === 'dark' ? "text-gray-300": "text-gray-700" } mb-2`}>Choose an Avatar
       </p>

       <div className='flex flex-wrap justify-center gap-2'>
{avatars.map((avatar,index) => (
  <img key={index} src={avatar} alt='avatar' className={`w-12 h-12 rounded-full transition duration-300 ease-in-out transform hover:scale-110 cursor-pointer ${selectedAvatar === avatar ? 'ring-2 ring-green-500' : ''}`} onClick={() => setSelectedAvatar(avatar)} />
))}
       </div>

       
        </div>
        <div className='relative'>
       <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2  ${theme === 'dark' ? "text-gray-400": "text-gray-700"}`} />

<input {...profileRegister('username')} type='text' placeholder='UserName' className={`w-full py-2 pl-10 pr-3 border ${theme === 'dark' ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`} />

{profileErrors.username && <p className='text-red-500 text-sm mt-1'>{profileErrors.username.message}</p>}
       </div>


       <div className='flex items-center space-x-2'>
 <input {...profileRegister('agreed')} type='checkbox' className={`rounded-md ${theme === 'dark' ? "bg-gray-700  text-green-500" : " text-green-500"} focus:ring-green-500`}  />
 <label htmlFor='terms' className={`text-sm ${theme === 'dark' ? "text-gray-300": "text-gray-700" }`}>I agree to the <a href='#' className='text-red-500 hover:underline'>terms and conditions</a></label>
       </div>
        {profileErrors.agreed && <p className='text-red-500 text-sm mt-1'>{profileErrors.agreed.message}</p>}

        <button disabled={!watch('agreed') || loading} type='submit' className={`w-full bg-green-500 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out hover:bg-green-600 hover:scale-105 items-center justify-center cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} >{loading ? <Spinner /> : 'Complete Profile'}</button>
      </form>
    )}

    </motion.div>

    </div>
  )
}

export default Login