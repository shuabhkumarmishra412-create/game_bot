#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run this once to set up collections and indexes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Group = require('../models/Group');
const Game = require('../models/Game');
const UnoRoom = require('../models/UnoRoom');
const RedeemCode = require('../models/RedeemCode');

const initDatabase = async () => {
  try {
    console.log('📊 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Create indexes
    console.log('📑 Creating indexes...');
    
    await User.collection.createIndex({ telegramId: 1 });
    await Group.collection.createIndex({ groupId: 1 });
    await Game.collection.createIndex({ gameId: 1 });
    await UnoRoom.collection.createIndex({ roomId: 1 });
    await RedeemCode.collection.createIndex({ code: 1 });

    console.log('✅ Indexes created');

    // Create sample data (optional)
    const sampleCode = await RedeemCode.findOne({ code: 'WELCOME100' });
    if (!sampleCode) {
      console.log('✨ Creating sample redeem code...');
      const welcomeCode = new RedeemCode({
        code: 'WELCOME100',
        reward: 100,
        maxUses: 1000,
        isActive: true
      });
      await welcomeCode.save();
      console.log('✅ Sample code created: WELCOME100 (100 coins)');
    }

    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
};

initDatabase();
