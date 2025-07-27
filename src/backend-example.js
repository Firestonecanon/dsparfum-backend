// Backend Express.js pour Stripe
const express = require('express');
const stripe = require('stripe')('sk_live_VOTRE_CLE_SECRETE');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, customerEmail } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: item.description,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'https://dsparfum.fr?payment=success',
      cancel_url: 'https://dsparfum.fr?payment=cancelled',
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('🚀 Serveur Stripe actif'));

// Installation: npm install express stripe cors
