# Diagnostic : Formulaire Contact ne fonctionne pas

## ❌ Problème identifié
Le formulaire de contact n'envoie pas les données car :
1. **Backend non démarré** : Le serveur backend n'est pas accessible sur `localhost:3001`
2. **Proxy mal configuré** : Vite était configuré pour pointer vers la production

## ✅ Solutions appliquées

### 1. Configuration Vite corrigée
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:3001', // ✅ Backend local
    changeOrigin: true,
    secure: false
  }
}
```

### 2. Environnement de développement
```bash
# .env
NODE_ENV=development  # ✅ Mode développement
PORT=3001
```

### 3. Script de démarrage créé
- `start-dev.bat` : Lance backend + frontend automatiquement

## 🚀 Comment résoudre

### Étape 1 : Démarrer le backend
```bash
npm run dev-server
```
*(Le backend sera accessible sur http://localhost:3001)*

### Étape 2 : Démarrer le frontend (dans un autre terminal)
```bash
npm run dev
```
*(Le frontend sera accessible sur http://localhost:5173)*

### Étape 3 : Tester
1. Aller sur http://localhost:5173
2. Remplir le formulaire de contact
3. Vérifier dans la console les logs d'API

## 🧪 Tests
- `test-api-contact.js` : Test direct de l'API
- Logs détaillés dans ContactSection pour diagnostic

## ⚠️ Important
**Les deux serveurs doivent être démarrés** :
- Backend (3001) : Pour traiter les requêtes API
- Frontend (5173) : Pour l'interface utilisateur
