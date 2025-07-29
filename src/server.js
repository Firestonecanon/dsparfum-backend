// D&S Parfum - Serveur Admin Principal pour Render
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const stripe = require('stripe');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configuration Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Route pour servir l'interface admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Route pour servir l'application React
app.get('/admin-app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-app.js'));
});

// Initialisation de la base de données
const initDB = async () => {
  try {
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

  } catch (error) {
    console.error('❌ Erreur initialisation DB:', error);
  }
};

// Routes API

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      database: 'Disconnected',
      error: error.message 
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
    console.error('Erreur récupération clients:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les statistiques
app.get('/api/stats', async (req, res) => {
  try {
    const totalClients = await pool.query('SELECT COUNT(*) FROM clients');
    const activeClients = await pool.query('SELECT COUNT(*) FROM clients WHERE status = $1', ['active']);
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
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un nouveau client
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
    console.error('Erreur création client:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email déjà existant' });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// Modifier un client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone, status, source, notes } = req.body;
    
    const result = await pool.query(`
      UPDATE clients 
      SET nom = $1, prenom = $2, email = $3, telephone = $4, 
          status = $5, source = $6, notes = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [nom, prenom, email, telephone, status, source, notes, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur modification client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Webhook Stripe
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Enregistrer la commande
        await pool.query(`
          INSERT INTO commandes (stripe_session_id, montant, status, client_id, produits)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          session.id,
          session.amount_total / 100,
          'completed',
          session.client_reference_id || null,
          JSON.stringify(session.metadata || {})
        ]);

        // Mettre à jour le client si nécessaire
        if (session.customer_email) {
          await pool.query(`
            UPDATE clients 
            SET derniere_commande = CURRENT_TIMESTAMP,
                total_commandes = total_commandes + 1,
                stripe_customer_id = $1
            WHERE email = $2
          `, [session.customer, session.customer_email]);
        }
        
        console.log('✅ Commande enregistrée:', session.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ error: 'Erreur traitement webhook' });
  }
});

// Créer une session de paiement Stripe
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, customer_email, success_url, cancel_url } = req.body;

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: success_url || 'https://dsparfum.fr/success',
      cancel_url: cancel_url || 'https://dsparfum.fr/cancel',
      customer_email: customer_email
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ error: 'Erreur création session' });
  }
});

// Route par défaut
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Démarrage du serveur
const startServer = async () => {
  try {
    await initDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur D&S Parfum démarré sur le port ${PORT}`);
      console.log(`📊 Interface admin: http://localhost:${PORT}/admin`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log(`❤️ Version: Production - Base de données PostgreSQL`);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    process.exit(1);
  }
};

startServer();
