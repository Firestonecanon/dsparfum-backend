// Test pour voir les champs exacts retournés par l'API admin
const testAdminAPI = async () => {
  console.log('🔍 Test de l\'API admin pour voir les champs disponibles...');
  
  try {
    const response = await fetch('https://api.dsparfum.fr/api/admin/clients');
    
    if (response.ok) {
      const clients = await response.json();
      console.log('📊 Nombre de clients:', clients.length);
      
      if (clients.length > 0) {
        console.log('🔍 Premier client complet:', clients[0]);
        console.log('🔍 Champs disponibles:', Object.keys(clients[0]));
        
        // Chercher les champs liés à l'adresse
        const addressFields = Object.keys(clients[0]).filter(key => 
          key.toLowerCase().includes('address') || 
          key.toLowerCase().includes('street') ||
          key.toLowerCase().includes('postal') ||
          key.toLowerCase().includes('city') ||
          key.toLowerCase().includes('adresse')
        );
        console.log('📍 Champs adresse trouvés:', addressFields);
        
        // Afficher quelques clients pour voir le contenu
        clients.slice(0, 3).forEach((client, index) => {
          console.log(`\n👤 Client ${index + 1}:`);
          console.log('  - ID:', client.id);
          console.log('  - Nom:', client.name);
          console.log('  - address:', client.address);
          console.log('  - Tous les champs:', client);
        });
      }
    } else {
      console.log('❌ Erreur API:', response.status);
    }
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
};

testAdminAPI();
