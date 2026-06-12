import React from 'react'
import dp from "../assets/dp.webp"
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setSelectedUser } from '../redux/messageSlice'
const OnlineUser = ({user}) => {
const navigate=useNavigate()
const dispatch=useDispatch()
  return (
    <div className='w-12.5 h-12.5 flex gap-5 justify-start items-center relative'>
       <div className='w-12.5 h-12.5 border-2 border-black rounded-full cursor-pointer overflow-hidden' onClick={()=>{
         dispatch(setSelectedUser(user))
         navigate(`/messageArea`)
       }}>
               <img src={user.profileImage || dp} alt="" className='w-full object-cover' />
             </div>
             <div className='w-2.5 h-2.5 bg-[#0080ff] rounded-full absolute top-0 right-0'>

             </div>
    </div>
  )
}

export default OnlineUser
