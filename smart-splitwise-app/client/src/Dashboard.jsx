import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, UserPlus, CreditCard, Calendar, Activity, Trash2, LogOut, AlertTriangle, CheckCircle2, Circle, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BudgetChart from './components/BudgetChart';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  
  // Forms
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newExpense, setNewExpense] = useState({ 
      description: '', amount: '', category: 'Food', paidBy: '', splitBetween: [] 
  });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchGroups();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
      setIsSidebarOpen(false); // Default closed on mobile
    } else {
      setIsMobile(false);
      setIsSidebarOpen(true); // Default open on desktop
    }
  };

  const fetchGroups = async () => {
    try {
      if (!user) return;
      const res = await axios.get(`https://moneymend-api.onrender.com/api/groups/user/${user.id}`);
      setGroups(res.data);
      if (res.data.length > 0 && !selectedGroupId) {
        handleSelectGroup(res.data[0]._id);
      } else if (res.data.length === 0) {
        setDashboardData(null);
        setSelectedGroupId(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleSelectGroup = async (groupId) => {
    setSelectedGroupId(groupId);
    if (isMobile) setIsSidebarOpen(false); // Auto-close on mobile selection
    try {
      const res = await axios.get(`https://moneymend-api.onrender.com/api/groups/${groupId}`);
      setDashboardData(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateGroup = async (groupName) => {
    try {
      const res = await axios.post('https://moneymend-api.onrender.com/api/groups/create', { name: groupName, userId: user.id });
      setGroups([...groups, res.data]);
      handleSelectGroup(res.data._id);
    } catch (err) { alert("Failed to create group"); }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://moneymend-api.onrender.com/api/groups/invite', { groupId: selectedGroupId, email: newMemberEmail, invitedByName: user.name });
      alert(`Invitation sent to ${newMemberEmail}!`);
      setShowInviteModal(false);
      setNewMemberEmail('');
      // Refresh data to show new member immediately (optional)
      handleSelectGroup(selectedGroupId);
    } catch (err) { alert(err.response?.data?.msg || 'Failed to invite user'); }
  };

  const handleLeaveGroupConfirm = async () => {
    try {
        await axios.post('https://moneymend-api.onrender.com/api/groups/leave', { groupId: selectedGroupId, userId: user.id });
        setShowLeaveModal(false);
        window.location.reload(); 
    } catch (err) { alert("Failed to leave group"); }
  };

  const openExpenseModal = () => {
      if (!dashboardData) return;
      setNewExpense({
          description: '', 
          amount: '', 
          category: 'Food', 
          paidBy: user.id,
          // Initialize split with ALL members
          splitBetween: dashboardData.members.map(m => m._id)
      });
      setShowExpenseModal(true);
  };

  const toggleSplitUser = (memberId) => {
      const currentSplit = newExpense.splitBetween;
      if (currentSplit.includes(memberId)) {
          setNewExpense({ ...newExpense, splitBetween: currentSplit.filter(id => id !== memberId) });
      } else {
          setNewExpense({ ...newExpense, splitBetween: [...currentSplit, memberId] });
      }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (newExpense.splitBetween.length === 0) { alert("Split cannot be empty!"); return; }
    try {
      await axios.post('https://moneymend-api.onrender.com/api/expense', {
        description: newExpense.description, 
        amount: Number(newExpense.amount), 
        date: new Date().toISOString(),
        group: selectedGroupId, 
        paidBy: newExpense.paidBy, 
        category: newExpense.category, 
        splitBetween: newExpense.splitBetween
      });
      setShowExpenseModal(false);
      handleSelectGroup(selectedGroupId); // Refresh dashboard
    } catch (err) { alert("Failed to add expense"); }
  };

  const handleDeleteExpense = async (expenseId) => {
      if(!window.confirm("Delete this expense?")) return;
      try {
          await axios.delete(`https://moneymend-api.onrender.com/api/expense/${expenseId}`);
          handleSelectGroup(selectedGroupId);
      } catch (err) { alert("Failed to delete"); }
  };

  if (!user) return <div className="text-white">Please Login</div>;

  return (
    <div className="flex min-h-screen bg-[#0B0B15] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* --- SIDEBAR --- */}
      <div 
        className={`
            fixed md:relative z-40 h-full bg-[#0F0F1A] border-r border-white/5 transition-all duration-300 ease-in-out overflow-hidden
            ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0'}
        `}
      >
         <div className="w-64 h-full">
            <Sidebar 
                groups={groups} 
                onSelectGroup={handleSelectGroup} 
                onCreateGroup={handleCreateGroup}
                selectedGroupId={selectedGroupId}
                onClose={() => setIsSidebarOpen(false)}
            />
         </div>
      </div>

      {/* MOBILE BACKDROP */}
      {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 z-30 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative scroll-smooth w-full">
         <div className="absolute top-0 left-0 w-full h-96 bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

         {dashboardData ? (
           <>
             {/* HEADER */}
             <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 relative z-10">
                <div className="flex items-center gap-4">
                   <button 
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
                   >
                      <Menu size={24} />
                   </button>

                   <div>
                      <h2 className="text-3xl md:text-4xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                          {dashboardData.groupName}
                      </h2>
                      <p className="text-gray-400 text-sm">Overview & Expenses</p>
                   </div>
                </div>
                
                <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto pl-12 md:pl-0">
                  <button onClick={() => setShowLeaveModal(true)} className="flex-1 md:flex-none justify-center group flex items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs md:text-sm font-semibold transition-all active:scale-95 text-red-400 whitespace-nowrap">
                    <LogOut size={16} /> <span className="hidden sm:inline">Leave</span>
                  </button>
                  <button onClick={() => setShowInviteModal(true)} className="flex-1 md:flex-none justify-center group flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs md:text-sm font-semibold transition-all active:scale-95 whitespace-nowrap">
                    <UserPlus size={16} className="text-purple-400 group-hover:text-white transition-colors" /> Invite
                  </button>
                  <button onClick={openExpenseModal} className="flex-[2] md:flex-none justify-center flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40 active:scale-95 whitespace-nowrap text-sm md:text-base">
                    <Plus size={18} /> Add Expense
                  </button>
                </div>
             </header>

             {/* DASHBOARD GRID */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 relative z-10 mb-8">
                {/* BALANCES */}
                <div className="lg:col-span-1 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl shadow-xl overflow-y-auto custom-scrollbar h-[400px]">
                   <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-pink-400"><CreditCard size={20} /> Balances</h3>
                   {dashboardData.debts.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center"><CreditCard size={20} className="opacity-50"/></div>
                        <p className="text-sm font-medium">All settled up!</p>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {dashboardData.debts.map((debt, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-xs">{debt.from.charAt(0)}</div>
                                 <div className="flex flex-col"><span className="text-sm font-bold text-gray-200">{debt.from}</span><span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">owes</span></div>
                              </div>
                              <div className="flex items-center gap-3 text-right">
                                  <div className="flex flex-col"><span className="text-sm font-bold text-gray-200">{debt.to}</span><span className="text-xs text-emerald-400 font-mono font-bold">₹{debt.amount}</span></div>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>

                {/* ACTIVITY TABLE */}
                <div className="lg:col-span-2 bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-xl h-[400px] flex flex-col">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="font-bold text-lg flex items-center gap-2"><Calendar size={20} className="text-purple-400" /> Recent Activity</h3>
                    </div>
                   <div className="overflow-auto custom-scrollbar flex-1">
                       {dashboardData.expenses.length === 0 ? <div className="h-full flex items-center justify-center text-gray-500">No expenses yet.</div> : (
                          <table className="w-full text-left min-w-[600px]">
                             <thead className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider font-bold sticky top-0 backdrop-blur-md">
                                <tr><th className="p-5">Date</th><th className="p-5">Description</th><th className="p-5">Category</th><th className="p-5">Paid By</th><th className="p-5 text-right">Amount</th><th className="p-5 text-right">Action</th></tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                {dashboardData.expenses.map(exp => (
                                   <tr key={exp._id} className="hover:bg-white/5 transition-colors group">
                                      <td className="p-5 text-gray-400 font-medium text-sm">{new Date(exp.date).toLocaleDateString(undefined, {month: 'short', day:'numeric'})}</td>
                                      <td className="p-5 font-bold text-gray-200">{exp.description}</td>
                                      <td className="p-5"><span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300">{exp.category}</span></td>
                                      <td className="p-5 text-gray-300 text-sm">{exp.paidBy?.name || 'Unknown'}</td>
                                      <td className="p-5 text-right font-mono font-bold text-emerald-400">₹{exp.amount}</td>
                                      <td className="p-5 text-right"><button onClick={() => handleDeleteExpense(exp._id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button></td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       )}
                   </div>
                </div>
             </div>

             {/* AI CHART */}
             <div className="relative z-10 pb-10">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl h-[400px] shadow-xl flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Activity size={20} className="text-cyan-400"/> Spending Analytics (AI)</h3>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Forecast Active</span>
                   </div>
                   <div className="flex-1 w-full min-h-0">
                      <BudgetChart history={dashboardData.chartData} forecast={dashboardData.forecast} />
                   </div>
                </div>
             </div>
           </>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-center animate-pulse">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute top-4 left-4 p-2 bg-white/5 rounded-lg text-gray-300 md:hidden z-50">
                  <Menu size={24} />
              </button>
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4"><Activity size={32} className="text-gray-600" /></div>
              <p className="text-gray-500 font-medium">Select a group to view dashboard</p>
           </div>
         )}
      </div>

      {/* --- MODALS --- */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#1A1A2E] p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden">
                <h3 className="text-2xl font-black text-white mb-6">Invite Member</h3>
                <form onSubmit={handleInviteMember} className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} required />
                    <div className="flex gap-3"><button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-gray-400 font-bold">Cancel</button><button type="submit" className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl">Invite</button></div>
                </form>
            </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#1A1A2E] p-6 rounded-3xl w-full max-w-lg border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                <h3 className="text-2xl font-black text-white mb-4">Add Expense</h3>
                <form onSubmit={handleAddExpense} className="space-y-4 overflow-y-auto custom-scrollbar px-2 pb-2">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Desc" className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} required />
                        <input type="number" placeholder="Amount" className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} required />
                    </div>
                    
                    {/* PAID BY DROPDOWN (FIXED) */}
                    <div>
                        <label className="text-xs text-gray-400 ml-1 mb-1 block">Paid By</label>
                        <select className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white" value={newExpense.paidBy} onChange={e => setNewExpense({...newExpense, paidBy: e.target.value})}>
                            {dashboardData?.members.map(m => (
                                <option key={m._id} value={m._id}>
                                    {m._id === user.id ? "Me" : (m.name || m.email)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <select className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}><option>Food</option><option>Travel</option><option>Rent</option><option>Fun</option><option>Other</option></select>
                    
                    {/* SPLIT BETWEEN LIST (FIXED) */}
                    <div>
                        <label className="text-xs text-gray-400 ml-1 mb-1 block">Split Between</label>
                        <div className="grid grid-cols-2 gap-2 bg-black/20 p-2 rounded-xl border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                            {dashboardData?.members.map(m => (
                                <button type="button" key={m._id} onClick={() => toggleSplitUser(m._id)} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${newExpense.splitBetween.includes(m._id) ? 'bg-pink-500/20 text-pink-400' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                                    {newExpense.splitBetween.includes(m._id) ? <CheckCircle2 size={14}/> : <Circle size={14}/>} 
                                    <span className="truncate">{m.name || m.email}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3"><button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-gray-400 font-bold">Cancel</button><button type="submit" className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-xl">Add</button></div>
                </form>
            </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-[#1A1A2E] p-8 rounded-3xl w-full max-w-sm border border-white/10 shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-black text-white mb-2">Leave Group?</h3>
              <p className="text-gray-400 text-sm mb-6">Are you sure you want to leave <b>{dashboardData?.groupName}</b>?</p>
              <div className="flex gap-3"><button onClick={() => setShowLeaveModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-gray-400 font-bold">Cancel</button><button onClick={handleLeaveGroupConfirm} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl">Leave</button></div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;