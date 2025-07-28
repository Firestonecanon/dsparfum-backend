@echo off
echo === CONSTRUCTION FORCEE DU PROJET ===
echo Suppression du dossier dist existant...
if exist dist rmdir /s /q dist
echo Construction avec Vite...
npx vite build
echo === BUILD TERMINE ===
pause
