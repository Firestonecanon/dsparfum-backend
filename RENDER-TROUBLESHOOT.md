# 🚨 TROUBLESHOOTING RENDER - D&S Parfum

## 🔍 Diagnostic des problèmes Render

### 🟡 **Symptôme : Logs vides / Rien ne s'affiche**

#### ✅ **Solutions à vérifier :**

### 1️⃣ **Configuration du service Backend**
```
Service Type: Web Service
Environment: Node
Build Command: npm install
Start Command: node backend-admin.js
Node Version: 18
```

### 2️⃣ **Variables d'environnement obligatoires**
```
NODE_ENV=production
PORT=10000
```
⚠️ **IMPORTANT** : Render utilise le port 10000, pas 3001 !

### 3️⃣ **Configuration du service Frontend**
```
Service Type: Static Site  
Build Command: npm run build
Publish Directory: dist
```

## 🛠️ **Corrections à appliquer**

### ❌ **Erreur commune : Mauvais port**
Le backend doit écouter sur `process.env.PORT` (10000 sur Render)

### ❌ **Erreur commune : Variables d'environnement**
Assurez-vous que toutes les variables sont définies dans Render

### ❌ **Erreur commune : Build qui échoue**
Vérifiez que `npm run build` fonctionne en local

## 🔧 **Actions immédiates**

1. **Vérifier le port** dans backend-admin.js
2. **Ajouter les variables d'env** dans Render
3. **Redéployer** les services
4. **Vérifier les URLs** des API calls

## 📊 **URLs de test**
- API Health: `https://votre-backend.onrender.com/api/health`
- Frontend: `https://votre-frontend.onrender.com`
- Admin: `https://votre-frontend.onrender.com/admin`
