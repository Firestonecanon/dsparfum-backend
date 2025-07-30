// Test de l'API de production après déploiement
const testProductionAPI = async () => {
  console.log('🌐 Test de l\'API de production après déploiement...');
  
  const clientData = {
    firstName: "Test",
    lastName: "Production", 
    email: "test.production@dsparfum.fr",
    phone: "0123456789",
    street: "123 rue production",
    postalCode: "75001",
    city: "Paris",
    message: "Test API production après déploiement",
    cart: [],
    total: 25,
    timestamp: Date.now()
  };

  try {
    console.log('📦 Test des données:', clientData);
    
    const response = await fetch('https://api.dsparfum.fr/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData)
    });
    
    console.log('📡 Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API production OK - firstName/lastName acceptés !');
      console.log('🎯 Nom construit:', result.data?.name);
    } else {
      const errorText = await response.text();
      console.log('❌ API production pas encore mise à jour:', errorText);
      console.log('⏳ Attendre encore quelques minutes...');
    }
  } catch (error) {
    console.error('💥 Erreur réseau:', error);
  }
};

testProductionAPI();
