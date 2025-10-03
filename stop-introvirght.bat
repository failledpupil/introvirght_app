@echo off
title Stop Introvirght Platform
color 0C
echo.
echo ========================================
echo    STOPPING INTROVIRGHT PLATFORM
echo ========================================
echo.

echo Stopping Node.js processes (Backend & Frontend)...
taskkill /f /im node.exe >nul 2>&1
if errorlevel 1 (
    echo No Node.js processes found running
) else (
    echo Node.js processes stopped successfully
)

echo.
echo Stopping any remaining development servers...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo ========================================
echo    INTROVIRGHT PLATFORM STOPPED
echo ========================================
echo.
echo All servers have been stopped.
echo You can now safely close any remaining terminal windows.
echo.
pause