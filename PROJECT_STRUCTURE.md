# 📦 Project Structure

```
game_bot/
│
├── 📄 Configuration Files
│   ├── package.json              ← Dependencies and scripts
│   ├── .env.example              ← Template for secrets
│   ├── .gitignore                ← Git exclusions
│   ├── Dockerfile                ← Container image
│   └── docker-compose.yml        ← Multi-service setup
│
├── 📚 Documentation
│   ├── START_HERE.md             ← Read this first! ⭐
│   ├── QUICKSTART.md             ← 5-minute setup
│   ├── SETUP.md                  ← Detailed installation
│   ├── README.md                 ← Project overview
│   ├── DEPLOYMENT.md             ← Production guide
│   ├── ARCHITECTURE.md           ← System design
│   └── API.md                    ← API reference
│
├── 🤖 Backend (Node.js)
│   └── backend/
│       │
│       ├── bot.js                ← Main Telegram bot
│       └── server.js             ← Express API + WebSocket
│       │
│       ├── 🗂️ models/
│       │   ├── User.js           ← User schema
│       │   ├── Group.js          ← Group/chat schema
│       │   ├── Game.js           ← Game records
│       │   ├── UnoRoom.js        ← UNO game rooms
│       │   └── RedeemCode.js     ← Promo codes
│       │
│       ├── 🔧 utils/
│       │   ├── userUtils.js      ← User functions
│       │   ├── groupUtils.js     ← Group/admin functions
│       │   └── gameUtils.js      ← Game logic
│       │
│       └── 🛠️ scripts/
│           ├── initDb.js         ← Initialize database
│           └── createCode.js     ← Create redeem codes
│
├── 📱 Frontend (Mini App)
│   └── frontend/
│       ├── index.html            ← Main HTML
│       ├── styles.css            ← Beautiful CSS
│       └── app.js                ← App logic & UI
│
└── 🚀 Setup Scripts
    ├── install.sh                ← Linux/Mac setup
    └── install.bat               ← Windows setup
```

---

## File Count Summary

- **Backend Files**: 11 files
  - 1 main bot file
  - 1 API server
  - 5 database models
  - 3 utility modules
  - 2 admin scripts

- **Frontend Files**: 3 files
  - 1 HTML structure
  - 1 CSS styling
  - 1 JavaScript app

- **Documentation**: 7 guides
- **Configuration**: 4 files
- **Setup Scripts**: 2 installers

**Total: 26+ files creating a complete bot + Mini App system**

---

## Installation Size

- Package.json: ~15 dependencies
- npm install: ~200+ packages (node_modules/)
- Code size: ~50 KB (minified)
- Documentation: ~100+ KB

**But worth it for what you get!** ✨

---

## What Each File Does

### Core Bot
- **bot.js** (450+ lines)
  - Telegram command handlers
  - Group management (/ban, /kick, /mute, etc.)
  - Games (/truth, /dare, /stuno)
  - Economy (/profile, /leaderboard)

- **server.js** (350+ lines)
  - Express REST API
  - WebSocket server
  - User sync & authentication
  - Game room management
  - Coin purchases

### Database Models
- **User.js**
  - Stores: ID, coins, stats, daily rewards
  
- **Group.js**
  - Stores: warnings, bans, leaderboards
  
- **Game.js**
  - Stores: game history, results
  
- **UnoRoom.js**
  - Stores: active games, players, state
  
- **RedeemCode.js**
  - Stores: codes, rewards, usage

### Utilities
- **userUtils.js** (80 lines)
  - Create/get users
  - Manage coins
  - Daily rewards
  - Leaderboard

- **groupUtils.js** (90 lines)
  - Warn users
  - Ban/unban
  - Group settings

- **gameUtils.js** (120 lines)
  - Truth/Dare questions
  - UNO deck generation
  - Card validation
  - Room IDs

### Scripts
- **initDb.js** (70 lines)
  - Creates MongoDB indexes
  - Sets up sample data
  
- **createCode.js** (60 lines)
  - Generate redeem codes
  - Control rewards

