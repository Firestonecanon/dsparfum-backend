@echo off
cls
color 0A
echo.
echo ============================================
echo    🚀 DS PARFUM - DEMARRAGE AUTOMATIQUE
echo ============================================
echo.

:: Aller dans le bon dossier
cd /d "c:\Users\fires\OneDrive\Bureau\Projet_DS_Parfum"

:: Tuer tous les processus Node
echo [1/4] Nettoyage...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Lancer SEULEMENT le frontend avec npm run dev
echo [2/4] Demarrage du site...
npm run dev

echo.
echo Si ca marche pas, appuyez sur une touche...
pause >nul
