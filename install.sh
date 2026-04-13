#!/bin/bash

# Game Bot - Installer Script
# This script helps set up the Telegram bot and Mini App

set -e

echo "🎮 Game Bot + Mini App - Setup Wizard"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Please install Node.js 14+"
    echo "Download: https://nodejs.org"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not installed"
    exit 1
fi
echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --silent

echo "✅ Dependencies installed"

# Create .env if not exists
if [ ! -f .env ]; then
    echo ""
    echo "🔐 Setting up environment variables..."
    cp .env.example .env
    echo "✅ Created .env (Please edit with your bot token)"
else
    echo "✅ .env already exists"
fi

# Create backend directories if not exist
mkdir -p backend/models backend/utils backend/scripts

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Telegram token"
echo "2. Start MongoDB (docker run -d -p 27017:27017 mongo:latest)"
echo "3. Initialize database: node backend/scripts/initDb.js"
echo "4. Start bot: npm start"
echo "5. Start server: npm run server"
echo ""
echo "📖 Read QUICKSTART.md for more info"
echo ""
