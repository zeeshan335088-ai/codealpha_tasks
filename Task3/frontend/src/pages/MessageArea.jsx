import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import dp from "../assets/dp.webp"
import { LuImage } from "react-icons/lu";
import { IoMdSend } from "react-icons/io";
import axios from 'axios'
import { serverUrl } from '../App'
import { setMessages } from '../redux/messageSlice'
import Messages from './Messages'
import SenderMessage from '../components/SenderMessage'
import ReceiverMessage from '../components/ReceiverMessage'
import { IoCall, IoVideocam } from 'react-icons/io5'
import { setCall } from '../redux/callSlice'

const MessageArea = () => {
    const {selectedUser,messages}=useSelector(state=>state.message)
    const {userData}=useSelector(state=>state.user)
    const {socket}=useSelector(state=>state.socket)
    const navigate=useNavigate() 
    const [input,setInput]=useState("")
    const dispatch=useDispatch()
    const mediaInput=useRef()
    const [frontendMedia,setFrontendMedia]=useState(null)
    const [backendMedia,setBackendMedia]=useState(null)
    const [mediaType,setMediaType]=useState("")
    
    const initiateCall = (type) => {
        console.log("Initiating call to:", selectedUser.userName, "Type:", type);
        dispatch(setCall({
            isCalling: true,
            remoteUser: selectedUser,
            callType: type
        }));
    };

    const handleMedia=(e)=>{
        const file=e.target.files[0]
        if(file.type.includes("video")){
            setMediaType("video")
        }else{
            setMediaType("image")
        }
  setBackendMedia(file)
  setFrontendMedia(URL.createObjectURL(file))
    }

const handleSendMessage = async (e) => {
  e.preventDefault()
  if (!input.trim() && !backendMedia) return;
  
  try {
    const formData = new FormData()
    formData.append("message", input)

    if (backendMedia) {
      formData.append("media", backendMedia)
    }

    const result = await axios.post(
      `${serverUrl}/api/message/send/${selectedUser._id}`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    dispatch(setMessages([...messages, result.data]))
    setInput("")
    setFrontendMedia(null)
    setBackendMedia(null)
    setMediaType("")
  } catch (error) {
    console.log(error)
  }
}


const getAllMessages=async()=>{
    try {
        const result=await axios.get(`${serverUrl}/api/message/getAll/${selectedUser._id}`,{withCredentials:true})
        dispatch(setMessages(result.data))
    } catch (error) {
        console.log(error)
    }
}
useEffect(()=>{
getAllMessages()
},[])

useEffect(()=>{
socket?.on("newMessage", (mess)=>{
  dispatch(setMessages([...messages,mess]))
})
return ()=>socket?.off("newMessage")
},[messages,setMessages])
  return (
    <div className='w-full h-screen bg-black relative'>
      
      <div className='w-full flex items-center  gap-3.75 px-5 py-2.5 fixed top-0 z-100 bg-black '>
        <div className=' h-20 flex items-center gap-5 px-5'>
   <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-6.25 h-6.25 ' onClick={() => navigate(`/`)} />
  </div>
    <div className='w-10 h-10 border-2 border-black rounded-full cursor-pointer overflow-hidden' onClick={()=>navigate(`/profile/${selectedUser.userName}`)}>
           <img src={selectedUser.profileImage || dp} alt="" className='w-full object-cover' />
         </div>

         <div className='text-white text-[18px] font-semibold flex-1'>
            <div>{selectedUser.userName}</div>
            <div className='text-[14px] text-gray-400
            '>{selectedUser.name}</div>
         </div>

         <div className='flex items-center gap-5 mr-5 relative z-[200]'>
            <IoCall className='text-white w-6 h-6 cursor-pointer hover:text-purple-500 transition-colors pointer-events-auto' onClick={(e) => {
                e.stopPropagation();
                initiateCall('audio');
            }} />
            <IoVideocam className='text-white w-7 h-7 cursor-pointer hover:text-purple-500 transition-colors pointer-events-auto' onClick={(e) => {
                e.stopPropagation();
                initiateCall('video');
            }} />
         </div>

      </div>

      <div className='w-full h-[80%] pt-25  px-10 flex flex-col gap-12.5 overflow-auto bg-black'>
{messages && messages.map((mess,index)=>(
    mess.sender==userData._id?<SenderMessage message={mess}/>:<ReceiverMessage message={mess}/>
))}
      </div>
<div className='w-full h-20 fixed bottom-0 flex justify-center items-center bg-black z-100'>
<form className='w-[90%] max-w-200 h-[80%] rounded-full bg-[#131616] flex items-center gap-2.5 px-5 relative' onSubmit={handleSendMessage}>
   {frontendMedia &&  <div className='w-40 rounded-2xl h-40 absolute -top-45 right-2.5 overflow-hidden bg-black/50 border border-gray-800 p-1'>
      {mediaType === "image" ? (
          <img src={frontendMedia} alt="" className='w-full h-full object-cover rounded-xl'/>  
      ) : (
          <video src={frontendMedia} className='w-full h-full object-cover rounded-xl' />
      )}
    </div>}
   
    <input type="file" accept='image/*,video/*' hidden ref={mediaInput} onChange={handleMedia}/>
   <input type="text" placeholder='Message' className='w-full h-full px-5 text-[18px] text-white outline-0' onChange={(e)=>setInput(e.target.value)} value={input}/> 
   <div className='cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors' onClick={()=>mediaInput.current.click()}><LuImage className='w-7 h-7 text-white'/></div>
   {(input.trim() || frontendMedia) && <button className='w-15 h-10 rounded-full bg-linear-to-br from-[#9500ff] to-[#ff0095] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity'><IoMdSend className='w-6.25 h-6.25 text-white'/></button>}
   
</form>
</div>


    </div>
  )
}

export default MessageArea
