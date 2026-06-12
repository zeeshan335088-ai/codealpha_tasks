import { useState, useEffect } from 'react';
import { Search, MoreVertical, MessageCircle } from 'lucide-react';
import axios from 'axios';

const ChatList = ({ user, onSelectConversation, onlineUsers }) => {
    const [conversations, setConversations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/chat/conversations', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setConversations(res.data);
            } catch (err) {
                console.error('Error fetching conversations:', err);
            }
        };
        fetchConversations();
    }, []);

    const filteredConversations = conversations.filter(conv => {
        const otherParticipant = conv.participants.find(p => p._id !== user.id);
        return otherParticipant?.username.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-full max-w-sm">
            <div className="p-4 border-b border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Chats</h1>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                            <MessageCircle size={20} />
                        </button>
                        <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search chats..."
                        className="w-full bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
                        <p>No conversations yet.</p>
                        <p className="text-sm mt-2">Start a new chat to see it here.</p>
                    </div>
                ) : (
                    filteredConversations.map(conv => {
                        const otherParticipant = conv.participants.find(p => p._id !== user.id);
                        const isOnline = onlineUsers.includes(otherParticipant?._id);
                        
                        return (
                            <div 
                                key={conv._id}
                                onClick={() => onSelectConversation(conv)}
                                className="flex items-center gap-4 p-4 hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-800/30"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                        {otherParticipant?.username.charAt(0).toUpperCase()}
                                    </div>
                                    {isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-semibold text-white truncate">{otherParticipant?.username}</h3>
                                        <span className="text-[11px] text-slate-500">
                                            {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-slate-400 truncate">
                                            {conv.lastMessage?.text || 'No messages yet'}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatList;
