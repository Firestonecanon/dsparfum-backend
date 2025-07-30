import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Utiliser une clé de test par défaut si pas de clé configurée
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_local_development';
const stripe = new Stripe(stripeKey);
const router = express.Router();

// Configurer le transporteur d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD || '', // à définir dans .env
  },
});

// Webhook Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erreur signature webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Paiement réussi
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Envoyer un email à l'admin
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: 'Paiement Stripe réussi',
      text: `Paiement reçu !\nMontant: ${session.amount_total / 100} €\nClient: ${session.customer_email}`,
    });
    console.log('Email envoyé à l’admin pour le paiement Stripe.');
  }

  res.json({ received: true });
});

export default router;
