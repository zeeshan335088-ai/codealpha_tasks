import React, { useEffect, useRef, useState } from 'react'
import { FiVolume2 } from "react-icons/fi";
import { FiVolumeX } from "react-icons/fi";
import dp from "../assets/dp.webp"
import FollowButton from './FollowButton';
import { useDispatch, useSelector } from 'react-redux';
import { GoHeart } from "react-icons/go";
import { GoHeartFill } from "react-icons/go";
import { MdOutlineComment } from "react-icons/md";
import axios from 'axios';
import { serverUrl } from '../App';
import { setLoopData } from '../redux/loopSlice'
import { IoSendSharp } from "react-icons/io5";


const LoopCard = ({ loop }) => {
  const videoRef = useRef()
  const [isPlaying, setIsPlaying]=useState(true)
  const [isMute,setIsMute]=useState(true)
  const [progress,setProgress]=useState(0)
 const {userData} = useSelector(state => state.user)
const {socket} = useSelector(state => state.socket)
const {loopData} = useSelector(state => state.loop)

  const [showHeart,setShowHeart]=useState(false)
  const [showComment,setShowComment]=useState(false)
  const [message,setMessage]=useState("")
  const dispatch=useDispatch()
  const commentRef=useRef()
 const handleTimeUpdate =()=>{
    const video =videoRef.current
    if (video) {
      const percent=(video.currentTime / video.duration)*100
      setProgress(percent)
    }
 }

const handleLikeOnDoubleClick = () => {
  setShowHeart(true)
  setTimeout(() => setShowHeart(false), 600)

  if (!loop.likes?.includes(userData?._id)) {
    handleLike()
  }
}

  const handleClick=()=>{
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    }else{
     videoRef.current.play() 
     setIsPlaying(true)
    }
  }

  const handleLike=async()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/loop/like/${loop._id}`,{withCredentials:true})
      const updatedLoop=result.data

      const updatedLoops=loopData.map(p=>p._id==loop._id?updatedLoop:p)
      dispatch(setLoopData(updatedLoops))
      
    } catch (error) {
      console.log(error)
    }
  }

    const handleComment=async()=>{
    try {
      const result=await axios.post(`${serverUrl}/api/loop/comment/${loop._id}`,{message},{withCredentials:true})
      const updatedLoop=result.data

      const updatedLoops=loopData.map(p=>p._id==loop._id?updatedLoop:p)
      dispatch(setLoopData(updatedLoops))
      setMessage("")
      
    } catch (error) {
      console.log(error)
    }
  }

  

 useEffect(()=>{
  const handleClickOutside=(event)=>{
if(commentRef.current && !commentRef.current.contains(event.target)){
  setShowComment(false)
}

  }
 if(showComment){
  document.addEventListener("mousedown",handleClickOutside)
 }else{
  document.removeEventListener("mousedown",handleClickOutside)
 }

 },[showComment])


  // reels data
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const video = videoRef.current
      if (entry.isIntersecting) {
        video.play()
        setIsPlaying(true)
      } else {
        video.pause()
        setIsPlaying(false)
      }
    }, { threshold: 0.6 })
    if (videoRef.current) {
      observer.observe(videoRef.current)
    }
    
    return ()=>{
      if (videoRef.current) {
      observer.unobserve(videoRef.current)
    }
    }

  }, [])

  useEffect(()=>{
  socket?.on("likedLoop",(updatedData)=>{
    const updatedLoops = loopData.map(p => p._id == updatedData.loopId ? {...p,likes:updatedData.likes} : p)
    dispatch(setLoopData(updatedLoops))
  })
  socket?.on("commentedLoop",(updatedData)=>{
    const updatedLoops = loopData.map(p => p._id == updatedData.loopId ? {...p,comments:updatedData.comments} : p)
    dispatch(setLoopData(updatedLoops))
  })
  
  return ()=>{socket?.off("likedLoop")
            socket?.off("commentedLoop")}
  },[socket,loopData,dispatch])
  return (
    <div className='w-full max-w-md lg:max-w-none lg:w-120 h-screen flex items-center justify-center border-l border-r border-gray-800 relative bg-black'>
{showHeart && 
<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 heart-animation z-50'>
    <GoHeartFill className='w-25 h-25 text-white drop-shadow-2xl' /> 
 </div>
}

{/* comment div */}
<div ref={commentRef} className={`absolute z-200 bottom-0 w-full h-[70%]
   p-5 rounded-t-3xl bg-[#0e1718] transition-transform duration-500 ease-in-out shadow-2xl shadow-black left-0 ${showComment?"translate-y-0":"translate-y-full "}`}>
  <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setShowComment(false)}></div>
  <h1 className='text-white text-xl text-center font-bold mb-6'>Comments</h1>

  <div className='w-full h-[calc(100%-120px)] overflow-y-auto flex flex-col gap-4 pb-20 scrollbar-hide'>

  {loop.comments?.length==0 && <div className='text-center text-gray-400 text-lg font-medium mt-10 '>No comments yet. Be the first!</div>}

