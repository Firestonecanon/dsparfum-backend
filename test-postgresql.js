// Test PostgreSQL pour D&S Parfum
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

console.log('🐘 Test de connexion PostgreSQL...\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    // Test de connexion
    const client = await pool.connect();
    console.log('✅ Connexion PostgreSQL réussie');
    
    // Test de création de table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        subject TEXT,
        message TEXT,
        paymentmethod TEXT,
        source TEXT DEFAULT 'contact_form',
        cart_data TEXT,
        total_amount DECIMAL DEFAULT 0,
        promo_code TEXT,
        order_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table clients créée');
    
    // Test d'insertion
    const result = await client.query(`
      INSERT INTO clients (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING id
    `, ['Test PostgreSQL', 'test@postgresql.com', 'Migration réussie']);
    
    console.log('✅ Client test créé avec ID:', result.rows[0].id);
    
    // Test de lecture
    const clients = await client.query('SELECT COUNT(*) as total FROM clients');
    console.log('✅ Total clients:', clients.rows[0].total);
    
    client.release();
    console.log('\n🎉 PostgreSQL opérationnel !');
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    
    if (err.message.includes('does not exist')) {
      console.log('\n📋 ACTION REQUISE:');
      console.log('1. Aller sur render.com');
      console.log('2. Créer une nouvelle PostgreSQL Database');
      console.log('3. Copier la DATABASE_URL dans le .env');
      console.log('4. Relancer ce test');
    }
  } finally {
    await pool.end();
  }
}

testConnection();
