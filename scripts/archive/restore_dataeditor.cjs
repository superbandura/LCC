const fs = require('fs');

let content = fs.readFileSync('F:/LCC/components/Map.tsx', 'utf8');

// Find where to insert the DataEditor component declaration
const insertAfter = '};

';
const searchPattern = insertAfter + '  // Helper function to check if a location is within the operational area bounds';

const insertionPoint = content.indexOf(searchPattern);

if (insertionPoint === -1) {
  console.log('❌ Could not find insertion point');
  process.exit(1);
}

const dataEditorDeclaration = `const DataEditor: React.FC<{
  areaId: string;
  initialData: OperationalData;
  onSave: (areaId: string, data: OperationalData) => void;
  area: OperationalArea;
  locations: Location[];
  onLocationsUpdate?: (locations: Location[]) => void;
  selectedFaction: 'us' | 'china';
  taskForces: TaskForce[];
  units: Unit[];
  cards: Card[];
  operationalAreas: OperationalArea[];
  onOperationalAreasUpdate: (areas: OperationalArea[]) => void;
  onUnitsUpdate: (units: Unit[]) => void;
  isAdmin: boolean;
}> = ({ areaId, initialData, onSave, area, locations, onLocationsUpdate, selectedFaction, taskForces, units, cards, operationalAreas, onOperationalAreasUpdate, onUnitsUpdate, isAdmin }) => {
  const [data, setData] = useState<OperationalData>(initialData);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'tactical' | 'patrols' | 'bases' | 'cards' | 'taskforces'>('tactical');
  const [baseDamage, setBaseDamage] = useState<Record<string, boolean[]>>({});
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

`;

// Insert the declaration
const beforeInsertion = content.substring(0, insertionPoint + insertAfter.length);
const afterInsertion = content.substring(insertionPoint + insertAfter.length);

content = beforeInsertion + dataEditorDeclaration + afterInsertion;

fs.writeFileSync('F:/LCC/components/Map.tsx', content, 'utf8');
console.log('✅ DataEditor component declaration restored!');