{loop.comments?.map((com,index)=>(
<div key={index} className='w-full flex flex-col gap-2 pb-4 border-b border-gray-800/50'>
  
    <div className='flex items-center gap-3'>
          <div className='w-8 h-8 border border-gray-700 rounded-full cursor-pointer overflow-hidden '>
            <img src={com.author?.profileImage || dp} alt="" className='w-full h-full object-cover' />
          </div  >
          <div className='font-bold text-sm text-white'>{com.author?.userName}</div>
        </div>
        <div className='text-gray-200 text-sm pl-11'>{com.message}</div>
</div>
))}
  </div>

 
     <div className='absolute bottom-0 left-0 w-full p-4 bg-[#0e1718] border-t border-gray-800'>
        <div className="flex items-center gap-3 bg-[#1a2426] rounded-full px-4 py-2">
            <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0'>
                <img src={userData?.profileImage || dp} alt="" className='w-full h-full object-cover' />
            </div>
            <input 
                type="text" 
                className='flex-1 bg-transparent text-white text-sm outline-none' 
                placeholder='Add a comment...' 
                onChange={(e)=>setMessage(e.target.value)} 
                value={message}
            />
            {message.trim() && (
                <button className='text-blue-500 font-bold text-sm cursor-pointer' onClick={handleComment}>Post</button>
            )}
        </div>
     </div> 
  
</div>
 

      <video 
        ref={videoRef} 
        autoPlay 
        loop 
        muted={isMute} 
        src={loop?.media} 
        className='h-full w-full object-contain'
        onClick={handleClick} 
        onTimeUpdate={handleTimeUpdate} 
        onDoubleClick={handleLikeOnDoubleClick}
      />

      <div className='absolute top-5 right-5 z-100 p-2 bg-black/20 rounded-full backdrop-blur-sm cursor-pointer' onClick={()=>setIsMute(prev=>!prev)}>
         {isMute ? <FiVolumeX className='w-5 h-5 text-white'/> : <FiVolume2 className='w-5 h-5 text-white'/>}
      </div>

      <div className='absolute bottom-0 left-0 w-full h-1 bg-gray-800 z-50'>
        <div className='h-full bg-white transition-all duration-200 ease-linear' style={{width:`${progress}%`}}></div>
      </div>
   
   <div className='absolute bottom-0 left-0 w-full p-5 pt-20 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-3 pointer-events-none'>
        <div className='flex items-center gap-3 pointer-events-auto'>
            <div className='w-10 h-10 border-2 border-white/20 rounded-full cursor-pointer overflow-hidden' onClick={() => navigate(`/profile/${loop.author?.userName}`)}>
                <img src={loop.author?.profileImage || dp} alt="" className='w-full h-full object-cover' />
            </div>
            <div className='flex flex-col'>
                <span className='font-bold text-white text-sm'>{loop.author?.userName}</span>
                <span className='text-xs text-gray-300'>{loop.caption}</span>
            </div>
            <FollowButton targetUserId={loop.author?._id} tailwind={"ml-2 px-4 py-1 bg-transparent border border-white text-white text-xs font-bold rounded-md hover:bg-white/10 transition-colors"}/>
        </div>
   </div>

   <div className='absolute right-2 bottom-20 flex flex-col gap-6 items-center z-40'>
        <div className='flex flex-col items-center gap-1 group cursor-pointer' onClick={handleLike}>
            <div className='p-3 bg-black/20 rounded-full backdrop-blur-md group-hover:bg-black/40 transition-all'>
                {loop.likes?.includes(userData?._id) 
                    ? <GoHeartFill className='w-7 h-7 text-red-500' /> 
                    : <GoHeart className='w-7 h-7 text-white' />
                }
            </div>
            <span className='text-white text-xs font-bold'>{loop.likes?.length || 0}</span>
        </div>

        <div className='flex flex-col items-center gap-1 group cursor-pointer' onClick={()=>setShowComment(true)}>
            <div className='p-3 bg-black/20 rounded-full backdrop-blur-md group-hover:bg-black/40 transition-all'>
                <MdOutlineComment className='w-7 h-7 text-white' />
            </div>
            <span className='text-white text-xs font-bold'>{loop.comments?.length || 0}</span>
        </div>

        <div className='flex flex-col items-center gap-1 group cursor-pointer'>
            <div className='p-3 bg-black/20 rounded-full backdrop-blur-md group-hover:bg-black/40 transition-all'>
                <IoSendSharp className='w-6 h-6 text-white -rotate-45' />
            </div>
        </div>
   </div>
</div>
  )
}

export default LoopCard