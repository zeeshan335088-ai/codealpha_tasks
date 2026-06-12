import { useState, useEffect } from 'react';
import { Search, UserPlus, Phone, Video, MessageCircle, Check } from 'lucide-react';
import axios from 'axios';

const PeopleList = ({ user, onStartCall, onStartChat, onlineUsers }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

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

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/chat/search?username=${query}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSearchResults(res.data);
            } catch (err) {
                console.error('Error searching users:', err);
            } finally {
                setLoading(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const addContact = async (contactId) => {
        try {
            await axios.post('http://localhost:5000/api/chat/add-contact', { contactId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchContacts();
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            console.error('Error adding contact:', err);
        }
    };

    const isContact = (id) => contacts.some(c => c._id === id);

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-full max-w-sm">
            <div className="p-4 border-b border-slate-800">
                <h1 className="text-2xl font-bold text-white mb-4">People</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search for people..."
                        className="w-full bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {searchQuery.length > 1 && (
                    <div className="p-2">
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2">Search Results</h2>
                        {loading ? (
                            <div className="p-4 text-center text-slate-500 text-sm">Searching...</div>
                        ) : searchResults.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">No users found</div>
                        ) : (
                            searchResults.map(result => (
                                <div key={result._id} className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                                            {result.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-white">{result.username}</span>
                                    </div>
                                    {isContact(result._id) ? (
                                        <span className="p-2 text-green-500"><Check size={20} /></span>
                                    ) : (
                                        <button 
                                            onClick={() => addContact(result._id)}
                                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            title="Add to contacts"
                                        >
                                            <UserPlus size={18} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                        <div className="my-2 border-t border-slate-800" />
                    </div>
                )}

                <div className="p-2">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2">Your Contacts</h2>
                    {contacts.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            Your saved contacts will appear here.
                        </div>
                    ) : (
                        contacts.map(contact => {
                            const isOnline = onlineUsers.includes(contact._id);
                            return (
                                <div key={contact._id} className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                                {contact.username.charAt(0).toUpperCase()}
                                            </div>
                                            {isOnline && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-white">{contact.username}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onStartChat(contact)}
                                            className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                                            title="Message"
                                        >
                                            <MessageCircle size={18} />
                                        </button>
                                        <button 
                                            onClick={() => onStartCall(contact)}
                                            className="p-2 hover:bg-slate-700 text-slate-400 hover:text-green-500 rounded-lg transition-colors"
                                            title="Start Video Call"
                                        >
                                            <Video size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default PeopleList;
