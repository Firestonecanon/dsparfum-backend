// Test des endpoints avec logs détaillés
console.log('🧪 Test des endpoints DS Parfum');
console.log('================================');

const testEndpoints = async () => {
  const baseUrl = 'https://api.dsparfum.fr/api';
  
  // Test 1: Health check
  console.log('\n1️⃣ Test Health Check...');
  try {
    const response = await fetch(`${baseUrl}/health`);
    console.log('✅ Status:', response.status);
    const data = await response.json();
    console.log('📊 Data:', data);
  } catch (error) {
    console.error('❌ Erreur health:', error);
  }

  // Test 2: Stripe Status
  console.log('\n2️⃣ Test Stripe Status...');
  try {
    const response = await fetch(`${baseUrl}/stripe-status`);
    console.log('✅ Status:', response.status);
    const data = await response.json();
    console.log('💳 Stripe configuré:', data.stripeConfigured);
    console.log('🔑 Clé présente:', data.hasSecretKey);
    console.log('🌍 Environnement:', data.environment);
  } catch (error) {
    console.error('❌ Erreur stripe status:', error);
  }

  // Test 3: Simulation checkout (données minimales)
  console.log('\n3️⃣ Test Checkout Simulation...');
  const checkoutData = {
    cart: [{
      name: "Test Parfum Mobile",
      price: 19.99,
      quantity: 1,
      ref: "MOBILE_TEST"
    }],
    total: 19.99,
    customerInfo: {
      email: "mobile.test@dsparfum.fr",
      name: "Test Mobile User",
      address: "123 Mobile Street",
      city: "Mobile City",
      postal: "12345",
      phone: "+33123456789"
    }
  };

  try {
    console.log('📦 Données envoyées:', checkoutData);
    const response = await fetch(`${baseUrl}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📋 Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Checkout data:', data);
      if (data.url) {
        console.log('🔗 URL Stripe générée:', data.url);
        console.log('🎯 Test RÉUSSI - URL générée correctement');
      } else {
        console.log('❌ PROBLÈME - Pas d\'URL dans la réponse');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur checkout:', errorText);
    }
  } catch (error) {
    console.error('💥 Erreur fetch checkout:', error);
    console.error('🔍 Message:', error.message);
    console.error('🔍 Stack:', error.stack);
  }
};

// Execution
testEndpoints().then(() => {
  console.log('\n🏁 Tests terminés');
}).catch(error => {
  console.error('💥 Erreur globale:', error);
});
