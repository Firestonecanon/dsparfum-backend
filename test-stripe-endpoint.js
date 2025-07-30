// Test de l'endpoint Stripe create-checkout-session
const testStripeEndpoint = async () => {
  console.log('🧪 Test de l\'endpoint Stripe...');
  
  const testData = {
    cart: [
      {
        name: "Parfum Test",
        price: 25,
        quantity: 1
      }
    ],
    total: 25,
    customerInfo: {
      email: "test@dsparfum.fr",
      name: "Test User",
      address: "123 rue test",
      city: "Paris",
      postal: "75001",
      phone: "0123456789"
    }
  };

  try {
    console.log('📦 Données envoyées:', testData);
    
    const response = await fetch('https://api.dsparfum.fr/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 Headers:', response.headers);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Réponse:', result);
      
      if (result.url) {
        console.log('🎯 URL Stripe:', result.url);
      } else {
        console.log('❌ Pas d\'URL dans la réponse !');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur HTTP:', response.status, errorText);
    }
  } catch (error) {
    console.error('💥 Erreur fetch:', error);
  }
};

testStripeEndpoint();
