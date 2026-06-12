import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

const SenderMessage = ({message}) => {
    const {userData}=useSelector(state=>state.user)
    const {messages}=useSelector(state=>state.message)
    const scroll=useRef()
    useEffect(()=>{
      scroll.current.scrollIntoView({behavior:"smooth"})  
    },[message.message,message.image,message.video])

  return (
    <div ref={scroll} className='w-fit max-w-[60%] bg-linear-to-br from-[#9400ff] to-[#ff0095] rounded-t-2xl rounded-bl-2xl rounded-br-0 px-2.5 py-2.5 relative ml-auto right-0 flex flex-col gap-2.5'>
      {message.image &&  <img src={message.image} alt="" className='h-50 object-cover rounded-2xl'/>
        }
      {message.video && <video src={message.video} controls className='h-50 w-full object-cover rounded-2xl' />
        }

        {message.message && <div className='text-[18px] text-white wrap-break-word'>
            {message.message}</div>}
            <div className='w-7.5 h-7.5 rounded-full cursor-pointer overflow-hidden absolute -right-6.25 -bottom-10'>
                <img src={userData.profileImage} alt="" className='w-full object-cover'/>
            </div>
    </div>
  )
}

export default SenderMessage
