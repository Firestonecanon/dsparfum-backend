// Script d'initialisation de la base de données pour production
import sqlite3pkg from 'sqlite3';
const sqlite3 = sqlite3pkg.verbose();
import fs from 'fs';
import path from 'path';

console.log('🚀 Initialisation de la base de données en production...');

const dbPath = './clients.db';

// Supprimer l'ancienne base si elle existe
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️ Ancienne base supprimée');
}

// Créer une nouvelle base
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur création DB:', err.message);
    process.exit(1);
  }
  console.log('✅ Base de données créée');
});

// Créer la table clients
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      subject TEXT,
      message TEXT,
      paymentMethod TEXT,
      source TEXT DEFAULT 'contact_form',
      cart_data TEXT,
      total_amount REAL DEFAULT 0,
      promo_code TEXT,
      order_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur création table:', err.message);
      process.exit(1);
    }
    console.log('✅ Table clients créée');
  });

  // Insérer les données existantes
  const clients = [
    {
      name: 'Déborah Costanzo',
      email: 'deborah.costanzo@yahoo.fr',
      phone: '0123456789',
      subject: 'Commande D&S Parfum',
      message: 'Commande de parfums premium',
      source: 'contact_form',
      created_at: '2025-07-29T03:19:47.056Z'
    },
    {
      name: 'Samir BELAID',
      email: 'pizzas.tofsof@yahoo.fr',
      phone: '0987654321',
      subject: 'Demande information',
      message: 'Information sur les parfums mixtes',
      source: 'contact_form',
      created_at: '2025-07-29T02:48:10.102Z'
    },
    {
      name: 'Test Fix JSX',
      email: 'test@jsx.com',
      phone: '0123456789',
      subject: 'Contact D&S Parfum',
      message: 'Test après correction JSX',
      source: 'contact_form',
      created_at: '2025-07-29T05:30:00.000Z'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO clients (name, email, phone, subject, message, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  clients.forEach(client => {
    stmt.run([
      client.name,
      client.email,
      client.phone,
      client.subject,
      client.message,
      client.source,
      client.created_at
    ]);
  });

  stmt.finalize();

  // Vérifier les données
  db.all('SELECT COUNT(*) as total FROM clients', (err, rows) => {
    if (err) {
      console.error('❌ Erreur vérification:', err.message);
    } else {
      console.log(`✅ ${rows[0].total} clients initialisés`);
    }
    
    db.close((err) => {
      if (err) {
        console.error('❌ Erreur fermeture DB:', err.message);
      } else {
        console.log('🎉 Base de données initialisée avec succès');
      }
    });
  });
});
