import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import stripeWebhook from './stripeWebhook.js';
import sqlite3pkg from 'sqlite3';
const sqlite3 = sqlite3pkg.verbose();
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des variables d'environnement en premier
dotenv.config();

// === Configuration de la base de données SQLite ===
const dbPath = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'clients.db')  // Chemin pour Render
  : path.join(process.cwd(), 'data', 'clients.db'); // Chemin local pour développement

const dbDir = path.dirname(dbPath);

// En développement, on crée le dossier data si nécessaire
if (process.env.NODE_ENV !== 'production') {
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`✅ Dossier de données créé: ${dbDir}`);
    }
  } catch (err) {
    console.warn(`⚠️ Note: ${err.message}`);
  }
}

// Log du chemin de la base de données
console.log(`📂 Utilisation de la base de données: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err);
    console.error('Détails:', err.message);
    console.error('Chemin DB:', dbPath);
    return;
  }
  console.log(`✅ Base de données connectée: ${dbPath}`);
  
  // Activer les foreign keys et le mode WAL pour de meilleures performances
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');
});

const app = express();

// Configuration CORS plus permissive
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://dsparfum.fr',
      'https://www.dsparfum.fr',
      'https://admin.dsparfum.fr',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
      'https://dsparfum.onrender.com',
      'https://ds-parfum.onrender.com',
      'https://ds-parfum-admin.onrender.com'
    ];
    
    // En développement, accepter toutes les origines
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
      return;
    }
    
    // En production, vérifier l'origine
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️ Origine bloquée par CORS:', origin);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Ajout de headers de sécurité
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json({ limit: '10mb' }));

// Création de la table clients
// Fonction pour créer ou mettre à jour la table clients
const setupDatabase = () => {
  return new Promise((resolve, reject) => {
    // Créer la table si elle n'existe pas
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      subject TEXT,
      message TEXT,
      cart_data TEXT,
      total REAL,
      promo TEXT,
      paymentMethod TEXT,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('❌ Erreur création table clients:', err);
        reject(err);
        return;
      }
      console.log('✅ Table clients créée ou existante');
      resolve();
    });
  });
};

// Exécuter la configuration de la base de données
setupDatabase()
  .then(() => {
    // Compter le nombre de clients
    db.get('SELECT COUNT(*) as count FROM clients', (err, result) => {
      if (err) {
        console.error('❌ Erreur comptage clients:', err);
      } else {
        console.log(`✅ Base de données OK - ${result.count} clients enregistrés`);
      }
    });
  })
  .catch(err => {
    console.error('❌ Erreur configuration base de données:', err);
  });

// Route pour enregistrer un client
app.post('/api/clients', (req, res) => {
  console.log('📦 Réception données client:', JSON.stringify(req.body, null, 2));
  
  try {
    const {
      name = '',
      email = '',
      phone = '',
      address = '',
      subject = '',
      message = '',
      paymentMethod = '',
      source = '',
      orderId = '',
      cart = [],
      total = '',
      promo = null,
      timestamp = Date.now()
    } = req.body;

    let cleanTotal = 0;
    if (typeof total === 'string') {
      cleanTotal = parseFloat(total.replace('€', '').trim());
    } else if (typeof total === 'number') {
      cleanTotal = total;
    }

    const cleanCart = cart.map(item => ({
      ...item,
      price: parseFloat(item.price.toString().replace('€', '').trim())
    }));

    const fullMessage = `
      ${message}
      Commande #${orderId}
      Total: ${cleanTotal}€
      Promo: ${promo || 'Aucune'}
      Date: ${new Date(timestamp).toLocaleString('fr-FR')}
    `.trim();

    console.log('💾 Sauvegarde des données nettoyées:', {
      name, email, phone, address, 
      cart: cleanCart,
      total: cleanTotal
    });

    const query = `INSERT INTO clients (
      name, email, phone, address, subject, message, 
      cart_data, total, promo, paymentMethod, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const cartData = Array.isArray(cleanCart) ? JSON.stringify(cleanCart) : null;
    
    const params = [
      name, 
      email, 
      phone, 
      address, 
      subject || `Commande du ${new Date().toLocaleDateString('fr-FR')}`,
      fullMessage,
      cartData,
      cleanTotal,
      promo,
      paymentMethod || 'website',
      source || 'cart'
    ];

    db.run(query, params, function(err) {
      if (err) {
        console.error('❌ Erreur SQL:', err);
        return res.status(500).json({ 
          success: false, 
          error: err.message,
          details: 'Erreur lors de l\'enregistrement en base de données'
        });
      }

      const insertId = this.lastID;
      console.log('✅ Client enregistré avec succès, ID:', insertId);

      db.get('SELECT * FROM clients WHERE id = ?', [insertId], (err, row) => {
        if (err) {
          console.error('❌ Erreur vérification insertion:', err);
          return res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la vérification de l\'insertion'
          });
        }

        if (!row) {
          console.error('❌ Client non trouvé après insertion!');
          return res.status(500).json({ 
            success: false, 
            error: 'Client non trouvé après insertion'
          });
        }

        console.log('✅ Données client vérifiées:', row);
        res.json({ success: true, id: insertId });
      });
    });
  } catch (error) {
    console.error('❌ Erreur traitement:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Erreur lors du traitement des données'
    });
  }
});

  // Route pour lister les clients
