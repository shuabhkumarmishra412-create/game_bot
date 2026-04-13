# 🔌 API Documentation

## Base URL
```
Development: http://localhost:3001
Production: https://your-domain.com
```

---

## Authentication

All API endpoints require Telegram authentication via the Mini App.

### Headers Required
```
X-Init-Data: <telegram_init_data>
Content-Type: application/json
```

Where `initData` comes from Telegram WebApp SDK:
```javascript
const initData = window.Telegram.WebApp.initData;
// Include in request headers
```

### Server-Side Verification
The server verifies the hash using:
```javascript
HMAC-SHA256(
  sorted_parameters,
  hash(bot_token)
)
```

---

## User Endpoints

### 1. Sync User
**POST** `/api/user/sync`

Auto-register or update user from Telegram WebApp.

**Request:**
```javascript
fetch('http://localhost:3001/api/user/sync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Init-Data': window.Telegram.WebApp.initData
  },
  body: JSON.stringify({
    id: 123456789,
    first_name: 'John',
    username: 'johndoe',
    last_name: 'Doe'
  })
})
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "telegramId": "123456789",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "coins": 200,
  "lastDailyReward": "2024-04-13T10:30:00.000Z",
  "stats": {
    "gamesPlayed": 0,
    "gamesWon": 0,
    "totalEarnings": 0
  },
  "createdAt": "2024-04-13T10:30:00.000Z"
}
```

---

### 2. Get User Profile
**GET** `/api/user/profile`

Get current user's complete profile data.

**Request:**
```javascript
fetch('http://localhost:3001/api/user/profile', {
  headers: {
    'X-Init-Data': window.Telegram.WebApp.initData
  }
})
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "telegramId": "123456789",
  "username": "johndoe",
  "firstName": "John",
  "coins": 500,
  "stats": {
    "gamesPlayed": 5,
    "gamesWon": 2,
    "totalEarnings": 1000
  }
}
```

---

### 3. Add Coins (Testing)
**POST** `/api/user/coins`

Add coins to user balance (testing only, use for admin).

**Request:**
```javascript
fetch('http://localhost:3001/api/user/coins', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Init-Data': window.Telegram.WebApp.initData
  },
  body: JSON.stringify({
    amount: 100
  })
})
```

**Response (200):**
```json
{
  "coins": 600,
  "success": true
}
```

---

## Game Endpoints

### 1. Create UNO Room
**POST** `/api/uno/create`

Create a new UNO game room.

**Request:**
```javascript
fetch('http://localhost:3001/api/uno/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Init-Data': window.Telegram.WebApp.initData
  },
  body: JSON.stringify({
    username: "John"
  })
})
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "roomId": "ABC12DEF",
  "createdBy": "123456789",
  "players": [
    {
      "userId": "123456789",
      "username": "John",
      "hand": [],
      "position": 0,
      "isPlaying": true
    }
  ],
  "gameState": {
    "currentPlayer": "123456789",
    "deck": ["red_1", "blue_2", ...],
    "discard": ["red_5"],
    "direction": 1
  },
  "status": "waiting",
  "miniApp": true,
  "createdAt": "2024-04-13T10:30:00.000Z"
}
```

---

### 2. Join UNO Room
**POST** `/api/uno/join`

Join an existing UNO game room.

**Request:**
```javascript
fetch('http://localhost:3001/api/uno/join', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Init-Data': window.Telegram.WebApp.initData
  },
  body: JSON.stringify({
    roomId: "ABC12DEF",
    username: "Jane"
  })
})
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "roomId": "ABC12DEF",
  "players": [
    {
      "userId": "123456789",
      "username": "John",
      "hand": [],
      "position": 0,
      "isPlaying": true
    },
    {
      "userId": "987654321",
      "username": "Jane",
      "hand": [],
      "position": 1,
      "isPlaying": true
    }
  ],
  "status": "waiting"
}
```

**Error Responses:**
```json
// Room not found
{ "error": "Room not found" } // 404

// Already joined
{ "error": "Already joined" } // 400

// Room full/inactive
{ "error": "Cannot join this room" } // 400
```

---

### 3. Get Room Details
**GET** `/api/uno/room/:roomId`

Get current state of a room.

**Request:**
```javascript
fetch('http://localhost:3001/api/uno/room/ABC12DEF')
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "roomId": "ABC12DEF",
  "players": [
    {
      "userId": "123456789",
      "username": "John",
      "hand": ["red_1", "blue_5"],
      "position": 0,
      "isPlaying": true
    }
  ],
  "gameState": {
    "currentPlayer": "123456789",
    "deck": ["red_2", "blue_3", ...],
    "discard": ["red_5"],
    "direction": 1
  },
  "status": "active"
}
```

---

## Leaderboard Endpoints

