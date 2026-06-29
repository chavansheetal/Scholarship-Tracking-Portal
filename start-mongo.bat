@echo off
title MongoDB Server
echo ==========================================
echo   Starting MongoDB for NSP Scholar Project
echo ==========================================
echo.
echo MongoDB will start on port 27017
echo Keep this window open while developing!
echo.
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath mongodb_data --port 27017
echo.
echo MongoDB stopped. Press any key to exit.
pause
