# ⚡ Quick Start (5 minutes)

## 1. Get Telegram Bot Token
- Open Telegram → Search [@BotFather](https://t.me/botfather)
- Send `/newbot`
- Copy your token (looks like: `123456:ABC-DEF1234ghIkl-Z...`)

## 2. Install Dependencies
```bash
cd /workspaces/game_bot
npm install
```

## 3. Create .env File
```bash
cp .env.example .env
```

Edit `.env`:
```
TELEGRAM_TOKEN=paste_your_token_here
MONGODB_URI=mongodb://localhost:27017/game_bot
```

## 4. Start MongoDB (Pick One)

### Option A: Docker (Easiest)
```bash
docker run -d -p 27017:27017 --name game_bot_db mongo:latest
```

### Option B: Local Installation
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows - Runs automatically after install
```

## 5. Initialize Database
```bash
node backend/scripts/initDb.js
```

## 6. Start Services (Open 2 terminals)

**Terminal 1 - Bot:**
```bash
npm start
```

**Terminal 2 - Server:**
```bash
npm run server
```

## 7. Test It!

1. Open Telegram
2. Find your bot by username
3. Send `/start`
4. You should see: "✅ Welcome to Game Bot!" with coin balance

## 8. Try Commands
```
/help            - See all commands
/profile         - Your profile
/truth           - Truth question
/dare            - Dare challenge
/leaderboard     - Top players
/stuno           - Start UNO game
```

## 9. Setup Mini App (In BotFather)
1. Talk to [@BotFather](https://t.me/botfather)
2. Send `/myapps`
3. Send `/newapp`
4. Set Web App URL to: `http://localhost:3000`
5. Now users can access via `/game`

## ✅ You're Done!

Your bot is live and ready to use!

---

## Troubleshooting

**Bot not responding?**
- Check `.env` has correct token
- Check Terminal 1 shows "🤖 Bot is running..."

**Port in use?**
```bash
lsof -i :3001    # Find process
kill -9 <PID>    # Kill it
```

**MongoDB connection error?**
- Check MongoDB is running
- Or use MongoDB Atlas (cloud)

---

## Next: Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Docker setup
- Heroku deployment
- Railway deployment
- AWS EC2 setup

---

## Next: Customize

1. Edit truth/dare questions: `backend/utils/gameUtils.js`
2. Change coin rewards: `backend/utils/userUtils.js`
3. Modify Mini App UI: `frontend/styles.css`
4. Add new commands: `backend/bot.js`

---

Created with ❤️
