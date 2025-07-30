// Serveur simple sans base de données pour test
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Route de test simple
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Serveur de test actif !',
    timestamp: new Date().toISOString()
  });
});

// Route contact simplifiée (sans base de données)
app.post('/api/contact', (req, res) => {
  console.log('📨 Contact reçu:', req.body);
  
  // Simulation de traitement
  res.json({
    success: true,
    message: 'Contact reçu avec succès (mode test)',
    data: req.body
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur de test démarré sur http://localhost:${port}`);
  console.log(`📡 Test: http://localhost:${port}/api/test`);
});

console.log('🔧 Serveur en mode test - sans base de données');
