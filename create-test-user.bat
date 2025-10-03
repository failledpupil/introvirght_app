@echo off
title Create Test User - Introvirght
color 0E
echo.
echo ========================================
echo    CREATING TEST USER FOR LOGIN
echo ========================================
echo.

echo Creating test user with known credentials...
echo.

REM Create test user
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/auth/register' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"username\":\"demo\",\"email\":\"demo@introvirght.com\",\"password\":\"Demo123456\",\"confirmPassword\":\"Demo123456\"}'; Write-Host 'SUCCESS: Test user created!' -ForegroundColor Green; Write-Host 'Email: demo@introvirght.com' -ForegroundColor Cyan; Write-Host 'Password: Demo123456' -ForegroundColor Cyan } catch { if ($_.Exception.Response.StatusCode -eq 409) { Write-Host 'User already exists - you can use existing credentials' -ForegroundColor Yellow; Write-Host 'Email: demo@introvirght.com' -ForegroundColor Cyan; Write-Host 'Password: Demo123456' -ForegroundColor Cyan } else { Write-Host 'Error creating user:' $_.Exception.Message -ForegroundColor Red } }"

echo.
echo ========================================
echo    TEST CREDENTIALS READY
echo ========================================
echo.
echo You can now login with:
echo Email:    demo@introvirght.com
echo Password: Demo123456
echo.
echo Alternative test accounts:
echo Email:    testuser123@example.com
echo Password: password123
echo.
echo Email:    newuser@test.com
echo Password: Test123456
echo.
pause