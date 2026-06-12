import React from 'react'
import imge from "../assets/imge.png"
import { FaRegHeart } from "react-icons/fa6";
import dp from "../assets/dp.webp"
import {useDispatch, useSelector} from 'react-redux'
import axios from 'axios'
import {serverUrl} from '../App'
import { setUserData } from '../redux/userSlice';
import OtherUser from './OtherUser';

const LeftHome = () => {

  const {userData, suggestedUsers} = useSelector(state=>state.user)
  const dispatch = useDispatch()

  const handleLogOut = async ()=>{
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {withCredentials:true})
 dispatch(setUserData(null))
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className='w-[25%] hidden lg:block min-h-screen bg-black border-r-2 border-gray-900'>
      <div className='w-full h-25 flex items-center justify-between p-5'>
       <img className='w-40' src={imge} alt="/" /> 
       <div>
     <FaRegHeart className='text-white w-6 h-6' />
       </div>
      </div>
      <div className='flex items-center w-full justify-between gap-2.5 px-2.5 border-b-2 border-b-gray-900 py-2.5'>
        <div className='flex items-center gap-2.5'>
  <div className='w-18 h-18 border-2 border-black rounded-full cursor-pointer overflow-hidden '>
    <img src={userData.profileImage || dp} alt="" className='w-full object-cover' />
  </div>
  <div >
    <div className='text-[18px] text-white font-semibold'>{userData.userName}</div>
    <div className='text-[14px] text-gray-400 font-semibold'>{userData.name}

    </div>
  </div>
  </div>
  
  <div className='text-blue-500 font-semibold cursor-pointer' onClick={handleLogOut}>Log Out</div>
      </div>

<div className='w-full flex flex-col gap-5 p-5'>
  <h1 className='text-white text-[19px]'>Suggested Users</h1>
  {suggestedUsers && suggestedUsers.slice(0,3).map((user,index)=>(

    <OtherUser key={index} user={user}/>
  ))}
</div>

    

    </div>
  )
}

export default LeftHome