### Mini App
- **index.html** (30 lines)
  - Basic structure
  - Load SDK

- **styles.css** (800+ lines)
  - Beautiful responsive design
  - Dark theme
  - Animations

- **app.js** (500+ lines)
  - User authentication
  - All UI pages
  - API integration
  - WebSocket handling

---

## Dependencies Used

### Backend
```json
{
  "telegraf": "^4.12.0",      // Telegram bot
  "express": "^4.18.2",       // API server
  "mongoose": "^7.5.0",       // MongoDB ODM
  "ws": "^8.14.2",            // WebSocket
  "body-parser": "^1.20.2",   // JSON parsing
  "cors": "^2.8.5",           // CORS headers
  "dotenv": "^16.3.1",        // Env variables
  "uuid": "^9.0.0"            // ID generation
}
```

### Frontend
- Vanilla JavaScript (no framework needed!)
- Telegram WebApp SDK (included)
- Pure CSS (no dependencies)

---

## Database Collections

### users
```
{
  telegramId: "123456789",
  username: "johndoe",
  coins: 1000,
  stats: { gamesWon: 5, ... },
  lastDailyReward: Date
}
```

### groups
```
{
  groupId: "-123456789",
  warnings: [{ userId, count, reasons }],
  bannedUsers: ["456", "789"],
  leaderboard: [...]
}
```

### unoRooms
```
{
  roomId: "ABC123",
  players: [{userId, username, hand, position}],
  gameState: { currentPlayer, deck, discard },
  status: "active"
}
```

### redeemCodes
```
{
  code: "SUMMER50",
  reward: 50,
  usedBy: ["123", "456"],
  maxUses: 100
}
```

---

## API Routes

```
POST   /api/user/sync              - Register user
GET    /api/user/profile           - Get stats
POST   /api/user/coins             - Add coins

POST   /api/uno/create             - Create room
POST   /api/uno/join               - Join room
GET    /api/uno/room/:roomId       - Get state

POST   /api/purchase/coins         - Buy coins
POST   /api/redeem                 - Redeem code

GET    /api/leaderboard            - Top players

WS     /                           - WebSocket endpoint
```

---

## UI Pages (Mini App)

```
Profile Tab
├─ Avatar
├─ Name & ID
├─ Coin balance
├─ Stats (games won/played)
└─ Action buttons

Games Tab
├─ UNO (card game)
├─ Truth & Dare
└─ More coming...

Shop Tab
├─ Coin packages (3 sizes)
├─ Redeem code input
└─ Purchase history

Leaderboard Tab
├─ Top 20 players
├─ Rank medals
└─ Coin amounts
```

---

## Command Summary

### Admin Commands
```
/ban        - Ban user
/unban      - Unban user
/kick       - Kick user
/mute       - Mute user
/tmute      - Temp mute
/unmute     - Unmute user
/warn       - Warn user
/warns      - Check warnings
/rmwarn     - Remove warnings
/promote    - Make admin
/demote     - Remove admin
```

### Game Commands
```
/truth      - Truth question
/dare       - Dare challenge
/stuno      - Start UNO game
```

### User Commands
```
/start      - Register & daily reward
/help       - Show commands
/profile    - User profile
/leaderboard- Top 20 players
/redeem     - Redeem code
```

---

## Environment Variables

```env
TELEGRAM_TOKEN=your_bot_token
MONGODB_URI=mongodb://localhost:27017/game_bot
MINI_APP_URL=http://localhost:3000
BOT_SERVER_PORT=3001
MINI_APP_PORT=3000
NODE_ENV=development
```

---

## File Size Reference

| File | Size | Lines |
|------|------|-------|
| bot.js | 15 KB | 450+ |
| server.js | 12 KB | 350+ |
| app.js | 18 KB | 500+ |
| styles.css | 26 KB | 800+ |
| All models (5 files) | 8 KB | 200+ |
| All utils (3 files) | 12 KB | 280+ |

**Total code: ~95 KB (minified)**

---

Created with ❤️
