import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const Auth = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        console.log('Form data being sent:', formData);

        try {
            if (isForgotPassword) {
                // Mock forgot password call
                await new Promise(resolve => setTimeout(resolve, 1500));
                setMessage('If an account exists with this email, you will receive a reset link.');
            } else {
                const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
                // Use absolute URL to bypass proxy issues during debugging
                const API_BASE_URL = 'http://localhost:5000';
                console.log('Sending request to:', API_BASE_URL + endpoint);
                
                const response = await axios.post(API_BASE_URL + endpoint, formData);
                console.log('Full server response:', response.data);
                
                const data = response.data;
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onAuthSuccess(data.user);
            }
        } catch (err) {
            console.error('Frontend Auth Error:', err);
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
                setError(err.response.data.message || 'Server error occurred');
            } else if (err.request) {
                console.error('No response received:', err.request);
                setError('Cannot reach the server. Please check if backend is running on port 5000.');
            } else {
                console.error('Request setup error:', err.message);
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    if (isForgotPassword) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
                <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <div className="text-center mb-8">
                        <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="text-blue-500" size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                        <p className="text-slate-400 mt-2">Enter your email to receive a recovery link</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</div>}
                        {message && <div className="text-green-400 text-sm bg-green-400/10 p-3 rounded-lg border border-green-400/20">{message}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Send Reset Link
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsForgotPassword(false)}
                            className="w-full text-slate-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-slate-400 mt-2">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-blue-500 hover:text-blue-400 font-semibold ml-1 underline-offset-4 hover:underline"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-1.5 block">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-sm font-medium text-slate-300">Password</label>
                            {isLogin && (
                                <button 
                                    type="button"
                                    onClick={() => setIsForgotPassword(true)}
                                    className="text-xs text-blue-500 hover:text-blue-400 font-medium"
                                >
                                    Forgot password?
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group mt-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
