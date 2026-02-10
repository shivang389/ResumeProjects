const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'General' },
  date: { type: Date, default: Date.now },
  
  // Who paid for it?
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Which group is it for? (If null, it's Personal)
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },

  // For group splits
  splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Expense', ExpenseSchema);