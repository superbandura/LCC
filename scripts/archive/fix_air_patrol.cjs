const fs = require('fs');

let content = fs.readFileSync('F:/LCC/components/Map.tsx', 'utf8');

// Find the start of the function
const startPattern = 'const getAirPatrolStatusIcon = (data: OperationalData, faction: \'us\' | \'china\') => {';
const startIndex = content.indexOf(startPattern);

if (startIndex === -1) {
  console.log('❌ Could not find getAirPatrolStatusIcon function');
  process.exit(1);
}

// Find the end of the function by counting braces
let braceCount = 0;
let inString = false;
let stringChar = null;
let endIndex = startIndex + startPattern.length;

for (let i = endIndex; i < content.length; i++) {
  const char = content[i];
  const prevChar = i > 0 ? content[i - 1] : '';

  // Handle strings
  if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
    if (!inString) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar) {
      inString = false;
      stringChar = null;
    }
  }

  // Count braces only outside strings
  if (!inString) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;

    // When we close all braces, we're at the end
    if (braceCount === -1) {
      endIndex = i + 1;
      // Look for the semicolon
      if (content[i + 1] === ';') {
        endIndex = i + 2;
      }
      break;
    }
  }
}

const oldFunction = content.substring(startIndex, endIndex);

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

// Replace the function
content = content.substring(0, startIndex) + newFunction + content.substring(endIndex);

fs.writeFileSync('F:/LCC/components/Map.tsx', content, 'utf8');
console.log('✅ Changes applied successfully!');
console.log('  - Icon size increased to 35x35');
console.log('  - Colors now use solid backgrounds (Blue for US, Red for China, Gray when used)');
