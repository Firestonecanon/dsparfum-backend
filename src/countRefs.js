const fs = require('fs');

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
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/publicRef:/g);
  const count = matches ? matches.length : 0;
  console.log(file + ': ' + count + ' références');
  total += count;
});

console.log('TOTAL: ' + total + ' références');
