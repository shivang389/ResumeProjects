import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('https://moneymend-api.onrender.com/api/auth/register', { name, email, password });
      // Redirect to login after successful signup
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B15] relative overflow-hidden font-sans">
      {/* Background Blobs (Different Positions) */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl shadow-black/40">
          
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-2xl shadow-lg shadow-cyan-500/30 mb-4">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Join SplitWise AI</h1>
            <p className="text-gray-400 text-sm mt-2">Start managing your group expenses intelligently</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-700"
                  placeholder="John Doe"
                  value={name} onChange={e => setName(e.target.value)} required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-700"
                  placeholder="name@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-700"
                  placeholder="Create a strong password"
                  value={password} onChange={e => setPassword(e.target.value)} required 
                />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              Create Account <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already a member?{' '}
              <Link to="/" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;