# 🏗️ Architecture Overview

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                          USERS                              │
│         (Telegram Groups & Direct Messages)                 │
└──────────┬──────────────────────────────────────┬───────────┘
           │                                      │
           ▼                                      ▼
    ┌──────────────┐                      ┌─────────────┐
    │ TELEGRAM BOT │                      │  MINI APP   │
    │  (Telegraf)  │                      │ (Frontend)  │
    └──────┬───────┘                      └─────┬───────┘
           │                                    │
           └────────────┬─────────────────────┬─┘
                        ▼                     ▼
        ┌─────────────────────────────────────────┐
        │       BACKEND API SERVER                │
        │         (Express.js / Node)             │
        │                                         │
        │  ┌────────────────────────────────┐    │
        │  │  HTTP Routes (/api/*)          │    │
        │  │  - User endpoints              │    │
        │  │  - Game endpoints              │    │
        │  │  - Shop/Purchase               │    │
        │  └────────────────────────────────┘    │
        │                                         │
        │  ┌────────────────────────────────┐    │
        │  │  WebSocket (Real-time)         │    │
        │  │  - Game state updates          │    │
        │  │  - Player actions              │    │
        │  │  - Multiplayer sync            │    │
        │  └────────────────────────────────┘    │
        └─────────────┬──────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────────┐
        │     MONGODB DATABASE            │
        │                                 │
        │  Collections:                   │
        │  ├─ users                       │
        │  ├─ groups                      │
        │  ├─ games                       │
        │  ├─ unoRooms                    │
        │  └─ redeemCodes                 │
        └─────────────────────────────────┘
```

---

## Data Flow

### 1️⃣ User Registration Flow

```
User sends /start
    │
    ▼
Bot receives update
    │
    ▼
Extract user data from Telegram
    │
    ▼
Check if user exists in DB
    ├─ Yes: Load profile
    └─ No: Create new user
    │
    ▼
Award daily bonus (if eligible)
    │
    ▼
Send welcome message
```

### 2️⃣ UNO Game Flow

```
User runs /stuno
    │
    ▼
Show mode selection buttons
├─ Play in Group
└─ Play in Mini App
    │
    ├─ GROUP MODE:
    │   ├─ Create lobby
    │   ├─ Show "Join" button
    │   ├─ Players click join
    │   ├─ Start button appears
    │   ├─ Game runs in chat
    │   └─ Award winners coins
    │
    └─ MINI APP MODE:
        ├─ Generate room ID
        ├─ Open Mini App
        ├─ Players connect via WebSocket
        ├─ Real-time game state
        └─ Award winners coins
```

### 3️⃣ Mini App Data Sync

```
User opens Mini App
    │
    ▼
Get Telegram WebApp data
    │
    ▼
Send init data to server
    │
    ▼
Server verifies hash (security)
    │
    ▼
Auto-create/update user
    │
    ▼
Load profile & stats
    │
    ▼
Display UI with real data
```

---

## API Endpoints Structure

```
/api
├── /user
│   ├── POST /sync           - Register/update user
│   ├── GET  /profile        - Get user data
│   └── POST /coins          - Add coins (test)
│
├── /uno
│   ├── POST /create         - Create game room
│   ├── POST /join           - Join existing room
│   └── GET  /room/:id       - Get room state
│
├── /purchase
│   ├── POST /coins          - Buy coins (payment)
│   └── POST /redeem         - Redeem code
│
└── /leaderboard
    └── GET  /               - Get top 20 users
```

---

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  telegramId: String (unique),
  username: String,
  firstName: String,
  lastName: String,
  coins: Number,
  lastDailyReward: Date,
  stats: {
    gamesPlayed: Number,
    gamesWon: Number,
    totalEarnings: Number
  },
  createdAt: Date
}
```

### UnoRoom Collection
```javascript
{
  _id: ObjectId,
  roomId: String (unique),
  createdBy: String,
  players: [
    {
      userId: String,
      username: String,
      hand: [String],
      position: Number,
      isPlaying: Boolean
    }
  ],
  gameState: {
    currentPlayer: String,
    deck: [String],
    discard: [String],
    direction: Number
  },
  status: String, // "waiting" | "active" | "finished"
  miniApp: Boolean,
  createdAt: Date
}
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Bot** | Telegraf.js | Telegram API wrapper |
| **Server** | Express.js | REST API & WebSocket |
| **Database** | MongoDB | Persistent data storage |
| **Real-time** | WebSocket (ws) | Live game updates |
| **Frontend** | HTML/CSS/JS | Mini App UI |
| **Containers** | Docker | Deployment & scaling |

---

## Security Architecture

```
┌──────────────────────────────────────┐
│  Frontend (Mini App)                 │
│  - User data from Telegram WebApp    │
│  - initData parameter                │
└────────┬─────────────────────────────┘
         │ X-Init-Data header
         ▼
┌──────────────────────────────────────┐
│  Backend Middleware                  │
│  - Verify Telegram hash              │
│  - Validate JWT token                │
│  - Rate limiting                     │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Protected Routes                    │
│  - Only authenticated users          │
│  - Server-side validation            │
│  - Game state verification           │
└──────────────────────────────────────┘
```

---

## Scalability Strategy

### Current (Single Server)
```
User → Bot → API Server → MongoDB
           ↓
      WebSocket Pool
```

### Future (Distributed)
```
Users → Load Balancer
        ├─ Bot Instance 1
        ├─ Bot Instance 2
        └─ Bot Instance N
            │
        ┌───┴───┐
        ▼       ▼
     Redis   Message Queue
        │       │
        └─┬─────┘
          ▼
     MongoDB Cluster
```

---

## Key Design Decisions

✅ **MongoDB over SQL**
- Flexible schema for game states
- Easy horizontal scaling
- Built-in replication

✅ **WebSocket for Real-time**
- Low latency for games
- Persistent connections
- Event-driven updates

✅ **Stateless Bot**
- Can run multiple instances
- Easy to restart
- Better error recovery

✅ **Mini App Separate**
- Independent from bot
- Can scale separately
- Better user experience

---

## Performance Considerations

### Optimization Points

1. **Database**
   - Index frequently queried fields
   - Archive old game records
   - Use MongoDB aggregation for leaderboard

2. **API Server**
   - Cache leaderboard (Redis)
   - Compress responses
   - Connection pooling

3. **WebSocket**
   - Message batching
   - Client-side debouncing
   - Graceful disconnection handling

4. **Frontend**
   - Lazy load images
   - Minimize bundle size
   - Service worker for offline support

---

## Monitoring & Observability

```
Application Logs
    ↓
Error Tracking (Sentry)
    ↓
Performance Monitoring
    ↓
Health Checks
```

**Key Metrics:**
- Bot uptime
- API response time
- WebSocket connections
- Database latency
- User registration rate

---

## Disaster Recovery

1. **Database Backup**
   - Daily automated backups
   - Point-in-time recovery

2. **Service Health**
   - Health check endpoints
   - Auto-restart on failure
   - Fallback servers

3. **Data Consistency**
   - Transaction support for critical operations
   - Conflict resolution for game states
   - Audit logging

---

Created with ❤️
