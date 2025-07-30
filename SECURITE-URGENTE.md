# 🚨 SÉCURITÉ CRITIQUE - Actions requises

## ⚠️ CLÉS COMPROMISES DÉTECTÉES

La clé Stripe est maintenant publique dans l'historique Git :
- **Clé exposée :** `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`

## 🔥 ACTIONS IMMÉDIATES REQUISES :

### 1. **Révoquer la clé Stripe MAINTENANT**
- Aller sur https://dashboard.stripe.com/apikeys
- Supprimer/révoquer la clé actuelle
- Générer une nouvelle clé secrète

### 2. **Mettre à jour les variables d'environnement**
- Sur Render : Dashboard → Environment Variables
- Remplacer `STRIPE_SECRET_KEY` par la nouvelle clé
- Redéployer le service

### 3. **Nettoyer l'historique Git (optionnel mais recommandé)**
```bash
# Créer un nouveau repository propre
# OU utiliser git filter-branch pour nettoyer l'historique
```

## 🛡️ MESURES PRÉVENTIVES :

### 1. **Fichier .env.example créé**
```env
# Configuration PostgreSQL pour D&S Parfum
NODE_ENV=development
PORT=3001

# Base de données PostgreSQL - Render Production
DATABASE_URL=your_database_url_here

# Clé Stripe (à remplacer par vos vraies clés)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# EmailJS
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
```

### 2. **Variables d'environnement sur Render**
- Ne jamais mettre de vraies clés dans le code
- Utiliser uniquement les variables d'environnement Render

### 3. **Audit de sécurité**
- Vérifier si des transactions suspectes ont eu lieu
- Monitorer les logs Stripe
- Activer les alertes de sécurité

## ⏰ URGENCE : HAUTE
**Temps estimé avant exploitation potentielle : 1-24h**

Cette clé donne accès COMPLET à votre compte Stripe de production !

## 📞 CONTACT STRIPE
En cas de problème, contacter immédiatement le support Stripe.
