@echo off
color 0A
echo.
echo  🚀 SERVEUR BACKEND D^&S PARFUM - VERSION SIMPLE
echo.

cd /d "c:\Users\fires\OneDrive\Bureau\Projet_DS_Parfum"

echo 🧹 Nettoyage des processus Node.js...
taskkill /F /IM node.exe >nul 2>&1
ping localhost -n 2 > nul

echo.
echo ⚡ Démarrage du serveur simple...
echo.

node simple-server.mjs

echo.
echo 🔴 Serveur arrêté. Appuyez sur une touche pour fermer...
pause >nul
