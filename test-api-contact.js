// Test simple de l'API contact avec node-fetch
import fetch from 'node-fetch';

console.log('🧪 Test de l\'API contact...');

const testData = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '0123456789',
  street: '123 Rue Test',
  postalCode: '75001',
  city: 'Paris',
  message: 'Message de test'
};

fetch('http://localhost:3001/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Réponse:', data);
})
.catch(error => {
  console.error('❌ Erreur:', error);
});
