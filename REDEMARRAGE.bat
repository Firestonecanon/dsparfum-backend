@echo off
color 0C
title REDEMARRAGE FORCE
echo.
echo ===== REDEMARRAGE FORCE =====
echo.

cd /d "c:\Users\fires\OneDrive\Bureau\Projet_DS_Parfum"

echo [1] Arrêt forcé de tous les processus...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM chrome.exe >nul 2>&1
taskkill /F /IM msedge.exe >nul 2>&1
echo ✅ Processus arrêtés

echo.
echo [2] Attente nettoyage...
timeout /t 3 /nobreak >nul

echo.
echo [3] Redémarrage backend...
start "BACKEND FORCE" cmd /c "echo BACKEND DEMARRE && node simple-server.mjs"

echo.
echo [4] Attente backend...
timeout /t 5 /nobreak >nul

echo.
echo [5] Redémarrage frontend...
start "FRONTEND FORCE" cmd /c "echo FRONTEND DEMARRE && npm run dev"

echo.
echo [6] Attente frontend...
timeout /t 5 /nobreak >nul

echo.
echo [7] Ouverture navigateur...
start http://localhost:5173

echo.
echo ===== TERMINÉ =====
echo.
echo Si ça ne marche toujours pas:
echo - Appuyez sur CTRL+C dans les fenêtres
echo - Relancez ce script
echo.
pause
