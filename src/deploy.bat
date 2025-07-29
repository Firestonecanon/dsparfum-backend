@echo off
echo 🚀 Préparation du déploiement D&S Parfum Admin...

echo 📦 Installation des dépendances...
call npm install

echo 🔨 Build de l'application React...
call npm run build

echo 📂 Copie des fichiers build...
if not exist "src\backend\dist" mkdir "src\backend\dist"
xcopy "dist\*" "src\backend\dist\" /E /Y

echo 📦 Installation des dépendances backend...
cd src\backend
call npm install
cd ..\..

echo ✅ Préparation terminée !
echo 🌐 L'admin sera accessible sur : /admin
echo 🔑 Mot de passe : Sam230385bs

pause
