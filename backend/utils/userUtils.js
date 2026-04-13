const User = require('../models/User');

const getUserOrCreate = async (telegramId, userData) => {
  let user = await User.findOne({ telegramId });
  
  if (!user) {
    // Check if this user is the owner
    const isOwner = telegramId === process.env.OWNER_ID;
    
    user = new User({
      telegramId,
      username: userData.username || '',
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      coins: 0,
      isOwner: isOwner
    });
    await user.save();
  } else if (!user.isOwner && user.telegramId === process.env.OWNER_ID) {
    // Update existing user if they're the owner
    user.isOwner = true;
    await user.save();
  }
  
  return user;
};

const isOwner = (telegramId) => {
  return telegramId === process.env.OWNER_ID;
};

const addCoins = async (telegramId, amount) => {
  const user = await User.findOne({ telegramId });
  if (user) {
    user.coins += amount;
    user.stats.totalEarnings += amount;
    await user.save();
  }
  return user;
};

const removeCoins = async (telegramId, amount) => {
  const user = await User.findOne({ telegramId });
  if (user && user.coins >= amount) {
    user.coins -= amount;
    await user.save();
    return true;
  }
  return false;
};

const getDailyReward = async (telegramId) => {
  const user = await User.findOne({ telegramId });
  if (!user) return null;

  const now = new Date();
  const lastReward = user.lastDailyReward;

  if (!lastReward || (now - lastReward) >= 24 * 60 * 60 * 1000) {
    user.coins += 200;
    user.lastDailyReward = now;
    await user.save();
    return { success: true, coins: 200 };
  }

  const nextRewardTime = new Date(lastReward.getTime() + 24 * 60 * 60 * 1000);
  return { success: false, nextReward: nextRewardTime };
};

const getLeaderboard = async (groupId = null) => {
  if (groupId) {
    // Group leaderboard
    const users = await User.find({}).sort({ coins: -1 }).limit(10);
    return users;
  } else {
    // Global leaderboard
    const users = await User.find({}).sort({ coins: -1 }).limit(10);
    return users;
  }
};

module.exports = {
  getUserOrCreate,
  isOwner,
  addCoins,
  removeCoins,
  getDailyReward,
  getLeaderboard
};
