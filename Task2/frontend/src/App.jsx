import { useState, useEffect, useRef } from 'react'
import { Video, Monitor, Share2, PenTool, User, Send, LogOut, MessageSquare, MessageCircle, Phone, PhoneOff, Users } from 'lucide-react'
import VideoRoom from './VideoRoom'
import Whiteboard from './Whiteboard'
import Auth from './components/Auth'
import Chat from './components/Chat'
import ChatList from './components/ChatList'
import PeopleList from './components/PeopleList'
import SearchModal from './components/SearchModal'
import { socket } from './socket'
import axios from 'axios'

function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('chats')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [contacts, setContacts] = useState([])
  const [incomingCall, setIncomingCall] = useState(null) // For incoming call notifications
  const [calling, setCalling] = useState(false) // For outgoing call state
  
  // Get room ID from URL or generate a new one
  const getInitialRoomId = () => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) return roomParam;
    
    // Generate a random 6-character room ID if not in URL
    const randomId = Math.random().toString(36).substring(2, 8);
    return randomId;
  };

  const [roomId, setRoomId] = useState(getInitialRoomId())
  const [loading, setLoading] = useState(true)
  const videoRoomRef = useRef()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      
      // Connect socket and signal online status
      socket.connect()
      socket.emit('user-online', parsedUser.id)
      
      // Initial fetch of contacts
      fetchContacts()
    }
    
    // Update URL to include room ID if it's not there
    const url = new URL(window.location);
    if (!url.searchParams.has('room')) {
      url.searchParams.set('room', roomId);
      window.history.replaceState({}, '', url);
    }
    
    const handlePresenceUpdate = (users) => {
      setOnlineUsers(users)
    }

    // Listen for incoming call
    const handleIncomingCall = (callData) => {
      setIncomingCall(callData)
    }

    // Listen for call acceptance
    const handleCallAccepted = ({ roomId: acceptedRoomId }) => {
      setCalling(false)
      setRoomId(acceptedRoomId)
      setActiveTab('video')
      const url = new URL(window.location)
      url.searchParams.set('room', acceptedRoomId)
      window.history.replaceState({}, '', url)
    }

    // Listen for call decline
    const handleCallDeclined = () => {
      setCalling(false)
      alert('Call declined')
    }

    socket.on('presence-update', handlePresenceUpdate)
    socket.on('incoming-call', handleIncomingCall)
    socket.on('call-accepted', handleCallAccepted)
    socket.on('call-declined', handleCallDeclined)

    setLoading(false)

    return () => {
      socket.off('presence-update', handlePresenceUpdate)
      socket.off('incoming-call', handleIncomingCall)
      socket.off('call-accepted', handleCallAccepted)
      socket.off('call-declined', handleCallDeclined)
    }
  }, [roomId])

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chat/contacts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleAddContact = async (contactId) => {
    try {
      await axios.post('http://localhost:5000/api/chat/add-contact', { contactId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchContacts();
      setIsSearchModalOpen(false);
      alert('Contact added successfully!');
    } catch (err) {
      console.error('Error adding contact:', err);
    }
  };

  const handleStartCall = async (contact) => {
    try {
      const res = await axios.post('http://localhost:5000/api/chat/conversation', { 
        recipientId: contact._id 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const conversationId = res.data._id;
      setCalling(true);
      setRoomId(conversationId);
      
      // Emit call initiation
      socket.emit('initiate-call', {
        callerId: user.id,
        callerName: user.username,
        recipientId: contact._id,
        roomId: conversationId
      });
      
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('room', conversationId);
      window.history.replaceState({}, '', url);
    } catch (err) {
      console.error('Error starting call:', err);
    }
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      socket.emit('accept-call', {
        roomId: incomingCall.roomId,
        callerId: incomingCall.callerId
      });
      setRoomId(incomingCall.roomId);
      setActiveTab('video');
      setIncomingCall(null);
      const url = new URL(window.location);
      url.searchParams.set('room', incomingCall.roomId);
      window.history.replaceState({}, '', url);
    }
  };

  const handleDeclineCall = () => {
    if (incomingCall) {
      socket.emit('decline-call', {
        callerId: incomingCall.callerId
      });
      setIncomingCall(null);
    }
  };

  const handleStartChat = async (contact) => {
    try {
      const res = await axios.post('http://localhost:5000/api/chat/conversation', { 
        recipientId: contact._id 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedConversation(res.data);
      setActiveTab('chats');
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )

  if (!user) {
    return <Auth onAuthSuccess={setUser} />
  }

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 p-4 shadow-lg flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="text-blue-500" /> CommApp
          </h1>
          <div className="bg-slate-700 px-3 py-1 rounded-full text-sm font-mono flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Room: {roomId}
          </div>
        </div>
        <div className="flex gap-4 relative">
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
          >
            <User size={20} className="text-blue-400" />
            <span className="font-medium">{user.username}</span>
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => {
                  setIsSearchModalOpen(true);
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Users size={16} className="text-blue-400" />
                Find a person
              </button>
              <div className="border-t border-slate-700 my-1" />
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-8 gap-8">
          <NavButton 
            icon={<MessageCircle />} 
            active={activeTab === 'chats'} 
            onClick={() => setActiveTab('chats')} 
            label="Chats"
          />
          <NavButton 
            icon={<Video />} 
            active={activeTab === 'video'} 
            onClick={() => setActiveTab('video')} 
            label="Calls"
          />
          <NavButton 
            icon={<Users />} 
            active={activeTab === 'contacts'} 
            onClick={() => setActiveTab('contacts')} 
            label="People"
          />
          <NavButton 
            icon={<PenTool />} 
            active={activeTab === 'whiteboard'} 
            onClick={() => setActiveTab('whiteboard')} 
            label="Draw"
          />
          <NavButton 
            icon={<Send />} 
            active={activeTab === 'files'} 
            onClick={() => setActiveTab('files')} 
            label="Files"
          />
        </aside>

        {/* Workspace */}
        <section className="flex-1 relative bg-slate-900 flex overflow-hidden">
          {activeTab === 'chats' && (
            <>
              <ChatList 
                user={user} 
                onSelectConversation={setSelectedConversation} 
                onlineUsers={onlineUsers}
              />
              <div className="flex-1">
                {selectedConversation ? (
                  <Chat 
                    roomId={selectedConversation._id} 
                    user={user} 
                    isPrivate={true}
                    recipient={selectedConversation.participants.find(p => p._id !== user.id)}
                    onStartCall={() => handleStartCall(selectedConversation.participants.find(p => p._id !== user.id))}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
                    <MessageCircle size={64} className="mb-4 opacity-20" />
                    <p>Select a chat to start messaging</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'contacts' && (
            <PeopleList 
              user={user} 
              onStartCall={handleStartCall} 
              onStartChat={handleStartChat} 
              onlineUsers={onlineUsers}
            />
          )}

          {activeTab === 'video' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <VideoRoom ref={videoRoomRef} roomId={roomId} userId={user.id} />
            </div>
          )}

          {activeTab === 'whiteboard' && (
            <div className="flex-1 p-6">
              <div className="h-full bg-white rounded-xl overflow-hidden shadow-2xl">
                <Whiteboard roomId={roomId} />
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="h-full bg-slate-800 rounded-xl p-6 border-2 border-slate-700">
                <h2 className="text-xl font-semibold mb-4">File Sharing</h2>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 flex flex-col items-center justify-center">
                  <Send className="text-slate-500 mb-4" size={48} />
                  <p className="text-slate-400">Drag and drop files here or click to browse</p>
                  <input type="file" className="hidden" id="file-upload" />
                  <label 
                    htmlFor="file-upload"
                    className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Upload File
                  </label>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-slate-400 font-medium mb-4">Recent Files</h3>
                  <div className="space-y-2">
                    <div className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded text-blue-400">PDF</div>
                        <span>Project_Requirements.pdf</span>
                      </div>
                      <button className="text-slate-400 hover:text-white">Download</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
              <Phone size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Incoming Call</h2>
            <p className="text-slate-400 mb-6">{incomingCall.callerName} is calling...</p>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={handleDeclineCall}
                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              >
                <PhoneOff size={24} />
              </button>
              <button 
                onClick={handleAcceptCall}
                className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
              >
                <Phone size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outgoing Call Indicator */}
      {calling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center animate-ping">
              <Phone size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Calling...</h2>
            <p className="text-slate-400 mb-6">Waiting for the other person to answer</p>
            <button 
              onClick={() => {
                setCalling(false)
              }}
              className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}

      <SearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        user={user}
        onAddContact={handleAddContact}
        contacts={contacts}
      />
    </div>
  )
}

function NavButton({ icon, active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 group relative w-full ${active ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
    >
      <div className={`p-3 rounded-xl transition-all ${active ? 'bg-blue-500/10' : 'group-hover:bg-slate-700'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      {active && <div className="absolute -left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
    </button>
  )
}

export default App
