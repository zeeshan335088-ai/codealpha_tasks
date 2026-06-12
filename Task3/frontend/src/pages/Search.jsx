import React, { useState, useEffect } from 'react'
import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { FiSearch } from "react-icons/fi";
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchData } from '../redux/userSlice';
import dp from "../assets/dp.webp";

const Search = () => {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const dispatch = useDispatch()
  const { searchData } = useSelector(state => state.user)

  const handleSearch = async (keyword) => {
    if (!keyword) {
      dispatch(setSearchData([]))
      return
    }
    try {
      const result = await axios.get(`${serverUrl}/api/user/search?keyword=${keyword}`, { withCredentials: true })
      dispatch(setSearchData(result.data))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(input)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [input])

  return (
    <div className='w-full min-h-screen bg-black flex flex-col items-center'>
      {/* Header */}
      <div className='w-full h-16 flex items-center gap-4 px-5 fixed top-0 bg-black/80 backdrop-blur-md z-50'>
        <MdOutlineKeyboardBackspace 
          className='text-white cursor-pointer w-7 h-7 hover:text-gray-300 transition-colors' 
          onClick={() => navigate('/')} 
        />
        <div className='flex-1 flex justify-center'>
          <form className='w-full max-w-xl h-10 rounded-full bg-[#1a1f1f] flex items-center px-4 border border-gray-800 focus-within:border-gray-600 transition-all'>
            <FiSearch className='w-5 h-5 text-gray-400' />
            <input 
              type="text" 
              placeholder='Search creators...' 
              className='h-full w-full bg-transparent outline-none px-3 text-white text-base placeholder:text-gray-500'
              onChange={(e) => setInput(e.target.value)} 
              value={input}
            />
          </form>
        </div>
      </div>

      {/* Results Area */}
      <div className='w-full max-w-2xl mt-20 px-5 flex flex-col gap-3 pb-10'>
        {input && searchData && searchData.length > 0 ? (
          searchData.map((user) => (
            <div 
              key={user._id}
              className='w-full p-3 rounded-2xl bg-[#0e1212] border border-gray-900 flex items-center gap-4 cursor-pointer hover:bg-[#161b1b] transition-all group' 
              onClick={() => navigate(`/profile/${user.userName}`)}
            >
              <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-800'>
                <img src={user.profileImage || dp} alt="" className='w-full h-full object-cover' />
              </div>
              <div className='flex flex-col flex-1'>
                <div className='text-white font-bold group-hover:text-blue-400 transition-colors'>{user.userName}</div>
                <div className='text-sm text-gray-500'>{user.name}</div>
              </div>
              <div className='text-xs text-gray-600 px-3 py-1 rounded-full border border-gray-800'>View Profile</div>
            </div>
          ))
        ) : input && searchData?.length === 0 ? (
          <div className='flex flex-col items-center justify-center mt-20 gap-4 text-center'>
            <div className='p-5 rounded-full bg-gray-900/50'>
              <FiSearch className='w-10 h-10 text-gray-700' />
            </div>
            <div className='text-xl text-gray-400 font-medium'>No results found for "{input}"</div>
            <div className='text-sm text-gray-600'>Try checking the spelling or using different keywords.</div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center mt-32 gap-4 opacity-40'>
            <FiSearch className='w-16 h-16 text-gray-700' />
            <div className='text-2xl text-gray-600 font-bold'>Search Vistagram</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
