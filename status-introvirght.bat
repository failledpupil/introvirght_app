@echo off
title Introvirght Platform Status
color 0B
echo.
echo ========================================
echo    INTROVIRGHT PLATFORM STATUS
echo ========================================
echo.

echo Checking server status...
echo.

REM Check backend server
echo [Backend Server - Port 3001]
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/health' -TimeoutSec 3; Write-Host 'Status: RUNNING' -ForegroundColor Green; Write-Host 'Response:' $response.StatusCode $response.StatusDescription } catch { Write-Host 'Status: NOT RUNNING' -ForegroundColor Red }"
echo.

REM Check frontend server
echo [Frontend Server - Port 5173]
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 3; Write-Host 'Status: RUNNING' -ForegroundColor Green; Write-Host 'Response:' $response.StatusCode $response.StatusDescription } catch { Write-Host 'Status: NOT RUNNING' -ForegroundColor Red }"
echo.

REM Check processes
echo [Running Node.js Processes]
tasklist /fi "imagename eq node.exe" /fo table 2>nul | find "node.exe" >nul
if errorlevel 1 (
    echo No Node.js processes found
) else (
    tasklist /fi "imagename eq node.exe" /fo table
)

echo.
echo [Port Usage]
netstat -an | find ":3001" | find "LISTENING" >nul
if not errorlevel 1 (
    echo Port 3001: IN USE ^(Backend^)
) else (
    echo Port 3001: AVAILABLE
)

netstat -an | find ":5173" | find "LISTENING" >nul
if not errorlevel 1 (
    echo Port 5173: IN USE ^(Frontend^)
) else (
    echo Port 5173: AVAILABLE
)

echo.
echo ========================================
echo    QUICK ACCESS LINKS
echo ========================================
echo.
echo Main App:      http://localhost:5173
echo Diary Page:    http://localhost:5173/#diary  
echo API Health:    http://localhost:3001/health
echo API Docs:      http://localhost:3001/api
echo.
pause