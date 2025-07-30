// Test simple pour vérifier le formulaire de contact du site en production
async function testFormulaire() {
  try {
    console.log('🧪 Test du formulaire de contact...');
    
    // Test 1: Vérifier la configuration de l'API
    const apiConfig = {
      production: 'https://api.dsparfum.fr/api/contact',
      development: 'http://localhost:3001/api/contact'
    };
    
    console.log('🔗 URL API attendue:', apiConfig.production);
    
    // Test 2: Envoyer une requête directe à l'API
    const testData = {
      name: 'Test Frontend',
      email: 'frontend@test.com', 
      phone: '0123456789',
      address: '123 Test Street',
      subject: 'Test Frontend Integration',
      message: 'Test integration frontend-backend',
      paymentMethod: 'carte'
    };
    
    const response = await fetch('https://api.dsparfum.fr/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test réussi:', result);
      console.log('👤 Client créé avec ID:', result.clientId);
    } else {
      const error = await response.text();
      console.error('❌ Erreur API:', response.status, error);
    }
    
  } catch (error) {
    console.error('💥 Erreur test:', error);
  }
}

testFormulaire();
