@echo off
title NSP MongoDB Permanent Fixer
echo ====================================================
echo 🚀 NSP SCHOLARSHIP PORTAL — MONGODB AUTO-FIXER
echo ====================================================
echo.

:: Check for administrative privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with Administrative privileges!
    echo 🧹 Cleaning up ALL stale MongoDB lock files...
    
    :: Remove locks from Service directory
    if exist "C:\Program Files\MongoDB\Server\8.2\data\mongod.lock" (
        del /f /q "C:\Program Files\MongoDB\Server\8.2\data\mongod.lock"
        echo ✅ Removed stale mongod.lock from Windows Service.
    )
    if exist "C:\Program Files\MongoDB\Server\8.2\data\WiredTiger.lock" (
        del /f /q "C:\Program Files\MongoDB\Server\8.2\data\WiredTiger.lock"
        echo ✅ Removed stale WiredTiger.lock from Windows Service.
    )
    
    :: Remove locks from Project directory
    if exist "..\mongodb_data\mongod.lock" (
        del /f /q "..\mongodb_data\mongod.lock"
        echo ✅ Removed stale mongod.lock from local project database.
    )
    if exist "..\mongodb_data\WiredTiger.lock" (
        del /f /q "..\mongodb_data\WiredTiger.lock"
        echo ✅ Removed stale WiredTiger.lock from local project database.
    )

    echo.
    echo ⚙️ Configuring MongoDB service startup to AUTOMATIC...
    sc config MongoDB start= auto >nul 2>&1
    
    echo 🔌 Starting MongoDB Server service...
    net stop MongoDB >nul 2>&1
    net start MongoDB
    if %errorLevel% == 0 (
        echo ✅ MongoDB Service started successfully!
        echo 🎉 Local database is now fully functional.
    ) else (
        echo ⚠️ Could not start Windows Service. Starting manual background backup process instead...
        goto MANUAL_START
    )
) else (
    echo [INFO] Running in standard user mode. (No admin rights required for local database)
    echo 🧹 Cleaning up project-level lock files...
    
    :: Remove locks from Project directory
    if exist "..\mongodb_data\mongod.lock" (
        del /f /q "..\mongodb_data\mongod.lock"
        echo ✅ Removed stale mongod.lock from local database.
    )
    if exist "..\mongodb_data\WiredTiger.lock" (
        del /f /q "..\mongodb_data\WiredTiger.lock"
        echo ✅ Removed stale WiredTiger.lock from local database.
    )
    
    goto MANUAL_START
)
goto END

:MANUAL_START
echo.
echo 🚀 Launching MongoDB manual background process...
if exist "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" (
    start /b "" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "..\mongodb_data" --port 27017
    echo ✅ MongoDB started successfully in background!
) else if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" (
    start /b "" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "..\mongodb_data" --port 27017
    echo ✅ MongoDB (v8.0) started successfully in background!
) else (
    echo ❌ Could not find mongod.exe in standard directories.
    echo Please make sure MongoDB is installed properly.
)
goto END

:END
echo.
echo ====================================================
echo 🎉 Database repair process complete!
echo You can now run the project.
echo ====================================================
pause
