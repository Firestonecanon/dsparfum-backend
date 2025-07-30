@echo off
color 0C
title DIAGNOSTIC DS PARFUM
echo.
echo ===== DIAGNOSTIC COMPLET =====
echo.

cd /d "c:\Users\fires\OneDrive\Bureau\Projet_DS_Parfum"

echo [TEST 1] Verification du dossier...
dir /b | findstr /i "package.json" >nul
if %errorlevel%==0 (
    echo ✅ package.json trouvé
) else (
    echo ❌ package.json INTROUVABLE !
    pause
    exit
)

echo.
echo [TEST 2] Verification Node.js...
node --version >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Node.js installé
    node --version
) else (
    echo ❌ Node.js INTROUVABLE !
    pause
    exit
)

echo.
echo [TEST 3] Verification npm...
npm --version >nul 2>&1
if %errorlevel%==0 (
    echo ✅ npm installé
    npm --version
) else (
    echo ❌ npm INTROUVABLE !
    pause
    exit
)

echo.
echo [TEST 4] Verification simple-server.mjs...
if exist "simple-server.mjs" (
    echo ✅ simple-server.mjs trouvé
) else (
    echo ❌ simple-server.mjs INTROUVABLE !
    pause
    exit
)

echo.
echo [TEST 5] Test démarrage serveur simple...
echo Lancement en cours...
timeout /t 2 /nobreak >nul
node simple-server.mjs

pause
