// Test de l'API contact
const testContact = async () => {
  try {
    console.log('🧪 Test API contact...');
    
    const testData = {
      name: 'Test Client',
      email: 'test@example.com',
      phone: '0123456789',
      address: '123 Rue Test',
      subject: 'Test Formulaire',
      message: 'Ceci est un test du formulaire de contact',
      paymentMethod: 'paypal'
    };
    
    const response = await fetch('https://api.dsparfum.fr/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Status:', response.status);
    console.log('🔗 Headers:', response.headers);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Réponse succès:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('💥 Erreur réseau:', error);
  }
};

testContact();
