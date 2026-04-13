# 📋 Setup Guide - Step by Step

## Prerequisites ✅

- **Node.js** 14+ ([download](https://nodejs.org))
- **MongoDB** ([local](https://docs.mongodb.com/manual/installation/) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([download](https://git-scm.com))
- **Telegram Bot** (from [@BotFather](https://t.me/botfather))

---

## Step 1: Get Your Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Follow prompts (name, username)
4. **Copy the token** - you'll need it later

Example token: `123456789:ABCdefGHIjklmnoPQRstuvWXYZabcdefGH`

---

## Step 2: Clone & Install

```bash
# Navigate to workspace
cd /workspaces/game_bot

# Install all dependencies
npm install

# This installs:
# - telegraf (Telegram bot library)
# - express (API server)
# - mongoose (MongoDB)
# - ws (WebSockets)
# - and more...
```

**Expected Output:**
```
added 200+ packages in 45s
```

---

## Step 3: Setup MongoDB

### Option A: Local MongoDB (Recommended for Development)

**Linux/macOS:**
```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongo --version
```

**Windows:**
- Download and run [MongoDB installer](https://www.mongodb.com/try/download/community)
- MongoDB runs as a service automatically

**Docker:**
```bash
docker run -d -p 27017:27017 --name game_bot_mongo mongo:latest
```

### Option B: MongoDB Atlas (Cloud - Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account
3. Create free cluster
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/game_bot`

---

## Step 4: Configure Environment

1. Copy example file:
```bash
cp .env.example .env
```

2. Edit `.env` with your values:

**For Local MongoDB:**
```env
TELEGRAM_TOKEN=YOUR_BOT_TOKEN_HERE
MONGODB_URI=mongodb://localhost:27017/game_bot
MINI_APP_URL=http://localhost:3000
BOT_SERVER_PORT=3001
MINI_APP_PORT=3000
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
TELEGRAM_TOKEN=YOUR_BOT_TOKEN_HERE
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/game_bot
MINI_APP_URL=http://localhost:3000
BOT_SERVER_PORT=3001
MINI_APP_PORT=3000
NODE_ENV=development
```

3. Replace:
   - `YOUR_BOT_TOKEN_HERE` - Paste your token from Step 1
   - `mongodb://localhost:27017/game_bot` - Your MongoDB URL

---

## Step 5: Initialize Database

```bash
node backend/scripts/initDb.js
```

**Expected Output:**
```
📊 Connecting to MongoDB...
✅ Connected to MongoDB
📑 Creating indexes...
✅ Indexes created
✨ Creating sample redeem code...
✅ Sample code created: WELCOME100 (100 coins)
✅ Database initialized successfully!
```

---

## Step 6: Start Services

Open **3 separate terminals** in the project directory:

### Terminal 1 - Telegram Bot:
```bash
npm start
```

Expected output:
```
🤖 Bot is running...
```

### Terminal 2 - API Server:
```bash
npm run server
```

Expected output:
```
🚀 Server running on port 3001
```

### Terminal 3 - Mini App (Optional, for development):
```bash
# Using Python's http.server
python3 -m http.server 3000 --directory ./frontend

# Or if you have http-server installed
npx http-server frontend -p 3000
```

Expected output:
```
Starting up http-server on port 3000
```

---

## Step 7: Test the Bot

1. Open Telegram
2. Find your bot by username
3. Send `/start`
4. You should see welcome message with your coins

**Test commands:**
```
/help - See all commands
/profile - View your profile
/truth - Get a truth question
/dare - Get a dare
/leaderboard - See rankings
```

---

## Step 8: Setup Mini App (BotFather)

1. Talk to [@BotFather](https://t.me/botfather)
2. Send `/myapps`
3. Select your bot
4. Send `/newapp`
5. Fill in details:
   - **Short name:** `game`
   - **Friendly name:** `Game Bot`
   - **Description:** `Play games and earn coins!`
   - **Web App URL:** `http://localhost:3000`

6. Copy the app access link (you can share this)

7. In your bot, users can now run `/game` to open the Mini App

---

## Step 9: Test Mini App

1. Get your Mini App URL from BotFather
2. Open it on your phone or in browser
3. You should see:
   - Profile tab with coins
   - Games tab
   - Shop tab
   - Leaderboard tab

---

## Step 10: Create Redeem Codes (Optional)

```bash
# Create a code that gives 100 coins
node backend/scripts/createCode.js WELCOME100 100 1000

# Create a code with limited uses
node backend/scripts/createCode.js SUMMER50 50 100

# Create unlimited code
node backend/scripts/createCode.js VIP500 500
```

Users can redeem with: `/redeem WELCOME100`

---

## Full Project Structure

```
game_bot/
├── backend/
│   ├── bot.js                 # Main bot file
│   ├── server.js              # API & WebSocket server
│   ├── models/                # Database schemas
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Game.js
│   │   ├── UnoRoom.js
│   │   └── RedeemCode.js
│   ├── utils/                 # Helper functions
│   │   ├── userUtils.js
│   │   ├── groupUtils.js
│   │   └── gameUtils.js
│   └── scripts/               # Admin scripts
│       ├── initDb.js
│       └── createCode.js
│
├── frontend/                  # Mini App
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── package.json
├── .env                       # Your secrets (NOT in git)
├── .env.example              # Example config
├── docker-compose.yml        # Docker setup
├── Dockerfile                # Container recipe
├── README.md                 # Overview
├── SETUP.md                  # This file
└── DEPLOYMENT.md             # Deployment guide
```

---

## Troubleshooting

### Bot doesn't respond

**Check 1: Is token correct?**
```bash
echo $TELEGRAM_TOKEN
# Should show your token
```

**Check 2: Is bot running?**
```bash
# Look for "🤖 Bot is running..." in Terminal 1
```

**Check 3: Is MongoDB connected?**
```bash
# Try connecting manually
mongosh mongodb://localhost:27017/game_bot
# Should connect successfully
```

### Mini App shows blank

**Check 1: Is server running?**
```bash
# Terminal 2 should show "🚀 Server running on port 3001"
```

**Check 2: Check browser console**
- Open DevTools (F12)
- Go to Console tab
- Look for errors

**Check 3: Clear cache**
- Hard refresh (Ctrl+Shift+R on Linux/Windows)
- Or open in incognito mode

### Port already in use

If you get "EADDRUSE: address already in use :::3001":

```bash
# Find process on port 3001
lsof -i :3001

# Kill it (Linux/macOS)
kill -9 <PID>

# Or just use different port in .env
BOT_SERVER_PORT=3002
```

---

## Next Steps

1. **Customize Bot:**
   - Edit truth/dare questions in `backend/utils/gameUtils.js`
   - Modify coin rewards in `backend/utils/userUtils.js`

2. **Deploy:**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Upload to Heroku, Railway, AWS, etc.

3. **Add Features:**
   - Implement more games
   - Add tournaments
   - Create admin dashboard

4. **Connect Payment:**
   - Integrate Stripe for coin purchases
   - Add real transactions

---

## Quick Reference Commands

```bash
# Start development
npm start                      # Bot only
npm run server                 # Server only
npm run dev                    # Both (requires concurrently)

# Database
node backend/scripts/initDb.js              # Initialize DB
node backend/scripts/createCode.js CODE 50  # Create coin code

# Testing
curl http://localhost:3001/api/leaderboard  # Test API

# Docker
docker-compose up -d           # Start all services
docker-compose down            # Stop services
docker-compose logs -f         # View logs
```

---

## Support & Resources

- **Telegraf Docs:** https://telegraf.js.org
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **MongoDB Docs:** https://docs.mongodb.com
- **Express.js:** https://expressjs.com

---

✅ **Setup Complete!**

Your bot is ready to use. Share the Mini App link with friends and start playing!
