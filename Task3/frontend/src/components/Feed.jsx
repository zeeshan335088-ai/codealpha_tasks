import React from 'react'
import logo from "../assets/logo.png"
import { FaRegHeart } from "react-icons/fa6";
import StoryDp from './StoryDp';
import Nav from './Nav';
import { useSelector } from 'react-redux';
import { BiSolidMessageDetail } from "react-icons/bi";
import Post from './Post';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const {postData}=useSelector(state=>state.post)
  const {userData}=useSelector(state=>state.user)
  const {storyList,currentUserStory}=useSelector(state=>state.story)
  const navigate =useNavigate()
  return (
    <div className='lg:w-[50%] w-full bg-black min-h-lvh lg:h-lvh relative lg:overflow-y-auto'>
         <div className='w-full h-25 flex items-center justify-between p-5 lg:hidden'>
             <img className='w-20' src={logo} alt="/" /> 
             <div className='flex items-center gap-2.5'>
           <FaRegHeart className='text-white w-6 h-6' />
           <BiSolidMessageDetail className='text-white w-6 h-6' onClick={()=>navigate("/messages")}/>
             </div>
            </div>

            <div className='flex w-full overflow-x-auto gap-2.5 items-center p-5'>

    <StoryDp userName={"Your Story"} ProfileImage={userData.profileImage} story={currentUserStory}/>

    {storyList?.map((story,index)=>(

<StoryDp userName={story?.author?.userName} ProfileImage={story?.author?.profileImage} story={story} key={index}
/>

    ))}
   
            </div>

       <div className='w-ful min-h-screen flex flex-col items-center gap-5 p-2.5 pt-10 bg-white rounded-t-[60px] relative pb-30'>

        <Nav/>

        {postData?.map((post,index)=>(
          <Post post={post} key={index}/>
        ))}
        </div>     
      
    </div>
  )
}

export default Feed
