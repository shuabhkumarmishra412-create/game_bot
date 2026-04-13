require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const User = require('./models/User');
const UnoRoom = require('./models/UnoRoom');
const userUtils = require('./utils/userUtils');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../frontend/index.html');
});

// Verify Telegram WebApp data
const verifyTelegramWebAppData = (initData) => {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256')
    .update(process.env.TELEGRAM_TOKEN)
    .digest();

  const hmac = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === hash;
};

// Middleware for authentication (loosened for development)
const authenticateUser = (req, res, next) => {
  const initData = req.headers['x-init-data'];
  
  if (!initData) {
    // Development mode: use demo user
    req.userId = '123456789';
    req.user = { id: 123456789, first_name: 'Demo', last_name: 'User' };
    return next();
  }

  const params = new URLSearchParams(initData);
  const userJson = params.get('user');
  
  if (!userJson) {
    return res.status(401).json({ error: 'No user data' });
  }

  try {
    const user = JSON.parse(userJson);
    req.userId = user.id.toString();
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid user data' });
  }
};

// Middleware for owner authentication
const authenticateOwner = (req, res, next) => {
  const initData = req.headers['x-init-data'];
  
  if (!initData) {
    return res.status(401).json({ error: 'No init data' });
  }

  const params = new URLSearchParams(initData);
  const userJson = params.get('user');
  
  if (!userJson) {
    return res.status(401).json({ error: 'No user data' });
  }

  try {
    const user = JSON.parse(userJson);
    const userId = user.id.toString();
    
    // Check if user is owner
    if (userId !== process.env.OWNER_ID) {
      return res.status(403).json({ error: 'Owner access required' });
    }
    
    req.userId = userId;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid user data' });
  }
};

// ========== USER ENDPOINTS ==========

// Get/Create user
app.post('/api/user/sync', authenticateUser, async (req, res) => {
  try {
    const user = await userUtils.getUserOrCreate(req.userId, req.user);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Add coins (testing only, remove in production)
app.post('/api/user/coins', authenticateUser, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await userUtils.addCoins(req.userId, amount);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add coins' });
  }
});

// Get user by Telegram ID (for login page)
app.get('/api/user/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ========== LEADERBOARD ENDPOINTS ==========

app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}).sort({ coins: -1 }).limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ========== UNO GAME ENDPOINTS ==========

// Create UNO room
app.post('/api/uno/create', authenticateUser, async (req, res) => {
  try {
    const { username } = req.body;
    const roomId = require('uuid').v4().slice(0, 8).toUpperCase();

    const room = new UnoRoom({
      roomId,
      createdBy: req.userId,
      players: [{
        userId: req.userId,
        username: username || req.user.first_name,
        hand: [],
        isPlaying: true,
        position: 0
      }],
      miniApp: true
    });

    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Join UNO room
app.post('/api/uno/join', authenticateUser, async (req, res) => {
  try {
    const { roomId, username } = req.body;
    const room = await UnoRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const playerExists = room.players.find(p => p.userId === req.userId);
    if (playerExists) {
      return res.status(400).json({ error: 'Already joined' });
    }

    room.players.push({
      userId: req.userId,
      username: username || req.user.first_name,
      hand: [],
      isPlaying: true,
      position: room.players.length
    });

    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Get room
app.get('/api/uno/room/:roomId', async (req, res) => {
  try {
    const room = await UnoRoom.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// ========== COIN PURCHASE ==========

app.post('/api/purchase/coins', authenticateUser, async (req, res) => {
  try {
    const { packageId } = req.body;
    
    const packages = {
      'small': { price: 9.99, coins: 1000 },
      'medium': { price: 49.99, coins: 6000 },
      'large': { price: 99.99, coins: 13000 }
    };

    const pkg = packages[packageId];
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package' });
    }

    // In production, integrate with payment processor (Stripe, etc)
    const user = await userUtils.addCoins(req.userId, pkg.coins);
    res.json({ success: true, coins: pkg.coins, user });
  } catch (err) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// ========== OWNER ENDPOINTS ==========

// Add coins to any user (Owner only)
app.post('/api/owner/add-coins', authenticateOwner, async (req, res) => {
  try {
    const { telegramId, amount } = req.body;
    
    if (!telegramId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid telegramId or amount' });
    }

    const user = await userUtils.addCoins(telegramId, amount);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: `Added ${amount} coins to user ${telegramId}`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add coins' });
  }
});

// Get user by ID (Owner only)
app.get('/api/owner/user/:userId', authenticateOwner, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get all users (Owner only)
app.get('/api/owner/users', authenticateOwner, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Remove coins from user (Owner only)
app.post('/api/owner/remove-coins', authenticateOwner, async (req, res) => {
  try {
    const { telegramId, amount } = req.body;
    
    if (!telegramId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid telegramId or amount' });
    }

    const success = await userUtils.removeCoins(telegramId, amount);
    if (!success) {
      return res.status(404).json({ error: 'User not found or insufficient coins' });
    }

    const user = await User.findOne({ telegramId });
    res.json({ success: true, message: `Removed ${amount} coins from user ${telegramId}`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove coins' });
  }
});

// Set coins for user (Owner only)
app.post('/api/owner/set-coins', authenticateOwner, async (req, res) => {
  try {
    const { telegramId, amount } = req.body;
    
    if (!telegramId || amount === undefined || amount < 0) {
      return res.status(400).json({ error: 'Invalid telegramId or amount' });
    }

    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.coins = amount;
    await user.save();
    res.json({ success: true, message: `Set coins to ${amount} for user ${telegramId}`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set coins' });
  }
});

// ========== WEBSOCKET HANDLERS ==========

const gameRooms = new Map();

wss.on('connection', (ws) => {
  let currentRoom = null;
  let userId = null;

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'join_room':
          userId = message.userId;
          currentRoom = message.roomId;
          
          if (!gameRooms.has(currentRoom)) {
            gameRooms.set(currentRoom, new Set());
          }
          gameRooms.get(currentRoom).add(ws);

          // Notify others
          broadcastToRoom(currentRoom, {
            type: 'player_joined',
            userId,
            totalPlayers: gameRooms.get(currentRoom).size
          });
          break;

        case 'play_card':
          broadcastToRoom(currentRoom, {
            type: 'card_played',
            userId,
            card: message.card
          });
          break;

        case 'draw_card':
          broadcastToRoom(currentRoom, {
            type: 'card_drawn',
            userId
          });
          break;

        case 'game_state':
          broadcastToRoom(currentRoom, {
            type: 'state_update',
            state: message.state
          });
          break;
      }
    } catch (err) {
      console.error('WebSocket error:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoom) {
      const room = gameRooms.get(currentRoom);
      if (room) {
        room.delete(ws);
        if (room.size === 0) {
          gameRooms.delete(currentRoom);
        }
      }

      broadcastToRoom(currentRoom, {
        type: 'player_left',
        userId,
        totalPlayers: room?.size || 0
      });
    }
  });
});

const broadcastToRoom = (roomId, message) => {
  const room = gameRooms.get(roomId);
  if (!room) return;

  const data = JSON.stringify(message);
  room.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// ========== ERROR HANDLING ==========

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.BOT_SERVER_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