### Get Global Leaderboard
**GET** `/api/leaderboard`

Get top 20 players globally.

**Request:**
```javascript
fetch('http://localhost:3001/api/leaderboard')
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "telegramId": "123456789",
    "username": "johndoe",
    "firstName": "John",
    "coins": 5000,
    "stats": {
      "gamesWon": 50,
      "gamesPlayed": 100
    }
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "telegramId": "987654321",
    "username": "janedoe",
    "firstName": "Jane",
    "coins": 4500,
    "stats": {
      "gamesWon": 45,
      "gamesPlayed": 95
    }
  }
]
```

---

## Shop Endpoints

### Purchase Coins
**POST** `/api/purchase/coins`

Purchase coin packages (integrate with payment processor).

**Request:**
```javascript
fetch('http://localhost:3001/api/purchase/coins', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Init-Data': window.Telegram.WebApp.initData
  },
  body: JSON.stringify({
    packageId: "small"  // small | medium | large
  })
})
```

**Available Packages:**
```
small:   $9.99  → 1,000 coins
medium:  $49.99 → 6,000 coins
large:   $99.99 → 13,000 coins
```

**Response (200):**
```json
{
  "success": true,
  "coins": 1000,
  "user": {
    "coins": 1200,
    "stats": { ... }
  }
}
```

**Response (400):**
```json
{
  "error": "Invalid package"
}
```

---

## Error Handling

All errors follow this format:

**Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `429` - Too many requests
- `500` - Server error

**Example Error Response:**
```javascript
{
  error: "User not found",
  code: "USER_NOT_FOUND"
}
```

---

## WebSocket API

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'join_room',
    userId: '123456789',
    roomId: 'ABC12DEF'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

### Message Types

#### 1. Join Room
**Send from Client:**
```json
{
  "type": "join_room",
  "userId": "123456789",
  "roomId": "ABC12DEF"
}
```

**Receive from Server:**
```json
{
  "type": "player_joined",
  "userId": "123456789",
  "totalPlayers": 2
}
```

#### 2. Play Card
**Send from Client:**
```json
{
  "type": "play_card",
  "userId": "123456789",
  "card": "red_5"
}
```

**Receive from Server:**
```json
{
  "type": "card_played",
  "userId": "123456789",
  "card": "red_5"
}
```

#### 3. Draw Card
**Send from Client:**
```json
{
  "type": "draw_card",
  "userId": "123456789"
}
```

**Receive from Server:**
```json
{
  "type": "card_drawn",
  "userId": "123456789"
}
```

#### 4. Game State Update
**Send from Client:**
```json
{
  "type": "game_state",
  "state": {
    "currentPlayer": "987654321",
    "deck": [ ... ],
    "discard": [ ... ]
  }
}
```

**Receive from Server:**
```json
{
  "type": "state_update",
  "state": {
    "currentPlayer": "987654321",
    "deck": [ ... ],
    "discard": [ ... ]
  }
}
```

#### 5. Player Left
**Receive from Server (when player disconnects):**
```json
{
  "type": "player_left",
  "userId": "987654321",
  "totalPlayers": 1
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

```
Rate Limit: 100 requests per minute per user
Headers:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 99
  X-RateLimit-Reset: 1608062400
```

---

## Code Examples

### JavaScript - Get User Coins
```javascript
async function getUserCoins(initData) {
  const response = await fetch('http://localhost:3001/api/user/profile', {
    headers: {
      'X-Init-Data': initData
    }
  });
  
  const user = await response.json();
  return user.coins;
}
```

### JavaScript - Create UNO Room
```javascript
async function createRoom(username, initData) {
  const response = await fetch('http://localhost:3001/api/uno/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Init-Data': initData
    },
    body: JSON.stringify({ username })
  });
  
  return await response.json();
}
```

### JavaScript - Subscribe to WebSocket
```javascript
function subscribeToGame(roomId, userId) {
  const ws = new WebSocket('ws://localhost:3001');
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'join_room',
      userId,
      roomId
    }));
  };
  
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    
    switch(msg.type) {
      case 'player_joined':
        console.log(`${msg.userId} joined`);
        break;
      case 'state_update':
        console.log('Game state:', msg.state);
        break;
    }
  };
  
  return ws;
}
```

---

## Testing with cURL

### Get Leaderboard
```bash
curl http://localhost:3001/api/leaderboard
```

### Get Room
```bash
curl http://localhost:3001/api/uno/room/ABC12DEF
```

---

## Webhook Integration (Future)

For payment processing:

```javascript
// POST /api/webhook/payment
{
  "event": "payment.completed",
  "userId": "123456789",
  "orderId": "order_123",
  "amount": 9.99,
  "coins": 1000,
  "signature": "hmac_signature"
}
```

---

Created with ❤️ for developers
