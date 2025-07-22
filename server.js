import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import stripeWebhook from './stripeWebhook.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3005', 'https://dsparfum.fr', 'https://www.dsparfum.fr'],
  credentials: true
}));
app.use(express.json());
// Stripe webhook (raw body)
app.use('/api', stripeWebhook);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend D&S Parfum opérationnel! 🌸' });
});

// Route pour créer une session de paiement Stripe
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { cart, customerInfo } = req.body;

    // Validation des données
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Panier vide ou invalide' });
    }

    if (!customerInfo || !customerInfo.email) {
      return res.status(400).json({ error: 'Email client requis' });
    }

    // Conversion du panier en line_items pour Stripe
    const lineItems = cart.map(item => {
      // S'assurer que le prix est un nombre valide
      const price = parseFloat(item.price);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Prix invalide pour l'article ${item.name}: ${item.price}`);
      }
      
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: item.description || '',
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(price * 100), // Prix en centimes
        },
        quantity: parseInt(item.quantity) || 1,
      };
    });

    // Création de la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerInfo.email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'],
      },
      metadata: {
        customer_name: customerInfo.name || '',
        customer_phone: customerInfo.phone || '',
        order_source: 'dsparfum_website'
      },
      success_url: `http://localhost:3000/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/?payment=cancelled`,
    });

    // Log pour debug
    console.log('✅ Session Stripe créée:', session.id);
    console.log('💰 Montant total:', lineItems.reduce((sum, item) => sum + (item.price_data.unit_amount * item.quantity), 0) / 100, '€');

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('❌ Erreur création session Stripe:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du paiement',
      details: error.message 
    });
  }
});

// Route pour récupérer les détails d'une session de paiement
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json(session);
  } catch (error) {
    console.error('❌ Erreur récupération session:', error);
    res.status(500).json({ error: 'Session introuvable' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend D&S Parfum démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🔑 Stripe configuré: ${process.env.STRIPE_SECRET_KEY ? '✅' : '❌'}`);
});
