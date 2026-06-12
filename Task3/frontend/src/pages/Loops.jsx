import { MdOutlineKeyboardBackspace } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoopCard from '../components/LoopCard'

const Loops = () => {
  const navigate = useNavigate()
  const { loopData } = useSelector(state => state.loop)

  return (
    <div className="w-screen h-screen bg-black relative">

      {/* HEADER */}
      <div className="fixed top-0 left-0 w-full h-16 flex items-center gap-5 px-5 bg-black z-50">
        <MdOutlineKeyboardBackspace
          className="text-white cursor-pointer w-6 h-6"
          onClick={() => navigate('/')}
        />
        <h1 className="text-white text-[20px] font-semibold">Loops</h1>
      </div>

      {/* SCROLLABLE REELS */}
      <div className="w-full h-screen pt-16 overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {loopData?.map((loop,index) => (
          <div key={loop._id} className="h-screen snap-start flex justify-center">
            <LoopCard loop={loop} key={index}/>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Loops
