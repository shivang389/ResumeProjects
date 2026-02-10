import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { User, Mail, LogOut, Shield, Bell, Moon, Smartphone } from 'lucide-react';

const Settings = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#0B0B15] text-white font-sans">
      <Sidebar groups={[]} selectedGroupId="settings" onSelectGroup={() => {}} />

      <div className="flex-1 p-10 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none" />
        
        <h2 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 relative z-10">
          Settings & Account
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          
          {/* 1. Profile Card */}
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-400">
                <User size={20} /> My Profile
             </h3>
             
             <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-purple-500/30">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h4 className="text-2xl font-bold">{user.name}</h4>
                    <p className="text-gray-400 text-sm">Member since 2024</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                        Active Account
                    </span>
                </div>
             </div>

             <div className="space-y-4">
                <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Mail size={18} /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Email Address</p>
                        <p className="text-gray-200">{user.email}</p>
                    </div>
                </div>
                <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Shield size={18} /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Security</p>
                        <p className="text-gray-200">Password is secure</p>
                    </div>
                </div>
             </div>
          </div>

          {/* 2. App Preferences (Visual Only) */}
          <div className="space-y-6">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-400">
                    <Smartphone size={20} /> App Preferences
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Bell size={18} className="text-gray-400"/>
                            <span>Notifications</span>
                        </div>
                        <div className="w-10 h-5 bg-purple-600 rounded-full relative">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Moon size={18} className="text-gray-400"/>
                            <span>Dark Mode</span>
                        </div>
                         <div className="w-10 h-5 bg-purple-600 rounded-full relative">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Danger Zone (Logout) */}
            <div className="bg-red-500/5 p-8 rounded-3xl border border-red-500/20 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-4 text-red-400">Session Control</h3>
                <p className="text-gray-400 text-sm mb-6">Logging out will remove your access token from this device.</p>
                <button 
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                    <LogOut size={20} /> Log Out
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;