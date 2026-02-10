import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, ArrowRight, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Use Localhost for now (Switch to Render URL when deploying)
      const res = await axios.post('https://moneymend-api.onrender.com/api/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B15] relative overflow-hidden font-sans">
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl shadow-black/40">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30 mb-4">
              <Wallet className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-gray-400 text-sm mt-2">Enter your details to access your finance AI</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-700"
                  placeholder="name@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-700"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required 
                />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-bold shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
              Sign In <ArrowRight size={18} />
            </button>
          </form>
          <div className="text-right mt-1">
    <button 
      type="button" 
      onClick={() => navigate('/forgot-password')} 
      className="text-xs text-gray-400 hover:text-purple-400 transition-colors"
    >
      Forgot Password?
    </button>
</div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;