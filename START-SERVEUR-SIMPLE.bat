@echo off
color 0A
echo.
echo  ███████╗███████╗██████╗ ██╗   ██╗███████╗██╗   ██╗██████╗ 
echo  ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██║   ██║██╔══██╗
echo  ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██║   ██║██████╔╝
echo  ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██║   ██║██╔══██╗
echo  ███████║███████╗██║  ██║ ╚████╔╝ ███████╗╚██████╔╝██║  ██║
echo  ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝
echo.
echo  🚀 SERVEUR BACKEND D^&S PARFUM - VERSION SIMPLE
echo.

cd /d "c:\Users\fires\OneDrive\Bureau\Projet_DS_Parfum"

echo 🧹 Nettoyage des processus Node.js...
taskkill /F /IM node.exe >nul 2>&1
ping localhost -n 2 > nul

echo.
echo ⚡ Démarrage du serveur simple (sans PostgreSQL)...
echo.
echo 📝 Ce serveur va:
echo    - Écouter sur le port 3001
echo    - Accepter les formulaires de contact  
echo    - Afficher les données reçues
echo    - Permettre de tester votre site
echo.
echo 🎯 Une fois démarré, testez votre formulaire sur:
echo    http://localhost:5173
echo.

node simple-server.js

echo.
echo 🔴 Serveur arrêté. Appuyez sur une touche pour fermer...
pause >nul
