// Configuration des URLs d'API selon l'environnement
const API_CONFIG = {
  // En développement, utiliser le backend local
  development: {
    BASE_URL: 'http://localhost:3001',
    API_URL: 'http://localhost:3001/api'
  },
  // En production, utiliser votre domaine personnalisé
  production: {
    BASE_URL: 'https://api.dsparfum.fr',
    API_URL: 'https://api.dsparfum.fr/api'
  }
};

// Détecter l'environnement
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
const currentEnv = isDevelopment ? 'development' : 'production';

// Export des URLs courantes
export const API_BASE_URL = API_CONFIG[currentEnv].BASE_URL;
export const API_URL = API_CONFIG[currentEnv].API_URL;

// URLs spécifiques
export const CLIENTS_URL = `${API_URL}/clients`;
export const ADMIN_CLIENTS_URL = `${API_URL}/admin/clients`;
export const ADMIN_EXPORT_URL = `${API_URL}/admin/export`;
export const CHECKOUT_URL = `${API_URL}/create-checkout-session`;

// Log pour debug
if (isDevelopment) {
  console.log('🔧 Mode développement - Backend local:', API_BASE_URL);
  console.log('🔗 URLs configurées:');
  console.log('  - CLIENTS_URL:', CLIENTS_URL);
  console.log('  - ADMIN_CLIENTS_URL:', ADMIN_CLIENTS_URL);
  console.log('  - ADMIN_EXPORT_URL:', ADMIN_EXPORT_URL);
  console.log('  - CHECKOUT_URL:', CHECKOUT_URL);
} else {
  console.log('🚀 Mode production - Backend Render:', API_BASE_URL);
  console.log('  - CHECKOUT_URL:', CHECKOUT_URL);
}
