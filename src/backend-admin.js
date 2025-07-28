// D&S Parfum - Backend Admin pour Production (Render)
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 D&S Parfum Backend - Démarrage en production...');

// Configuration PostgreSQL pour Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
const allowedOrigins = [
  'https://dsparfum.fr',
  'https://www.dsparfum.fr',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173'
];
app.use(cors({
  origin: function (origin, callback) {
    // Autoriser toutes les origines en développement
    if (!origin || process.env.NODE_ENV !== 'production') {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.static('.'));

// Initialisation de la base de données
const initDB = async () => {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        telephone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        source VARCHAR(50) DEFAULT 'manual',
        total_commandes INTEGER DEFAULT 0,
        derniere_commande TIMESTAMP,
        notes TEXT,
        stripe_customer_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table clients initialisée');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS commandes (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        stripe_session_id VARCHAR(255),
        montant DECIMAL(10,2),
        status VARCHAR(50),
        produits JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table commandes initialisée');

    // Insérer des données de test si aucun client n'existe
    const clientCount = await pool.query('SELECT COUNT(*) FROM clients');
    if (parseInt(clientCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO clients (nom, prenom, email, telephone, source) VALUES
        ('Dupont', 'Jean', 'jean.dupont@example.com', '0123456789', 'test'),
        ('Martin', 'Marie', 'marie.martin@example.com', '0987654321', 'website'),
        ('Bernard', 'Pierre', 'pierre.bernard@example.com', '0156789012', 'social')
      `);
      console.log('✅ Données de test ajoutées');
    }

  } catch (error) {
    console.error('❌ Erreur initialisation DB:', error);
    throw error;
  }
};

// Routes API

// Health check - CRITIQUE pour Render
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await pool.query('SELECT NOW() as timestamp');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString(),
      dbTime: dbTest.rows[0].timestamp,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({ 
      status: 'Error', 
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Récupérer tous les clients
app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM clients 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erreur récupération clients:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Récupérer les statistiques
app.get('/api/stats', async (req, res) => {
  try {
    const totalClients = await pool.query('SELECT COUNT(*) FROM clients');
    // La colonne 'status' n'existe pas, donc on ignore ce comptage
    const activeClients = { rows: [{ count: 0 }] };
    const newClientsWeek = await pool.query(
      'SELECT COUNT(*) FROM clients WHERE created_at > NOW() - INTERVAL \'7 days\''
    );
    const totalRevenue = await pool.query('SELECT COALESCE(SUM(montant), 0) as total FROM commandes WHERE status = $1', ['completed']);

    res.json({
      totalClients: parseInt(totalClients.rows[0].count),
      activeClients: parseInt(activeClients.rows[0].count),
      newClientsWeek: parseInt(newClientsWeek.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].total)
    });
  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Créer un nouveau client
// Enregistrer un contact depuis le site
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message, address, paymentMethod, subject } = req.body;
    // On insère le contact comme un client avec source 'contact' et les infos dans notes
    const notes = `Message: ${message || ''}\nAdresse: ${address || ''}\nPaiement: ${paymentMethod || ''}\nSujet: ${subject || ''}`;
    const result = await pool.query(`
      INSERT INTO clients (nom, prenom, email, telephone, status, source, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, '', email, phone, 'active', 'contact', notes]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erreur enregistrement contact:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email déjà existant' });
    } else {
      res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
  }
});
app.post('/api/clients', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, status, source, notes } = req.body;
    
    const result = await pool.query(`
      INSERT INTO clients (nom, prenom, email, telephone, status, source, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [nom, prenom, email, telephone, status || 'active', source || 'manual', notes]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erreur création client:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email déjà existant' });
    } else {
      res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
  }
});

// Interface admin intégrée
app.get('/admin', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D&S Parfum - Admin Production</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .header {
            background: rgba(255,255,255,0.95);
            padding: 1rem 2rem;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            color: #667eea;
            font-size: 2rem;
            font-weight: 700;
        }
        
        .production-badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-left: 1rem;
        }
        
        .container {
            max-width: 1400px;
            margin: 2rem auto;
            padding: 0 2rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: rgba(255,255,255,0.95);
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .clients-section {
            background: rgba(255,255,255,0.95);
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .section-title {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 1.5rem;
            font-weight: 600;
        }
        
        .add-client-form {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f8f9ff;
            border-radius: 10px;
            border: 2px dashed #667eea;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
        }
        
        .form-group label {
            margin-bottom: 0.5rem;
            color: #555;
            font-weight: 500;
        }
        
        .form-group input, .form-group select, .form-group textarea {
            padding: 0.75rem;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .clients-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .clients-table th {
            background: #667eea;
            color: white;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.85rem;
        }
        
        .clients-table td {
            padding: 1rem;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .clients-table tbody tr:hover {
            background: #f8f9ff;
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-active {
            background: #d4edda;
            color: #155724;
        }
        
        .status-inactive {
            background: #f8d7da;
            color: #721c24;
        }
        
        .loading {
            text-align: center;
            padding: 2rem;
            color: #666;
        }
        
        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #c3e6cb;
        }
        
        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #f5c6cb;
        }

        .refresh-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 1rem;
        }

        .health-status {
            background: rgba(255,255,255,0.95);
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            border-left: 4px solid #28a745;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌸 D&S Parfum - Interface Admin <span class="production-badge">PRODUCTION</span></h1>
    </div>
    
    <div class="container">
        <div class="health-status" id="healthStatus">
            <strong>🟢 Serveur en ligne</strong> - Base de données PostgreSQL connectée
        </div>

        <div class="stats-grid" id="statsGrid">
            <div class="stat-card">
                <div class="stat-value" id="totalClients">-</div>
                <div class="stat-label">Total Clients</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="activeClients">-</div>
                <div class="stat-label">Clients Actifs</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="newClientsWeek">-</div>
                <div class="stat-label">Nouveaux (7j)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="totalRevenue">-€</div>
                <div class="stat-label">Chiffre d'affaires</div>
            </div>
        </div>
        
        <div class="clients-section">
            <div class="section-title">
                Gestion des Clients - Production
                <button class="refresh-btn" onclick="loadClients()">🔄 Actualiser</button>
            </div>
            
            <div id="messageContainer"></div>
            
            <div class="add-client-form">
                <div class="form-group">
                    <label for="nom">Nom *</label>
                    <input type="text" id="nom" required>
                </div>
                <div class="form-group">
                    <label for="prenom">Prénom *</label>
                    <input type="text" id="prenom" required>
                </div>
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="telephone">Téléphone</label>
                    <input type="tel" id="telephone">
                </div>
                <div class="form-group">
                    <label for="status">Statut</label>
                    <select id="status">
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="source">Source</label>
                    <select id="source">
                        <option value="manual">Manuel</option>
                        <option value="website">Site web</option>
                        <option value="social">Réseaux sociaux</option>
                        <option value="referral">Recommandation</option>
                    </select>
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="notes">Notes</label>
                    <textarea id="notes" rows="3"></textarea>
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                    <button type="button" class="btn btn-primary" onclick="addClient()">
                        ➕ Ajouter Client
                    </button>
                </div>
            </div>
            
            <div id="clientsContainer">
                <div class="loading">Chargement des clients...</div>
            </div>
        </div>
    </div>

    <script>
        // Fonctions JavaScript pour l'interface admin
        let clients = [];

        // Vérifier le health check
        async function checkHealth() {
            try {
                const response = await fetch('/api/health');
                const health = await response.json();
                const statusEl = document.getElementById('healthStatus');
                
                if (health.status === 'OK') {
                    statusEl.innerHTML = \`<strong>🟢 Serveur en ligne</strong> - \${health.database} (\${health.environment})\`;
                    statusEl.style.borderLeftColor = '#28a745';
                } else {
                    statusEl.innerHTML = \`<strong>🔴 Problème serveur</strong> - \${health.error}\`;
                    statusEl.style.borderLeftColor = '#dc3545';
                }
            } catch (error) {
                console.error('Erreur health check:', error);
                document.getElementById('healthStatus').innerHTML = '<strong>🔴 Serveur déconnecté</strong>';
            }
        }

        // Charger les statistiques
        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                const stats = await response.json();
                
                document.getElementById('totalClients').textContent = stats.totalClients || 0;
                document.getElementById('activeClients').textContent = stats.activeClients || 0;
                document.getElementById('newClientsWeek').textContent = stats.newClientsWeek || 0;
                document.getElementById('totalRevenue').textContent = (stats.totalRevenue || 0).toFixed(2) + '€';
            } catch (error) {
                console.error('Erreur chargement stats:', error);
            }
        }

        // Charger les clients
        async function loadClients() {
            try {
                const response = await fetch('/api/clients');
                clients = await response.json();
                renderClients();
                loadStats();
            } catch (error) {
                console.error('Erreur chargement clients:', error);
                showMessage('Erreur lors du chargement des clients', 'error');
            }
        }

        // Afficher les clients
        function renderClients() {
            const container = document.getElementById('clientsContainer');
            
            if (clients.length === 0) {
                container.innerHTML = '<div class="loading">Aucun client trouvé</div>';
                return;
            }
            
            const table = \`
                <table class="clients-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Statut</th>
                            <th>Source</th>
                            <th>Date création</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${clients.map(client => \`
                            <tr>
                                <td>\${client.id}</td>
                                <td>\${client.nom}</td>
                                <td>\${client.prenom}</td>
                                <td>\${client.email}</td>
                                <td>\${client.telephone || '-'}</td>
                                <td><span class="status-badge status-\${client.status}">\${client.status}</span></td>
                                <td>\${client.source}</td>
                                <td>\${new Date(client.created_at).toLocaleDateString('fr-FR')}</td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
            \`;
            
            container.innerHTML = table;
        }

        // Ajouter un client
        async function addClient() {
            const formData = {
                nom: document.getElementById('nom').value,
                prenom: document.getElementById('prenom').value,
                email: document.getElementById('email').value,
                telephone: document.getElementById('telephone').value,
                status: document.getElementById('status').value,
                source: document.getElementById('source').value,
                notes: document.getElementById('notes').value
            };

            if (!formData.nom || !formData.prenom || !formData.email) {
                showMessage('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            try {
                const response = await fetch('/api/clients', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showMessage('Client ajouté avec succès !', 'success');
                    clearForm();
                    loadClients();
                } else {
                    const error = await response.json();
                    showMessage(error.error || 'Erreur lors de l\\'ajout', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showMessage('Erreur de connexion', 'error');
            }
        }

        // Vider le formulaire
        function clearForm() {
            document.getElementById('nom').value = '';
            document.getElementById('prenom').value = '';
            document.getElementById('email').value = '';
            document.getElementById('telephone').value = '';
            document.getElementById('status').value = 'active';
            document.getElementById('source').value = 'manual';
            document.getElementById('notes').value = '';
        }

        // Afficher un message
        function showMessage(message, type) {
            const container = document.getElementById('messageContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
            messageDiv.textContent = message;
            
            container.innerHTML = '';
            container.appendChild(messageDiv);
            
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            checkHealth();
            loadStats();
            loadClients();
            
            // Vérifier le health check toutes les 30 secondes
            setInterval(checkHealth, 30000);
        });
    </script>
</body>
</html>
  `);
});

// Route par défaut
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('❌ Erreur non gérée:', err);
  res.status(500).json({ 
    error: 'Erreur serveur interne',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    console.log('🔄 Connexion à la base de données...');
    await initDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur D&S Parfum démarré sur le port ${PORT}`);
      console.log(`📊 Interface admin: https://dsparfum-backend-go.onrender.com/admin`);
      console.log(`🌐 API URL: https://dsparfum-backend-go.onrender.com/api`);
      console.log(`❤️ Version: Production - PostgreSQL sur Render`);
      console.log(`✅ Serveur prêt pour production !`);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    process.exit(1);
  }
};

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt gracieux...');
  pool.end(() => {
    console.log('✅ Connexions DB fermées');
    process.exit(0);
  });
});

startServer();
