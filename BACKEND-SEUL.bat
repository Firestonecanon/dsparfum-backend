@echo off
color 0E
title RELANCE BACKEND SEUL
echo.
echo ===== RELANCE BACKEND SEUL =====
echo.

cd /d "c:\Users\fires\OneDrive\Bureau\Projet_DS_Parfum"

echo [1] Arrêt processus Node...
taskkill /F /IM node.exe >nul 2>&1
echo ✅ Processus Node arrêtés

echo.
echo [2] Attente 3 secondes...
timeout /t 3 /nobreak >nul

echo.
echo [3] Démarrage backend...
echo.

node simple-server.mjs

echo.
echo ❌ Backend arrêté - Appuyez sur une touche...
pause >nul