app.get('/api/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des clients:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des clients'
      });
    }
    
    // Parser les données du panier pour chaque client
    const processedRows = rows.map(row => {
      const processedRow = { ...row };
      
      if (processedRow.cart_data) {
        try {
          processedRow.cart = JSON.parse(processedRow.cart_data);
        } catch (e) {
          console.error(`❌ Erreur parsing cart_data pour client ${row.id}:`, e);
          processedRow.cart = null;
        }
      } else {
        processedRow.cart = null;
      }
      
      return processedRow;
    });
    
    console.log(`✅ ${processedRows.length} clients récupérés`);
    res.json({ 
      success: true, 
      data: processedRows 
    });
  });
});

// Routes admin pour la gestion des clients
app.get('/api/admin/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des clients:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de la récupération des clients'
      });
    }
    
    // Parser les données du panier pour chaque client
    const processedRows = rows.map(row => {
      const processedRow = { ...row };
      
      if (processedRow.cart_data) {
        try {
          processedRow.cart = JSON.parse(processedRow.cart_data);
        } catch (e) {
          console.error(`❌ Erreur parsing cart_data pour client ${row.id}:`, e);
          processedRow.cart = null;
        }
      } else {
        processedRow.cart = null;
      }
      
      return processedRow;
    });
    
    console.log(`✅ ${processedRows.length} clients récupérés pour admin`);
    res.json({ 
      success: true, 
      clients: processedRows 
    });
  });
});

// Route admin pour créer un nouveau client
app.post('/api/admin/clients', (req, res) => {
  const { name, email, phone, source, notes } = req.body;
  
  const query = `INSERT INTO clients (
    name, email, phone, source, message
  ) VALUES (?, ?, ?, ?, ?)`;
  
  const params = [name, email, phone, source || 'manual', notes || ''];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('❌ Erreur création client admin:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message
      });
    }
    
    console.log('✅ Client créé via admin, ID:', this.lastID);
    res.json({ success: true, id: this.lastID });
  });
});

// Route admin pour modifier un client
app.put('/api/admin/clients/:id', (req, res) => {
  const { name, email, phone, source, notes } = req.body;
  const clientId = req.params.id;
  
  const query = `UPDATE clients SET 
    name = ?, email = ?, phone = ?, source = ?, message = ?
    WHERE id = ?`;
  
  const params = [name, email, phone, source || 'manual', notes || '', clientId];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('❌ Erreur modification client admin:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message
      });
    }
    
    console.log('✅ Client modifié via admin, ID:', clientId);
    res.json({ success: true, id: clientId });
  });
});

// Route admin pour supprimer un client
app.delete('/api/admin/clients/:id', (req, res) => {
  const clientId = req.params.id;
  
  db.run('DELETE FROM clients WHERE id = ?', [clientId], function(err) {
    if (err) {
      console.error('❌ Erreur suppression client admin:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message
      });
    }
    
    console.log('✅ Client supprimé via admin, ID:', clientId);
    res.json({ success: true, deleted: this.changes });
  });
});

