@echo off
title تشغيل مشروع PC Builder
color 0A

echo ===================================================
echo     Starting PC Builder Environment... Please wait.
echo ===================================================
echo.

echo [1/3] Starting XAMPP Servers (Apache ^& MySQL)...
start "" "C:\xampp\xampp_start.exe"

echo [2/3] Starting Node.js AI Backend...
cd /d "C:\xampp\htdocs\ProjWeb\server"
:: This opens a new terminal window for the Node.js server so you can see AI logs
start "PC Builder - Node.js AI Server" cmd /k "npm start"

echo [3/3] Opening Website in your default browser...
:: Wait 3 seconds to ensure servers are up before opening the browser
timeout /t 3 /nobreak >nul
start http://localhost/ProjWeb/HTMLPage/index.html

echo.
echo ✅ All done! Enjoy!
timeout /t 2 >nul
exit
