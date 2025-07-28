#!/usr/bin/env node

/**
 * NETTOYEUR DE CONVERTISSEUR DE RÉFÉRENCES
 * 
 * Ce script supprime automatiquement les références orphelines du convertisseur
 * en ne gardant que les références qui existent dans les fichiers de données.
 */

import fs from 'fs';
import path from 'path';

// Fonction pour extraire les références publiques d'un fichier de données
function extractPublicRefs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/publicRef:\s*['"](.*?)['"]/g);
    
    if (!matches) return [];
    
    return matches.map(match => {
      const publicRefMatch = match.match(/publicRef:\s*['"](.*?)['"]/);
      return publicRefMatch ? publicRefMatch[1] : null;
    }).filter(ref => ref);
  } catch (error) {
    console.error(`Erreur lecture ${filePath}:`, error.message);
    return [];
  }
}

// Fonction pour extraire les mappings du convertisseur avec leurs lignes
function extractConverterMappings() {
  try {
    const converterPath = './src/utils/referenceConverter.js';
    const content = fs.readFileSync(converterPath, 'utf8');
    const lines = content.split('\n');
    
    const mappings = {};
    lines.forEach((line, index) => {
      // Regex plus flexible pour capturer différents formats
      const match = line.match(/^\s*['"]([^'"]+)['"]:\s*['"]([^'"]+)['"],?\s*\/\/\s*(.*)$/);
      if (match) {
        mappings[match[1]] = {
          internalRef: match[2],
          comment: match[3].trim(),
          lineNumber: index + 1,
          originalLine: line
        };
      }
    });
    
    return { mappings, content, lines };
  } catch (error) {
    console.error('Erreur lecture convertisseur:', error.message);
    return { mappings: {}, content: '', lines: [] };
  }
}

// Fonction principale de nettoyage
function cleanConverter() {
  console.log('🧹 NETTOYAGE DU CONVERTISSEUR DE RÉFÉRENCES\n');
  
  const dataFiles = [
    './src/data/parfumsHomme.js',
    './src/data/parfumsFemme.js',
    './src/data/parfumsMixte.js',
    './src/data/parfumsLuxe.js',
    './src/data/parfumsLuxury.js',
    './src/data/parfumsEnfantCreation.js',
    './src/data/etuis.js'
  ];
  
  // Collecter toutes les références publiques existantes
  let validPublicRefs = new Set();
  dataFiles.forEach(file => {
    const refs = extractPublicRefs(file);
    refs.forEach(ref => validPublicRefs.add(ref));
  });
  
  console.log(`📊 Trouvé ${validPublicRefs.size} références publiques valides dans les données`);
  
  // Analyser le convertisseur
  const { mappings, content, lines } = extractConverterMappings();
  const converterRefs = Object.keys(mappings);
  
  console.log(`📊 Trouvé ${converterRefs.length} mappings dans le convertisseur`);
  
  // Identifier les références orphelines
  const orphanRefs = converterRefs.filter(ref => !validPublicRefs.has(ref));
  const validRefs = converterRefs.filter(ref => validPublicRefs.has(ref));
  
  console.log(`✅ Références valides: ${validRefs.length}`);
  console.log(`🗑️  Références orphelines à supprimer: ${orphanRefs.length}`);
  
  if (orphanRefs.length === 0) {
    console.log('\\n🎉 Aucune référence orpheline trouvée ! Le convertisseur est déjà propre.');
    return;
  }
  
  // Afficher les références orphelines
  console.log('\\n📋 Références orphelines détectées:');
  orphanRefs.forEach(ref => {
    console.log(`  - ${ref} → ${mappings[ref].internalRef} // ${mappings[ref].comment}`);
  });
  
  // Créer le nouveau contenu du convertisseur
  const newLines = lines.filter(line => {
    // Garder les lignes qui ne sont pas des mappings orphelins
    const match = line.match(/^\s*['"]([^'"]+)['"]:\s*['"]([^'"]+)['"],?\s*\/\/\s*(.*)$/);
    if (match && orphanRefs.includes(match[1])) {
      return false; // Supprimer cette ligne
    }
    return true; // Garder cette ligne
  });
  
  const newContent = newLines.join('\\n');
  
  // Sauvegarder l'ancien convertisseur
  const backupPath = './src/utils/referenceConverter.js.backup';
  fs.writeFileSync(backupPath, content);
  console.log(`\\n💾 Sauvegarde créée: ${backupPath}`);
  
  // Écrire le nouveau convertisseur nettoyé
  fs.writeFileSync('./src/utils/referenceConverter.js', newContent);
  
  console.log(`\\n🎉 Convertisseur nettoyé avec succès !`);
  console.log(`✅ ${validRefs.length} références valides conservées`);
  console.log(`🗑️  ${orphanRefs.length} références orphelines supprimées`);
}

cleanConverter();
