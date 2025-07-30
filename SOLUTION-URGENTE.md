# 🚨 PROBLÈME IDENTIFIÉ : BACKEND NON DÉMARRÉ

## Le problème
Le formulaire de contact renvoie "400 Bad Request" car **le serveur backend n'est pas démarré**.

Le frontend essaie d'envoyer les données à `/api/contact`, qui est proxifié vers `localhost:3001`, mais rien n'écoute sur ce port.

## ✅ SOLUTION IMMÉDIATE

### Étape 1 : Ouvrir un nouveau terminal
- Ouvrir PowerShell ou CMD
- Naviguer vers le projet : `cd "c:\Users\fires\OneDrive\Bureau\Projet_DS_Parfum"`

### Étape 2 : Démarrer le backend
```bash
npm run dev-server
```

Vous devriez voir :
```
🐘 Configuration PostgreSQL...
🔗 Connexion à PostgreSQL...
✅ Table clients PostgreSQL créée
📊 Base de données initialisée - X clients enregistrés
🚀 Serveur démarré sur le port 3001
```

### Étape 3 : Tester le formulaire
- Retourner sur votre site (localhost:5173)
- Remplir le formulaire de contact
- Envoyer

## 🎯 VÉRIFICATIONS

1. **Backend démarré** : `http://localhost:3001` doit répondre
2. **Frontend actif** : `http://localhost:5173` doit fonctionner
3. **Proxy configuré** : Vite proxy `/api` vers `localhost:3001`

## 🔍 SI ÇA NE MARCHE TOUJOURS PAS

Dans la console du navigateur, vous devriez voir :
- `🔄 Tentative d'enregistrement sur: /api/contact`
- `🔄 Response status: 200` (au lieu de 400)
- `✅ Contact enregistré dans l'admin: [données]`
