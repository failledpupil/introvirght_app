@echo off
title Introvirght Platform Launcher
color 0A
echo.
echo ========================================
echo    INTROVIRGHT PLATFORM LAUNCHER
echo ========================================
echo.
echo Starting your mindful social platform...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if directories exist
if not exist "server" (
    echo ERROR: Server directory not found
    echo Make sure you're running this from the project root
    pause
    exit /b 1
)

if not exist "introvirght" (
    echo ERROR: Frontend directory not found
    echo Make sure you're running this from the project root
    pause
    exit /b 1
)

echo [1/2] Starting Backend Server (Node.js + Express)...
start "Introvirght Backend - Port 3001" cmd /k "cd server && echo Starting backend server... && npm run dev"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo [2/2] Starting Frontend Server (Vite + React)...
start "Introvirght Frontend - Port 5173" cmd /k "cd introvirght && echo Starting frontend server... && npm run dev"

echo.
echo ========================================
echo    SERVERS STARTING SUCCESSFULLY
echo ========================================
echo.
echo Backend API:     http://localhost:3001
echo Frontend App:    http://localhost:5173
echo Diary Page:      http://localhost:5173/#diary
echo Health Check:    http://localhost:3001/health
echo.
echo FEATURES AVAILABLE:
echo - Complete Diary System with mood tracking
echo - Rich entry composer with reflection fields
echo - Beautiful, responsive UI design
echo - Real-time entry creation and editing
echo.
echo TIP: Wait a few seconds for both servers to fully start
echo      then open http://localhost:5173 in your browser
echo.
echo Press any key to close this launcher...
pause > nul