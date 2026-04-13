require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const userUtils = require('./utils/userUtils');
const groupUtils = require('./utils/groupUtils');
const gameUtils = require('./utils/gameUtils');
const RedeemCode = require('./models/RedeemCode');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => console.log('MongoDB connection error:', err));

// Middleware to check admin permissions
const isAdmin = async (ctx) => {
  if (ctx.chat.type === 'private') return true;
  const member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);
  return member.status === 'administrator' || member.status === 'creator';
};

// ========== PRIVATE CHAT HANDLERS ==========

bot.command('start', async (ctx) => {
  const userData = ctx.from;
  const user = await userUtils.getUserOrCreate(userData.id.toString(), userData);
  
  const rewardResult = await userUtils.getDailyReward(userData.id.toString());
  
  let message = `👋 Welcome to Game Bot!\n\n`;
  message += `💰 Your coins: ${user.coins}\n`;
  
  if (rewardResult.success) {
    message += `✅ Daily reward claimed! +200 coins\n`;
  } else {
    message += `⏰ Next reward in: ${Math.ceil((rewardResult.nextReward - new Date()) / (60 * 60 * 1000))} hours\n`;
  }
  
  message += `\n📱 Open Mini App:`;

  // Only show webApp button in production (HTTPS)
  if (process.env.NODE_ENV === 'production') {
    await ctx.reply(message, 
      Markup.inlineKeyboard([
        [Markup.button.webApp('🌐 Open Mini App', `${process.env.MINI_APP_URL}?userId=${userData.id}`)],
        [Markup.button.callback('Help', 'help_info')]
      ])
    );
  } else {
    // For development, use callback and text instructions
    message += `\n\nDevelopment Mode: Visit http://localhost:3000 in your browser to access the mini app.\n\n`;
    message += `Or click the button below for help:`;
    
    await ctx.reply(message, 
      Markup.inlineKeyboard([
        [Markup.button.callback('Help', 'help_info')]
      ])
    );
  }
});

// Help info callback
bot.action('help_info', async (ctx) => {
  ctx.answerCbQuery();
  let message = `🤖 *Game Bot Commands*\n\n`;
  message += `*Private Chats:*\n`;
  message += `/start - Get daily reward\n`;
  message += `/redeem - Redeem a code\n`;
  message += `/profile - Your profile\n`;
  message += `/leaderboard - Top players\n`;
  
  if (userUtils.isOwner(ctx.from.id.toString())) {
    message += `\n*Owner Commands:*\n`;
    message += `/addcoin <id> <amount> - Add coins to user\n`;
  }
  
  await ctx.editMessageText(message, { parse_mode: 'Markdown' });
});


bot.command('help', async (ctx) => {
  let message = `🤖 *Game Bot Commands*\n\n`;
  
  if (ctx.chat.type === 'private') {
    message += `*Private Chats:*\n`;
    message += `/start - Get daily reward\n`;
    message += `/redeem - Redeem a code\n`;
    message += `/profile - Your profile\n`;
    message += `/leaderboard - Top players\n`;
    
    // Add owner commands if user is owner
    if (userUtils.isOwner(ctx.from.id.toString())) {
      message += `\n*Owner Commands:*\n`;
      message += `/addcoin <id> <amount> - Add coins to user\n`;
    }
    message += `\n`;
  } else {
    message += `*Group Commands:*\n`;
    message += `*Admin Only:*\n`;
    message += `/ban - Ban a user\n`;
    message += `/unban - Unban a user\n`;
    message += `/kick - Remove user from group\n`;
    message += `/mute - Mute a user\n`;
    message += `/unmute - Unmute a user\n`;
    message += `/warn - Warn a user\n`;
    message += `/warns - Check warnings\n`;
    message += `/rmwarn - Remove all warnings\n`;
    message += `/promote - Promote to admin\n`;
    message += `/demote - Demote admin\n\n`;
    message += `*Everyone:*\n`;
    message += `/truth - Random truth question\n`;
    message += `/dare - Random dare\n`;
    message += `/stuno - Start UNO game\n`;
    message += `/leaderboard - Show top players\n`;
    message += `/profile - Your profile\n`;
  }
  
  await ctx.reply(message, { parse_mode: 'Markdown' });
});

bot.command('redeem', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply('Usage: /redeem <code>');
  }

  const code = args[1].toUpperCase();
  const redeemCode = await RedeemCode.findOne({ code, isActive: true });

  if (!redeemCode) {
    return ctx.reply('❌ Invalid or expired code');
  }

  if (redeemCode.usedBy.includes(ctx.from.id.toString())) {
    return ctx.reply('❌ You already used this code');
  }

  if (redeemCode.maxUses && redeemCode.usedBy.length >= redeemCode.maxUses) {
    return ctx.reply('❌ Code limit reached');
  }

  redeemCode.usedBy.push(ctx.from.id.toString());
  await redeemCode.save();

  await userUtils.addCoins(ctx.from.id.toString(), redeemCode.reward);
  ctx.reply(`✅ Redeemed! +${redeemCode.reward} coins`);
});

