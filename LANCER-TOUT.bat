@echo off
color 0A
echo.
echo  🚀 LANCEMENT COMPLET DU SITE DS PARFUM
echo.

cd /d "c:\Users\fires\OneDrive\Bureau\Projet_DS_Parfum"

echo 🧹 Nettoyage complet...
taskkill /F /IM node.exe >nul 2>&1
ping localhost -n 2 > nul

echo.
echo ⚡ Démarrage du backend (port 3001)...
start "Backend DS Parfum" cmd /k "node simple-server.mjs"

echo.
echo ⏳ Attente 3 secondes...
ping localhost -n 4 > nul

echo.
echo 🌐 Démarrage du frontend (port 5173)...
start "Frontend DS Parfum" cmd /k "npm run dev"

echo.
echo ⏳ Attente 5 secondes...
ping localhost -n 6 > nul

echo.
echo 🎯 Ouverture automatique du navigateur...
start http://localhost:5173

echo.
echo 🎉 TOUT EST LANCÉ !
echo.
echo 📝 Votre site est maintenant accessible sur:
echo    http://localhost:5173
echo.
echo 💡 Pour tester le formulaire de contact:
echo    1. Remplissez le formulaire
echo    2. Regardez la console "Backend DS Parfum" 
echo    3. Vous verrez les données reçues !
echo.
echo ✅ Les deux serveurs tournent en arrière-plan
echo 🔴 Fermez cette fenêtre quand vous avez fini
echo.
pause
