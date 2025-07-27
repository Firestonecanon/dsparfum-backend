# 🔐 Page Admin D&S Parfum - Guide Complet

## 🚀 **Accès à l'Administration**

### **URL d'accès**

- **Local**: `http://localhost:10000/admin`
- **Production**: `https://dsparfum.fr/admin`

### **Authentification**

- **Mot de passe**: `Sam230385bs`
- **Session**: 4 heures d'auto-déconnexion
- **Sécurité**: Données stockées en localStorage

---

## 📊 **Fonctionnalités Admin**

### **1. Tableau de Bord**

- 📈 **Statistiques en temps réel**
  - Total clients
  - Commandes Stripe
  - Contacts formulaire
  - Ajouts manuels

### **2. Gestion des Clients**

- 🔍 **Recherche & Filtres**
  - Recherche par nom, email, téléphone
  - Filtrage par source (Stripe/Contact/Manuel)
- ✏️ **Actions CRUD**
  - ➕ Ajouter un client manuellement
  - ✏️ Éditer les informations
  - 🗑️ Supprimer un client
  - 📥 Exporter la base complète

### **3. Intégrations Automatiques**

#### **Commandes Stripe** 💳

- Ajout automatique lors d'un paiement réussi
- Webhook configuré avec Render backend
- Informations collectées :
  - Nom, email, téléphone
  - Adresses facturation/livraison
  - Historique des commandes
  - Montants et statuts

#### **Formulaire Contact** 📧

- Ajout automatique lors d'un envoi de contact
- Intégration avec EmailJS existant
- Données sauvegardées :
  - Coordonnées complètes
  - Message et sujet
  - Mode de paiement souhaité
  - Date de contact

---

## 🗄️ **Structure des Données**

### **Format Client**

```json
{
  "id": "stripe_session123_timestamp",
  "name": "Nom Client",
  "email": "client@email.com",
  "phone": "0123456789",
  "source": "stripe|contact|manual",
  "orders": [{
    "sessionId": "cs_session123",
    "amount": 85.00,
    "currency": "eur",
    "items": [...],
    "date": "2025-01-27T10:30:00Z",
    "status": "paid",
    "billingAddress": {...},
    "shippingAddress": {...}
  }],
  "contacts": [{
    "date": "2025-01-27T10:30:00Z",
    "message": "Contenu du message",
    "status": "nouveau"
  }],
  "createdAt": "2025-01-27T10:30:00Z",
  "updatedAt": "2025-01-27T10:30:00Z",
  "notes": "Notes privées admin"
}
```

---

## 🔧 **Configuration Backend**

### **Variables d'Environnement Render**

```env
DB_PATH=/data/clients.db
ADMIN_EMAIL=contact@dsparfum.fr
ADMIN_EMAIL_PASSWORD=Sam230385bs
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
PORT=10000
```

### **Routes API Disponibles**

- `GET /api/admin/clients` - Liste tous les clients
- `POST /api/admin/clients` - Ajouter un client
- `PUT /api/admin/clients/:id` - Modifier un client
- `DELETE /api/admin/clients/:id` - Supprimer un client
- `GET /api/admin/export` - Exporter la base
- `GET /api/admin/stats` - Statistiques
- `POST /api/contact` - Nouveau contact (auto-ajout)

---

## 📱 **Interface Utilisateur**

### **Design & UX**

- 🎨 Interface moderne avec Tailwind CSS
- 📱 Responsive mobile/desktop
- 🔍 Recherche en temps réel
- 📊 Cartes statistiques colorées
- 🎯 Actions rapides (éditer/supprimer)

### **Codes Couleur**

- 💜 **Purple**: Actions principales, admin
- 💚 **Vert**: Commandes Stripe, export
- 🔵 **Bleu**: Contacts formulaire
- 🟠 **Orange**: Ajouts manuels
- 🔴 **Rouge**: Suppressions, déconnexion

---

## 💾 **Sauvegardes & Sécurité**

### **Stockage**

- 📁 **Local**: `./data/clients.json`
- ☁️ **Render**: Stockage persistant garanti
- 🔄 **Sync**: Automatique via webhooks

### **Backups**

- 📥 **Export manuel**: Bouton dans l'interface
- 🗓️ **Format**: `clients_backup_2025-01-27.json`
- 🔒 **Chiffrement**: Variables d'environnement sécurisées

### **Sécurité**

- 🔐 Authentification par mot de passe
- ⏰ Session limitée (4h)
- 🛡️ Validation côté serveur
- 🚫 Pas d'exposition publique des données

---

## 🚨 **Dépannage**

### **Problèmes Courants**

#### **Page admin ne charge pas**

1. Vérifier que le serveur dev tourne (`npm run dev`)
2. Contrôler l'URL : `/admin` (sans #)
3. Vider le cache navigateur

#### **Données clients manquantes**

1. Vérifier le dossier `./data/clients.json`
2. Contrôler les logs backend
3. Tester les webhooks Stripe

#### **Authentification échoue**

1. Vérifier le mot de passe : `Sam230385bs`
2. Vider localStorage si nécessaire
3. Rafraîchir la page

### **Logs Utiles**

```bash
# Voir les logs du serveur
npm run dev

# Vérifier les fichiers de données
cat ./data/clients.json

# Tester une route API
curl http://localhost:3001/api/admin/clients
```

---

## 🎯 **Prochaines Améliorations**

### **Fonctionnalités Futures**

- 📊 Dashboard analytics avancé
- 📧 Envoi d'emails groupés depuis l'admin
- 🏷️ Système de tags clients
- 📋 Gestion des statuts de commande
- 🔄 Synchronisation avec le backend Render existant
- 📱 Notifications push pour nouveaux clients
- 🎨 Thèmes sombres/clairs

### **Intégrations Possibles**

- 📞 Intégration téléphonie (click-to-call)
- 📧 MailChimp/Brevo pour newsletters
- 📊 Google Analytics liaison
- 💬 Chat client intégré
- 🗓️ Système de rendez-vous

---

## 📞 **Support**

En cas de problème, vérifiez :

1. ✅ Backend actif sur Render
2. ✅ Variables d'environnement configurées
3. ✅ Webhooks Stripe opérationnels
4. ✅ Serveur local démarré

**Accès admin** : `dsparfum-backend-go.onrender.com/admin` avec `Sam230385bs`

---

## 🚀 **Déploiement sur Render**

### **Commandes de Build Render**
```bash
# Build Command
npm install && npm run build && cp -r dist src/backend/ && cd src/backend && npm install

# Start Command  
cd src/backend && npm start
```

### **Variables d'Environnement à Configurer**
```env
NODE_ENV=production
PORT=10000
DB_PATH=/opt/render/project/src/data/clients.json
ADMIN_EMAIL=contact@dsparfum.fr
ADMIN_EMAIL_PASSWORD=Sam230385bs
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **URL Finale**
- **Admin** : `https://dsparfum-backend-go.onrender.com/admin`
- **API** : `https://dsparfum-backend-go.onrender.com/api/`
