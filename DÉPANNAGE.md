# 🚨 DÉPANNAGE - Commande bloquée

## Problème
La commande `node server.js` ne s'exécute pas ou reste bloquée.

## ✅ SOLUTIONS ÉTAPE PAR ÉTAPE

### Étape 1 : Test de base
```bash
node test-config.js
```
**Attendu :** Affichage des variables d'environnement

### Étape 2 : Serveur de test (sans base de données)
Double-clic sur : `start-test-server.bat`

**OU en ligne de commande :**
```bash
node server-test.js
```

**Attendu :**
```
🚀 Serveur de test démarré sur http://localhost:3001
📡 Test: http://localhost:3001/api/test
```

### Étape 3 : Test de l'API
Ouvrir dans le navigateur : `http://localhost:3001/api/test`

**Attendu :** Message JSON de confirmation

### Étape 4 : Test du formulaire
1. Aller sur : `http://localhost:5173`
2. Tester le formulaire de contact
3. **Attendu :** Succès (mode test sans vraie base de données)

## 🔍 DIAGNOSTIC

### Si Étape 1 échoue :
- Problème Node.js ou modules manquants
- Solution : `npm install`

### Si Étape 2 échoue :
- Port 3001 occupé
- Solution : Script batch tue les processus existants

### Si Étape 3 réussit :
- ✅ Serveur fonctionne
- Problème = Connexion base de données

### Si formulaire fonctionne en mode test :
- ✅ Tout fonctionne côté frontend
- Activer la vraie base de données

## 🎯 PROCHAINE ÉTAPE

Si le mode test fonctionne, nous activerons ensuite la vraie base PostgreSQL.
