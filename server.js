import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import stripeWebhook from './stripeWebhook.js';
import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des variables d'environnement en premier
dotenv.config();

// === Configuration de la base de données PostgreSQL ===
console.log(`🐘 Configuration PostgreSQL...`);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/dsparfum',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion et initialisation des tables
async function initializeDatabase() {
  try {
    console.log('🔗 Connexion à PostgreSQL...');
    
    // Créer la table clients si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Table clients PostgreSQL créée');
    
    // Migration : Ajouter les colonnes manquantes
    const columnsToAdd = [
      { name: 'address', type: 'TEXT' },
      { name: 'subject', type: 'TEXT' },
      { name: 'message', type: 'TEXT' },
      { name: 'paymentmethod', type: 'TEXT' },
      { name: 'source', type: 'TEXT DEFAULT \'contact_form\'' },
      { name: 'cart_data', type: 'TEXT' },
      { name: 'total_amount', type: 'DECIMAL DEFAULT 0' },
      { name: 'promo_code', type: 'TEXT' },
      { name: 'order_id', type: 'TEXT' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    console.log('🔄 Migration des colonnes...');
    for (const column of columnsToAdd) {
      try {
        await pool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`);
        console.log(`✅ Colonne ${column.name} ajoutée`);
      } catch (err) {
        // Ignorer si la colonne existe déjà
        if (!err.message.includes('already exists')) {
          console.log(`⚠️  Erreur colonne ${column.name}:`, err.message);
        }
      }
    }
    
    // Compter les clients existants
    const result = await pool.query('SELECT COUNT(*) as count FROM clients');
    console.log(`📊 Base de données initialisée - ${result.rows[0].count} clients enregistrés`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

// Initialiser la base de données au démarrage
await initializeDatabase();

// === Configuration Express ===
const app = express();
const port = process.env.PORT || 10000;

// === Configuration Stripe ===
let stripe;
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe configuré');
} catch (error) {
  console.error('❌ Erreur configuration Stripe:', error);
}

// === Middleware ===
app.use(cors({
  origin: ['https://dsparfum.fr', 'https://www.dsparfum.fr', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
}));

// Middleware pour les webhooks Stripe (avant express.json())
app.use('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === Middleware de logging ===
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// === Route de test ===
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ D&S Parfum Backend PostgreSQL actif !', 
    version: '2.0.0',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString() 
  });
});

// === Route de santé ===
app.get('/health', async (req, res) => {
  try {
    // Test de connexion PostgreSQL
    const result = await pool.query('SELECT NOW() as server_time, COUNT(*) as client_count FROM clients');
    
    res.json({
      status: 'healthy',
      database: 'PostgreSQL connected',
      server_time: result.rows[0].server_time,
      clients_count: result.rows[0].client_count,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// === Route de contact PostgreSQL ===
app.post('/api/contact', async (req, res) => {
  console.log('📨 Nouveau contact reçu:', req.body);
  
  try {
    const { 
      name, 
      email, 
      phone = '', 
      address = '', 
      subject = '', 
      message = '', 
      paymentMethod = '',
      cart = [], 
      total = 0, 
      promo = '' 
    } = req.body;
    
    // Validation des données requises
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nom, email et message sont requis' });
    }
    
    // Préparer les données pour PostgreSQL
    const cartData = Array.isArray(cart) ? JSON.stringify(cart) : '';
    const totalAmount = parseFloat(total) || 0;
    
    const query = `
      INSERT INTO clients (name, email, phone, address, subject, message, paymentmethod, cart_data, total_amount, promo_code, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      name,
      email,
      phone,
      address,
      subject,
      message,
      paymentMethod,
      cartData,
      totalAmount,
      promo,
      'contact_form'
    ];
    
    const result = await pool.query(query, values);
    const newClient = result.rows[0];
    
    console.log('✅ Client enregistré PostgreSQL:', newClient);
    
    res.json({
      success: true,
      message: 'Message envoyé avec succès !',
      clientId: newClient.id,
      data: newClient
    });
    
  } catch (error) {
    console.error('❌ Erreur enregistrement contact PostgreSQL:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
});

// === Routes Admin PostgreSQL ===
app.get('/admin', (req, res) => {
  try {
    const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
    res.send(adminHtml);
  } catch (error) {
    console.error('❌ Erreur lecture admin.html:', error);
    res.status(500).send('Erreur chargement interface admin');
  }
});

// Route alias pour compatibilité frontend
app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    const clients = result.rows;
    
    console.log(`📊 ${clients.length} clients récupérés de PostgreSQL`);
    res.json(clients);
    
  } catch (error) {
    console.error('❌ Erreur récupération clients PostgreSQL:', error);
    res.status(500).json({ error: 'Erreur récupération des clients' });
  }
});

app.get('/api/admin/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    const clients = result.rows;
    
    console.log(`📊 ${clients.length} clients récupérés de PostgreSQL`);
    res.json(clients);
    
  } catch (error) {
    console.error('❌ Erreur récupération clients PostgreSQL:', error);
    res.status(500).json({ error: 'Erreur récupération des clients' });
  }
});

