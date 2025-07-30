// Test spécifique pour firstName/lastName
const testClientCreation = async () => {
  console.log('🧪 Test création client avec firstName/lastName...');
  
  const clientData = {
    firstName: "Samir",
    lastName: "BELAID", 
    email: "test.firstname@test.fr",
    phone: "0123456789",
    street: "123 rue test",
    postalCode: "75001",
    city: "Paris",
    message: "Test creation client avec firstName/lastName",
    cart: [],
    total: 35,
    timestamp: Date.now()
  };

  try {
    console.log('📦 Données envoyées:', clientData);
    
    const response = await fetch('http://localhost:3001/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData)
    });
    
    console.log('📡 Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Client créé avec succès:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur:', errorText);
    }
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
};

testClientCreation();
