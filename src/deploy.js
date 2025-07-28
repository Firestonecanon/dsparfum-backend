#!/usr/bin/env node

console.log('🚀 DÉPLOIEMENT AUTOMATIQUE D&S PARFUM BACKEND');
console.log('==============================================');

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

async function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  console.log(`   $ ${command}`);
  
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(`   ✅ ${stdout.trim()}`);
    if (stderr) console.log(`   ⚠️  ${stderr.trim()}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
    return false;
  }
}

async function checkFiles() {
  console.log('\n📋 Vérification des fichiers...');
  
  const requiredFiles = [
    'backend-simple.js',
    'package.json',
    'README-BACKEND.md'
  ];
  
  let allExist = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} manquant`);
      allExist = false;
    }
  }
  
  return allExist;
}

async function deploy() {
  console.log('🎯 Début du déploiement...');
  
  // Vérification des fichiers
  if (!await checkFiles()) {
    console.log('❌ Fichiers manquants, arrêt du déploiement');
    process.exit(1);
  }
  
  // Récupération du statut Git
  console.log('\n📡 Statut Git...');
  await runCommand('git status --porcelain', 'Vérification des modifications');
  
  // Tests locaux (optionnel)
  const runTests = process.argv.includes('--test');
  if (runTests) {
    console.log('\n🧪 Tests avant déploiement...');
    
    // Démarrage temporaire du serveur pour tests
    console.log('   Démarrage serveur temporaire...');
    const serverProcess = exec('node backend-simple.js');
    
    // Attendre un peu que le serveur démarre
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Lancer les tests
    const testSuccess = await runCommand('node test-complete.js', 'Exécution des tests');
    
    // Arrêter le serveur
    serverProcess.kill();
    
    if (!testSuccess) {
      console.log('❌ Tests échoués, arrêt du déploiement');
      process.exit(1);
    }
  }
  
  // Mise à jour de la version
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  const versionParts = currentVersion.split('.');
  versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
  const newVersion = versionParts.join('.');
  
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  
  console.log(`\n📦 Version mise à jour: ${currentVersion} → ${newVersion}`);
  
  // Commit et push
  const commitMessage = `Deploy backend simple v${newVersion} - ${new Date().toISOString()}`;
  
  const deploySteps = [
    ['git add .', 'Ajout des fichiers'],
    [`git commit -m "${commitMessage}"`, 'Commit des modifications'],
    ['git push origin main', 'Push vers GitHub']
  ];
  
  for (const [command, description] of deploySteps) {
    if (!await runCommand(command, description)) {
      console.log('❌ Échec du déploiement');
      process.exit(1);
    }
  }
  
  console.log('\n🎉 DÉPLOIEMENT RÉUSSI !');
  console.log('========================');
  console.log(`📦 Version: ${newVersion}`);
  console.log('🔗 URLs de production:');
  console.log('   - Backend: https://dsparfum-backend-go.onrender.com');
  console.log('   - Admin: https://dsparfum-backend-go.onrender.com/admin');
  console.log('   - Health: https://dsparfum-backend-go.onrender.com/api/health');
  
  console.log('\n⏱️  Déploiement Render en cours (1-2 minutes)...');
  console.log('💡 Surveiller avec: npm run monitor:prod');
}

// Gestion des arguments
if (process.argv.includes('--help')) {
  console.log(`
Usage: node deploy.js [options]

Options:
  --test    Exécuter les tests avant déploiement
  --help    Afficher cette aide

Exemples:
  node deploy.js           # Déploiement simple
  node deploy.js --test    # Avec tests préalables
`);
  process.exit(0);
}

// Lancement du déploiement
deploy().catch(error => {
  console.error('💥 Erreur fatale:', error.message);
  process.exit(1);
});
