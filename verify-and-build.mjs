#!/usr/bin/env node

console.log('🔍 === VÉRIFICATION ET BUILD FINAL ===\n');

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectDir = process.cwd();
const distDir = path.join(projectDir, 'dist');

// 1. Vérifier le dossier dist actuel
console.log('📂 Vérification du dossier dist...');
if (fs.existsSync(distDir)) {
  const stats = fs.statSync(distDir);
  const modifiedTime = stats.mtime;
  console.log(`⏰ Dossier dist modifié le: ${modifiedTime.toLocaleString('fr-FR')}`);
  
  // Supprimer l'ancien dist
  console.log('🗑️ Suppression de l\'ancien dossier dist...');
  fs.rmSync(distDir, { recursive: true, force: true });
} else {
  console.log('❌ Aucun dossier dist trouvé');
}

// 2. Nettoyer le cache et rebuild
console.log('\n🧹 Nettoyage du cache...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️ Essai avec npx vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
}

// 3. Vérifier le nouveau build
if (fs.existsSync(distDir)) {
  const newStats = fs.statSync(distDir);
  const newModifiedTime = newStats.mtime;
  console.log(`\n✅ Nouveau dossier dist créé le: ${newModifiedTime.toLocaleString('fr-FR')}`);
  
  // Vérifier le contenu
  const files = fs.readdirSync(distDir);
  console.log('📦 Contenu du dossier dist:');
  files.forEach(file => console.log(`   - ${file}`));
  
  // Vérifier les assets
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    console.log('🎯 Assets générés:');
    assetFiles.forEach(file => console.log(`   - assets/${file}`));
  }
  
  console.log('\n🎉 BUILD RÉUSSI ! Votre dist est maintenant à jour.');
  console.log('⚡ Vous pouvez maintenant déployer ce dossier.');
  
} else {
  console.log('\n❌ ERREUR: Le dossier dist n\'a pas été créé.');
}

console.log('\n=== FIN ===');
