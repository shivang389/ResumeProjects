const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of User IDs
  currency: { type: String, default: 'INR' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);