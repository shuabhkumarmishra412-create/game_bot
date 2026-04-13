const mongoose = require('mongoose');

const unoRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  roomCode: String,
  createdBy: String,
  players: [{
    userId: String,
    username: String,
    hand: [String],
    isPlaying: Boolean,
    position: Number
  }],
  gameState: {
    currentPlayer: String,
    deck: [String],
    discard: [String],
    direction: { type: Number, default: 1 }
  },
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now },
  miniApp: { type: Boolean, default: true }
});

module.exports = mongoose.model('UnoRoom', unoRoomSchema);
