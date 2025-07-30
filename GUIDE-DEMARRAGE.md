# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## Problème SSL résolu

✅ **Configuration SSL corrigée** : Le serveur détecte maintenant automatiquement s'il doit utiliser SSL selon l'URL de la base.

## 🎯 DÉMARRAGE

### Méthode 1 : Commande directe
```bash
cd "c:\Users\fires\OneDrive\Bureau\Projet_DS_Parfum"
node server.js
```

### Méthode 2 : Script batch
Double-clic sur `start-backend-only.bat`

## ✅ VÉRIFICATIONS

Le serveur devrait maintenant afficher :
```
🐘 Configuration PostgreSQL...
🔍 DATABASE_URL: Définie (production)
🔍 SSL requis: Oui (base distante)
🔗 Connexion à PostgreSQL...
✅ Table clients PostgreSQL créée
📊 Base de données initialisée - X clients enregistrés
🚀 Serveur démarré sur le port 3001
```

## 🎉 APRÈS LE DÉMARRAGE

1. **Backend actif** : ✅
2. **Aller sur** : `http://localhost:5173`
3. **Tester le formulaire contact**
4. **Vérifier la console** : Vous devriez voir `✅ Contact enregistré dans l'admin`

## 🔧 SI PROBLÈME PERSISTE

La base est configurée pour utiliser la production (Render) même en développement. C'est normal et plus simple que d'installer PostgreSQL localement.
