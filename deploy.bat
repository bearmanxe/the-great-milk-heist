@echo off
REM The Great Milk Heist - Multiplayer Deployment Script (Windows)
REM This script deploys the Edge Function for real online multiplayer

echo.
echo ========================================================
echo    The Great Milk Heist - Multiplayer Deployment
echo ========================================================
echo.

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found!
    echo.
    echo Install it with:
    echo   Scoop:  scoop install supabase
    echo   npm:    npm install -g supabase
    echo.
    pause
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

REM Project ID
set PROJECT_REF=symyhtogzjmuibiayvnr

echo 📡 Checking if you're logged in...
supabase projects list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Not logged in to Supabase
    echo.
    echo Run: supabase login
    echo.
    pause
    exit /b 1
)

echo ✅ Logged in to Supabase
echo.

echo 🔗 Linking to project...
supabase link --project-ref %PROJECT_REF% >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Project linked successfully
) else (
    echo ⚠️  Project already linked or link failed
)
echo.

echo 🚀 Deploying Edge Function...
supabase functions deploy make-server
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Deployment successful!
    echo.
    echo 🧪 Testing deployment...
    echo.
    
    set FUNCTION_URL=https://%PROJECT_REF%.supabase.co/functions/v1/make-server/health
    
    curl -s "%FUNCTION_URL%" | findstr /C:"ok" >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Edge Function is online and responding!
        echo.
        echo 🎮 Multiplayer is now ready!
        echo.
        echo Next steps:
        echo   1. Open your game
        echo   2. Go to Multiplayer menu
        echo   3. Create a session
        echo   4. Share the session code with friends
        echo.
        echo Happy gaming! 🥛🎮
    ) else (
        echo ⚠️  Edge Function deployed but health check failed
        echo Check logs with: supabase functions logs make-server
    )
) else (
    echo.
    echo ❌ Deployment failed!
    echo.
    echo Common issues:
    echo   - Missing KV store table (see DEPLOY_EDGE_FUNCTION.md Step 1^)
    echo   - Incorrect project ID
    echo   - Permission issues
    echo.
    echo Check: supabase functions logs make-server
    pause
    exit /b 1
)

echo.
pause
