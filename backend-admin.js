import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import cors from 'cors';
import { config } from 'dotenv';
import fs from 'fs';

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chargement des variables d'environnement
config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚪 Port configuré: ${PORT}`);

// Configuration CORS pour production et développement
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'https://votre-frontend.onrender.com', // À remplacer par votre URL Render
  'https://dsparfum-backend-go.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Servir les fichiers statiques du build React
app.use(express.static(path.join(__dirname, 'dist')));

// Route pour l'interface admin
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>D&S Parfum - Admin</title>
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .auth-form { max-width: 400px; margin: 100px auto; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .admin-panel { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .btn { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #0056b3; }
        .form-group { margin: 15px 0; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .clients-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .clients-table th, .clients-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .clients-table th { background: #f8f9fa; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .error { color: red; margin: 10px 0; }
        .success { color: green; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div id="admin-root"></div>
      
      <script type="text/babel">
        const { useState, useEffect } = React;
        
        const API_BASE_URL = '${process.env.NODE_ENV === 'production' ? 'https://dsparfum-backend-go.onrender.com' : 'http://localhost:3001'}';
        
        function AdminApp() {
          const [isAuthenticated, setIsAuthenticated] = useState(false);
          const [password, setPassword] = useState('');
          const [clients, setClients] = useState([]);
          const [stats, setStats] = useState({});
          const [error, setError] = useState('');
          const [loading, setLoading] = useState(false);
          
          const authenticate = () => {
            if (password === 'Sam230385bs') {
              setIsAuthenticated(true);
              setError('');
              loadData();
            } else {
              setError('Mot de passe incorrect');
            }
          };
          
          const loadData = async () => {
            setLoading(true);
            try {
              const [clientsRes, statsRes] = await Promise.all([
                fetch(\`\${API_BASE_URL}/api/admin/clients\`),
                fetch(\`\${API_BASE_URL}/api/health\`)
              ]);
              
              if (clientsRes.ok) {
                const clientsData = await clientsRes.json();
                setClients(clientsData.clients || []);
              }
              
              if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
              }
            } catch (err) {
              setError('Erreur de connexion à l\\'API');
            }
            setLoading(false);
          };
          
          if (!isAuthenticated) {
            return (
              <div className="auth-form">
                <h2>Connexion Admin</h2>
                <div className="form-group">
                  <label>Mot de passe :</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <button className="btn" onClick={authenticate}>Se connecter</button>
              </div>
            );
          }
          
          return (
            <div className="container">
              <h1>D&S Parfum - Administration</h1>
              
              <div className="stats">
                <div className="stat-card">
                  <h3>Clients Total</h3>
                  <p style={{fontSize: '2em', color: '#007bff'}}>{clients.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Base de données</h3>
                  <p style={{color: 'green'}}>✅ Connectée</p>
                </div>
                <div className="stat-card">
                  <h3>API Status</h3>
                  <p style={{color: stats.status === 'ok' ? 'green' : 'red'}}>
                    {stats.status === 'ok' ? '✅ Opérationnelle' : '❌ Erreur'}
                  </p>
                </div>
              </div>
              
              <div className="admin-panel">
                <h2>Clients Enregistrés ({clients.length})</h2>
                {loading && <p>Chargement...</p>}
                {clients.length > 0 ? (
                  <table className="clients-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Source</th>
                        <th>Date création</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map(client => (
                        <tr key={client.id}>
                          <td>{client.id}</td>
                          <td>{client.name || 'N/A'}</td>
                          <td>{client.email || 'N/A'}</td>
                          <td>{client.phone || 'N/A'}</td>
                          <td>{client.source || 'manuel'}</td>
                          <td>{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Aucun client enregistré pour le moment.</p>
                )}
                
                <button className="btn" onClick={loadData}>
                  🔄 Actualiser
                </button>
              </div>
            </div>
          );
        }
        
        ReactDOM.render(<AdminApp />, document.getElementById('admin-root'));
      </script>
    </body>
    </html>
  `);
});

// Base de données SQLite
const dbPath = path.join(__dirname, 'data', 'clients.db');
console.log(`📂 Utilisation de la base de données: ${dbPath}`);

// Créer le répertoire data s'il n'existe pas
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialisation de la base de données
console.log('=== D&S Parfum Admin API ===');
console.log(`🚀 API démarrée sur le port ${PORT}`);
console.log(`📡 API locale: http://localhost:${PORT}/api`);
console.log(`💾 Base de données: ${dbPath}`);
console.log('============================');

// Créer la table clients si elle n'existe pas
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    source TEXT DEFAULT 'manual',
    notes TEXT,
    orderData TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Ajouter les colonnes manquantes si elles n'existent pas (migration)
try {
  db.exec(`ALTER TABLE clients ADD COLUMN notes TEXT`);
} catch (e) {
  // La colonne existe déjà
}

try {
  db.exec(`ALTER TABLE clients ADD COLUMN orderData TEXT`);
} catch (e) {
  // La colonne existe déjà
}

console.log('✅ Base de données connectée');
console.log('✅ Table clients créée ou existante');

