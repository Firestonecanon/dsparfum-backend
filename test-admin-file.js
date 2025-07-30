// Test pour récupérer le fichier admin.html directement depuis Render
const testAdminFile = async () => {
  try {
    const response = await fetch('https://api.dsparfum.fr/admin');
    const html = await response.text();
    
    // Chercher si "Adresse" est dans le HTML
    const hasAdresse = html.includes('<th>Adresse</th>');
    console.log('🔍 HTML contient "Adresse":', hasAdresse);
    
    // Chercher les en-têtes de colonnes
    const thMatches = html.match(/<th[^>]*>([^<]+)<\/th>/g);
    if (thMatches) {
      console.log('📋 Colonnes trouvées:');
      thMatches.forEach((th, index) => {
        const text = th.replace(/<[^>]+>/g, '');
        console.log(`  ${index + 1}. ${text}`);
      });
    }
    
    // Chercher notre timestamp
    const hasTimestamp = html.includes('Update 2025-07-30');
    console.log('⏰ Timestamp 2025-07-30 présent:', hasTimestamp);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

testAdminFile();
