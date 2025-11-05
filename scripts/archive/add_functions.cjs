const fs = require('fs');
let content = fs.readFileSync('F:/LCC/components/Map.tsx', 'utf8');

const searchPattern = '  const getTacticalNetworkEffect = (faction: \'us\' | \'plan\'): string => {\n    const damageCount = data[faction].tacticalNetworkDamage.filter(dmg => dmg === true).length;\n\n    if (damageCount <= 1) {\n      return \'Red Táctica plenamente operativa\';\n    } else if (damageCount <= 3) {\n      return \'Efecto Menor: Reduce LRS e INTERCEPT en 4\';\n    } else {\n      return \'Efecto Mayor: Reduce LRS e INTERCEPT en 7\';\n    }\n  };\n\n  return (';

const newContent = '  // Helper function to get units for a task force\n  const getTaskForceUnits = (taskForceId: string): Unit[] => {\n    return units.filter(unit => unit.taskForceId === taskForceId);\n  };\n\n  // Helper function to handle playing a card\n  const handlePlayCard = (cardId: string) => {\n    const card = cards.find(c => c.id === cardId);\n    if (!card) return;\n\n    // Add card to this operational area\n    const updatedAreas = operationalAreas.map(area => {\n      if (area.id === areaId) {\n        const currentCards = area.assignedCards || [];\n        return {\n          ...area,\n          assignedCards: [...currentCards, cardId]\n        };\n      }\n      return area;\n    });\n\n    onOperationalAreasUpdate(updatedAreas);\n    setSelectedCardToPlay(null);\n  };\n\n  // Filter task forces for this area\n  const areaTaskForces = taskForces.filter(tf => tf.operationalAreaId === area.id);\n\n  const getTacticalNetworkEffect = (faction: \'us\' | \'plan\'): string => {\n    const damageCount = data[faction].tacticalNetworkDamage.filter(dmg => dmg === true).length;\n\n    if (damageCount <= 1) {\n      return \'Red Táctica plenamente operativa\';\n    } else if (damageCount <= 3) {\n      return \'Efecto Menor: Reduce LRS e INTERCEPT en 4\';\n    } else {\n      return \'Efecto Mayor: Reduce LRS e INTERCEPT en 7\';\n    }\n  };\n\n  return (';

content = content.replace(searchPattern, newContent);

fs.writeFileSync('F:/LCC/components/Map.tsx', content, 'utf8');
console.log('✅ Helper functions added!');
