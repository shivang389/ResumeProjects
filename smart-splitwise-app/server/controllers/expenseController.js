const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// 1. ADD EXPENSE (Group OR Personal)
exports.addExpense = async (req, res) => {
  try {
    const { description, amount, date, category, paidBy, group, splitBetween } = req.body;

    console.log("📝 Adding Expense:", { description, amount, paidBy, group });

    const newExpense = new Expense({
      description,
      amount,
      date,
      category,
      paidBy, 
      group: group || null, 
      splitBetween: splitBetween || []
    });

    await newExpense.save();
    console.log("✅ Expense Saved!");
    res.status(201).json(newExpense);
  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. GET MY TRUE CONSUMPTION (What I actually spent/used)
exports.getPersonalExpenses = async (req, res) => {
  try {
    const { userId } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. FIND RELEVANT EXPENSES
    // We want:
    // A) Private expenses I paid for (group is null)
    // OR
    // B) Group expenses where I am a participant (splitBetween contains Me)
    const rawExpenses = await Expense.find({
        $or: [
            { paidBy: userObjectId, group: null }, // Case A: Private
            { splitBetween: userObjectId }         // Case B: Group Share
        ]
    })
    .populate('group', 'name')
    .populate('paidBy', 'name') // Helpful to see who paid if it wasn't me
    .sort({ date: -1 });

    // 2. CALCULATE "MY SHARE"
    const expenses = rawExpenses.map(exp => {
        let myCost = exp.amount;

        // If it is a group expense, calculate the split
        if (exp.group && exp.splitBetween.length > 0) {
            // My Cost = Total Bill / Number of People
            myCost = exp.amount / exp.splitBetween.length;
        }

        // Return the modified object
        return {
            ...exp.toObject(),
            originalAmount: exp.amount, 
            amount: Math.round(myCost) // This is now YOUR specific cost
        };
    });

    console.log(`✅ Calculated consumption for ${expenses.length} items.`);

    // --- CHART DATA ---
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

    // AI Forecast
    const recentMonths = chartData.slice(-3);
    const avgSpending = recentMonths.reduce((sum, m) => sum + m.amount, 0) / (recentMonths.length || 1);
    const predictedAmount = Math.round(avgSpending * 1.1);
    const nextMonthIndex = (today.getMonth() + 1) % 12;
    const forecast = [{ name: monthNames[nextMonthIndex] + " (AI)", amount: predictedAmount }];

    res.json({ expenses, chartData, forecast });
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. DELETE EXPENSE
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ msg: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};