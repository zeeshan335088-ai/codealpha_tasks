import { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import { Send, User, Phone, Video, MoreVertical, Paperclip, MessageCircle } from 'lucide-react';
import axios from 'axios';

const Chat = ({ roomId, user, isPrivate, recipient, onStartCall }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (isPrivate && roomId) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/chat/messages/${roomId}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setMessages(res.data.map(m => ({
                        ...m,
                        isMe: m.sender === user.id || m.sender._id === user.id
                    })));
                } catch (err) {
                    console.error('Error fetching messages:', err);
                }
            }
        };
        fetchMessages();

        const onReceiveMessage = (data) => {
            if (data.conversationId === roomId) {
                setMessages((prev) => [...prev, { ...data.message, isMe: false }]);
            }
        };

        socket.on('new-private-message', onReceiveMessage);
        socket.on('receive-message', onReceiveMessage);

        return () => {
            socket.off('new-private-message', onReceiveMessage);
            socket.off('receive-message', onReceiveMessage);
        };
    }, [roomId, isPrivate, user.id]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            if (isPrivate) {
                const messageData = {
                    conversationId: roomId,
                    senderId: user.id,
                    recipientId: recipient._id,
                    text: newMessage
                };
                socket.emit('private-message', messageData);
                // The server saves it, but we can optimistically add it
                setMessages(prev => [...prev, {
                    text: newMessage,
                    isMe: true,
                    timestamp: new Date().toLocaleTimeString(),
                    sender: user.id
                }]);
            } else {
                const messageData = {
                    roomId,
                    text: newMessage,
                    sender: user.username,
                    timestamp: new Date().toLocaleTimeString()
                };
                socket.emit('send-message', messageData);
                setMessages((prev) => [...prev, { ...messageData, isMe: true }]);
            }
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {recipient ? recipient.username.charAt(0).toUpperCase() : 'R'}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            {recipient ? recipient.username : 'Room Chat'}
                        </h2>
                        <span className="text-[11px] text-green-500 font-medium">Online</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                    <button className="p-2.5 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <Phone size={20} />
                    </button>
                    <button 
                        onClick={onStartCall}
                        className="p-2.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-green-500 transition-colors"
                    >
                        <Video size={20} />
                    </button>
                    <button className="p-2.5 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/30">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                        <div className="bg-slate-800 p-6 rounded-full">
                            <MessageCircle size={40} className="opacity-20" />
                        </div>
                        <p className="text-sm font-medium">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                    msg.isMe 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                                }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1.5 font-medium uppercase tracking-wider">
                                    {msg.timestamp || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button type="button" className="p-2.5 text-slate-500 hover:text-slate-300 transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-slate-800 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder-slate-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`p-3 rounded-full transition-all ${
                            newMessage.trim() 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-slate-800 text-slate-500'
                        }`}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;

