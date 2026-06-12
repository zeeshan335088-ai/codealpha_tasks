import React, { useEffect, useState } from 'react'
import dp from "../assets/dp.webp"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { FaEye } from "react-icons/fa";
import VideoPlayer from './VideoPlayer'
const StoryCard = ({storyData}) => {
     const {userData}=useSelector(state=>state.user)
     const [showViewers,setShowViewers]=useState(false)
    const navigate=useNavigate({storyData})
    const [progress,setProgress]=useState(0)

useEffect(()=>{
const interval=setInterval(()=>{
setProgress(prev=>{
    if(prev>=100){
        clearInterval(interval)
        navigate('/')
     return 100
    }
    
   return prev+1})
},150)

return ()=>clearInterval(interval)
},[navigate])

  return (
    <div className='w-full max-w-125 h-screen border-x-2 border-gray-800 pt-2.5 relative flex flex-col justify-center'>



    <div className='flex item-center gap-2.5 absolute top-7.5 px-2.5'>
         <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-6.25 h-6.25 ' onClick={() => navigate(`/`)} />
          <div className='md:w-10 md:h-10 w-7.5 h-7.5 border-2 border-black rounded-full cursor-pointer overflow-hidden'>
                    <img src={storyData?.author?.profileImage || dp} alt="" className='w-full object-cover' />
                  </div>
                  <div className='w-30 font-semibold truncate text-white'>{storyData?.author?.userName}</div>
    </div>

       <div className='absolute top-2.5  w-full h-1.25 bg-gray-900'>
<div className='w-50 h-full bg-white transition-all duration-200 ease-linear' style={{width:`${progress}%`}}>

</div>

  </div>

    {!showViewers && <> <div className='w-full h-[90vh] flex flex-col items-center justify-center '>
        {storyData?.mediaType == "image" && <div className='w-[90%]   flex  items-center justify-center '>
          <img src={storyData.media} alt="" className='h-[80%]  rounded-2xl  object-cover' />


        </div>}

        {storyData?.mediaType == "video" && <div className='w-[80%]  flex flex-col items-center justify-center '>
          <VideoPlayer media={storyData?.media} />
        </div>}
      </div>

   

{storyData?.author?.userName==userData?.userName && 
<div className='abolute text-white flex items-center gap-2.5 w-full h-17.5 bottom-0 p-2 cursor-pointer left-0' onClick={()=>setShowViewers(true)}> 
<div className='text-white flex items-center gap-1.25'><FaEye />{storyData?.viewers?.length}</div>

<div className='flex relative'>
              {storyData?.viewers?.slice(0, 3).map((viewer, index) => (
                <div
                key={viewer?._id || index}

                  style={index > 0 ? { left: `${index * 9}px` } : {}}
                  className={`w-7.5 h-7.5 border-2 border-black rounded-full cursor-pointer overflow-hidden ${index > 0 ? "absolute" : ""
                    }`}
                >
                  <img
                    src={viewer?.profileImage || dp}
                    alt=""
                    className="w-full  object-cover"
                  />
                </div>
              ))}
            </div>

</div> }
</>}

{showViewers && <>
<div className='w-full h-[30%] flex flex-col items-center justify-center mt-14 cursor-pointer overflow-hidden py-7.5' onClick={()=>setShowViewers(false)}>
        {storyData?.mediaType == "image" && <div className='h-full   flex  items-center justify-center '>
          <img src={storyData?.media} alt="" className='h-[80%]  rounded-2xl  object-cover' />


        </div>}

        {storyData?.mediaType == "video" && <div className='h-full  flex flex-col items-center justify-center '>
          <VideoPlayer media={storyData?.media} />
        </div>}
      </div>

      <div className='w-full h-[70%] border-t-2 border-t-gray-800 p-5'>
<div className='text-white flex items-center gap-2.5'>
  <FaEye />
  <span>{storyData?.viewers?.length}</span>
  <span>Viewers</span>
</div>
  <div className='w-full max-h-full flex flex-col gap-2.5 overflow-auto pt-5'>
    {storyData?.viewers?.map((viewer,index)=>(
<div className='w-full flex items-center gap-5'>
  <div className='md:w-10 md:h-10 w-7.5 h-7.5 border-2 border-black rounded-full cursor-pointer overflow-hidden'>
                    <img src={viewer?.profileImage || dp} alt="" className='w-full object-cover' />
                  </div>
                  <div className='w-30 font-semibold truncate text-white'>{viewer?.userName}</div>
</div>
    ))}

  </div>
      </div>

</> }
  


    </div>
  )
}

export default StoryCard