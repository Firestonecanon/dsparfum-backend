const fs = require('fs');
const content = fs.readFileSync('./src/utils/referenceConverter.js', 'utf8');
const lines = content.split('\n');

console.log('=== LIGNES EXEMPLES ===');
console.log('Ligne 4:', lines[3]);
console.log('Ligne 5:', lines[4]);
console.log('Ligne 6:', lines[5]);

console.log('\n=== TEST REGEX ===');
const testLine = lines[3];
console.log('Ligne test:', testLine);

const regex1 = /^\s*['"]([^'"]+)['"]:\s*['"]([^'"]+)['"],?\s*\/\/\s*(.*)$/;
const match = testLine.match(regex1);
console.log('Match result:', match);

console.log('\n=== COMPTAGE TOTAL ===');
let count = 0;
lines.forEach(line => {
  if (regex1.test(line)) count++;
});
console.log('Total mappings trouvés:', count);
