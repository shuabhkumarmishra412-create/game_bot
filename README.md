# 🎮 Game Bot + Mini App

A complete Telegram bot with group management, games (UNO, Truth & Dare), and a coin-based economy system, paired with an advanced Mini App for real-time gameplay.

---

## 🚀 Features

### 🤖 Bot Features
- **Group Management** (Admin only)
  - `/ban` - Ban users
  - `/unban` - Unban users
  - `/kick` - Remove users
  - `/mute` / `/tmute` / `/unmute` - Mute system
  - `/warn` / `/warns` / `/rmwarn` - Warning system
  - `/promote` / `/demote` - Admin controls

- **Games**
  - `/truth` - Random truth questions
  - `/dare` - Random dares
  - `/stuno` - UNO game with modes (group or mini app)

- **Economy**
  - `/start` - Daily reward (200 coins, 24h cooldown)
  - `/profile` - User profile
  - `/leaderboard` - Top 10 players
  - `/redeem` - Redeem codes

### 📱 Mini App Features
- **Profile** - User info, stats, coin balance
- **Games** - Join UNO rooms, real-time multiplayer
- **Shop** - Purchase coins, redeem codes
- **Leaderboard** - Global rankings
- **WebSocket** - Real-time game updates

---

## 🛠️ Installation

### Prerequisites
- Node.js 14+
- MongoDB (local or cloud)
- Telegram Bot Token

### 1. Clone & Setup

```bash
cd /workspaces/game_bot

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
TELEGRAM_TOKEN=your_bot_token_here
MONGODB_URI=mongodb://localhost:27017/game_bot
MINI_APP_URL=http://localhost:3000
BOT_SERVER_PORT=3001
MINI_APP_PORT=3000
NODE_ENV=development
```

### 3. Create Telegram Bot

1. Talk to [@BotFather](https://t.me/botfather) on Telegram
2. Create new bot → Get token
3. Set webhook or polling mode
4. Create Mini App:
   - `/newapp` in BotFather
   - Set short name and web app URL

### 4. Run Services

**Terminal 1 - Bot:**
```bash
npm start
```

**Terminal 2 - API Server:**
```bash
npm run server
```

**Terminal 3 - Mini App (optional, for development):**
```bash
# If using Python's http.server or similar
python3 -m http.server 3000 --directory ./frontend
```

---

## 📚 API Documentation

### Authentication
All requests to `/api/*` endpoints require:
```
Headers: X-Init-Data: <telegram_init_data>
```

### User Endpoints
- `POST /api/user/sync` - Auto-register/update user
- `GET /api/user/profile` - Get user stats
- `POST /api/user/coins` - Add coins (testing)

### UNO Endpoints
- `POST /api/uno/create` - Create room
- `POST /api/uno/join` - Join room
- `GET /api/uno/room/:roomId` - Get room state

### Shop Endpoints
- `POST /api/purchase/coins` - Buy coins
- `POST /api/redeem` - Redeem code

### Leaderboard
- `GET /api/leaderboard` - Top 20 users

---

## 🎮 Game Mechanics

### UNO Implementation

**Flow:**
1. User runs `/stuno` in group
2. Chooses: "Play in Group" or "Play in Mini App"
3. Players join within 2 minutes
4. Game starts with shuffled deck
5. Turn-based card matching
6. Win conditions and scoring

**Rewards:**
- 1st place: 500 coins
- 2nd place: 300 coins
- 3rd place: 100 coins

**WebSocket Messages:**
```json
{
  "type": "join_room",
  "userId": "123456",
  "roomId": "ABC123"
}
```

---

## 🗄️ Database Models

### User
- `telegramId` - Unique identifier
- `coins` - Account balance
- `stats` - Games won, played, earnings
- `lastDailyReward` - For cooldown

### Group
- `groupId` - Telegram group ID
- `warnings` - User warnings
- `bannedUsers` - Banned user IDs
- `leaderboard` - Group rankings

### UnoRoom
- `roomId` - Game room ID
- `players` - Player list with hands
- `gameState` - Current game state
- `status` - waiting/active/finished

---

## 🔒 Security Notes

### Important
- ✅ Verify Telegram WebApp data
- ✅ Validate user tokens
- ✅ Rate limit API endpoints
- ✅ Server-side game validation
- ❌ Don't trust client game state

### Telegram WebApp Verification
```javascript
// Server validates hash
const hash = telegramData.hash;
// Compare with computed HMAC-SHA256
```

---

## 🚀 Deployment

### Using Heroku/Railway

1. Create `Procfile`:
```
web: node backend/bot.js
api: node backend/server.js
```

2. Push to Heroku:
```bash
git push heroku main
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000 3001
CMD ["npm", "start"]
```

---

## 📱 Setting Up Mini App

1. In [@BotFather](https://t.me/botfather):
   - `/myapps` → Select your bot
   - `/newapp` - Create Mini App
   - Set:
     - **Short name:** `game`
     - **Friendly name:** `Game Bot`
     - **Descriptions:** Add description
     - **Web App URL:** `https://yourdomain.com` (your server)

2. Users can now access via `/game` command

3. Add menu button to bot:
   - `/myapps` → Select app
   - Add menu button linking to web app

---

## 🎯 Future Features

- [ ] More games (Dice, Blackjack, Slots)
- [ ] Tournaments with prizes
- [ ] Daily challenges
- [ ] Guilds/Teams
- [ ] Item trading
- [ ] Achievements/Badges
- [ ] Admin dashboard

---

## 🐛 Troubleshooting

### Bot not responding
- Check token in `.env`
- Ensure MongoDB is running
- Check bot hasn't been stopped

### Mini App not loading
- Verify Mini App URL in BotFather
- Check CORS settings in server.js
- Clear browser cache

### WebSocket connection fails
- Check server is running on port 3001
- Verify WSS protocol for HTTPS

---

## 📞 Support

For issues:
1. Check `.env` configuration
2. Verify MongoDB connection
3. Check console logs in terminal
4. Restart services if needed

---

## 📄 License

MIT License - Feel free to modify and use!

---

Created with ❤️ for Telegram bots