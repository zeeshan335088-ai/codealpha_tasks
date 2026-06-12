import React from 'react'
import { useSelector } from 'react-redux'
import dp from "../assets/dp.webp"
import { useNavigate } from 'react-router-dom'
import FollowButton from './FollowButton'
const OtherUser = ({user}) => {
    const {userData}=useSelector(state=>state.user)
    const navigate = useNavigate()
  return (
    <div className='w-full h-20 flex items-center justify-between border-b-2 border-gray-800'>
       <div className='flex items-center gap-2.5'>
       <div className='w-12.5 h-12.5 border-2 border-black rounded-full cursor-pointer overflow-hidden' onClick={()=>navigate(`/profile/${user.userName}`)}>
         <img src={user.profileImage || dp} alt="" className='w-full object-cover' />
       </div>
       <div >
         <div className='text-[18px] text-white font-semibold'>{user.userName}</div>
         <div className='text-[14px] text-gray-400 font-semibold'>{user.name}
     
         </div>
       </div>
       </div> 
       <FollowButton tailwind={'px-2.5 w-25 py-1.5 h-10 bg-white rounded-2xl'} targetUserId={user._id}/>
       
    </div>
  )
}

export default OtherUser
