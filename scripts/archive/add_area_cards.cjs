const fs = require('fs');
let content = fs.readFileSync('F:/LCC/components/Map.tsx', 'utf8');

const searchPattern = '  // Filter task forces for this area\n  const areaTaskForces = taskForces.filter(tf => tf.operationalAreaId === area.id);';

const newContent = '  // Filter task forces for this area\n  const areaTaskForces = taskForces.filter(tf => tf.operationalAreaId === area.id);\n\n  // Filter cards assigned to this area for the current faction\n  const areaCards = cards.filter(card => {\n    const isAssigned = area.assignedCards?.includes(card.id);\n    const isFactionMatch = card.faction === selectedFaction;\n    return isAssigned && isFactionMatch;\n  });';

content = content.replace(searchPattern, newContent);

fs.writeFileSync('F:/LCC/components/Map.tsx', content, 'utf8');
console.log('✅ areaCards filtering added!');
