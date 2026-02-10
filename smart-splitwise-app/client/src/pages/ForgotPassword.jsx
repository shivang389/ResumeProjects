import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://moneymend-api.onrender.com/api/auth/forgot-password', { email });
      setMessage(res.data.msg);
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.msg || "Failed to send email"));
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B15] flex items-center justify-center p-4">
      <div className="bg-[#1A1A2E] p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none" />
        
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 text-sm">
           <ArrowLeft size={16} /> Back to Login
        </button>

        <h2 className="text-3xl font-black text-white mb-2">Forgot Password?</h2>
        <p className="text-gray-400 mb-6 text-sm">Enter your email and we'll send you a reset link.</p>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
             <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                <input 
                  type="email" 
                  className="w-full p-3 pl-10 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-colors"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
             </div>
          </div>
          <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
             Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;