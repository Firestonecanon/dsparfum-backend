// Test d'intégration Stripe → Admin
// Ce script simule un webhook Stripe pour tester l'enregistrement des clients

const testStripeWebhook = async () => {
  const mockStripeSession = {
    id: 'cs_test_123456789',
    customer_email: 'test@example.com',
    customer_details: {
      name: 'Jean Dupont',
      phone: '+33123456789'
    },
    amount_total: 8500, // 85€
    currency: 'eur',
    payment_status: 'paid',
    shipping: {
      name: 'Jean Dupont',
      address: {
        line1: '123 Rue de la Paix',
        line2: 'Apt 4B',
        postal_code: '75001',
        city: 'Paris',
        country: 'FR'
      }
    }
  };

  try {
    const response = await fetch('http://localhost:3001/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: mockStripeSession }
      }),
    });

    if (response.ok) {
      console.log('✅ Test webhook Stripe réussi !');
      console.log('🔍 Vérifiez votre interface admin pour voir le nouveau client.');
    } else {
      console.error('❌ Erreur test webhook:', response.status);
    }
  } catch (error) {
    console.error('❌ Erreur connexion:', error.message);
  }
};

testStripeWebhook();
