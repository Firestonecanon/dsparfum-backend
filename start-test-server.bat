@echo off
echo 🔄 Nettoyage et démarrage du serveur test...
echo.

cd /d "c:\Users\fires\OneDrive\Bureau\Projet_DS_Parfum"

echo 🧹 Arrêt des processus Node.js existants...
taskkill /F /IM node.exe 2>nul
timeout /t 2 > nul

echo.
echo 🚀 Démarrage du serveur de test (sans base de données)...
echo.
echo Si cela fonctionne, nous activerons ensuite la base de données.
echo.

node server-test.js

pause
