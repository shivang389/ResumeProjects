const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Existing Notifications
  notifications: [{
    type: { type: String, default: 'invite' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    groupName: String,
    invitedBy: String,
    createdAt: { type: Date, default: Date.now }
  }],

  // --- NEW FIELDS FOR PASSWORD RESET ---
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

module.exports = mongoose.model('User', UserSchema);