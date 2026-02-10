import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Activity } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      const { data } = await axios.post(`https://moneymend-api.onrender.com/api/auth${endpoint}`, formData);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload(); 
      }, 500);

    } catch (err) {
      alert(err.response?.data?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B15] flex items-center justify-center p-4 font-sans text-white">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-600/20 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-4 shadow-lg shadow-purple-900/50">
            <Activity size={32} className="text-white" />
          </div>
          {/* UPDATED NAME HERE */}
          <h1 className="text-4xl font-black tracking-tight mb-2">MoneyMend</h1>
          <p className="text-gray-400">Smart expense tracking for groups.</p>
        </div>

        <div className="bg-[#1A1A2E] p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex bg-black/30 p-1 rounded-xl mb-8">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>Log In</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input type="text" name="name" placeholder="Full Name" className="w-full p-4 pl-12 bg-black/30 border border-white/10 rounded-xl outline-none focus:border-purple-500 text-white placeholder-gray-600 transition-all font-medium" onChange={handleChange} required />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
              <input type="email" name="email" placeholder="Email Address" className="w-full p-4 pl-12 bg-black/30 border border-white/10 rounded-xl outline-none focus:border-purple-500 text-white placeholder-gray-600 transition-all font-medium" onChange={handleChange} required />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
              <input type="password" name="password" placeholder="Password" className="w-full p-4 pl-12 bg-black/30 border border-white/10 rounded-xl outline-none focus:border-purple-500 text-white placeholder-gray-600 transition-all font-medium" onChange={handleChange} required />
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-xs text-gray-400 hover:text-purple-400 transition-colors font-bold">Forgot Password?</button>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all active:scale-95 flex items-center justify-center gap-2 group">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isLogin ? 'Log In' : 'Create Account'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;