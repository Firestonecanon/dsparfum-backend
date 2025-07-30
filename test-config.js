// Test simple de configuration
console.log('🧪 Test de configuration...');

// Test des variables d'environnement
import dotenv from 'dotenv';
dotenv.config();

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL présente:', !!process.env.DATABASE_URL);

// Test de base sans connexion DB
console.log('✅ Configuration chargée avec succès');
