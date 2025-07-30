// SERVEUR ULTRA-SIMPLE - Version qui marche à coup sûr
const http = require('http');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
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
        console.log('📨 Contact reçu:', data);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Contact reçu avec succès!',
          data: data
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Données invalides' }));
      }
    });
    return;
  }
  
  // API Test
  if (req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Serveur simple actif!',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end('Not Found');
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log('🚀 SERVEUR SIMPLE DÉMARRÉ !');
  console.log(`📡 Port: ${PORT}`);
  console.log(`✅ Test: http://localhost:${PORT}/api/test`);
  console.log('');
  console.log('🎯 Maintenant testez votre formulaire de contact !');
});

console.log('⚡ Démarrage du serveur simple...');
