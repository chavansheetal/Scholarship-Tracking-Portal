@echo off
:: Check for administrative privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with administrative privileges.
) else (
    echo [ERROR] Please right-click this file and select 'Run as Administrator'.
    pause
    exit /b 1
)

echo ----------------------------------------------------
echo 🚀 Setting MongoDB to start automatically...
echo ----------------------------------------------------

:: Set MongoDB service to start automatically
sc config MongoDB start= auto
if %errorLevel% == 0 (
    echo ✅ MongoDB Service set to Automatic startup.
) else (
    echo ❌ Failed to set MongoDB Service to Automatic.
)

:: Delete stale lock files if they exist to prevent 1067 crash
echo 🧹 Cleaning up stale MongoDB lock files...
if exist "C:\Program Files\MongoDB\Server\8.2\data\mongod.lock" (
    del /f /q "C:\Program Files\MongoDB\Server\8.2\data\mongod.lock"
    echo ✅ Removed stale mongod.lock file.
)
if exist "C:\Program Files\MongoDB\Server\8.2\data\WiredTiger.lock" (
    del /f /q "C:\Program Files\MongoDB\Server\8.2\data\WiredTiger.lock"
    echo ✅ Removed stale WiredTiger.lock file.
)

:: Start the MongoDB service
echo 🔌 Starting MongoDB service...
net start MongoDB
if %errorLevel% == 0 (
    echo ✅ MongoDB Service started successfully.
) else (
    echo ⚠️ MongoDB Service might already be running or failed to start.
    echo Checking status...
    sc query MongoDB
)

echo ----------------------------------------------------
echo 🎉 Permanent fix applied! 
echo MongoDB will now start automatically whenever your computer starts.
echo ----------------------------------------------------
pause
