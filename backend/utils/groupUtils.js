const Group = require('../models/Group');

const getOrCreateGroup = async (groupId, groupName) => {
  let group = await Group.findOne({ groupId });
  
  if (!group) {
    group = new Group({
      groupId,
      groupName
    });
    await group.save();
  }
  
  return group;
};

const addWarning = async (groupId, userId, reason) => {
  const group = await Group.findOne({ groupId });
  if (!group) return null;

  let userWarning = group.warnings.find(w => w.userId === userId);
  if (!userWarning) {
    group.warnings.push({ userId, count: 1, reasons: [reason] });
  } else {
    userWarning.count += 1;
    userWarning.reasons.push(reason);
  }

  await group.save();
  return userWarning || { userId, count: 1, reasons: [reason] };
};

const removeWarning = async (groupId, userId) => {
  const group = await Group.findOne({ groupId });
  if (!group) return null;

  group.warnings = group.warnings.filter(w => w.userId !== userId);
  await group.save();
  return true;
};

const getWarnings = async (groupId, userId) => {
  const group = await Group.findOne({ groupId });
  if (!group) return null;

  const userWarning = group.warnings.find(w => w.userId === userId);
  return userWarning || { count: 0 };
};

const banUser = async (groupId, userId) => {
  const group = await Group.findOne({ groupId });
  if (!group) return null;

  if (!group.bannedUsers.includes(userId)) {
    group.bannedUsers.push(userId);
    await group.save();
  }

  return true;
};

const unbanUser = async (groupId, userId) => {
  const group = await Group.findOne({ groupId });
  if (!group) return null;

  group.bannedUsers = group.bannedUsers.filter(id => id !== userId);
  await group.save();
  return true;
};

const isBanned = async (groupId, userId) => {
  const group = await Group.findOne({ groupId });
  if (!group) return false;

  return group.bannedUsers.includes(userId);
};

module.exports = {
  getOrCreateGroup,
  addWarning,
  removeWarning,
  getWarnings,
  banUser,
  unbanUser,
  isBanned
};
