#!/usr/bin/env node

console.log('🔧 === RECONSTRUCTION FORCÉE DU PROJET ===');

import { execSync } from 'child_process';
import fs from 'fs';

try {
  // Supprimer le dossier dist s'il existe
  if (fs.existsSync('dist')) {
    console.log('📂 Suppression du dossier dist existant...');
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  console.log('🏗️ Construction avec Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('✅ BUILD TERMINÉ avec succès !');
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}
