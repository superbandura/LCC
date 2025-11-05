import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import { Card } from '../types';

async function syncCardsFromFirestore() {
  try {
    console.log('📥 Descargando cartas desde Firestore...');

    const gameDoc = await getDoc(doc(db, 'game', 'current'));

    if (!gameDoc.exists()) {
      console.error('❌ No se encontró el documento game/current en Firestore');
      return;
    }

    const data = gameDoc.data();
    const cards = data.cards as Card[];

    if (!cards || !Array.isArray(cards)) {
      console.error('❌ No se encontraron cartas en Firestore');
      return;
    }

    console.log(`✅ Descargadas ${cards.length} cartas desde Firestore`);

    // Count by faction
    const usmcCount = cards.filter(c => c.faction === 'us').length;
    const planCount = cards.filter(c => c.faction === 'china').length;
    console.log(`   - USMC: ${usmcCount} cartas`);
    console.log(`   - PLAN: ${planCount} cartas`);

    // Count by type
    const typeCounts: Record<string, number> = {};
    cards.forEach(card => {
      typeCounts[card.cardType] = (typeCounts[card.cardType] || 0) + 1;
    });
    console.log('\n📊 Distribución por tipo:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} cartas`);
    });

    // Generate the file content
    const fileContent = `// Generated card data - DO NOT EDIT MANUALLY
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

    // Write to file
    fs.writeFileSync('./data/cards.ts', fileContent, 'utf8');
    console.log('\n✅ Archivo data/cards.ts actualizado exitosamente');

  } catch (error) {
    console.error('❌ Error al sincronizar cartas:', error);
    throw error;
  }
}

// Run the sync
syncCardsFromFirestore()
  .then(() => {
    console.log('\n🎉 Sincronización completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
