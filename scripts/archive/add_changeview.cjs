const fs = require('fs');
let content = fs.readFileSync('F:/LCC/components/Map.tsx', 'utf8');

const searchPattern = '};\n\n// Component to handle map clicks for coordinate selection\nconst MapClickHandler: React.FC<{';
const insertionPoint = content.indexOf(searchPattern);

if (insertionPoint === -1) {
  console.log('❌ Could not find insertion point');
  process.exit(1);
}

const changeViewComponent = `};\n\nconst ChangeView: React.FC<{ center: Position; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  React.useEffect(() => {
    // Invalidate size to fix rendering issues
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  React.useEffect(() => {
    // Validate coordinates before flying to them
    if (center && Array.isArray(center) && center.length === 2 &&
        typeof center[0] === 'number' && typeof center[1] === 'number' &&
        !isNaN(center[0]) && !isNaN(center[1]) &&
        isFinite(center[0]) && isFinite(center[1]) &&
        typeof zoom === 'number' && !isNaN(zoom) && isFinite(zoom)) {
      try {
        map.setView(center, zoom, {
          animate: true,
          duration: 1
        });
      } catch (error) {
        // Silently handle map view errors
      }
    }
  }, [center, zoom, map]);

  return null;
};

// Component to handle map clicks for coordinate selection
const MapClickHandler: React.FC<{`;

const before = content.substring(0, insertionPoint);
const after = content.substring(insertionPoint + searchPattern.length);

content = before + changeViewComponent + after;

fs.writeFileSync('F:/LCC/components/Map.tsx', content, 'utf8');
console.log('✅ ChangeView component added!');
