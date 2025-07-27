const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const config = {
    apiUrl: 'https://dsparfum-backend-go.onrender.com/api',
    backupDir: path.join(__dirname, 'backups'),
    maxBackups: 30, // Garder 30 jours de backups
    endpoints: [
        { path: '/clients', filename: 'clients' },
        { path: '/orders', filename: 'orders' }
    ]
};

// Créer le dossier de backup s'il n'existe pas
if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
}

// Fonction pour télécharger et sauvegarder les données
async function backupEndpoint(endpoint) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `${endpoint.filename}_${date}.json`;
    const filePath = path.join(config.backupDir, filename);

    return new Promise((resolve, reject) => {
        https.get(`${config.apiUrl}${endpoint.path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    // Ajouter des métadonnées au backup
                    const backupData = {
                        timestamp: new Date().toISOString(),
                        source: `${config.apiUrl}${endpoint.path}`,
                        data: JSON.parse(data)
                    };

                    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
                    console.log(`✅ Backup réussi: ${filename}`);
                    resolve(filePath);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

// Fonction pour nettoyer les vieux backups
function cleanOldBackups() {
    const files = fs.readdirSync(config.backupDir);
    const sortedFiles = files.sort((a, b) => {
        return fs.statSync(path.join(config.backupDir, b)).mtime.getTime() - 
               fs.statSync(path.join(config.backupDir, a)).mtime.getTime();
    });

    if (sortedFiles.length > config.maxBackups) {
        sortedFiles.slice(config.maxBackups).forEach(file => {
            fs.unlinkSync(path.join(config.backupDir, file));
            console.log(`🗑️ Suppression de l'ancien backup: ${file}`);
        });
    }
}

// Fonction principale de backup
async function performBackup() {
    console.log('🔄 Démarrage du backup...');
    try {
        // Exécuter tous les backups en parallèle
        await Promise.all(config.endpoints.map(backupEndpoint));
        
        // Nettoyer les vieux backups
        cleanOldBackups();
        
        console.log('✨ Backup terminé avec succès!');
    } catch (error) {
        console.error('❌ Erreur durant le backup:', error);
    }
}

// Exécuter le backup toutes les 24 heures
setInterval(performBackup, 24 * 60 * 60 * 1000);

// Exécuter le premier backup immédiatement
performBackup();

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('❌ Erreur non capturée:', error);
    // Envoyer une notification si nécessaire
});

console.log('🚀 Service de backup démarré');
