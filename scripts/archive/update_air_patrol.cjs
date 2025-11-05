const fs = require('fs');

let content = fs.readFileSync('F:/LCC/components/Map.tsx', 'utf8');

// 1. Replace the getAirPatrolStatusIcon function with new implementation
const oldFunction = /const getAirPatrolStatusIcon = \(data: OperationalData, faction: 'us' \| 'china'\) => \{[\s\S]*?  \}\;\n\};/;

const newFunction = `const getAirPatrolStatusIcon = (data: OperationalData, faction: 'us' | 'china') => {
  // Determine air patrol status for the player's faction
  const factionKey = faction === 'us' ? 'us' : 'plan';
  const isDestroyed = data[factionKey].airPatrolsDamage.every(dmg => dmg === true);
  const isUsed = data[factionKey].airPatrolsUsed;

  // Determine background color
  let bgColor = '#DC2626'; // Red for China by default
  let opacity = 1;

  if (isDestroyed || isUsed) {
    bgColor = '#9CA3AF'; // Gray when used or destroyed
    opacity = 0.5;
  } else if (faction === 'us') {
    bgColor = '#3B82F6'; // Blue for US
  }

  // Build the icon with conditional styling
  const iconHtml = ReactDOMServer.renderToString(
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        opacity: opacity,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
      }}>
        <img
          src={PatrullaIcon}
          alt="Air Patrol"
          style={{
            width: '70%',
            height: '70%',
            filter: 'brightness(0) invert(1)', // Make image white
          }}
        />
      </div>
      {isDestroyed && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '30px',
          height: '30px',
          zIndex: 1000
        }}>
          <DestroyedIcon color="#DC2626" />
        </div>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'air-patrol-status-icon',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
  });
};`;

content = content.replace(oldFunction, newFunction);

// 2. Change the marker position to bottom-right corner
content = content.replace(
  /position=\{\[area\.bounds\[0\]\[0\] - 0\.2, area\.bounds\[1\]\[1\] - 0\.5\]\}/,
  'position={[area.bounds[1][0] + 0.2, area.bounds[1][1] - 0.2]}'
);

fs.writeFileSync('F:/LCC/components/Map.tsx', content, 'utf8');
console.log('✅ Changes applied successfully!');
console.log('  - Icon size increased to 35x35');
console.log('  - Position moved to bottom-right corner');
console.log('  - Colors now use solid backgrounds (Blue for US, Red for China, Gray when used)');
