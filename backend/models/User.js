const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  coins: { type: Number, default: 0 },
  isOwner: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastDailyReward: Date,
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('User', userSchema);
