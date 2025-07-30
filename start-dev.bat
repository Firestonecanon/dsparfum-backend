@echo off
echo 🚀 Démarrage des serveurs D&S Parfum...

echo.
echo 📦 Démarrage du backend (port 3001)...
start cmd /k "npm run dev-server"

timeout /t 3 > nul

echo.
echo 🌐 Démarrage du frontend (port 5173)...
start cmd /k "npm run dev"

echo.
echo ✅ Les deux serveurs sont en cours de démarrage :
echo   - Backend : http://localhost:3001
echo   - Frontend : http://localhost:5173
echo.
echo 🔧 Pour tester l'API contact : http://localhost:3001/api/contact
echo.
pause
