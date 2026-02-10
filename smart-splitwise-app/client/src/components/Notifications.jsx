import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, X, MessageSquare } from 'lucide-react';

const Notifications = ({ userId, onUpdate }) => {
  const [invites, setInvites] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      // Ensure this matches your live backend URL
      const res = await axios.get(`https://moneymend-api.onrender.com/api/groups/notifications/${userId}`);
      setInvites(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    if (userId) fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRespond = async (groupId, action) => {
    try {
      await axios.post('https://moneymend-api.onrender.com/api/groups/respond', { userId, groupId, action });
      fetchNotifications();
      if (onUpdate) onUpdate(); 
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell size={24} />
        {invites.length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
            {invites.length}
          </span>
        )}
      </button>

      {isOpen && (
        // --- FIXES APPLIED HERE ---
        // z-[100]: Ensures it sits on top of everything (even sidebar/modals)
        // max-h-80: Increased height limit slightly so it is less cramped
        // overflow-y-auto: Ensures scrollbar appears if needed
        <div className="absolute left-0 mt-4 w-72 bg-[#1A1A2E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-left">
            <div className="p-4 border-b border-white/5 bg-white/5">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                    <MessageSquare size={16} className="text-purple-400"/> Pending Invites
                </h3>
            </div>
            
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {invites.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-xs">
                    You're all caught up!
                </div>
                ) : (
                invites.map((notif, idx) => (
                    <div key={idx} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                        <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                            <span className="font-bold text-white">{notif.invitedBy}</span> invited you to <span className="font-bold text-purple-400">{notif.groupName}</span>
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleRespond(notif.groupId, 'accept')}
                                className="flex-1 flex items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-[10px] font-bold transition-all border border-emerald-500/20"
                            >
                                <Check size={12} /> ACCEPT
                            </button>
                            <button 
                                onClick={() => handleRespond(notif.groupId, 'reject')}
                                className="flex-1 flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-[10px] font-bold transition-all border border-red-500/20"
                            >
                                <X size={12} /> DECLINE
                            </button>
                        </div>
                    </div>
                ))
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;