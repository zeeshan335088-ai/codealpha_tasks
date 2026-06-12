import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

const SearchModal = ({ isOpen, onClose, user, onAddContact, contacts }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setLoading(true);
                try {
                    const res = await axios.get(`http://localhost:5000/api/chat/search?username=${searchQuery}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setResults(res.data);
                } catch (err) {
                    console.error('Search error:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    if (!isOpen) return null;

    const isContact = (id) => contacts.some(c => c._id === id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Find People</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Enter username..."
                            className="w-full bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Results Area */}
                    <div className="mt-6 min-h-[200px] max-h-[300px] overflow-y-auto pr-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                                <Loader2 className="animate-spin" size={32} />
                                <p className="text-sm">Searching the universe...</p>
                            </div>
                        ) : searchQuery.length <= 1 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2 text-center">
                                <Search size={40} className="opacity-10 mb-2" />
                                <p className="text-sm font-medium">Type a name to find users</p>
                                <p className="text-xs text-slate-600">Search by username to add them to your contacts</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                                <X size={40} className="opacity-10 mb-2 text-red-500" />
                                <p className="text-sm font-medium">No users found</p>
                                <p className="text-xs text-slate-600">Try a different username</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {results.map(res => (
                                    <div key={res._id} className="flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/60 rounded-2xl transition-all group border border-transparent hover:border-slate-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {res.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-white">{res.username}</span>
                                        </div>
                                        {isContact(res._id) ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-xl text-xs font-bold uppercase tracking-wider">
                                                <Check size={16} /> Contact
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => onAddContact(res._id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                            >
                                                <UserPlus size={16} /> Add
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950/30 border-t border-slate-800 text-center">
                    <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Connect with anyone, anywhere</p>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
