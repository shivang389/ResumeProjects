import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Calendar, Activity, Trash2, Wallet, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BudgetChart from './components/BudgetChart';

const PersonalDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [personalData, setPersonalData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Form State
  const [newExpense, setNewExpense] = useState({ 
      description: '', amount: '', category: 'Food'
  });

  const user = JSON.parse(localStorage.getItem('user'));

  // 1. Init
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    fetchGroups();
    fetchPersonalData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsSidebarOpen(false);
    } else {
        setIsMobile(false);
        setIsSidebarOpen(true);
    }
  };

  const fetchGroups = async () => {
    try {
      if (!user) return;
      const res = await axios.get(`https://moneymend-api.onrender.com/api/groups/user/${user.id}`);
      setGroups(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchPersonalData = async () => {
      try {
          if (!user) return;
          const res = await axios.get(`https://moneymend-api.onrender.com/api/expense/personal/${user.id}`);
          setPersonalData(res.data);
      } catch(err) { console.error(err); } 
      finally { setLoading(false); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://moneymend-api.onrender.com/api/expense', {
        description: newExpense.description, 
        amount: Number(newExpense.amount), 
        date: new Date().toISOString(),
        paidBy: user.id,
        category: newExpense.category,
        group: null, // Indicates Personal Expense
        splitBetween: []
      });
      setShowExpenseModal(false);
      setNewExpense({ description: '', amount: '', category: 'Food' });
      fetchPersonalData();
    } catch (err) { alert("Failed to add expense"); }
  };

  const handleDeleteExpense = async (expenseId) => {
      if(!window.confirm("Delete this expense?")) return;
      try {
          await axios.delete(`https://moneymend-api.onrender.com/api/expense/${expenseId}`);
          fetchPersonalData();
      } catch (err) { alert("Failed to delete"); }
  };

  if (!user) return <div className="text-white">Please Login</div>;

  return (
    <div className="flex min-h-screen bg-[#0B0B15] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* SIDEBAR WRAPPER */}
      <div className={`fixed md:relative z-40 h-full bg-[#0F0F1A] border-r border-white/5 transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0'}`}>
         <div className="w-64 h-full">
            <Sidebar 
                groups={groups} 
                onSelectGroup={(gid) => window.location.href='/dashboard'} 
                onCreateGroup={() => {}} // Disabled here
                selectedGroupId="personal"
                onClose={() => setIsSidebarOpen(false)}
            />
         </div>
      </div>

      {isMobile && isSidebarOpen && <div className="fixed inset-0 bg-black/80 z-30 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative scroll-smooth w-full">
         <div className="absolute top-0 left-0 w-full h-96 bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

         <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 relative z-10">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"><Menu size={24} /></button>
               <div>
                  <h2 className="text-3xl md:text-4xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      Personal Space
                  </h2>
                  <p className="text-gray-400 text-sm">My Private Spending</p>
               </div>
            </div>
            <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                <Plus size={18} /> Track Expense
            </button>
         </header>

         {loading ? (
             <div className="flex items-center justify-center h-64 text-emerald-500 font-bold animate-pulse">Loading Personal Space...</div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 relative z-10 pb-10">
                
                {/* 1. EXPENSE LIST */}
                <div className="lg:col-span-2 bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-xl h-[500px] flex flex-col order-2 lg:order-1">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-lg flex items-center gap-2"><Wallet size={20} className="text-emerald-400" /> My Wallet History</h3>
                    </div>
                    <div className="overflow-auto custom-scrollbar flex-1">
                       {personalData?.expenses.length === 0 ? <div className="h-full flex items-center justify-center text-gray-500">No personal expenses yet.</div> : (
                          <table className="w-full text-left min-w-[500px]">
                             <thead className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider font-bold sticky top-0 backdrop-blur-md">
                                <tr><th className="p-5">Date</th><th className="p-5">Description</th><th className="p-5">Category</th><th className="p-5 text-right">Amount</th><th className="p-5 text-right">Action</th></tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                {personalData.expenses.map(exp => (
                                   <tr key={exp._id} className="hover:bg-white/5 transition-colors group">
                                      <td className="p-5 text-gray-400 font-medium text-sm">{new Date(exp.date).toLocaleDateString(undefined, {month: 'short', day:'numeric'})}</td>
                                      
                                      {/* DESCRIPTION + BADGE */}
                                      <td className="p-5">
                                          <div className="flex flex-col">
                                              <span className="font-bold text-gray-200">{exp.description}</span>
                                              <span className="text-[10px] uppercase font-bold tracking-wider mt-1">
                                                  {exp.group ? (
                                                      <span className="text-purple-400 flex items-center gap-1">👥 {exp.group.name}</span>
                                                  ) : (
                                                      <span className="text-gray-500 flex items-center gap-1">🔒 Personal</span>
                                                  )}
                                              </span>
                                          </div>
                                      </td>

                                      <td className="p-5"><span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300">{exp.category}</span></td>
                                      
                                      {/* AMOUNT + "MY SHARE" HINT */}
                                      <td className="p-5 text-right font-mono font-bold text-emerald-400">
                                          ₹{exp.amount}
                                          {exp.group && (
                                              <div className="text-[9px] text-gray-500 font-sans font-normal uppercase mt-1">
                                                  (My Share)
                                              </div>
                                          )}
                                      </td>
                                      
                                      <td className="p-5 text-right"><button onClick={() => handleDeleteExpense(exp._id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button></td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       )}
                   </div>
                </div>

                {/* 2. AI CHART */}
                <div className="lg:col-span-1 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl h-[500px] shadow-xl flex flex-col order-1 lg:order-2">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Activity size={20} className="text-cyan-400"/> AI Analysis</h3>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Live</span>
                   </div>
                   <div className="flex-1 w-full min-h-0">
                      <BudgetChart history={personalData?.chartData} forecast={personalData?.forecast} />
                   </div>
                </div>

            </div>
         )}
      </div>

      {/* ADD MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#1A1A2E] p-6 rounded-3xl w-full max-w-sm border border-white/10 shadow-2xl flex flex-col">
                <h3 className="text-2xl font-black text-white mb-4">Add Personal Expense</h3>
                <form onSubmit={handleAddExpense} className="space-y-4">
                    <input type="text" placeholder="Description" className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} required />
                    <input type="number" placeholder="Amount (₹)" className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} required />
                    <select className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}><option>Food</option><option>Travel</option><option>Shopping</option><option>Bills</option><option>Other</option></select>
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-gray-400 font-bold">Cancel</button><button type="submit" className="flex-1 py-3 bg-emerald-500 text-black font-bold rounded-xl">Add</button></div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDashboard;