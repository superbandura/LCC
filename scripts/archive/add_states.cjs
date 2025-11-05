const fs = require('fs');
let content = fs.readFileSync('F:/LCC/components/Map.tsx', 'utf8');

const oldStates = '  const [data, setData] = useState<OperationalData>(initialData);\n  const [saved, setSaved] = useState(false);\n  const [activeTab, setActiveTab] = useState<\'tactical\' | \'patrols\' | \'bases\' | \'cards\' | \'taskforces\'>(\'tactical\');\n  const [baseDamage, setBaseDamage] = useState<Record<string, boolean[]>>({});\n  const [hoveredCard, setHoveredCard] = useState<string | null>(null);';

const newStates = '  const [data, setData] = useState<OperationalData>(initialData);\n  const [saved, setSaved] = useState(false);\n  const [activeTab, setActiveTab] = useState<\'tactical\' | \'patrols\' | \'bases\' | \'cards\' | \'taskforces\'>(\'tactical\');\n  const [baseDamage, setBaseDamage] = useState<Record<string, boolean[]>>({});\n  const [hoveredCard, setHoveredCard] = useState<string | null>(null);\n  const [selectedTaskForceForDetail, setSelectedTaskForceForDetail] = useState<TaskForce | null>(null);\n  const [selectedCardToPlay, setSelectedCardToPlay] = useState<Card | null>(null);';

content = content.replace(oldStates, newStates);

fs.writeFileSync('F:/LCC/components/Map.tsx', content, 'utf8');
console.log('✅ Missing state variables added!');
