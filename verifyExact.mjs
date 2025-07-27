import fs from 'fs';

const files = [
  './src/data/parfumsHomme.js',
  './src/data/parfumsFemme.js', 
  './src/data/parfumsMixte.js',
  './src/data/parfumsLuxe.js',
  './src/data/parfumsLuxury.js',
  './src/data/parfumsEnfantCreation.js',
  './src/data/etuis.js'
];

let total = 0;
let details = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/publicRef:\s*["'][^"']+["']/g);
  const count = matches ? matches.length : 0;
  const fileName = file.split('/').pop();
  
  details[fileName] = count;
  total += count;
  
  console.log(`${fileName}: ${count} références`);
});

console.log(`\nTOTAL: ${total} références\n`);

// Vérification du convertisseur
const converterContent = fs.readFileSync('./src/utils/referenceConverter.js', 'utf8');
const converterMatches = converterContent.match(/['"][A-Z]{2,3}-\d{3}['']:\s*['"][^'"]+[''],?\s*\/\//g);
const converterCount = converterMatches ? converterMatches.length : 0;

console.log(`Convertisseur: ${converterCount} mappings`);

// Test avec une regex plus simple
const simpleMatches = converterContent.match(/DS[HFMLXECT]-\d{3}/g);
const simpleCount = simpleMatches ? simpleMatches.length : 0;
console.log(`Regex simple (DS*-***): ${simpleCount} occurrences`);

if (total !== converterCount) {
  console.log(`\n⚠️ DIFFÉRENCE: ${Math.abs(total - converterCount)} références`);
} else {
  console.log(`\n✅ PARFAIT: Données et convertisseur cohérents!`);
}
