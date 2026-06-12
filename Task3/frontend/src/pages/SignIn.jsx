import React, { useState } from 'react'
import logo from '../assets/logo.png'
import imge from '../assets/imge.png'
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import axios from 'axios';
import  {serverUrl}  from '../App.jsx';
import { ClipLoader } from "react-spinners";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';


const SignIn = () => {

    const [inputClicked, setInputClicked] = useState({
        userName: false,
        password: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading,setLoading]=useState(false)
    const [userName,setUserName]=useState("")
    const [password,setPassword]=useState("")
    const [err,setErr] =useState("")
    const navigate = useNavigate();
    const dispatch =useDispatch()


const handleSignIn = async () => {
    setLoading(true);
    setErr("")
  try {
    const res = await axios.post(
      `${serverUrl}/api/auth/signIn`,
      {  userName,password },
      { withCredentials: true }
    );

  dispatch(setUserData(res.data))
    setLoading(false);
  } catch (error) {
    console.log(
      "SignIn Error:",
      error.response?.data?.message || error.message
    );
    setLoading(false);
    setErr(error.response?.data?.message || error.message)
  }
};



    return (
        <div className='w-full h-screen bg-linear-to-b from-black to-gray-900 flex flex-col justify-center items-center'>
            <div className='w-[90%] lg:max-w-[60%] h-[80%] bg-white rounded-2xl flex justify-center items-center overflow-hidden border-2 border-[#1a1f23]' >
                <div className='w-full lg:w-[50%] h-full bg-white flex flex-col items-center justify-center p-2.5 '>

                    <div className='flex gap-2.5 items-center text-[20px] font-semibold mt-8'>
                        <span>Sign In to</span>
                        <img src={logo} alt="" className='w-17.5' />
                    </div>

               
                    <div className='relative flex items-center justify-start w-[90%] h-12.5 rounded-2xl mt-7.5 border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, userName: true })}>
                        <label htmlFor='userName' className={`text-gray-700 absolute bg-white left-5 p-1 bg- text-[15px] ${inputClicked.userName ? "-top-4.5" : ""} `}>Enter username </label>
                        <input type="text" id='userName' className='w-full h-full rounded-xl px-5 py-2 outline-none border-0 required' onChange={(e)=>setUserName(e.target.value)} value={userName}/>

                    </div>
                   
                    <div className='relative flex items-center justify-start w-[90%] h-12.5 rounded-2xl mt-7.5 border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, password: true })}>
                        <label htmlFor='password' className={`text-gray-700 absolute left-5 p-1 bg-white text-[15px] ${inputClicked.password ? "-top-4.5" : ""}`}>Enter Your password </label>
                        <input type={showPassword ? "text" : "password"} id='password' className='w-full h-full rounded-2xl px-5 py-2 outline-none border-0 required' onChange={(e)=>setPassword(e.target.value)} value={password} />
                        {showPassword ?
                            <IoIosEye className='absolute cursor-pointer right-5 w-6 h-6' onClick={() => setShowPassword(!showPassword)} />
                            : <IoIosEyeOff className='absolute cursor-pointer right-5 w-6 h-6' onClick={() => setShowPassword(!showPassword)} />}
                           
                        </div>
                        <div className='w-[90%] px-5 cursor-pointer pt-3' onClick={()=>navigate("/forgot-password")}>Forgot Password</div>

                       {err && <p className='text-red-500 mt-2'>{err}</p>}
                         
                    <button className='w-[70%] px-5 py-2.5 bg-black text-white font-semibold h-12.5 cursor-pointer rounded-2xl mt-7.5' onClick={handleSignIn} disabled={loading}> {loading?<ClipLoader size={30} color='white'/>:"Sign In"}  </button>
                    <p className='cursor-pointer text-gray-800 pt-2' onClick={()=>navigate("/signup")}>Want To Create A New Account ? <span className='text-bold  pb-0.5 text-black lg:max-w'>Sign Up</span></p>


                </div>
                <div className='md:w-[50%] h-full hidden lg:flex justify-center items-center bg-[#000000] flex-col gap-2.5 text-white text-[16px] font-semibold rounded-l-[30px] shadow-2xl shadow-black'>
  
                   <img src={imge} alt="" className='w-[70%]'/>
                   <p >Not Just A Platform, It's A Vistagram</p>
                </div>


            </div>

        </div>

    )
}

export default SignIn
