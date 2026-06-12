import React from 'react'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import OnlineUser from '../components/OnlineUser'
import dp from "../assets/dp.webp"

const Messages = () => {
  const navigate=useNavigate()
  const {userData}=useSelector(state=>state.user)
  const {onlineUsers}=useSelector(state=>state.socket)
  const {prevChatUsers,selectedUsers}=useSelector(state=>state.message)
  const dispatch=useDispatch()
  return (
    <div className='w-full min-h-screen flex flex-col bg-black gap-5 p-2.5'>
        <div className='w-full h-20 flex items-center gap-5 px-5'>


                <MdOutlineKeyboardBackspace className='text-white cursor-pointer lg:hidden w-6.25 h-6.25 ' onClick={() => navigate(`/`)} />
                <h1 className='text-white text-[20px] font-semibold '>Messages </h1>
            </div>

            <div className='w-full h-20 flex gap-5 justify-start items-center overflow-x-auto p-5 border-b-2 border-gray-800'>
{userData.following?.map((user,index)=>(
 (onlineUsers?.includes(user._id)) && <OnlineUser user={user} />
))}
            </div>

            <div className='w-full h-full overflow-auto flex flex-col gap-5'>
              
{prevChatUsers?.map((user,index)=>(
  <div className='text-white cursor-pointer w-full flex items-center gap-5'onClick={()=>{
dispatch(selectedUsers(user))
navigate("/messageArea")
  }}>

{onlineUsers?.includes(user._id)? <OnlineUser user={user}/>: <div className='w-12.5 h-12.5 border-2 border-black rounded-full cursor-pointer overflow-hidden'>
         <img src={user.profileImage || dp} alt="" className='w-full object-cover' />
       </div>
       }
       <div className='flex flex-col'>
 <div className='text-white text-[18px] font-semibold'>{user.userName}</div>
{onlineUsers?.includes(user?._id) && <div className='text-blue-500 text-[15px]'>Active Now</div>}
</div>
  </div>
))}


            </div>
    </div>
    
  )
}

export default Messages
