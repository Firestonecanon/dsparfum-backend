#!/usr/bin/env node

/**
 * GÉNÉRATEUR AUTOMATIQUE DE RÉFÉRENCES D&S
 * 
 * Usage: node generateRef.js <category> <internal_code> <name> <brand> <price>
 * 
 * Exemple:
 * node generateRef.js homme 150 "NOUVEAU PARFUM" "MARQUE" "35 €"
 * 
 * Génère automatiquement:
 * 1. L'entrée dans le fichier de données
 * 2. L'entrée dans le convertisseur
 * 3. La nouvelle référence publique (DSH-022, DSF-031, etc.)
 */

const fs = require('fs');
const path = require('path');

// Configuration des préfixes et compteurs
const CONFIG = {
  homme: { prefix: 'DSH', file: 'parfumsHomme.js', counter: 21 },
  femme: { prefix: 'DSF', file: 'parfumsFemme.js', counter: 31 },
  mixte: { prefix: 'DSM', file: 'parfumsMixte.js', counter: 6 },
  luxe: { prefix: 'DSL', file: 'parfumsLuxe.js', counter: 16 },
  luxury: { prefix: 'DSX', file: 'parfumsLuxury.js', counter: 26 },
  enfant: { prefix: 'DSE', file: 'parfumsEnfantCreation.js', counter: 4 },
  creation: { prefix: 'DSC', file: 'parfumsEnfantCreation.js', counter: 6 },
  etuis: { prefix: 'DST', file: 'etuis.js', counter: 5 }
};

function generateReference(category, internalCode, name, brand, price) {
  const config = CONFIG[category.toLowerCase()];
  if (!config) {
    console.error(`❌ Catégorie invalide: ${category}`);
    console.log(`Categories valides: ${Object.keys(CONFIG).join(', ')}`);
    return;
  }

  // Générer la nouvelle référence publique
  const publicRef = `${config.prefix}-${config.counter.toString().padStart(3, '0')}`;
  
  // Générer l'entrée pour le fichier de données
  const dataEntry = `  { ref: "${internalCode}", publicRef: "${publicRef}", name: "${name}", brand: "${brand}", price: "${price}" }`;
  
  // Générer l'entrée pour le convertisseur
  const converterEntry = `  '${publicRef}': '${internalCode}',  // ${name}`;
  
  console.log(`\n🎉 NOUVELLE RÉFÉRENCE GÉNÉRÉE:\n`);
  console.log(`📱 Référence publique: ${publicRef}`);
  console.log(`🔧 Code interne: ${internalCode}`);
  console.log(`👤 Nom: ${name}`);
  console.log(`🏷️ Marque: ${brand}`);
  console.log(`💰 Prix: ${price}`);
  
  console.log(`\n📋 AJOUTS À FAIRE:\n`);
  console.log(`1. Dans src/data/${config.file}:`);
  console.log(`   ${dataEntry}`);
  
  console.log(`\n2. Dans src/utils/referenceConverter.js:`);
  console.log(`   ${converterEntry}`);
  
  console.log(`\n✅ Après ces ajouts, le système fonctionnera automatiquement!`);
  
  // Mettre à jour le compteur pour la prochaine fois
  config.counter++;
  console.log(`\n📊 Prochain numéro pour ${category}: ${config.prefix}-${config.counter.toString().padStart(3, '0')}`);
}

// Traitement des arguments
const args = process.argv.slice(2);
if (args.length !== 5) {
  console.log(`
🚀 GÉNÉRATEUR AUTOMATIQUE DE RÉFÉRENCES D&S

Usage: node generateRef.js <category> <internal_code> <name> <brand> <price>

Exemples:
  node generateRef.js homme 150 "NOUVEAU PARFUM" "MARQUE" "35 €"
  node generateRef.js femme 160 "PARFUM FEMME" "BRAND" "35 €"
  node generateRef.js luxe 170 "PARFUM LUXE" "LUXURY" "57 €"

Categories: ${Object.keys(CONFIG).join(', ')}
`);
  process.exit(1);
}

const [category, internalCode, name, brand, price] = args;
generateReference(category, internalCode, name, brand, price);
