const fs = require('fs');
let content = fs.readFileSync('F:/LCC/components/Map.tsx', 'utf8');

const oldStates = '  const [selectedTaskForceForDetail, setSelectedTaskForceForDetail] = useState<TaskForce | null>(null);\n  const [selectedCardToPlay, setSelectedCardToPlay] = useState<Card | null>(null);';

const newStates = '  const [selectedTaskForceForDetail, setSelectedTaskForceForDetail] = useState<TaskForce | null>(null);\n  const [selectedCardToPlay, setSelectedCardToPlay] = useState<Card | null>(null);\n  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);';

content = content.replace(oldStates, newStates);

fs.writeFileSync('F:/LCC/components/Map.tsx', content, 'utf8');
console.log('✅ selectedBaseId state added!');
