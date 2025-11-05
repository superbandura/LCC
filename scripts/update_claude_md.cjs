const fs = require('fs');
let content = fs.readFileSync('F:/LCC/CLAUDE.md', 'utf8');

// Add air patrol indicator information and DataEditor critical state
const oldSection = `### Component Structure
- \`App.tsx\`: Root component managing all state, faction selection, and layout
- \`Map.tsx\`: Leaflet map renderer with:
  - Location markers with interactive popups showing damage tracking
  - Operational area rectangles with info icons
  - DataEditor component embedded in area popups for tactical network/air patrol damage **and cards tab**
  - Coordinate selection mode for adding/editing base positions`;

const newSection = `### Component Structure
- \`App.tsx\`: Root component managing all state, faction selection, and layout
- \`Map.tsx\`: Leaflet map renderer with:
  - Location markers with interactive popups showing damage tracking
  - Operational area rectangles with info icons and **air patrol status indicators**
  - Air patrol indicators positioned at bottom-right corner of operational areas showing:
    - Blue circle (#3B82F6): US patrols operational
    - Red circle (#DC2626): China patrols operational  
    - Gray circle (#9CA3AF, 50% opacity): Patrols used or destroyed
    - Red X overlay when destroyed
    - Icon size: 35x35 pixels
  - DataEditor component embedded in area popups for tactical network/air patrol damage **and cards tab**
  - Coordinate selection mode for adding/editing base positions
  - **Critical DataEditor State Requirements** (Map.tsx lines 182-189):
    - \`data\`, \`saved\`, \`activeTab\`, \`baseDamage\`, \`hoveredCard\` (standard states)
    - \`selectedTaskForceForDetail\`: For task force detail modal
    - \`selectedCardToPlay\`: For card playing modal  
    - \`selectedBaseId\`: For base selection in bases tab
  - **Critical DataEditor Helper Functions** (Map.tsx lines 294-329):
    - \`getTaskForceUnits()\`: Filters units by task force ID
    - \`handlePlayCard()\`: Assigns cards to operational areas
    - \`areaTaskForces\`: Filters task forces for current area
    - \`areaCards\`: Filters cards assigned to current area for faction`;

content = content.replace(oldSection, newSection);

// Add section about file modification issues
const troubleshootingSection = `

## Development Troubleshooting

### File Modification Issues
When HMR (Hot Module Replacement) is active, direct file edits may fail with "File has been unexpectedly modified" errors. Solutions:
1. **Use Node.js scripts**: Create temporary .cjs scripts to modify files programmatically
2. **Kill dev servers**: Stop all running dev servers before editing critical files
3. **Common pattern**: Read file → Process with string replacement → Write back

### DataEditor Component State
If you encounter "X is not defined" errors in the DataEditor component, check that all required state variables are declared:
- Missing state variables cause runtime errors when switching tabs
- All state must be declared at component initialization (lines 182-189)
- Helper functions must be defined before the return statement (lines 294-329)

### Air Patrol Indicators
The \`getAirPatrolStatusIcon()\` function (Map.tsx:99-163):
- Uses solid background colors, not CSS filters
- Renders with \`ReactDOMServer.renderToString()\` for Leaflet compatibility
- Returns \`L.divIcon()\` with 35x35 iconSize
- Position calculated as \`[area.bounds[1][0] + 0.2, area.bounds[1][1] - 0.2]\` (bottom-right corner)`;

content = content + troubleshootingSection;

fs.writeFileSync('F:/LCC/CLAUDE.md', content, 'utf8');
console.log('✅ CLAUDE.md updated with air patrol and DataEditor information!');
