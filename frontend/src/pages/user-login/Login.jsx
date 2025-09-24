import React, { useState } from 'react'
import { useLoginStore } from '../../store/useLoginStore';
import Flag from 'react-world-flags'
import Countries from '../../utils/Countries';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup'
import {useNavigate} from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { useForm } from 'react-hook-form';
import { useThemeStore } from '../../store/themeStore';
import {motion} from 'motion/react'
import { FaChevronDown, FaWhatsapp } from 'react-icons/fa';



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

  const {step,setStep,setUserPhoneData,resetLoginStore} = useLoginStore(); 
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
  Whatsapp Login
</h1>
<ProgressBar/>

{error &&  <p className='text-red-500 text-center mb-4'>{error}</p> }



    {step ===1 && (
      <form className='space-y-4'>
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

        </div>

        </div>
      </form>
    )}

    </motion.div>

    </div>
  )
}

export default Login