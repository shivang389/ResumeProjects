import React, { useState } from 'react';
import axios from 'axios';
import { Lock, CheckCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams(); // Get token from URL
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`https://moneymend-api.onrender.com/api/auth/reset-password/${token}`, { password });
      setMessage("Success! Redirecting to login...");
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.msg || "Invalid or expired token"));
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B15] flex items-center justify-center p-4">
      <div className="bg-[#1A1A2E] p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none" />

        <h2 className="text-3xl font-black text-white mb-2">Reset Password</h2>
        <p className="text-gray-400 mb-6 text-sm">Enter your new password below.</p>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase ml-1">New Password</label>
             <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                <input 
                  type="password" 
                  className="w-full p-3 pl-10 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
             </div>
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg transition-transform active:scale-95">
             Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;