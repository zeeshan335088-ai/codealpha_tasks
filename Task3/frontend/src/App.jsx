import React, { useEffect } from 'react'
import { Navigate, Route,Routes } from 'react-router-dom'
import SignUp from './pages/SignUp.jsx'
import SignIn from './pages/SignIn.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Home from './pages/Home.jsx'
export const serverUrl ="http://localhost:8000"
import { useDispatch, useSelector } from 'react-redux'

import getCurrentUser from './hooks/getCurrentUser.jsx'
import getSuggestedUsers from './hooks/getSuggestedUser.jsx'
import Profile from './pages/Profile.jsx'
import EditProfile from './pages/EditProfile.jsx'
import Upload from './pages/Upload.jsx'
import getAllPost from './hooks/getAllPost.jsx'
import Loops from './pages/Loops.jsx'
import getAllLoops from './hooks/getAllLoops.jsx'
import Story from './pages/Story.jsx'
import getAllStories from './hooks/getAllStories.jsx'
import Messages from './pages/Messages.jsx'
import MessageArea from './pages/MessageArea.jsx'
import {io} from "socket.io-client"
import { setOnlineUsers, setSocket } from './redux/socketSlice.js'
import getFollowingList from './hooks/getFollowingList.jsx'
import getPrevChatUsers from './hooks/getPrevChatUsers.jsx'
import Search from './pages/Search.jsx'
import { resetCall, setCall } from './redux/callSlice.js'
import CallModal from './components/CallModal.jsx'

const App = () => {
  getCurrentUser()
  getSuggestedUsers()
  getAllPost()
  getAllLoops()
  getAllStories()
  getFollowingList()
  getPrevChatUsers()
  const {userData}=useSelector(state=>state.user)
  const {socket}=useSelector(state=>state.socket)
  const dispatch=useDispatch()

  useEffect(()=>{
    if(userData){
      const socketIo=io(`${serverUrl}`,{
        query:{
          userId:userData._id
        }
      })
    
    socketIo.on('connect', () => {
      console.log("SOCKET CONNECTED:", socketIo.id);
      dispatch(setSocket(socketIo))
    });

    socketIo.on('getOnlineUsers',(users)=>{
      dispatch(setOnlineUsers(users))
      console.log("Online Users:", users) 
    })

    socketIo.on('callUser', (data) => {
      const { from, name, signal, callType } = data;
      console.log("!!! INCOMING CALL RECEIVED BY SOCKET !!!", { from: name, type: callType });
      
      // Force update the call state
      dispatch(setCall({
        receivingCall: true,
        caller: from,
        callerSignal: signal,
        callType: callType || 'video',
        isCalling: false,
        callAccepted: false
      }));
    });

    socketIo.on('endCall', () => {
      console.log("CALL ENDED BY REMOTE");
      dispatch(resetCall());
    });

    return ()=> {
      console.log("CLEANING UP SOCKET");
      socketIo.off('callUser')
      socketIo.off('endCall')
      socketIo.off('getOnlineUsers')
      socketIo.close()
      dispatch(setSocket(null))
    }
    }
  },[userData, dispatch])
  
  return (
    <>
    <CallModal />
    <Routes>
      <Route path="/signup" element={!userData?<SignUp />:<Navigate to={"/"}/>} />
      <Route path="/signin" element={!userData?<SignIn />:<Navigate to={"/"}/>} />
      <Route path="/" element={userData?<Home />:<Navigate to={"/signin"
      }/>} />
      <Route path="/forgot-password" element={!userData?<ForgotPassword />:<Navigate to={"/"}/>} /> 
       <Route path="/profile/:userName" element={userData?<Profile />:<Navigate to={"/signin"
      }/>} />
       <Route path="/story/:userName" element={userData?<Story />:<Navigate to={"/signin"
      }/>} />
       <Route path="/upload" element={userData?<Upload />:<Navigate to={"/signin"
      }/>} />
      <Route path="/search" element={userData?<Search />:<Navigate to={"/signin"
      }/>} />
       <Route path="/editprofile" element={userData?<EditProfile />:<Navigate to={"/signin"
      }/>} />
        <Route path="/messages" element={userData?<Messages />:<Navigate to={"/signin"
      }/>} />
        <Route path="/messageArea" element={userData?<MessageArea />:<Navigate to={"/signin"
      }/>} />
      <Route path="/loops" element={userData?<Loops />:<Navigate to={"/signin"
      }/>} />
    </Routes>
    </>
  )
}

export default App
