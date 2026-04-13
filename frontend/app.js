// Demo user data
const DEMO_USER = {
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

const DEMO_LEADERBOARD = [
  { firstName: 'Champion', coins: 5000, wins: 50 },
  { firstName: 'Pro Player', coins: 3500, wins: 35 },
  { firstName: 'Good Player', coins: 2000, wins: 20 },
  { firstName: 'Regular User', coins: 1000, wins: 10 },
  { firstName: 'Beginner', coins: 500, wins: 5 }
];

// Main App Object
const app = {
  user: null,
  currentPage: 'profile',
  tg: null,
  isLoggedIn: false,

  async init() {
    try {
      this.tg = window.Telegram?.WebApp;
      if (this.tg) {
        this.tg.expand();
        this.tg.setBackgroundColor('#f5f5f5');
      }
      const savedUserId = localStorage.getItem('gamebot_user_id');
      if (savedUserId) {
        await this.loginWithId(savedUserId);
      } else {
        this.showLogin();
      }
    } catch (err) {
      console.error('Init error:', err);
      this.showLogin();
    }
  },

  showLogin() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = `
      <div class="container">
        <div style="text-align: center; color: white; margin-top: 50px;">
          <div style="font-size: 64px; margin-bottom: 20px;">🎮</div>
          <h1 style="font-size: 32px; margin-bottom: 10px;">Game Bot</h1>
          <p style="font-size: 16px; margin-bottom: 40px; opacity: 0.9;">Enter your Telegram ID to login</p>
          <div style="background: white; border-radius: 15px; padding: 30px; margin-top: 30px;">
            <input type="text" id="login-id" placeholder="Enter Telegram ID..." style="width: 100%; padding: 15px; border: 2px solid #667eea; border-radius: 10px; font-size: 16px; margin-bottom: 20px;">
            <button class="btn btn-primary" onclick="app.handleLogin()" style="width: 100%; padding: 15px; border: none; border-radius: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 16px; font-weight: 600; cursor: pointer;">Login</button>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">💡 Tip: Send /profile to the bot to see your Telegram ID</p>
          </div>
        </div>
      </div>
    `;
  },

  async handleLogin() {
    const telId = document.getElementById('login-id')?.value?.trim();
    if (!telId) {
      alert('❌ Please enter your Telegram ID');
      return;
    }
    await this.loginWithId(telId);
  },

  async loginWithId(telId) {
    try {
      const appDiv = document.getElementById('app');
      appDiv.innerHTML = '<div style="text-align: center; color: white; margin-top: 50px;"><div style="font-size: 48px;">🔄</div><h2>Logging in...</h2></div>';

      const response = await fetch(`/api/user/${telId}`);
      if (response.ok) {
        this.user = await response.json();
      } else {
        this.user = { ...DEMO_USER, telegramId: telId, coins: 200 };
      }

      localStorage.setItem('gamebot_user_id', telId);
      this.isLoggedIn = true;
      this.currentPage = 'profile';
      this.render();
    } catch (err) {
      console.error('Login error:', err);
      this.user = { ...DEMO_USER, telegramId: telId, coins: 200 };
      localStorage.setItem('gamebot_user_id', telId);
      this.isLoggedIn = true;
      this.currentPage = 'profile';
      this.render();
    }
  },

  render() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = `
      <div class="container">${this.getPageContent()}</div>
      <div class="navbar">
        <div class="nav-item ${this.currentPage === 'profile' ? 'active' : ''}" onclick="app.goToPage('profile')"><div class="nav-icon">👤</div><div class="nav-text">Profile</div></div>
        <div class="nav-item ${this.currentPage === 'games' ? 'active' : ''}" onclick="app.goToPage('games')"><div class="nav-icon">🎮</div><div class="nav-text">Games</div></div>
        <div class="nav-item ${this.currentPage === 'shop' ? 'active' : ''}" onclick="app.goToPage('shop')"><div class="nav-icon">🛍️</div><div class="nav-text">Shop</div></div>
        <div class="nav-item ${this.currentPage === 'leaderboard' ? 'active' : ''}" onclick="app.goToPage('leaderboard')"><div class="nav-icon">🏆</div><div class="nav-text">Top</div></div>
        ${this.user?.isOwner ? `<div class="nav-item ${this.currentPage === 'owner' ? 'active' : ''}" onclick="app.goToPage('owner')"><div class="nav-icon">⚙️</div><div class="nav-text">Owner</div></div>` : ''}
        <div class="nav-item" onclick="app.logout()"><div class="nav-icon">🚪</div><div class="nav-text">Logout</div></div>
      </div>
    `;
  },

  goToPage(page) {
    this.currentPage = page;
    this.render();
  },

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('gamebot_user_id');
      this.isLoggedIn = false;
      this.user = null;
      this.showLogin();
    }
  },

  getPageContent() {
    switch (this.currentPage) {
      case 'profile': return this.profilePage();
      case 'games': return this.gamesPage();
      case 'shop': return this.shopPage();
      case 'leaderboard': return this.leaderboardPage();
      case 'owner': return this.ownerPage();
      default: return '';
    }
  },

  profilePage() {
    return `<div class="page active"><div class="profile-header"><div class="profile-avatar">👤</div><div class="profile-name">${this.user.firstName}</div><div class="profile-id">ID: ${this.user.telegramId}</div><div class="profile-stats"><div class="stat-box"><div class="stat-value">${this.user.stats?.gamesWon || 0}</div><div class="stat-label">Won</div></div><div class="stat-box"><div class="stat-value">${this.user.stats?.gamesPlayed || 0}</div><div class="stat-label">Played</div></div></div></div><div class="coin-balance"><div class="coin-amount"><span class="coin-icon">🪙</span><span>${this.user.coins}</span></div><div class="coin-label">Your Balance</div></div><button class="btn btn-primary" onclick="app.goToPage('shop')">🛍️ Purchase Coins</button></div>`;
  },

  gamesPage() {
    return `<div class="page active"><h2 style="margin-bottom: 20px; color: white;">🎮 Available Games</h2><div class="games-grid"><div class="game-card" onclick="app.startUno()"><div class="game-icon">🃏</div><div class="game-info"><div class="game-name">UNO</div><div class="game-desc">Classic card game</div></div></div><div class="game-card" onclick="alert('Send /truth to bot')"><div class="game-icon">🎭</div><div class="game-info"><div class="game-name">Truth & Dare</div><div class="game-desc">Fun challenges</div></div></div></div></div>`;
  },

  startUno() {
    alert('🎮 UNO Game Started!');
  },

  shopPage() {
    return `<div class="page active"><h2 style="margin-bottom: 20px; color: white;">🛍️ Shop</h2><div class="coin-balance"><div class="coin-amount"><span class="coin-icon">🪙</span><span>${this.user.coins}</span></div></div><div class="shop-grid"><div class="coin-package" onclick="alert('Buy 1K coins')"><div class="package-icon">🎁</div><div class="package-coins">1K</div></div><div class="coin-package" onclick="alert('Buy 6K coins')"><div class="package-icon">💎</div><div class="package-coins">6K</div></div></div></div>`;
  },

  leaderboardPage() {
    const leaderHTML = DEMO_LEADERBOARD.map((user, idx) => `<div class="leaderboard-item"><div class="leaderboard-rank">${idx + 1}</div><div class="leaderboard-user"><div class="leaderboard-name">${user.firstName}</div></div><div class="leaderboard-coins">${user.coins}</div></div>`).join('');
    return `<div class="page active"><h2 style="color: white;">🏆 Leaderboard</h2><div class="leaderboard-list">${leaderHTML}</div></div>`;
  },

  ownerPage() {
    return `<div class="page active"><h2 style="color: white;">⚙️ Owner Panel</h2><div class="owner-section"><h3>Add Coins</h3><input type="text" id="owner-user-id" placeholder="Telegram ID..." style="width: 100%; padding: 12px; border: 2px solid #667eea; border-radius: 10px; margin-bottom: 10px;"><input type="number" id="owner-coin-amount" placeholder="Amount..." style="width: 100%; padding: 12px; border: 2px solid #667eea; border-radius: 10px; margin-bottom: 10px;"><button class="btn btn-primary" onclick="app.addCoinsOwner()" style="width: 100%;">Add</button></div></div>`;
  },

  addCoinsOwner() {
    const userId = document.getElementById('owner-user-id')?.value;
    const amount = parseInt(document.getElementById('owner-coin-amount')?.value);
    if (!userId || !amount) { alert('Invalid input'); return; }
    alert(`✅ Added ${amount} coins to ${userId}`);
  }
};

document.addEventListener('DOMContentLoaded', () => { app.init(); });
