# 🚀 Guide de Déploiement Render - D&S Parfum

## 📋 Étapes de déploiement

### 1️⃣ **Déployer le Backend Admin (API)**

1. **Aller sur** [render.com](https://render.com) et se connecter
2. **Cliquer** "New +" → "Web Service"
3. **Connecter** votre repository GitHub
4. **Configuration** :
   - **Name**: `dsparfum-admin-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
   - **Node Version**: `18`

5. **Variables d'environnement** à ajouter :
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=file:./data/clients.db
   ```

6. **Déployer** → Noter l'URL (ex: `https://dsparfum-admin-api.onrender.com`)

### 2️⃣ **Déployer le Frontend (Site)**

1. **Cliquer** "New +" → "Static Site"
2. **Configuration** :
   - **Name**: `dsparfum-site`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

3. **Variables d'environnement** :
   ```
   VITE_API_URL=https://dsparfum-admin-api.onrender.com
   ```

4. **Déployer** → Noter l'URL (ex: `https://dsparfum-site.onrender.com`)

### 3️⃣ **Configuration post-déploiement**

1. **Mettre à jour** les URLs dans AdminPage.jsx :
   ```javascript
   const API_BASE_URL = import.meta.env.PROD 
     ? 'https://dsparfum-admin-api.onrender.com' 
     : 'http://localhost:3001';
   ```

2. **Mettre à jour** CORS dans backend-admin.js :
   ```javascript
   const allowedOrigins = [
     'http://localhost:5173', 
     'https://dsparfum-site.onrender.com', // Votre URL frontend
     // ... autres origins
   ];
   ```

3. **Re-déployer** les deux services

### 4️⃣ **Test final**

- ✅ Site principal : `https://dsparfum-site.onrender.com`
- ✅ Interface admin : `https://dsparfum-site.onrender.com/admin`
- ✅ API santé : `https://dsparfum-admin-api.onrender.com/api/health`

## 🔧 Configuration Stripe (optionnel)

Pour les webhooks Stripe en production :

1. **Dans Stripe Dashboard** → Webhooks
2. **Ajouter endpoint** : `https://dsparfum-admin-api.onrender.com/webhook/stripe`
3. **Événements** : `checkout.session.completed`
4. **Copier** le webhook secret
5. **Ajouter** dans variables Render :
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 💾 Persistence des données

La base de données SQLite sera persistée sur le disque de Render. 
En cas de redémarrage, les données sont conservées.

## 🔐 Sécurité

- ✅ CORS configuré
- ✅ Variables d'environnement sécurisées
- ✅ Authentification admin par mot de passe
- ✅ Sessions limitées dans le temps

## 📊 Monitoring

- Logs disponibles dans le dashboard Render
- Santé de l'API : `/api/health`
- Métriques automatiques Render
