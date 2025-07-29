#!/bin/bash

# Script de déploiement automatique pour Render
# Ce script prépare l'application pour le déploiement

echo "🚀 Préparation du déploiement D&S Parfum Admin..."

# 1. Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# 2. Build de l'application React
echo "🔨 Build de l'application React..."
npm run build

# 3. Copie des fichiers dans le backend
echo "📂 Copie des fichiers build..."
mkdir -p src/backend/dist
cp -r dist/* src/backend/dist/

# 4. Installation des dépendances backend
echo "📦 Installation des dépendances backend..."
cd src/backend
npm install

echo "✅ Préparation terminée !"
echo "🌐 L'admin sera accessible sur : /admin"
echo "🔑 Mot de passe : Sam230385bs"
