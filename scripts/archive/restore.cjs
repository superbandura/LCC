const fs = require('fs');
let content = fs.readFileSync('F:/LCC/components/Map.tsx', 'utf8');
const searchPattern = '};\n\n  // Helper function';
const insertionPoint = content.indexOf(searchPattern);
if (insertionPoint === -1) { console.log('Not found'); process.exit(1); }
const dataEditor = '\n\nconst DataEditor: React.FC<{\n  areaId: string;\n  initialData: OperationalData;\n  onSave: (areaId: string, data: OperationalData) => void;\n  area: OperationalArea;\n  locations: Location[];\n  onLocationsUpdate?: (locations: Location[]) => void;\n  selectedFaction: \'us\' | \'china\';\n  taskForces: TaskForce[];\n  units: Unit[];\n  cards: Card[];\n  operationalAreas: OperationalArea[];\n  onOperationalAreasUpdate: (areas: OperationalArea[]) => void;\n  onUnitsUpdate: (units: Unit[]) => void;\n  isAdmin: boolean;\n}> = ({ areaId, initialData, onSave, area, locations, onLocationsUpdate, selectedFaction, taskForces, units, cards, operationalAreas, onOperationalAreasUpdate, onUnitsUpdate, isAdmin }) => {\n  const [data, setData] = useState<OperationalData>(initialData);\n  const [saved, setSaved] = useState(false);\n  const [activeTab, setActiveTab] = useState<\'tactical\' | \'patrols\' | \'bases\' | \'cards\' | \'taskforces\'>(\'tactical\');\n  const [baseDamage, setBaseDamage] = useState<Record<string, boolean[]>>({});\n  const [hoveredCard, setHoveredCard] = useState<string | null>(null);\n';
const before = content.substring(0, insertionPoint + 3);
const after = content.substring(insertionPoint + 3);
content = before + dataEditor + after;
fs.writeFileSync('F:/LCC/components/Map.tsx', content, 'utf8');
console.log('Done!');
