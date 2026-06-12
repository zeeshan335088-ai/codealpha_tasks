import React, { useState } from 'react'
import dp from "../assets/dp.webp"
import VideoPlayer from '../components/VideoPlayer';
import { GoHeart } from "react-icons/go";
import { GoHeartFill } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux"
import { MdOutlineComment } from "react-icons/md";
import { MdOutlineBookmarkBorder } from "react-icons/md";
import { GoBookmarkFill } from "react-icons/go";
import { IoSendSharp } from "react-icons/io5";
import axios from 'axios'
import { serverUrl } from '../App'
import { setPostData } from '../redux/postSlice';
import { setUserData } from '../redux/userSlice';
import FollowButton from './FollowButton';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Post = ({ post }) => {
  const { userData } = useSelector(state => state.user)
  const { postData } = useSelector(state => state.post)
  const { socket } = useSelector(state => state.socket)
  const [showComment, setShowComment] = useState(false)
  const [message, setMessage] = useState("")
  const navigate=useNavigate()
  const dispatch = useDispatch()
  const handleLike = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/post/like/${post._id}`, { withCredentials: true })
      const updatedPost = result.data

      const updatedPosts = postData.map(p => p._id == post._id ? updatedPost : p)
      dispatch(setPostData(updatedPosts))

    } catch (error) {

    }
  }

  const handleComment = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/post/comment/${post._id}`, { message }, { withCredentials: true })
      const updatedPost = result.data

      const updatedPosts = postData.map(p => p._id == post._id ? updatedPost : p)
      dispatch(setPostData(updatedPosts))

    } catch (error) {

    }
  }

  const handleSaved = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/post/saved/${post._id}`, { withCredentials: true })
      dispatch(setUserData(result.data))

    } catch (error) {

    }
  }

useEffect(()=>{
socket?.on("likedPost",(updatedData)=>{
  const updatedPosts = postData.map(p => p._id == updatedData.postId ? {...p,likes:updatedData.likes} : p)
  dispatch(setPostData(updatedPosts))
})
socket?.on("commentedPost",(updatedData)=>{
  const updatedPosts = postData.map(p => p._id == updatedData.postId ? {...p,comments:updatedData.comments} : p)
  dispatch(setPostData(updatedPosts))
})

return ()=>{socket?.off("likedPost")
          socket?.off("commentedPost")}
},[socket,postData,dispatch])
  return (
    <div className='w-[90%]  flex flex-col gap-2.5 bg-white items-center shadow-2xl shadow-[#00000058]
    rounded-2xl pb-5'>
      <div className='w-full h-20 flex justify-between items-center px-2.5'>
        <div className='flex justify-center items-center md:gap-5 gap-2.5' onClick={()=>navigate(`/profile/${post.author?.userName}`)}>
          <div className='md:w-15 md:h-15 w-10 h-10 border-2 border-black rounded-full cursor-pointer overflow-hidden '>
            <img src={post.author?.profileImage || dp} alt="" className='w-full object-cover' />
          </div  >
          <div className='w-37.5 font-semibold truncate'>{post.author?.userName}</div>
        </div>
        {post.author && userData._id != post.author._id &&
          <FollowButton tailwind={'px-2 md:px-4 py-1.5 h-8 md:h-10 bg-black text-white rounded-full text-xs md:text-sm font-medium whitespace-nowrap'} targetUserId={post.author._id} />
        }

      </div>

      <div className='w-[90%] flex flex-col items-center justify-center '>
        {post.mediaType == "image" && <div className='w-[90%]   flex  items-center justify-center '>
          <img src={post.media} alt="" className='w-[80%]  rounded-2xl  object-cover' />


        </div>}

        {post.mediaType == "video" && <div className='w-[80%]  flex flex-col items-center justify-center '>
          <VideoPlayer media={post.media} />

        </div>}


      </div>

      <div className='w-full h-15 flex justify-between items-center px-5 mt-2.5'>

        <div className='flex justify-center items-center gap-2.5'>
          <div className='flex justify-center items-center gap-1.25'>
            {!post.likes.includes(userData._id) && <GoHeart className='w-6.25 cursor-pointer h-6.25' onClick={handleLike} />}
            {post.likes.includes(userData._id) && <GoHeartFill className='w-6.25 cursor-pointer h-6.25 text-red-600' onClick={handleLike} />
            }
            <span>{post.likes.length}</span>
          </div>
          <div className='flex justify-center items-center gap-1.25' onClick={() => setShowComment(prev => !prev)}>
            <MdOutlineComment className='w-6.25 cursor-pointer h-6.25' />
            <span>{post.comments.length}</span>
          </div>
        </div>
        <div onClick={handleSaved}>
          {!userData.saved.includes(post?._id) && <MdOutlineBookmarkBorder className='w-6.25 cursor-pointer h-6.25' />}
          {userData.saved.includes(post?._id) && <GoBookmarkFill className='w-6.25 cursor-pointer h-6.25' />}
        </div>
      </div>
      {post.caption && post.author && (<div className='w-full px-5 gap-2.5 flex justify-start items-center'>
        <h1>{post.author.userName}</h1>
        <h1>{post.caption}</h1>
      </div>)}

      {showComment &&
        <div className='w-full flex flex-col gap-7.5 pb-5'>
          <div className='w-full h-20 flex items-center justify-between px-5 relative'>
            <div className='md:w-15 md:h-15 w-10 h-10 border-2 border-black rounded-full cursor-pointer overflow-hidden '>
              <img src={post.author?.profileImage || dp} alt="" className='w-full object-cover' />
            </div>
            <input type="text" className='px-2.5 border-b-2 border-b-gray-500 w-[90%] outline-none h-20' placeholder='write comment...' onChange={(e) => setMessage(e.target.value)} value={message} />
            <button className='absolute right-5 cursor-pointer' onClick={handleComment}><IoSendSharp className='w-6.25 h-6.25' /></button>
          </div>

          <div className='w-full max-h-75 overflow-auto'>
            {post.comments?.map((com, index) => (
              <div key={index} className='w-full px-5 py-5 flex items-center gap-5 border-b-2 border-b-gray-200'>
                <div className='md:w-15 md:h-15 w-10 h-10 border-2 border-black rounded-full cursor-pointer overflow-hidden '>
                  <img src={com.author?.profileImage || dp} alt="" className='w-full object-cover' />
                </div>
                <div>{com.message}</div>
              </div>
            ))}

          </div>
        </div>

      }


    </div>
  )
}

export default Post
