// Migration pour ajouter les colonnes manquantes à la table clients
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/dsparfum',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateDatabase() {
  try {
    console.log('🔄 Début de la migration...');
    
    // Vérifier la structure actuelle
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colonnes actuelles:', tableInfo.rows);
    
    // Ajouter les colonnes manquantes si elles n'existent pas
    const columnsToAdd = [
      { name: 'address', type: 'TEXT' },
      { name: 'paymentmethod', type: 'TEXT' },
      { name: 'source', type: 'TEXT DEFAULT \'contact_form\'' },
      { name: 'cart_data', type: 'TEXT' },
      { name: 'total_amount', type: 'DECIMAL DEFAULT 0' },
      { name: 'promo_code', type: 'TEXT' },
      { name: 'order_id', type: 'TEXT' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    for (const column of columnsToAdd) {
      try {
        await pool.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`);
        console.log(`✅ Colonne ${column.name} ajoutée/vérifiée`);
      } catch (err) {
        console.log(`⚠️  Colonne ${column.name} existe déjà ou erreur:`, err.message);
      }
    }
    
    // Vérifier la structure finale
    const finalTableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `);
    
    console.log('🎯 Structure finale de la table:');
    finalTableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });
    
    console.log('✅ Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur migration:', error);
  } finally {
    await pool.end();
  }
}

migrateDatabase();