// ========== OWNER COMMANDS ==========

// Add coins to user (Owner only)
bot.command('addcoin', async (ctx) => {
  // Check if user is owner
  if (!userUtils.isOwner(ctx.from.id.toString())) {
    return ctx.reply('❌ This command is for owner only');
  }

  const args = ctx.message.text.split(' ');
  if (args.length < 3) {
    return ctx.reply('Usage: /addcoin <telegram_id> <amount>');
  }

  const targetUserId = args[1];
  const amount = parseInt(args[2]);

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply('❌ Amount must be a positive number');
  }

  try {
    const user = await userUtils.addCoins(targetUserId, amount);
    if (user) {
      ctx.reply(`✅ Added ${amount} coins to user ${targetUserId}\nNew balance: ${user.coins}`);
    } else {
      ctx.reply('❌ User not found or not created yet');
    }
  } catch (err) {
    ctx.reply('❌ Failed to add coins');
  }
});

// ========== GROUP COMMANDS ==========

// MODERATION - Ban
bot.command('ban', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  if (!(await isAdmin(ctx))) {
    return ctx.reply('❌ Admin only');
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Reply to a message to ban that user');
  }

  try {
    await ctx.telegram.banChatMember(ctx.chat.id, userId);
    await groupUtils.banUser(ctx.chat.id.toString(), userId.toString());
    ctx.reply(`✅ User banned`);
  } catch (err) {
    ctx.reply('❌ Failed to ban user');
  }
});

// MODERATION - Unban
bot.command('unban', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  if (!(await isAdmin(ctx))) {
    return ctx.reply('❌ Admin only');
  }

  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply('Usage: /unban <user_id>');
  }

  const userId = parseInt(args[1]);
  try {
    await ctx.telegram.unbanChatMember(ctx.chat.id, userId);
    await groupUtils.unbanUser(ctx.chat.id.toString(), userId.toString());
    ctx.reply(`✅ User unbanned`);
  } catch (err) {
    ctx.reply('❌ Failed to unban user');
  }
});

// MODERATION - Kick
bot.command('kick', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  if (!(await isAdmin(ctx))) {
    return ctx.reply('❌ Admin only');
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Reply to a message to kick that user');
  }

  try {
    await ctx.telegram.kickChatMember(ctx.chat.id, userId);
    ctx.reply(`✅ User kicked`);
  } catch (err) {
    ctx.reply('❌ Failed to kick user');
  }
});

// MODERATION - KickMe
bot.command('kickme', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  try {
    await ctx.telegram.kickChatMember(ctx.chat.id, ctx.from.id);
  } catch (err) {
    ctx.reply('❌ Failed');
  }
});

// WARNING SYSTEM - Warn
bot.command('warn', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  if (!(await isAdmin(ctx))) {
    return ctx.reply('❌ Admin only');
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  const reason = ctx.message.text.split(' ').slice(1).join(' ') || 'No reason';

  if (!userId) {
    return ctx.reply('Reply to a message to warn that user');
  }

  const warning = await groupUtils.addWarning(ctx.chat.id.toString(), userId.toString(), reason);
  ctx.reply(`⚠️ User warned (${warning.count}/5)\nReason: ${reason}`);
});

// WARNING SYSTEM - Remove Warnings
bot.command('rmwarn', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  if (!(await isAdmin(ctx))) {
    return ctx.reply('❌ Admin only');
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Reply to a message to remove warnings');
  }

  await groupUtils.removeWarning(ctx.chat.id.toString(), userId.toString());
  ctx.reply(`✅ Warnings removed`);
});

// WARNING SYSTEM - Check Warnings
bot.command('warns', async (ctx) => {
  const userId = ctx.message.reply_to_message?.from?.id || ctx.from.id;
  const warnings = await groupUtils.getWarnings(ctx.chat.id.toString(), userId.toString());
  
  if (!warnings || warnings.count === 0) {
    return ctx.reply('✅ No warnings');
  }

  let message = `⚠️ *Warnings for user:* ${warnings.count}/5\n\n`;
  message += `*Reasons:*\n`;
  warnings.reasons.forEach((reason, idx) => {
    message += `${idx + 1}. ${reason}\n`;
  });

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// ADMIN - Promote
bot.command('promote', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  if (!(await isAdmin(ctx))) {
    return ctx.reply('❌ Admin only');
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Reply to a message to promote that user');
  }

  try {
    await ctx.telegram.promoteChatMember(ctx.chat.id, userId, {
      can_post_messages: true,
      can_edit_messages: true,
      can_delete_messages: true,
      can_manage_voice_chats: true
    });
    ctx.reply(`✅ User promoted to admin`);
  } catch (err) {
    ctx.reply('❌ Failed to promote user');
  }
});

// ADMIN - Demote
bot.command('demote', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  if (!(await isAdmin(ctx))) {
    return ctx.reply('❌ Admin only');
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Reply to a message to demote that user');
  }

  try {
    await ctx.telegram.promoteChatMember(ctx.chat.id, userId, {
      can_post_messages: false,
      can_edit_messages: false,
      can_delete_messages: false,
      can_manage_voice_chats: false
    });
    ctx.reply(`✅ User demoted`);
  } catch (err) {
    ctx.reply('❌ Failed to demote user');
  }
});