// Routes API pour l'administration
app.get('/api/admin/clients', (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM clients ORDER BY createdAt DESC').all();
    console.log(`📊 ${clients.length} clients récupérés`);
    res.json({ clients });
  } catch (error) {
    console.error('❌ Erreur récupération clients:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/admin/clients', (req, res) => {
  try {
    const { name, email, phone, source = 'manual', notes } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Nom et email requis' });
    }

    const stmt = db.prepare(`
      INSERT INTO clients (name, email, phone, source, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, email, phone, source, notes);
    
    console.log(`✅ Nouveau client ajouté: ${name} (${email})`);
    res.json({ id: result.lastInsertRowid, message: 'Client ajouté avec succès' });
  } catch (error) {
    console.error('❌ Erreur ajout client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/admin/clients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, source, notes } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Nom et email requis' });
    }

    const stmt = db.prepare(`
      UPDATE clients 
      SET name = ?, email = ?, phone = ?, source = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(name, email, phone, source, notes, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    console.log(`✅ Client modifié: ${name} (ID: ${id})`);
    res.json({ message: 'Client modifié avec succès' });
  } catch (error) {
    console.error('❌ Erreur modification client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/admin/clients/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM clients WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    console.log(`🗑️ Client supprimé (ID: ${id})`);
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/export', (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM clients ORDER BY createdAt DESC').all();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="clients_${new Date().toISOString().split('T')[0]}.json"`);
    
    console.log(`📥 Export de ${clients.length} clients`);
    res.json(clients);
  } catch (error) {
    console.error('❌ Erreur export:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour enregistrer les contacts depuis le formulaire
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, message, address, paymentMethod, subject } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Nom et email requis' });
    }

    const orderData = JSON.stringify({
      message,
      address,
      paymentMethod,
      subject
    });

    const stmt = db.prepare(`
      INSERT INTO clients (name, email, phone, source, notes, orderData)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, email, phone, 'contact', message, orderData);
    
    console.log(`📧 Nouveau contact: ${name} (${email})`);
    res.json({ id: result.lastInsertRowid, message: 'Contact enregistré' });
  } catch (error) {
    console.error('❌ Erreur enregistrement contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour ajouter un client depuis Stripe (webhook)
export const addClientFromStripe = (session, lineItems = []) => {
  try {
    const name = session.customer_details?.name || session.shipping?.name || 'Client Stripe';
    const email = session.customer_email || '';
    const phone = session.customer_details?.phone || '';
    
    // Construire les détails de la commande
    const orderDetails = {
      sessionId: session.id,
      amount: session.amount_total / 100,
      currency: session.currency,
      status: session.payment_status,
      shipping: session.shipping,
      lineItems: lineItems.map(item => ({
        name: item.price?.product?.name || item.description,
        quantity: item.quantity,
        amount: item.amount_total / 100
      }))
    };

    const notes = `Commande Stripe - ${orderDetails.amount}€ - Session: ${session.id}`;
    const orderData = JSON.stringify(orderDetails);

    const stmt = db.prepare(`
      INSERT INTO clients (name, email, phone, source, notes, orderData)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, email, phone, 'stripe', notes, orderData);
    
    console.log(`🛒 Client Stripe ajouté: ${name} (${email}) - ${orderDetails.amount}€`);
    return { id: result.lastInsertRowid, success: true };
  } catch (error) {
    console.error('❌ Erreur ajout client Stripe:', error);
    return { success: false, error: error.message };
  }
};

// Route webhook Stripe
app.post('/webhook/stripe', express.json(), (req, res) => {
  try {
    const event = req.body;
    
    console.log(`📡 Webhook Stripe reçu: ${event.type}`);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const result = addClientFromStripe(session, []);
      
      if (result.success) {
        console.log(`✅ Client Stripe enregistré avec succès (ID: ${result.id})`);
      } else {
        console.error(`❌ Erreur enregistrement client Stripe: ${result.error}`);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur webhook Stripe:', error);
    res.status(400).json({ error: 'Erreur traitement webhook' });
  }
});

// Route de santé
app.get('/api/health', (req, res) => {
  const clientCount = db.prepare('SELECT COUNT(*) as count FROM clients').get();
  res.json({ 
    status: 'OK', 
    clients: clientCount.count,
    database: dbPath,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Route de diagnostic pour Render
app.get('/api/debug', (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM clients LIMIT 5').all();
    res.json({
      status: 'DEBUG OK',
      environment: process.env.NODE_ENV,
      port: PORT,
      timestamp: new Date().toISOString(),
      database: {
        path: dbPath,
        exists: fs.existsSync(dbPath),
        clientCount: clients.length
      },
      sampleClients: clients
    });
  } catch (error) {
    res.status(500).json({
      status: 'DEBUG ERROR',
      error: error.message,
      stack: error.stack
    });
  }
});

// Route racine pour vérifier que le serveur répond
app.get('/', (req, res) => {
  res.json({
    message: 'D&S Parfum Admin API',
    status: 'Opérationnel',
    endpoints: ['/api/health', '/api/debug', '/api/admin/clients']
  });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  const clientCount = db.prepare('SELECT COUNT(*) as count FROM clients').get();
  console.log(`✅ Base de données OK - ${clientCount.count} clients enregistrés`);
  console.log(`🌐 Serveur accessible sur http://0.0.0.0:${PORT}`);
  console.log(`📡 API endpoints disponibles:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/admin/clients`);
  console.log(`   - POST /api/admin/clients`);
  console.log(`   - POST /webhook/stripe`);
  console.log(`   - POST /api/contact`);
});

export default app;
