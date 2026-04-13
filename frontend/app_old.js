// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.setBackgroundColor('#f5f5f5');
} else {
  console.warn('⚠️ Telegram WebApp not available - running in browser mode');
}

// App state
const app = {
  currentUser: null,
  currentPage: 'profile',
  unoGame: null,
  ws: null,

  // Initialize app
  async init() {
    try {
      // Get user data from Telegram or use demo user
      const userData = tg?.initDataUnsafe?.user;
      
      if (!userData) {
        // Demo user for local testing
        const demoUser = {
          id: 123456789,
          first_name: 'Demo',
          last_name: 'User',
          username: 'demouser'
        };
        
        this.currentUser = {
          telegramId: demoUser.id.toString(),
          firstName: demoUser.first_name,
          lastName: demoUser.last_name,
          username: demoUser.username,
          coins: 500,
          isOwner: false,
          stats: {
            gamesPlayed: 5,
            gamesWon: 2,
            totalEarnings: 500
          }
        };
        
        this.render();
        return;
      }

      // Sync user with backend if Telegram is available
      const response = await fetch('http://localhost:3001/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Init-Data': tg?.initData || ''
        },
        body: JSON.stringify(userData)
      });

      this.currentUser = await response.json();
      this.render();
    } catch (err) {
      console.error('Init error:', err);
      // Use demo data on error
      this.currentUser = {
        telegramId: '123456789',
        firstName: 'Demo',
        lastName: 'User',
        username: 'demouser',
        coins: 500,
        isOwner: false,
        stats: {
          gamesPlayed: 5,
          gamesWon: 2,
          totalEarnings: 500
        }
      };
      this.render();
    }
  },

  // Render app
  render() {
    const app = document.getElementById('app');
    const navOwnerItem = this.currentUser.isOwner ? `
      <div class="nav-item ${this.currentPage === 'owner' ? 'active' : ''}" onclick="app.switchPage('owner')">
        <div class="nav-icon">⚙️</div>
        <div class="nav-text">Owner</div>
      </div>
    ` : '';
    
    app.innerHTML = `
      <div class="container">
        ${this.getCurrentPage()}
      </div>
      <div class="navbar">
        <div class="nav-item ${this.currentPage === 'profile' ? 'active' : ''}" onclick="app.switchPage('profile')">
          <div class="nav-icon">👤</div>
          <div class="nav-text">Profile</div>
        </div>
        <div class="nav-item ${this.currentPage === 'games' ? 'active' : ''}" onclick="app.switchPage('games')">
          <div class="nav-icon">🎮</div>
          <div class="nav-text">Games</div>
        </div>
        <div class="nav-item ${this.currentPage === 'shop' ? 'active' : ''}" onclick="app.switchPage('shop')">
          <div class="nav-icon">🛍️</div>
          <div class="nav-text">Shop</div>
        </div>
        <div class="nav-item ${this.currentPage === 'leaderboard' ? 'active' : ''}" onclick="app.switchPage('leaderboard')">
          <div class="nav-icon">🏆</div>
          <div class="nav-text">Top</div>
        </div>
        ${navOwnerItem}
      </div>
    `;
  },

  // Switch pages
  switchPage(page) {
    this.currentPage = page;
    this.render();
  },

  // Get current page HTML
  getCurrentPage() {
    switch (this.currentPage) {
      case 'profile':
        return this.renderProfile();
      case 'games':
        return this.renderGames();
      case 'shop':
        return this.renderShop();
      case 'leaderboard':
        return this.renderLeaderboard();
      case 'uno':
        return this.renderUnoGame();
      case 'owner':
        return this.renderOwner();
      default:
        return '<p>Page not found</p>';
    }
  },

  // Profile page
  renderProfile() {
    return `
      <div class="page active">
        <div class="profile-header">
          <div class="profile-avatar">👤</div>
          <div class="profile-name">${this.currentUser.firstName}</div>
          <div class="profile-id">@${this.currentUser.username || 'user'}</div>
          
          <div class="profile-stats">
            <div class="stat-box">
              <div class="stat-value">${this.currentUser.stats.gamesWon}</div>
              <div class="stat-label">Won</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${this.currentUser.stats.gamesPlayed}</div>
              <div class="stat-label">Played</div>
            </div>
          </div>
        </div>

        <div class="coin-balance">
          <div class="coin-amount">
            <span class="coin-icon">🪙</span>
            <span>${this.currentUser.coins}</span>
          </div>
          <div class="coin-label">Your Balance</div>
        </div>

        <button class="btn btn-primary" onclick="app.switchPage('shop')">🛍️ Purchase Coins</button>
        <button class="btn btn-secondary" onclick="app.closeApp()">Close</button>
      </div>
    `;
  },

  // Games page
  renderGames() {
    return `
      <div class="page active">
        <h2 style="margin-bottom: 20px; color: white;">🎮 Available Games</h2>
        
        <div class="games-grid">
          <div class="game-card" onclick="app.startUnoGame()">
            <div class="game-icon">🃏</div>
            <div class="game-info">
              <div class="game-name">UNO</div>
              <div class="game-desc">Classic card game - Win coins!</div>
            </div>
            <div class="game-arrow">›</div>
          </div>
          
          <div class="game-card" onclick="app.startTruthDare()">
            <div class="game-icon">🎭</div>
            <div class="game-info">
              <div class="game-name">Truth & Dare</div>
              <div class="game-desc">Fun challenges with friends</div>
            </div>
            <div class="game-arrow">›</div>
          </div>

          <div class="game-card" style="opacity: 0.5; cursor: not-allowed;">
            <div class="game-icon">🎰</div>
            <div class="game-info">
              <div class="game-name">More Coming Soon</div>
              <div class="game-desc">New games coming to the platform</div>
            </div>
            <div class="game-arrow">›</div>
          </div>
        </div>
      </div>
    `;
  },

  // Shop page
  renderShop() {
    return `
      <div class="page active">
        <h2 style="margin-bottom: 20px; color: white;">🛍️ Coin Shop</h2>
        
        <div class="coin-balance" style="margin-bottom: 30px;">
          <div class="coin-amount">
            <span class="coin-icon">🪙</span>
            <span>${this.currentUser.coins}</span>
          </div>
          <div class="coin-label">Current Balance</div>
        </div>

        <h3 style="color: white; margin-bottom: 15px; font-size: 16px;">Choose a package:</h3>
        
        <div class="shop-grid">
          <div class="coin-package" onclick="app.purchaseCoins('small')">
            <div class="package-icon">🎁</div>
            <div class="package-coins">1K</div>
            <div class="package-price">\$9.99</div>
          </div>

          <div class="coin-package" onclick="app.purchaseCoins('medium')">
            <div class="package-icon">💎</div>
            <div class="package-coins">6K</div>
            <div class="package-price">\$49.99</div>
          </div>

          <div class="coin-package" onclick="app.purchaseCoins('large')" style="grid-column: 1 / -1;">
            <div class="package-icon">👑</div>
            <div class="package-coins">13K</div>
            <div class="package-price">\$99.99</div>
          </div>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

        <h3 style="color: white; margin-bottom: 15px; font-size: 16px;">Redeem Code:</h3>
        <input type="text" id="redeem-code" placeholder="Enter code..." style="
          width: 100%;
          padding: 12px;
          border: 2px solid #667eea;
          border-radius: 10px;
          margin-bottom: 10px;
          font-size: 14px;
        ">
        <button class="btn btn-primary" onclick="app.redeemCode()">Redeem</button>
      </div>
    `;
  },

  // Leaderboard page
  async renderLeaderboard() {
    try {
      const response = await fetch('http://localhost:3001/api/leaderboard');
      const users = await response.json();

      let leaderboardHTML = users.map((user, idx) => {
        const rankClass = idx === 0 ? 'first' : idx === 1 ? 'second' : idx === 2 ? 'third' : '';
        return `
          <div class="leaderboard-item">
            <div class="leaderboard-rank ${rankClass}">
              ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
            </div>
            <div class="leaderboard-user">
              <div class="leaderboard-name">${user.firstName}</div>
            </div>
            <div class="leaderboard-coins">${user.coins} 🪙</div>
          </div>
        `;
      }).join('');

      return `
        <div class="page active">
          <h2 style="margin-bottom: 20px; color: white;">🏆 Leaderboard</h2>
          <div class="leaderboard-list">
            ${leaderboardHTML}
          </div>
        </div>
      `;
    } catch (err) {
      return '⚠️ Failed to load leaderboard';
    }
  },

  // UNO Game
  async startUnoGame() {
    try {
      const response = await fetch('http://localhost:3001/api/uno/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Init-Data': tg?.initData || ''
        },
        body: JSON.stringify({
          username: this.currentUser.firstName
        })
      });

      this.unoGame = await response.json();
      this.currentPage = 'uno';
      this.connectWebSocket();
      this.render();
    } catch (err) {
      console.error('Failed to start game:', err);
      alert('Failed to start game');
    }
  },

  // Connect WebSocket for real-time game
  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${protocol}//localhost:3001`);

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'player_joined':
          this.unoGame.players.push(message.player);
          this.render();
          break;
        case 'state_update':
          this.unoGame.gameState = message.state;
          this.render();
          break;
      }
    };

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        type: 'join_room',
        userId: this.currentUser.telegramId,
        roomId: this.unoGame.roomId
      }));
    };
  },

  // Render UNO game
  renderUnoGame() {
    if (!this.unoGame) return '<p>Loading game...</p>';

    return `
      <div class="page active">
        <h2 style="margin-bottom: 20px; color: white;">🃏 UNO Game</h2>
        
        <div class="uno-room">
          <div class="uno-players">
            ${this.unoGame.players.map(p => `
              <div class="uno-player ${p.userId === this.currentUser.telegramId ? 'active' : ''}">
                <div class="uno-player-name">${p.username}</div>
                <div class="uno-player-cards">${p.hand.length} cards</div>
              </div>
            `).join('')}
          </div>

          <div class="game-board">
            <div style="margin-bottom: 15px;">
              <strong>Current Turn</strong>
            </div>
            <div class="current-card">🃏</div>
          </div>

          <h4 style="margin: 20px 0 10px; color: white;">Your Hand:</h4>
          <div class="player-hand">
            ${Array(7).fill(0).map((_, i) => {
              const colors = ['red', 'blue', 'yellow', 'green'];
              const color = colors[Math.floor(Math.random() * colors.length)];
              return \`<div class="card \${color}">\${i + 1}</div>\`;
            }).join('')}
          </div>

          <button class="btn btn-primary" onclick="app.drawCard()">🎲 Draw Card</button>
          <button class="btn btn-secondary" onclick="app.switchPage('games')">Back</button>
        </div>
      </div>
    `;
  },

  // Start Truth & Dare
  startTruthDare() {
    alert('Truth & Dare game coming soon!');
  },

  // Purchase coins
  async purchaseCoins(packageId) {
    try {
      const response = await fetch('http://localhost:3001/api/purchase/coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Init-Data': tg?.initData || ''
        },
        body: JSON.stringify({ packageId })
      });

      const result = await response.json();
      if (result.success) {
        this.currentUser.coins += result.coins;
        alert(`✅ Purchase successful! +${result.coins} coins`);
        this.render();
      }
    } catch (err) {
      alert('Purchase failed');
    }
  },

  // Redeem code
  async redeemCode() {
    const code = document.getElementById('redeem-code')?.value;
    if (!code) {
      alert('Enter a code');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Init-Data': tg?.initData || ''
        },
        body: JSON.stringify({ code })
      });

      const result = await response.json();
      if (result.success) {
        this.currentUser.coins += result.coins;
        document.getElementById('redeem-code').value = '';
        alert(`✅ Code redeemed! +${result.coins} coins`);
        this.render();
      } else {
        alert(result.error || 'Invalid code');
      }
    } catch (err) {
      alert('Failed to redeem code');
    }
  },

  // Draw card in UNO
  drawCard() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'draw_card',
        userId: this.currentUser.telegramId
      }));
    }
  },

  // Owner Panel
  renderOwner() {
    return `
      <div class="page active">
        <h2 style="margin-bottom: 20px; color: white;">⚙️ Owner Panel</h2>
        
        <div class="owner-section">
          <h3 style="color: white; margin-bottom: 15px; font-size: 16px;">Add Coins to User</h3>
          <input type="text" id="owner-user-id" placeholder="Telegram ID..." style="
            width: 100%;
            padding: 12px;
            border: 2px solid #667eea;
            border-radius: 10px;
            margin-bottom: 10px;
            font-size: 14px;
          ">
          <input type="number" id="owner-coin-amount" placeholder="Amount..." style="
            width: 100%;
            padding: 12px;
            border: 2px solid #667eea;
            border-radius: 10px;
            margin-bottom: 10px;
            font-size: 14px;
          ">
          <button class="btn btn-primary" onclick="app.ownerAddCoins()" style="width: 100%;">Add Coins</button>
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

        <div class="owner-section">
          <h3 style="color: white; margin-bottom: 15px; font-size: 16px;">Remove Coins from User</h3>
          <input type="text" id="owner-remove-user-id" placeholder="Telegram ID..." style="
            width: 100%;
            padding: 12px;
            border: 2px solid #667eea;
            border-radius: 10px;
            margin-bottom: 10px;
            font-size: 14px;
          ">
          <input type="number" id="owner-remove-amount" placeholder="Amount..." style="
            width: 100%;
            padding: 12px;
            border: 2px solid #667eea;
            border-radius: 10px;
            margin-bottom: 10px;
            font-size: 14px;
          ">
          <button class="btn btn-secondary" onclick="app.ownerRemoveCoins()" style="width: 100%;">Remove Coins</button>
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

        <div class="owner-section">
          <h3 style="color: white; margin-bottom: 15px; font-size: 16px;">Set User Coins</h3>
          <input type="text" id="owner-set-user-id" placeholder="Telegram ID..." style="
            width: 100%;
            padding: 12px;
            border: 2px solid #667eea;
            border-radius: 10px;
            margin-bottom: 10px;
            font-size: 14px;
          ">
          <input type="number" id="owner-set-amount" placeholder="Amount..." style="
            width: 100%;
            padding: 12px;
            border: 2px solid #667eea;
            border-radius: 10px;
            margin-bottom: 10px;
            font-size: 14px;
          ">
          <button class="btn btn-primary" onclick="app.ownerSetCoins()" style="width: 100%;">Set Coins</button>
        </div>
      </div>
    `;
  },

  // Owner add coins
  async ownerAddCoins() {
    const userId = document.getElementById('owner-user-id').value;
    const amount = parseInt(document.getElementById('owner-coin-amount').value);

    if (!userId || !amount || amount <= 0) {
      alert('Please enter valid Telegram ID and amount');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/owner/add-coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Init-Data': tg?.initData || ''
        },
        body: JSON.stringify({ telegramId: userId, amount })
      });

      const result = await response.json();
      if (response.ok) {
        alert(`✅ Added ${amount} coins to user ${userId}`);
        document.getElementById('owner-user-id').value = '';
        document.getElementById('owner-coin-amount').value = '';
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (err) {
      alert('Failed to add coins');
    }
  },

  // Owner remove coins
  async ownerRemoveCoins() {
    const userId = document.getElementById('owner-remove-user-id').value;
    const amount = parseInt(document.getElementById('owner-remove-amount').value);

    if (!userId || !amount || amount <= 0) {
      alert('Please enter valid Telegram ID and amount');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/owner/remove-coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Init-Data': tg?.initData || ''
        },
        body: JSON.stringify({ telegramId: userId, amount })
      });

      const result = await response.json();
      if (response.ok) {
        alert(`✅ Removed ${amount} coins from user ${userId}`);
        document.getElementById('owner-remove-user-id').value = '';
        document.getElementById('owner-remove-amount').value = '';
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (err) {
      alert('Failed to remove coins');
    }
  },

  // Owner set coins
  async ownerSetCoins() {
    const userId = document.getElementById('owner-set-user-id').value;
    const amount = parseInt(document.getElementById('owner-set-amount').value);

    if (!userId || amount === undefined || amount < 0) {
      alert('Please enter valid Telegram ID and amount');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/owner/set-coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Init-Data': tg?.initData || ''
        },
        body: JSON.stringify({ telegramId: userId, amount })
      });

      const result = await response.json();
      if (response.ok) {
        alert(`✅ Set coins to ${amount} for user ${userId}`);
        document.getElementById('owner-set-user-id').value = '';
        document.getElementById('owner-set-amount').value = '';
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (err) {
      alert('Failed to set coins');
    }
  },

  // Close app
  closeApp() {
    if (tg) {
      tg.close();
    } else {
      alert('Close this window to exit');
    }
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
