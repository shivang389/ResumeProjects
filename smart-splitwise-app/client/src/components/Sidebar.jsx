import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, User, LogOut, X, Sparkles } from 'lucide-react';
import Notifications from './Notifications';

const Sidebar = ({ groups, onSelectGroup, onCreateGroup, selectedGroupId, onClose }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { id: null, name: 'User', email: 'user@example.com' };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName);
      setNewGroupName("");
      setShowCreateModal(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <div className="w-64 bg-[#0F0F1A] border-r border-white/5 p-6 flex flex-col h-screen font-sans relative z-20">
        
        {/* HEADER */}
        <div className="mb-8 px-2 flex justify-between items-center relative z-30">
          {/* UPDATED NAME HERE */}
          <h1 
              className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 cursor-pointer select-none" 
              onClick={() => navigate('/dashboard')}
          >
              MoneyMend
          </h1>
          
          <div className="flex items-center gap-2">
             <Notifications userId={user.id} onUpdate={() => window.location.reload()} />
             <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                <X size={24} />
             </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 relative z-10">
          <button 
              type="button"
              onClick={() => navigate('/personal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  selectedGroupId === 'personal' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
          >
              <User size={20} /> My Personal Space
          </button>

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest select-none">
              My Groups
          </div>
          
          {groups.map(group => (
              <button
                key={group._id}
                type="button"
                onClick={() => { navigate('/dashboard'); onSelectGroup(group._id); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  selectedGroupId === group._id 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard size={18} /> 
                <span className="truncate">{group.name}</span>
              </button>
          ))}

          <button 
              type="button"
              onClick={() => setShowCreateModal(true)} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all border border-dashed border-gray-700 hover:border-purple-500/30 mt-2"
          >
              <Plus size={18} /> New Group
          </button>
        </nav>
        
        {/* FOOTER */}
        <div className="pt-6 border-t border-white/5 mt-2 relative z-10">
          <button 
              type="button"
              onClick={() => setShowLogoutModal(true)} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
          >
              <LogOut size={20} /> Logout
          </button>

          <div className="flex items-center gap-3 px-4 py-2 opacity-60">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#1A1A2E] p-6 rounded-3xl w-full max-w-sm border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="flex justify-between items-center mb-4 relative z-10">
                 <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-purple-400" /> Create Group
                 </h3>
                 <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateSubmit} className="relative z-10">
                 <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Group Name</label>
                    <input autoFocus type="text" placeholder="e.g. Goa Trip" className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-colors" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                 </div>
                 <div className="flex gap-3">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 font-bold">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg">Create</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#1A1A2E] p-6 rounded-3xl w-full max-w-sm border border-white/10 shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-full bg-red-500/5 pointer-events-none" />
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <LogOut size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2 relative z-10">Sign Out?</h3>
              <p className="text-gray-400 text-sm mb-6 relative z-10">Are you sure you want to sign out of your account?</p>
              <div className="flex gap-3 relative z-10">
                 <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 font-bold transition-colors">Cancel</button>
                 <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 transition-colors">Log Out</button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;