// Route admin pour exporter les données
app.get('/api/admin/export', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Erreur export données:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de l\'export'
      });
    }
    
    // Parser les données du panier pour chaque client
    const processedRows = rows.map(row => {
      const processedRow = { ...row };
      
      if (processedRow.cart_data) {
        try {
          processedRow.cart = JSON.parse(processedRow.cart_data);
        } catch (e) {
          console.error(`❌ Erreur parsing cart_data pour client ${row.id}:`, e);
          processedRow.cart = null;
        }
      } else {
        processedRow.cart = null;
      }
      
      return processedRow;
    });
    
    console.log(`✅ Export de ${processedRows.length} clients`);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="clients_${new Date().toISOString().split('T')[0]}.json"`);
    res.json({
      exportDate: new Date().toISOString(),
      totalClients: processedRows.length,
      clients: processedRows
    });
  });
});

// Route pour recevoir les messages de contact
app.post('/api/contact', (req, res) => {
  console.log('📨 Nouveau message de contact reçu:', req.body);
  
  const { name, email, phone, message, address, paymentMethod, subject } = req.body;
  
  // Validation des champs obligatoires
  if (!name || !email || !message) {
    console.log('❌ Champs obligatoires manquants');
    return res.status(400).json({ 
      success: false, 
      error: 'Nom, email et message sont obligatoires' 
    });
  }

  // Insérer le contact dans la base de données
  const contactData = {
    name,
    email,
    phone: phone || null,
    address: address || null,
    subject: subject || 'Contact D&S Parfum',
    message,
    payment_method: paymentMethod || null,
    source: 'contact_form',
    created_at: new Date().toISOString()
  };

  const stmt = db.prepare(`
    INSERT INTO clients (name, email, phone, address, subject, message, paymentMethod, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    contactData.name,
    contactData.email,
    contactData.phone,
    contactData.address,
    contactData.subject,
    contactData.message,
    contactData.payment_method,
    contactData.source,
    contactData.created_at
  ], function(err) {
    if (err) {
      console.error('❌ Erreur insertion contact:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Erreur lors de l\'enregistrement'
      });
    }
    
    console.log('✅ Contact enregistré avec ID:', this.lastID);
    res.json({ 
      success: true, 
      id: this.lastID,
      message: 'Contact enregistré avec succès'
    });
  });

  stmt.finalize();
});

// Route pour supprimer un client
app.delete('/api/clients/:id', (req, res) => {
  const clientId = req.params.id;

  db.run('DELETE FROM clients WHERE id = ?', [clientId], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression du client:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la suppression du client.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client non trouvé.' });
    }

    res.json({ message: 'Client supprimé avec succès.' });
  });
});

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const PORT = process.env.PORT || 3001;

// Stripe webhook
app.use('/api', stripeWebhook);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend D&S Parfum opérationnel! 🌸' });
});

// Route pour créer une session de paiement Stripe
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { cart, customerInfo } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Panier vide ou invalide' });
    }

    if (!customerInfo || !customerInfo.email) {
      return res.status(400).json({ error: 'Email client requis' });
    }

    console.log('🛒 Contenu du panier reçu:', JSON.stringify(cart, null, 2));
    
    const lineItems = cart.map(item => {
      console.log(`📦 Traitement de l'article: ${item.name}`);
      
      const price = parseFloat(item.price);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Prix invalide pour l'article ${item.name}: ${item.price}`);
      }
      
      const productData = {
        name: item.ref || 'Référence inconnue',
        images: item.image ? [item.image] : [],
        description: item.ref ? `Réf: ${item.ref}` : 'Produit D&S Parfum'
      };

      console.log(`📝 Product data pour ${item.name}:`, JSON.stringify(productData, null, 2));

      const lineItem = {
        price_data: {
          currency: 'eur',
          product_data: productData,
          unit_amount: Math.round(price * 100),
        },
        quantity: parseInt(item.quantity) || 1,
      };
      
      console.log(`✨ Line item créé pour ${item.name}:`, JSON.stringify(lineItem, null, 2));
      return lineItem;
    });

    let baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://dsparfum.fr'
      : 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerInfo.email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'],
      },
      metadata: {
        customer_name: customerInfo.name || '',
        customer_phone: customerInfo.phone || '',
        order_source: 'dsparfum_website'
      },
      success_url: `${baseUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?payment=cancelled`,
    });

    console.log('✅ Session Stripe créée:', session.id);
    console.log('💰 Montant total:', lineItems.reduce((sum, item) => sum + (item.price_data.unit_amount * item.quantity), 0) / 100, '€');

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Erreur création session Stripe:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du paiement',
      details: error.message 
    });
  }
});

// Route pour récupérer les détails d'une session de paiement
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json(session);
  } catch (error) {
    console.error('❌ Erreur récupération session:', error);
    res.status(500).json({ error: 'Session introuvable' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('\n=== D&S Parfum Backend ===');
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API locale: http://localhost:${PORT}/api`);
  console.log(`🌐 API production: https://dsparfum-backend-go.onrender.com`);
  console.log(`💾 Base de données: ${dbPath}`);
  console.log(`🔑 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configuré' : '❌ Non configuré'}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================\n');

  db.get('SELECT COUNT(*) as count FROM clients', (err, row) => {
    if (err) {
      console.error('❌ Erreur accès base de données:', err.message);
    } else {
      console.log(`✅ Base de données OK - ${row.count} clients enregistrés`);
    }
  });
});
