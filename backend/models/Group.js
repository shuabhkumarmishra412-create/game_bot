const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupId: { type: String, required: true, unique: true },
  groupName: String,
  warnings: [{
    userId: String,
    count: { type: Number, default: 0 },
    reasons: [String]
  }],
  bannedUsers: [String],
  leaderboard: [{
    userId: String,
    username: String,
    coins: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);
