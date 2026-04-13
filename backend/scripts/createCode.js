#!/usr/bin/env node

/**
 * Admin Script - Create redeem codes
 * Usage: node createCode.js <CODE> <REWARD> [MAX_USES]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const RedeemCode = require('../models/RedeemCode');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node createCode.js <CODE> <REWARD> [MAX_USES]');
  console.log('Example: node createCode.js SUMMER50 500 100');
  process.exit(1);
}

const [code, reward, maxUses] = args;

const createCode = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existing = await RedeemCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      console.log('❌ Code already exists!');
      process.exit(1);
    }

    const newCode = new RedeemCode({
      code: code.toUpperCase(),
      reward: parseInt(reward),
      maxUses: maxUses ? parseInt(maxUses) : null,
      isActive: true
    });

    await newCode.save();

    console.log(`✅ Code created successfully!`);
    console.log(`Code: ${code.toUpperCase()}`);
    console.log(`Reward: ${reward} coins`);
    console.log(`Max Uses: ${maxUses || 'Unlimited'}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createCode();
