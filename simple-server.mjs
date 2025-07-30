// SERVEUR ULTRA-SIMPLE - Version ES Modules compatible
import http from 'http';

const server = http.createServer((req, res) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  
  // CORS headers COMPLETS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API Contact
  if (req.method === 'POST' && req.url === '/api/contact') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('📧 CONTACT REÇU (ne sera PAS copié dans clients):', {
          prénom: data.firstName,
          nom: data.lastName,
          email: data.email,
          téléphone: data.phone,
          rue: data.street,
          codePostal: data.postalCode,
          ville: data.city,
          message: data.message
        });
        
        // ✅ SÉCURITÉ: Les contacts restent séparés des clients
        console.log('✅ SÉCURITÉ: Contact traité séparément (pas de création client automatique)');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Contact reçu avec succès!'
        }));
      } catch (error) {
        console.error('❌ ERREUR:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Données invalides' 
        }));
      }
    });
    return;
  }

  // API Stripe Checkout (SIMULATION)
  if (req.method === 'POST' && req.url === '/api/create-checkout-session') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('💳 COMMANDE STRIPE REÇUE:', {
          panier: data.cart,
          total: data.total + '€',
          client: data.customerInfo
        });
        
        // SIMULATION : Redirection vers succès après 2 secondes
        setTimeout(() => {
          console.log('✅ Paiement simulé réussi !');
        }, 2000);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          url: `http://localhost:5173/?payment=success&session_id=sim_${Date.now()}`
        }));
      } catch (error) {
        console.error('❌ ERREUR STRIPE:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Erreur paiement' 
        }));
      }
    });
    return;
  }

  // API Clients (SIMULATION)
  if (req.method === 'POST' && req.url === '/api/clients') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('👤 CLIENT CRÉÉ (distinct des contacts):', {
          nom: `${data.firstName} ${data.lastName}`,
          email: data.email,
          téléphone: data.phone,
          adresse: `${data.street}, ${data.postalCode} ${data.city}`,
          panier: data.cart || 'Aucun',
          total: data.total ? data.total + '€' : 'N/A'
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true,
          message: 'Client créé avec succès!',
          clientId: `client_${Date.now()}`
        }));
      } catch (error) {
        console.error('❌ ERREUR CLIENT:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false,
          error: 'Erreur création client' 
        }));
      }
    });
    return;
  }
  
  // Test endpoint
  if (req.method === 'GET' && req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK', 
      message: 'Serveur simple fonctionne!' 
    }));
    return;
  }
  
  // 404 pour tout le reste
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route non trouvée' }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log('🚀 SERVEUR SIMPLE DÉMARRÉ');
  console.log(`🌐 Port: ${PORT}`);
  console.log('📝 Endpoints disponibles:');
  console.log('   POST /api/contact - Formulaire de contact');
  console.log('   POST /api/clients - Création de clients');
  console.log('   POST /api/create-checkout-session - Paiement Stripe (simulé)');
  console.log('   GET  /api/test    - Test de fonctionnement');
  console.log('');
  console.log('✅ Prêt à recevoir TOUT (formulaires, clients, paiements) !');
});