// Route POST alias pour compatibilité frontend (commandes)
app.post('/api/clients', async (req, res) => {
  console.log('📦 Nouvelle commande reçue via /api/clients:', req.body);
  
  try {
    const { 
      name, 
      email, 
      phone = '', 
      address = '', 
      subject = '', 
      message = '', 
      paymentMethod = '',
      cart = [], 
      total = 0, 
      promo = '' 
    } = req.body;
    
    // Validation des données requises
    if (!name || !email) {
      return res.status(400).json({ error: 'Nom et email sont requis' });
    }
    
    // Préparer les données pour PostgreSQL
    const cartData = Array.isArray(cart) ? JSON.stringify(cart) : '';
    const totalAmount = parseFloat(total) || 0;
    
    const query = `
      INSERT INTO clients (name, email, phone, address, subject, message, paymentmethod, cart_data, total_amount, promo_code, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      name,
      email,
      phone,
      address,
      subject || 'Nouvelle commande',
      message || 'Commande passée via le panier',
      paymentMethod,
      cartData,
      totalAmount,
      promo,
      'cart_order'
    ];
    
    const result = await pool.query(query, values);
    const newClient = result.rows[0];
    
    console.log('✅ Commande enregistrée PostgreSQL:', newClient);
    
    res.json({
      success: true,
      message: 'Commande enregistrée avec succès !',
      clientId: newClient.id,
      data: newClient
    });
    
  } catch (error) {
    console.error('❌ Erreur enregistrement commande PostgreSQL:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
});

// Modifier un client
app.put('/api/admin/clients/:id', async (req, res) => {
  const clientId = req.params.id;
  const { name, email, phone, address, subject, message, total_amount, promo_code } = req.body;
  
  try {
    const query = `
      UPDATE clients 
      SET name = $1, email = $2, phone = $3, address = $4, subject = $5, 
          message = $6, total_amount = $7, promo_code = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [name, email, phone, address, subject, message, total_amount, promo_code, clientId];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    console.log('✅ Client modifié PostgreSQL:', result.rows[0]);
    res.json({ success: true, client: result.rows[0] });
    
  } catch (error) {
    console.error('❌ Erreur modification client PostgreSQL:', error);
    res.status(500).json({ error: 'Erreur modification du client' });
  }
});

