const Group = require('../models/Group');
const Expense = require('../models/Expense');
const User = require('../models/User');

// 1. CREATE GROUP
exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    // We use req.user.id (from the token) as the creator/admin
    const group = new Group({ 
        name, 
        members: [req.user.id], 
        admin: req.user.id 
    });
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. GET USER'S GROUPS (FIXED)
exports.getUserGroups = async (req, res) => {
  try {
    // FIX 1: Use req.user.id (from the Auth Token)
    // FIX 2: .populate() fetches the NAMES of the members
    const groups = await Group.find({ members: req.user.id })
      .populate('members', 'name email')
      .sort({ date: -1 });

    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. GET GROUP DETAILS (DASHBOARD)
exports.getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'name email');
    if (!group) return res.status(404).json({ msg: "Group not found" });

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name')
      .sort({ date: -1 });

    // Calculate Debts (Simplified)
    let balances = {};
    group.members.forEach(m => balances[m._id] = 0);

    expenses.forEach(exp => {
      const paidBy = exp.paidBy._id.toString();
      const amount = exp.amount;
      const splitCount = exp.splitBetween.length;
      
      if (splitCount > 0) {
          balances[paidBy] += amount;
          exp.splitBetween.forEach(memberId => {
            if (balances[memberId] !== undefined) {
                balances[memberId] -= (amount / splitCount);
            }
          });
      }
    });

    const debts = [];
    for (const [memberId, balance] of Object.entries(balances)) {
        if (balance < -1) {
            debts.push({
                from: group.members.find(m => m._id.toString() === memberId)?.name || 'User',
                to: 'Group Pool',
                amount: Math.abs(balance).toFixed(0)
            });
        }
    }

    // Chart Data
    const chartData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = monthNames[d.getMonth()];
        const monthlyTotal = expenses
            .filter(e => {
                const eDate = new Date(e.date);
                return eDate.getMonth() === d.getMonth() && eDate.getFullYear() === d.getFullYear();
            })
            .reduce((sum, e) => sum + e.amount, 0);
        chartData.push({ name: monthKey, amount: monthlyTotal });
    }

    // Forecast
    const recentMonths = chartData.slice(-3);
    const avgSpending = recentMonths.reduce((sum, m) => sum + m.amount, 0) / (recentMonths.length || 1);
    const predictedAmount = Math.round(avgSpending * 1.1);
    const nextMonthIndex = (today.getMonth() + 1) % 12;
    const forecast = [{ name: monthNames[nextMonthIndex] + " (AI)", amount: predictedAmount }];

    res.json({
      groupName: group.name,
      members: group.members,
      expenses,
      debts,
      chartData,
      forecast
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 4. INVITE MEMBER
exports.inviteMember = async (req, res) => {
    try {
        const { groupId, email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const group = await Group.findById(groupId);
        if (group.members.includes(user._id)) return res.status(400).json({ msg: "User already in group" });

        group.members.push(user._id);
        await group.save();
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. LEAVE GROUP
exports.leaveGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        await Group.findByIdAndUpdate(groupId, { $pull: { members: userId } });
        res.json({ msg: "Left group" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};