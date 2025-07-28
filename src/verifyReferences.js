#!/usr/bin/env node

/**
 * VÉRIFICATEUR DE COHÉRENCE DES RÉFÉRENCES
 * 
 * Ce script vérifie que toutes les références publiques dans les fichiers de données
 * correspondent exactement aux mappings dans referenceConverter.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour extraire les références d'un fichier de données
function extractReferences(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/{\s*ref:\s*"([^"]+)",\s*publicRef:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g);
    
    if (!matches) return [];
    
    return matches.map(match => {
      const refMatch = match.match(/ref:\s*"([^"]+)"/);
      const publicRefMatch = match.match(/publicRef:\s*"([^"]+)"/);
      const nameMatch = match.match(/name:\s*"([^"]+)"/);
      
      return {
        internalRef: refMatch ? refMatch[1] : null,
        publicRef: publicRefMatch ? publicRefMatch[1] : null,
        name: nameMatch ? nameMatch[1] : null,
        file: path.basename(filePath)
      };
    });
  } catch (error) {
    console.error(`Erreur lecture ${filePath}:`, error.message);
    return [];
  }
}

// Fonction pour extraire le mapping du convertisseur
function extractConverter() {
  try {
    const content = fs.readFileSync('./src/utils/referenceConverter.js', 'utf8');
    const matches = content.match(/'([^']+)':\s*'([^']+)',?\s*\/\/\s*([^\n]+)/g);
    
    if (!matches) return {};
    
    const converter = {};
    matches.forEach(match => {
      const parsed = match.match(/'([^']+)':\s*'([^']+)',?\s*\/\/\s*([^\n]+)/);
      if (parsed) {
        converter[parsed[1]] = {
          internalRef: parsed[2],
          comment: parsed[3].trim()
        };
      }
    });
    
    return converter;
  } catch (error) {
    console.error('Erreur lecture convertisseur:', error.message);
    return {};
  }
}

// Vérification principale
async function verifyConsistency() {
  console.log('🔍 VÉRIFICATION DE COHÉRENCE DES RÉFÉRENCES\n');
  
  const dataFiles = [
    './src/data/parfumsHomme.js',
    './src/data/parfumsFemme.js',
    './src/data/parfumsMixte.js',
    './src/data/parfumsLuxe.js',
    './src/data/parfumsLuxury.js',
    './src/data/parfumsEnfantCreation.js',
    './src/data/etuis.js'
  ];
  
  // Extraire toutes les références des fichiers de données
  let allDataRefs = [];
  dataFiles.forEach(file => {
    const refs = extractReferences(file);
    allDataRefs = allDataRefs.concat(refs);
  });
  
  // Extraire le mapping du convertisseur
  const converter = extractConverter();
  
  console.log(`📊 Trouvé ${allDataRefs.length} références dans les données`);
  console.log(`📊 Trouvé ${Object.keys(converter).length} mappings dans le convertisseur\n`);
  
  let errors = 0;
  let warnings = 0;
  
  // Vérifier chaque référence des données
  allDataRefs.forEach(dataRef => {
    if (!dataRef.publicRef || !dataRef.internalRef) {
      console.log(`❌ ERREUR: Référence incomplète dans ${dataRef.file}: ${JSON.stringify(dataRef)}`);
      errors++;
      return;
    }
    
    const converterMapping = converter[dataRef.publicRef];
    
    if (!converterMapping) {
      console.log(`⚠️  MANQUANT: ${dataRef.publicRef} (${dataRef.name}) n'existe pas dans le convertisseur`);
      warnings++;
    } else if (converterMapping.internalRef !== dataRef.internalRef) {
      console.log(`❌ INCOHÉRENCE: ${dataRef.publicRef} (${dataRef.name})`);
      console.log(`   Données: "${dataRef.internalRef}" | Convertisseur: "${converterMapping.internalRef}"`);
      console.log(`   Fichier: ${dataRef.file}`);
      errors++;
    } else {
      // Vérification silencieuse des cohérences (on peut décommenter pour voir les succès)
      // console.log(`✅ OK: ${dataRef.publicRef} → ${dataRef.internalRef} (${dataRef.name})`);
    }
  });
  
  // Vérifier les mappings orphelins dans le convertisseur
  Object.keys(converter).forEach(publicRef => {
    const found = allDataRefs.find(dataRef => dataRef.publicRef === publicRef);
    if (!found) {
      console.log(`⚠️  ORPHELIN: ${publicRef} existe dans le convertisseur mais pas dans les données`);
      warnings++;
    }
  });
  
  console.log(`\n📋 RÉSUMÉ:`);
  console.log(`✅ Références cohérentes: ${allDataRefs.length - errors}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`⚠️  Avertissements: ${warnings}`);
  
  if (errors === 0 && warnings === 0) {
    console.log(`\n🎉 PARFAIT! Toutes les références sont cohérentes!`);
  } else if (errors === 0) {
    console.log(`\n✅ Aucune erreur critique, juste quelques avertissements.`);
  } else {
    console.log(`\n🚨 ATTENTION: ${errors} erreur(s) à corriger!`);
  }
}

verifyConsistency();
