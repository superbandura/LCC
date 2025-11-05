import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyvrXqToLc6LxuMoXRPLeG-c08z4aAzIo",
  authDomain: "test-autentication-8ab27.firebaseapp.com",
  projectId: "test-autentication-8ab27",
  storageBucket: "test-autentication-8ab27.firebasestorage.app",
  messagingSenderId: "64206270267",
  appId: "1:64206270267:web:37234bd7e5877e0c2f111e",
  measurementId: "G-PS4C88NLQ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncUnitsFromFirestore() {
  try {
    console.log('Conectando a Firestore...');

    // Get the game document
    const gameDocRef = doc(db, 'game', 'current');
    const gameDoc = await getDoc(gameDocRef);

    if (!gameDoc.exists()) {
      console.error('Error: El documento game/current no existe en Firestore');
      process.exit(1);
    }

    const data = gameDoc.data();
    const units = data.units || [];

    console.log(`\nEncontradas ${units.length} unidades en Firestore`);

    // Format units as TypeScript code
    const unitsCode = formatUnitsAsTypeScript(units);

    // Write to unitsData.ts
    const outputPath = path.join(__dirname, 'data', 'unitsData.ts');
    fs.writeFileSync(outputPath, unitsCode, 'utf-8');

    console.log(`\n✅ Archivo actualizado: ${outputPath}`);
    console.log('\nSincronización completada con éxito!');

  } catch (error) {
    console.error('Error durante la sincronización:', error);
    process.exit(1);
  }
}

function formatUnitsAsTypeScript(units: any[]): string {
  // Sort units by faction and name for better organization
  const sortedUnits = [...units].sort((a, b) => {
    if (a.faction !== b.faction) {
      return a.faction === 'us' ? -1 : 1; // US first
    }
    return a.name.localeCompare(b.name);
  });

  let code = `import { Unit } from '../types';\n\n`;
  code += `/**\n`;
  code += ` * Unit database - Synced from Firestore\n`;
  code += ` * Last updated: ${new Date().toISOString()}\n`;
  code += ` * Total units: ${units.length}\n`;
  code += ` * USMC units: ${units.filter((u: any) => u.faction === 'us').length}\n`;
  code += ` * PLAN units: ${units.filter((u: any) => u.faction === 'china').length}\n`;
  code += ` */\n`;
  code += `export const unitsData: Unit[] = [\n`;

  sortedUnits.forEach((unit, index) => {
    code += `  {\n`;
    code += `    id: '${unit.id}',\n`;
    code += `    name: '${escapeString(unit.name)}',\n`;
    code += `    type: '${escapeString(unit.type)}',\n`;
    code += `    description: '${escapeString(unit.description)}',\n`;
    code += `    faction: '${unit.faction}',\n`;
    code += `    image: '${unit.image}',\n`;
    code += `    damagePoints: ${unit.damagePoints},\n`;
    code += `    currentDamage: [${unit.currentDamage.join(', ')}],\n`;

    if (unit.taskForceId !== undefined && unit.taskForceId !== null) {
      code += `    taskForceId: '${unit.taskForceId}',\n`;
    } else {
      code += `    taskForceId: undefined,\n`;
    }

    // Include category if present
    if (unit.category !== undefined && unit.category !== null) {
      code += `    category: '${escapeString(unit.category)}',\n`;
    }

    // Optional combat capabilities
    if (unit.attackPrimary !== undefined && unit.attackPrimary !== null) {
      code += `    attackPrimary: ${unit.attackPrimary},\n`;
    }
    if (unit.attackSecondary !== undefined && unit.attackSecondary !== null) {
      code += `    attackSecondary: ${unit.attackSecondary},\n`;
    }
    if (unit.interception !== undefined && unit.interception !== null) {
      code += `    interception: ${unit.interception},\n`;
    }
    if (unit.supply !== undefined && unit.supply !== null) {
      code += `    supply: ${unit.supply},\n`;
    }
    if (unit.groundCombat !== undefined && unit.groundCombat !== null) {
      code += `    groundCombat: ${unit.groundCombat},\n`;
    }

    code += `  }${index < sortedUnits.length - 1 ? ',' : ''}\n`;
  });

  code += `];\n`;

  return code;
}

function escapeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Run the sync
syncUnitsFromFirestore();
