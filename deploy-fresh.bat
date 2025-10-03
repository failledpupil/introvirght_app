@echo off
echo ========================================
echo    INTROVIRGHT FRESH DEPLOYMENT
echo ========================================
echo.

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Adding all changes...
git add .
echo.

echo [3/5] Committing fresh deployment...
git commit -m "Fresh deployment - Complete setup from scratch"
echo.

echo [4/5] Pushing to GitHub...
git push origin main
echo.

echo [5/5] Deployment triggered!
echo.
echo ========================================
echo   DEPLOYMENT PROCESS STARTED
echo ========================================
echo.
echo Your deployment is now running on Render!
echo.
echo Next steps:
echo 1. Go to your Render dashboard
echo 2. Monitor the deployment logs
echo 3. Wait for "Server startup complete" message
echo 4. Test your API at: https://your-app.onrender.com/health
echo.
echo ========================================
pause