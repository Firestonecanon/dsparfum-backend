# 🚀 Guide de Déploiement Admin sur Render

## 📋 **Prérequis**
- Backend Node.js existant sur Render
- Accès au dashboard Render
- Code source disponible sur GitHub

---

## 🔧 **Option 1: Backend + Admin sur Render (Recommandé)**

### **1. Préparer le Build**
```bash
# Dans votre projet local
npm run build

# Le dossier dist/ contient votre app React
```

### **2. Copier l'Admin dans le Backend**
```bash
# Copier les fichiers buildés vers le backend
cp -r dist/* src/backend/public/
```

### **3. Configurer le Backend pour servir l'Admin**
Ajouter dans `src/backend/server.js` :

```javascript
import path from 'path';

// Servir les fichiers statiques (admin)
app.use(express.static(path.join(process.cwd(), 'public')));

// Route pour la page admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Fallback pour toutes les autres routes (SPA)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Route API introuvable' });
  } else {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  }
});
```

### **4. Variables d'Environnement Render**
Vérifier dans le dashboard Render :
```env
NODE_ENV=production
PORT=10000
DB_PATH=/opt/render/project/src/data/clients.json
ADMIN_EMAIL=contact@dsparfum.fr
ADMIN_EMAIL_PASSWORD=Sam230385bs
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🔧 **Option 2: Nouveau Service Render**

### **1. Créer un nouveau service**
- Type: **Web Service**
- Repository: Votre repo GitHub
- Branch: `main`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### **2. Variables d'environnement**
```env
NODE_ENV=production
PORT=10000
ADMIN_EMAIL=contact@dsparfum.fr
ADMIN_EMAIL_PASSWORD=Sam230385bs
```

### **3. Configuration package.json**
```json
{
  "scripts": {
    "start": "node src/backend/server.js",
    "build": "vite build && cp -r dist src/backend/public"
  }
}
```

---

## 🔧 **Option 3: Frontend Static (Plus Simple)**

### **1. Créer un Static Site sur Render**
- Type: **Static Site**
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

### **2. Configurer l'URL de l'API**
Dans `AdminPage.jsx`, pointer vers votre backend :
```javascript
const API_BASE = 'https://dsparfum-backend-go.onrender.com';

// Utiliser dans les fetch
fetch(`${API_BASE}/api/admin/clients`)
```

### **3. Configuration CORS Backend**
S'assurer que le CORS autorise votre nouveau domaine :
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://dsparfum.fr',
    'https://votre-admin-render.onrender.com'
  ]
}));
```

---

## 🎯 **Recommandation**

**Option 1** est la meilleure car :
✅ Une seule URL à gérer  
✅ Pas de problèmes CORS  
✅ Backend et admin ensemble  
✅ Plus sécurisé  

**URL finale** : `https://dsparfum-backend-go.onrender.com/admin`

---

## 🔒 **Sécurité Production**

### **Variables à sécuriser**
```env
# Ne jamais exposer côté client
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_EMAIL_PASSWORD=Sam230385bs
```

### **Headers sécurisés**
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

---

## 📝 **Checklist Déploiement**

- [ ] Build React créé (`npm run build`)
- [ ] Backend configure les routes statiques
- [ ] Variables d'environnement configurées
- [ ] CORS autorise le nouveau domaine
- [ ] Route `/admin` redirige vers React app
- [ ] Test de connexion avec mot de passe
- [ ] Webhooks Stripe pointent vers le bon domaine
- [ ] Backup des données existantes

---

## 🚨 **Important**

⚠️ **Avant le déploiement** :
1. Faire un backup de votre backend actuel
2. Tester en local avec `npm run build && npm run preview`
3. Vérifier que les API calls fonctionnent
4. S'assurer que le dossier `data/` persiste sur Render

**URL Admin finale** : `https://dsparfum-backend-go.onrender.com/admin`
