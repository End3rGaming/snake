@echo off
echo SnakeRoyale Setup Script
echo ========================

echo.
echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    echo After installing Node.js, run this script again.
    pause
    exit /b 1
)

echo Node.js found. Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo Failed to install dependencies. Please check your internet connection.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo To start the game server, run:
echo   npm start
echo.
echo To start in development mode, run:
echo   npm run dev
echo.
echo The game will be available at http://localhost:3000
echo.
pause 