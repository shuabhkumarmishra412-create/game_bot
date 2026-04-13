@echo off
REM Game Bot - Windows Installer

echo.
echo 🎮 Game Bot + Mini App - Setup Wizard
echo ======================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not installed. Please install Node.js 14+
    echo Download: https://nodejs.org
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found
    exit /b 1
)

echo ✅ npm found: 
npm --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install --silent

echo ✅ Dependencies installed

REM Create .env if not exists
if not exist .env (
    echo.
    echo 🔐 Setting up environment variables...
    copy .env.example .env
    echo ✅ Created .env ^(Please edit with your bot token^)
) else (
    echo ✅ .env already exists
)

REM Create backend directories
if not exist backend\models mkdir backend\models
if not exist backend\utils mkdir backend\utils
if not exist backend\scripts mkdir backend\scripts

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your Telegram token
echo 2. Start MongoDB ^(docker run -d -p 27017:27017 mongo:latest^)
echo 3. Initialize database: node backend\scripts\initDb.js
echo 4. Start bot: npm start
echo 5. Start server: npm run server
echo.
echo 📖 Read QUICKSTART.md for more info
echo.
pause
