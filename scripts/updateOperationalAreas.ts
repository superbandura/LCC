import fs from 'fs';

const filePath = './data/operationalAreas.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/fillOpacity: 0\.05,\n  \}/g, 'fillOpacity: 0.05,\n    assignedCards: [],\n  }');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ operationalAreas.ts updated');