// MUTE SYSTEM - Mute
bot.command('mute', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  if (!(await isAdmin(ctx))) {
    return ctx.reply('❌ Admin only');
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Reply to a message to mute that user');
  }

  try {
    await ctx.telegram.restrictChatMember(ctx.chat.id, userId, {
      permissions: { can_send_messages: false }
    });
    ctx.reply(`🔇 User muted`);
  } catch (err) {
    ctx.reply('❌ Failed to mute user');
  }
});

// MUTE SYSTEM - Temporary Mute
bot.command('tmute', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  if (!(await isAdmin(ctx))) {
    return ctx.reply('❌ Admin only');
  }

  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply('Usage: /tmute <hours>');
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Reply to a message to mute that user');
  }

  const hours = parseInt(args[1]);
  const until = Math.floor(Date.now() / 1000) + (hours * 60 * 60);

  try {
    await ctx.telegram.restrictChatMember(ctx.chat.id, userId, {
      permissions: { can_send_messages: false },
      until_date: until
    });
    ctx.reply(`🔇 User muted for ${hours} hours`);
  } catch (err) {
    ctx.reply('❌ Failed to mute user');
  }
});

// MUTE SYSTEM - Unmute
bot.command('unmute', async (ctx) => {
  if (ctx.chat.type === 'private') {
    return ctx.reply('This command only works in groups');
  }

  if (!(await isAdmin(ctx))) {
    return ctx.reply('❌ Admin only');
  }

  const userId = ctx.message.reply_to_message?.from?.id;
  if (!userId) {
    return ctx.reply('Reply to a message to unmute that user');
  }

  try {
    await ctx.telegram.restrictChatMember(ctx.chat.id, userId, {
      permissions: {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true
      }
    });
    ctx.reply(`🔊 User unmuted`);
  } catch (err) {
    ctx.reply('❌ Failed to unmute user');
  }
});

// ========== GAMES ==========

// Truth & Dare
bot.command('truth', async (ctx) => {
  const question = gameUtils.getTruthQuestion();
  ctx.reply(`🎭 Truth: ${question}`);
});

bot.command('dare', async (ctx) => {
  const dare = gameUtils.getDareQuestion();
  ctx.reply(`🎯 Dare: ${dare}`);
});

// UNO Game - Mode Selection
bot.command('stuno', async (ctx) => {
  ctx.reply(
    '🎮 *UNO Game Mode*\n\nChoose how you want to play:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🎮 Play in Group', 'uno_group')],
      [Markup.button.callback('🌐 Play in Mini App', 'uno_mini_app')]
    ])
  );
});

// Handle button callbacks
bot.action('uno_group', async (ctx) => {
  ctx.answerCbQuery();
  const groupId = ctx.chat.id.toString();
  await groupUtils.getOrCreateGroup(groupId, ctx.chat.title);
  
  ctx.reply(
    '🎮 *UNO Game Started!*\n\nJoin the game or start playing:',
    Markup.inlineKeyboard([
      [Markup.button.callback('✅ Join Game', `uno_join_${groupId}`)],
      [Markup.button.callback('▶️ Start Game', `uno_start_${groupId}`)]
    ])
  );
});

bot.action('uno_mini_app', async (ctx) => {
  ctx.answerCbQuery();
  const roomId = gameUtils.generateRoomId();
  
  ctx.reply(
    `🌐 *UNO Mini App Room Created*\n\n📱 Room ID: \`${roomId}\`\n\nTap below to join:`,
    Markup.inlineKeyboard([
      [Markup.button.webApp(`🎮 Open Game`, `${process.env.MINI_APP_URL}?room=${roomId}`)]
    ])
  );
});

// Leaderboard
bot.command('leaderboard', async (ctx) => {
  const users = await userUtils.getLeaderboard();
  
  let message = `🏆 *Top Players*\n\n`;
  users.forEach((user, idx) => {
    message += `${idx + 1}. @${user.username} - ${user.coins} 🪙\n`;
  });

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// Profile
bot.command('profile', async (ctx) => {
  const user = await userUtils.getUserOrCreate(ctx.from.id.toString(), ctx.from);
  
  let message = `👤 *Your Profile*\n\n`;
  message += `Name: ${user.firstName || 'N/A'}\n`;
  message += `Balance: ${user.coins} 🪙\n`;
  message += `Games Won: ${user.stats.gamesWon}\n`;
  message += `Total Earnings: ${user.stats.totalEarnings}\n`;

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// Error handler
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ An error occurred. Please try again.');
});

// Launch bot
bot.launch().then(() => {
  console.log('🤖 Bot is running...');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