// Supprimer un client
app.delete('/api/admin/clients/:id', async (req, res) => {
  const clientId = req.params.id;
  
  try {
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [clientId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    console.log('🗑️ Client supprimé PostgreSQL:', result.rows[0]);
    res.json({ success: true, message: 'Client supprimé avec succès' });
    
  } catch (error) {
    console.error('❌ Erreur suppression client PostgreSQL:', error);
    res.status(500).json({ error: 'Erreur suppression du client' });
  }
});

// Rechercher des clients
app.get('/api/admin/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Paramètre de recherche requis' });
  }
  
  try {
    const query = `
      SELECT * FROM clients 
      WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 OR subject ILIKE $1 OR message ILIKE $1
      ORDER BY created_at DESC
    `;
    
    const searchTerm = `%${q}%`;
    const result = await pool.query(query, [searchTerm]);
    
    console.log(`🔍 Recherche "${q}": ${result.rows.length} résultats`);
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Erreur recherche PostgreSQL:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// === Routes Stripe PostgreSQL ===
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'eur', metadata = {} } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log('💳 Payment Intent créé:', paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
    
  } catch (error) {
    console.error('❌ Erreur création Payment Intent:', error);
    res.status(500).json({ error: 'Erreur création du paiement' });
  }
});

// === Route de statistiques PostgreSQL ===
app.get('/api/admin/stats', async (req, res) => {
  try {
    // Statistiques générales
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM clients');
    const totalClients = parseInt(totalResult.rows[0].total);
    
    // Clients récents (dernières 24h)
    const recentResult = await pool.query(
      'SELECT COUNT(*) as recent FROM clients WHERE created_at > NOW() - INTERVAL \'24 hours\''
    );
    const recentClients = parseInt(recentResult.rows[0].recent);
    
    // Chiffre d'affaires total
    const revenueResult = await pool.query('SELECT SUM(total_amount) as revenue FROM clients WHERE total_amount > 0');
    const totalRevenue = parseFloat(revenueResult.rows[0].revenue) || 0;
    
    // Clients par source
    const sourceResult = await pool.query(
      'SELECT source, COUNT(*) as count FROM clients GROUP BY source ORDER BY count DESC'
    );
    const clientsBySource = sourceResult.rows;
    
    const stats = {
      totalClients,
      recentClients,
      totalRevenue: totalRevenue.toFixed(2),
      clientsBySource,
      lastUpdate: new Date().toISOString()
    };
    
    console.log('📊 Statistiques générées:', stats);
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Erreur génération statistiques PostgreSQL:', error);
    res.status(500).json({ error: 'Erreur génération des statistiques' });
  }
});

// === Route backup PostgreSQL ===
app.get('/api/admin/backup', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    const clients = result.rows;
    
    const backupData = {
      exportDate: new Date().toISOString(),
      totalClients: clients.length,
      clients: clients
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="dsparfum_backup_${new Date().toISOString().split('T')[0]}.json"`);
    res.json(backupData);
    
    console.log(`💾 Backup généré: ${clients.length} clients`);
    
  } catch (error) {
    console.error('❌ Erreur génération backup PostgreSQL:', error);
    res.status(500).json({ error: 'Erreur génération du backup' });
  }
});

// === Route de test compteur PostgreSQL ===
app.get('/api/visit-count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM clients');
    const count = parseInt(result.rows[0].count);
    
    res.json({ count });
  } catch (error) {
    console.error('❌ Erreur comptage visites PostgreSQL:', error);
    res.status(500).json({ error: 'Erreur comptage des visites' });
  }
});

// === Middleware de gestion d'erreurs ===
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: err.message 
  });
});

// === Démarrage du serveur ===
app.listen(port, () => {
  console.log(`🚀 Serveur D&S Parfum PostgreSQL démarré sur le port ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log(`🐘 Base de données: PostgreSQL`);
  console.log(`⏰ Démarrage: ${new Date().toISOString()}`);
});

// === Gestion propre de l'arrêt ===
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await pool.end();
  console.log('🐘 Connexions PostgreSQL fermées');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Signal SIGTERM reçu, arrêt du serveur...');
  await pool.end();
  console.log('🐘 Connexions PostgreSQL fermées');
  process.exit(0);
});
