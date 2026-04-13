# 🚀 Deployment Guide

## Quick Start with Docker

### 1. Install Docker
- [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- Or using apt: `apt-get install docker.io docker-compose`

### 2. Set Environment Variables

Create `.env` file:

```env
TELEGRAM_TOKEN=your_telegram_token_here
MONGODB_URI=mongodb://mongodb:27017/game_bot
MINI_APP_URL=https://your-domain.com
BOT_SERVER_PORT=3001
MINI_APP_PORT=3000
NODE_ENV=production
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f game_bot

# Stop services
docker-compose down
```

---

## Deployment to Heroku

### 1. Create Heroku App

```bash
heroku create your-game-bot
heroku addons:create mongolab:sandbox
```

### 2. Set Environment Variables

```bash
heroku config:set TELEGRAM_TOKEN=your_token
heroku config:set MINI_APP_URL=https://your-game-bot.herokuapp.com
```

### 3. Create Procfile

```
web: node backend/server.js
worker: node backend/bot.js
```

### 4. Deploy

```bash
git push heroku main
```

---

## Deployment to Railway

### 1. Connect GitHub Repository

- Go to [Railway.app](https://railway.app)
- Create new project
- Connect your GitHub repo

### 2. Add Services

- Add MongoDB plugin
- Deploy Node.js app

### 3. Set Environment Variables

In Railway Dashboard → Variables:

```
TELEGRAM_TOKEN=your_token
MONGODB_URI=your_mongo_uri
MINI_APP_URL=your-railway-domain.com
```

### 4. Deploy

Push to main branch or deploy through Railway dashboard.

---

## Deployment to AWS

### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Initialize
eb init

# Create environment
eb create game-bot-env

# Deploy
eb deploy
```

### Using EC2 + PM2

```bash
# SSH to instance
ssh -i your-key.pem ec2-user@your-instance

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone your-repo
cd game_bot

# Install PM2 globally
sudo npm install -g pm2

# Start services
pm2 start backend/bot.js --name "game-bot"
pm2 start backend/server.js --name "game-server"
pm2 startup
pm2 save
```

---

## Production Checklist

### Security
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS only
- [ ] Set strong MongoDB password
- [ ] Enable IP whitelist for database

### Performance
- [ ] Enable Redis caching
- [ ] Set up CDN for static files
- [ ] Configure database indexes
- [ ] Set up monitoring/logging

### Reliability
- [ ] Set up auto-restart (PM2, systemd, etc.)
- [ ] Configure backups for MongoDB
- [ ] Set up monitoring (Sentry, NewRelic)
- [ ] Enable health checks

### Bot Features
- [ ] Test all commands in production
- [ ] Verify Mini App loads correctly
- [ ] Test payment integration
- [ ] Verify WebSocket connections

---

## Monitoring & Logging

### Using PM2

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Create dashboard
pm2 web
# Access at http://localhost:9615
```

### Using Sentry for Error Tracking

```bash
npm install @sentry/node
```

Add to bot.js:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "your_sentry_dsn",
  tracesSampleRate: 1.0
});
```

---

## Scaling Strategy

### Horizontal Scaling
- Use load balancer (NGINX)
- Run multiple bot instances
- Use message queue (Redis) for coordination

### Database Optimization
- Enable MongoDB replication
- Set up database sharding
- Create proper indexes
- Archive old game records

### Caching
- Redis for user sessions
- Cache leaderboard data
- Cache frequently accessed data

---

## Custom Domain Setup

### Update Mini App URL

1. Point domain to your server
2. Get SSL certificate (Let's Encrypt)
3. Update in `.env`: `MINI_APP_URL=https://yourdomain.com`
4. Update in BotFather Mini App settings

### Using Nginx as Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }

    location /app {
        root /var/www;
    }
}
```

---

## Troubleshooting

### Bot Not Responding
- Check logs: `docker-compose logs game_bot`
- Verify token in `.env`
- Check MongoDB connection

### High Memory Usage
- Check for memory leaks
- Monitor WebSocket connections
- Restart services regularly

### Slow Response Times
- Check database query performance
- Enable caching
- Optimize WebSocket messages

---

## Cost Estimation

**Monthly Costs (Example):**
- Heroku: $5-50
- MongoDB Atlas: $0-47
- Domain: $12/year
- Total: ~$50-100/month

---

Created with ❤️
