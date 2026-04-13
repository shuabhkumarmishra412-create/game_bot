const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true },
  gameType: { type: String, enum: ['uno', 'truth_dare'] },
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  groupId: String,
  players: [{
    userId: String,
    username: String,
    position: Number,
    coins: { type: Number, default: 0 }
  }],
  gameState: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  finishedAt: Date
});

module.exports = mongoose.model('Game', gameSchema);
