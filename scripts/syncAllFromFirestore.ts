import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import { Card, Location, OperationalArea, TaskForce, OperationalData, Unit, PurchaseHistory, CardPurchaseHistory } from '../types';

/**
 * Script maestro para sincronizar todos los datos desde Firestore a archivos locales
 * Actualiza los archivos en la carpeta data/ con los datos más recientes de Firestore
 */

// Helper function to convert Firestore flat bounds to nested format
interface FirestoreOperationalArea {
  id: string;
  name: string;
  bounds: number[]; // Flattened: [lat1, lng1, lat2, lng2]
  color?: string;
  fillOpacity?: number;
  assignedCards?: string[];
}

const areaFromFirestore = (fsArea: FirestoreOperationalArea): OperationalArea => ({
  ...fsArea,
  bounds: [
    [fsArea.bounds[0], fsArea.bounds[1]], // [lat1, lng1]
    [fsArea.bounds[2], fsArea.bounds[3]], // [lat2, lng2]
  ],
});

async function syncAllFromFirestore() {
  try {
    console.log('🚀 Iniciando sincronización completa desde Firestore...\n');

    const gameDoc = await getDoc(doc(db, 'game', 'current'));

    if (!gameDoc.exists()) {
      console.error('❌ No se encontró el documento game/current en Firestore');
      return;
    }

    const data = gameDoc.data();
    let successCount = 0;
    let errorCount = 0;

    // ========================================
    // 1. SINCRONIZAR CARTAS
    // ========================================
    try {
      console.log('📥 1/8 - Sincronizando cartas...');
      const cards = data.cards as Card[];

      if (!cards || !Array.isArray(cards)) {
        throw new Error('No se encontraron cartas en Firestore');
      }

      const usmcCount = cards.filter(c => c.faction === 'us').length;
      const planCount = cards.filter(c => c.faction === 'china').length;

      const cardsContent = `// Generated card data - DO NOT EDIT MANUALLY
// Este archivo contiene toda la información de las cartas del juego
// Total: ${cards.length} cartas (USMC: ${usmcCount}, PLAN: ${planCount})
// Última actualización: ${new Date().toISOString()}
import { Card } from '../types';

export const initialCards: Card[] = ${JSON.stringify(cards, null, 2)};

// Initial budget for each faction (Command Points)
export const initialCommandPoints = {
  us: 50,
  china: 50,
};
`;

      fs.writeFileSync('./data/cards.ts', cardsContent, 'utf8');
      console.log(`   ✅ data/cards.ts actualizado (${cards.length} cartas: ${usmcCount} USMC, ${planCount} PLAN)`);
      successCount++;
    } catch (error) {
      console.error('   ❌ Error al sincronizar cartas:', error);
      errorCount++;
    }

    // ========================================
    // 2. SINCRONIZAR LOCATIONS
    // ========================================
    try {
      console.log('\n📥 2/8 - Sincronizando locations (bases)...');
      const locations = data.locations as Location[];

      if (!locations || !Array.isArray(locations)) {
        throw new Error('No se encontraron locations en Firestore');
      }

      const usCount = locations.filter(l => l.country === 'EE. UU.').length;
      const cnCount = locations.filter(l => l.country === 'China').length;

      const locationsContent = `// Generated location data - DO NOT EDIT MANUALLY
// Este archivo contiene las bases militares del juego
// Total: ${locations.length} bases (EE. UU.: ${usCount}, China: ${cnCount})
// Última actualización: ${new Date().toISOString()}
import { Location } from '../types';

export const initialLocations: Location[] = ${JSON.stringify(locations, null, 2)};
`;

      fs.writeFileSync('./data/locations.ts', locationsContent, 'utf8');
      console.log(`   ✅ data/locations.ts actualizado (${locations.length} bases: ${usCount} EE.UU., ${cnCount} China)`);
      successCount++;
    } catch (error) {
      console.error('   ❌ Error al sincronizar locations:', error);
      errorCount++;
    }

    // ========================================
    // 3. SINCRONIZAR OPERATIONAL AREAS
    // ========================================
    try {
      console.log('\n📥 3/8 - Sincronizando operational areas...');
      const firestoreAreas = data.operationalAreas as FirestoreOperationalArea[];

      if (!firestoreAreas || !Array.isArray(firestoreAreas)) {
        throw new Error('No se encontraron operational areas en Firestore');
      }

      // Convert from Firestore flat format to nested bounds format
      // Also clean card-related arrays to ensure initial data is pristine
      const operationalAreas: OperationalArea[] = firestoreAreas.map(fsArea => ({
        ...areaFromFirestore(fsArea),
        assignedCards: [], // Clear assigned cards for initial data
        playedCards: [],   // Clear played cards for initial data
      }));

      const areasContent = `// Generated operational area data - DO NOT EDIT MANUALLY
// Este archivo contiene las áreas operacionales del mapa
// Total: ${operationalAreas.length} áreas
// Última actualización: ${new Date().toISOString()}
import { OperationalArea } from '../types';

export const initialOperationalAreas: OperationalArea[] = ${JSON.stringify(operationalAreas, null, 2)};
`;

      fs.writeFileSync('./data/operationalAreas.ts', areasContent, 'utf8');
      console.log(`   ✅ data/operationalAreas.ts actualizado (${operationalAreas.length} áreas)`);
      successCount++;
    } catch (error) {
      console.error('   ❌ Error al sincronizar operational areas:', error);
      errorCount++;
    }

    // ========================================
    // 4. SINCRONIZAR TASK FORCES
    // ========================================
    try {
      console.log('\n📥 4/8 - Sincronizando task forces...');
      const taskForces = data.taskForces as TaskForce[];

      if (!taskForces || !Array.isArray(taskForces)) {
        throw new Error('No se encontraron task forces en Firestore');
      }

      const usTaskForces = taskForces.filter(tf => tf.faction === 'us').length;
      const cnTaskForces = taskForces.filter(tf => tf.faction === 'china').length;

      const taskForcesContent = `// Generated task force data - DO NOT EDIT MANUALLY
// Este archivo contiene las fuerzas de tarea del juego
// Total: ${taskForces.length} task forces (USMC: ${usTaskForces}, PLAN: ${cnTaskForces})
// Última actualización: ${new Date().toISOString()}
import { TaskForce } from '../types';

export const initialTaskForces: TaskForce[] = ${JSON.stringify(taskForces, null, 2)};
`;

      fs.writeFileSync('./data/taskForces.ts', taskForcesContent, 'utf8');
      console.log(`   ✅ data/taskForces.ts actualizado (${taskForces.length} task forces: ${usTaskForces} USMC, ${cnTaskForces} PLAN)`);
      successCount++;
    } catch (error) {
      console.error('   ❌ Error al sincronizar task forces:', error);
      errorCount++;
    }

    // ========================================
    // 5. SINCRONIZAR UNITS
    // ========================================
    try {
      console.log('\n📥 5/8 - Sincronizando units (unidades)...');
      const units = data.units as Unit[];

      if (!units || !Array.isArray(units)) {
        throw new Error('No se encontraron units en Firestore');
      }

      // Clean attached cards from units to ensure initial data is pristine
      const cleanedUnits = units.map(unit => ({
        ...unit,
        attachedCard: undefined, // Clear attached card for initial data
      }));

      const usmcUnits = cleanedUnits.filter(u => u.faction === 'us').length;
      const planUnits = cleanedUnits.filter(u => u.faction === 'china').length;

      const unitsContent = `// Generated unit data - DO NOT EDIT MANUALLY
// Este archivo contiene todas las unidades del juego
// Total: ${cleanedUnits.length} unidades (USMC: ${usmcUnits}, PLAN: ${planUnits})
// Última actualización: ${new Date().toISOString()}
import { Unit } from '../types';

export const initialUnits: Unit[] = ${JSON.stringify(cleanedUnits, null, 2)};
`;

      fs.writeFileSync('./data/units.ts', unitsContent, 'utf8');
      console.log(`   ✅ data/units.ts actualizado (${cleanedUnits.length} unidades: ${usmcUnits} USMC, ${planUnits} PLAN)`);
      successCount++;
    } catch (error) {
      console.error('   ❌ Error al sincronizar units:', error);
      errorCount++;
    }

    // ========================================
    // 6. SINCRONIZAR OPERATIONAL DATA
    // ========================================
    try {
      console.log('\n📥 6/8 - Sincronizando operational data...');

      // Create operational data object with proper structure
      const operationalDataObj: Record<string, OperationalData> = {};

      // Get operational data from Firestore (it should be a map of areaId -> data)
      const firestoreOperationalData = data.operationalData || {};

      // Copy all operational data entries
      Object.keys(firestoreOperationalData).forEach(areaId => {
        operationalDataObj[areaId] = firestoreOperationalData[areaId];
      });

      const operationalDataContent = `// Generated operational data - DO NOT EDIT MANUALLY
// Este archivo contiene los datos operacionales de cada área
// Total: ${Object.keys(operationalDataObj).length} áreas con datos
// Última actualización: ${new Date().toISOString()}
import { OperationalData } from '../types';

export const initialOperationalData: Record<string, OperationalData> = ${JSON.stringify(operationalDataObj, null, 2)};
`;

      fs.writeFileSync('./data/operationalData.ts', operationalDataContent, 'utf8');
      console.log(`   ✅ data/operationalData.ts actualizado (${Object.keys(operationalDataObj).length} áreas)`);
      successCount++;
    } catch (error) {
      console.error('   ❌ Error al sincronizar operational data:', error);
      errorCount++;
    }

    // ========================================
    // 7. SINCRONIZAR PURCHASE HISTORY
    // ========================================
    try {
      console.log('\n📥 7/8 - Sincronizando purchase history...');

      // Get purchase history from Firestore
      const purchaseHistory = data.purchaseHistory || { us: 0, china: 0 };

      const purchaseHistoryContent = `import { PurchaseHistory } from '../types';

/**
 * Initial purchase history state
 *
 * Tracks lifetime card purchases for each faction.
 * This counter represents the total number of cards purchased throughout the game
 * and should never decrease (except on game reset).
 *
 * Both factions start with 0 purchases at the beginning of a new game.
 */
export const initialPurchaseHistory: PurchaseHistory = ${JSON.stringify(purchaseHistory, null, 2)};
`;

      fs.writeFileSync('./data/purchaseHistory.ts', purchaseHistoryContent, 'utf8');
      console.log(`   ✅ data/purchaseHistory.ts actualizado (US: ${purchaseHistory.us}, China: ${purchaseHistory.china})`);
      successCount++;
    } catch (error) {
      console.error('   ❌ Error al sincronizar purchase history:', error);
      errorCount++;
    }

    // ========================================
    // 8. SINCRONIZAR CARD PURCHASE HISTORY
    // ========================================
    try {
      console.log('\n📥 8/8 - Sincronizando card purchase history...');

      // Get card purchase history from Firestore
      const cardPurchaseHistory = data.cardPurchaseHistory || { us: {}, china: {} };

      const cardPurchaseHistoryContent = `import { CardPurchaseHistory } from '../types';

/**
 * Initial per-card purchase history state
 *
 * Tracks lifetime card purchases for each specific card ID per faction.
 * This counter represents the total number of times each card has been purchased
 * throughout the game and should never decrease (except on game reset).
 *
 * Format: { us: { "us-001": 3, "us-002": 1 }, china: { "china-001": 2 } }
 *
 * Both factions start with empty purchase history at the beginning of a new game.
 */
export const initialCardPurchaseHistory: CardPurchaseHistory = ${JSON.stringify(cardPurchaseHistory, null, 2)};
`;

      fs.writeFileSync('./data/cardPurchaseHistory.ts', cardPurchaseHistoryContent, 'utf8');
      const usCount = Object.keys(cardPurchaseHistory.us).length;
      const chinaCount = Object.keys(cardPurchaseHistory.china).length;
      console.log(`   ✅ data/cardPurchaseHistory.ts actualizado (US: ${usCount} cards, China: ${chinaCount} cards)`);
      successCount++;
    } catch (error) {
      console.error('   ❌ Error al sincronizar card purchase history:', error);
      errorCount++;
    }

    // ========================================
    // RESUMEN
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE SINCRONIZACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Exitosos: ${successCount}/8`);
    if (errorCount > 0) {
      console.log(`❌ Errores: ${errorCount}/8`);
    }
    console.log('='.repeat(60));

    if (errorCount === 0) {
      console.log('\n🎉 ¡Sincronización completa exitosa!');
    } else {
      console.log('\n⚠️  Sincronización completada con errores');
    }

  } catch (error) {
    console.error('❌ Error fatal durante la sincronización:', error);
    throw error;
  }
}

// Run the sync
syncAllFromFirestore()
  .then(() => {
    console.log('\n✨ Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
