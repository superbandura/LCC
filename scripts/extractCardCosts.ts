import fs from 'fs';
import path from 'path';

// Script para extraer información de las cartas y generar el archivo de datos
// Basado en el análisis manual de las imágenes

interface CardData {
  id: string;
  name: string;
  faction: 'us' | 'china';
  imagePath: string;
  cost: number;
}

// Mapeo manual de costos basado en el análisis de las imágenes
// El costo se encuentra en la esquina superior izquierda de cada carta
const MANUAL_COSTS: { [key: string]: number } = {
  // USMC Cards - basado en análisis visual
  '01': 0, '02': 0, '03': 4, '04': 1, '05': 2,
  '06': 3, '07': 0, '08': 4, '09': 2, '10': 3,
  '11': 4, '12': 0, '13': 1, '14': 2, '15': 1,
  '16': 2, '17': 5, '18': 5, '19': 2, '20': 3,
  '21': 4, '22': 3, '23': 2, '24': 2, '25': 2,
  '26': 1, '27': 3, '28': 2, '29': 3, '30': 1,
  '31': 1, '32': 3, '33': 3, '34': 2, '35': 1,
  '36': 1, '37': 2, '38': 3, '39': 2, '40': 1,
  '41': 2, '42': 3, '43': 3, '44': 3, '45': 1,
  '46': 2, '47': 2, '48': 4, '49': 2, '50': 2,
  '51': 3, '52': 3, '53': 2, '54': 3, '55': 2,
  '56': 2, '57': 2, '58': 1, '59': 3, '60': 3,
  '61': 3, '62': 3, '63': 3, '64': 5, '65': 2,
  '66': 3, '67': 3, '68': 2, '69': 4, '70': 5,
  '71': 2, '72': 2, '73': 2, '74': 3, '75': 3,
  '76': 2, '77': 4, '78': 3, '79': 3, '80': 3,
  '81': 2, '82': 3, '83': 4, '84': 1, '85': 5,
  '86': 2, '87': 3, '88': 3, '89': 2, '90': 3,
  '91': 2, '92': 2, '93': 2, '94': 4, '95': 2,
  '96': 2, '97': 1, '98': 2, '99': 3, '100': 3,
  '101': 3, '102': 3, '103': 3,
};

function extractCardNumber(filename: string): string | null {
  const match = filename.match(/LCC (?:USMC|PLAN) (\d+)/);
  return match ? match[1] : null;
}

function extractCardName(filename: string): string {
  const match = filename.match(/LCC (?:USMC|PLAN) \d+ (.+)\.jpg/);
  if (match) {
    return match[1].replace(/\s*\(x\d+\)\s*$/, '').trim();
  }
  return 'Unknown';
}

function generateCardId(faction: 'us' | 'china', number: string): string {
  return `${faction}-${number.padStart(3, '0')}`;
}

function processCardsInDirectory(directory: string, faction: 'us' | 'china'): CardData[] {
  const cards: CardData[] = [];
  const files = fs.readdirSync(directory);

  for (const file of files) {
    if (file.endsWith('.jpg') && file.match(/LCC (USMC|PLAN) \d+/)) {
      // Skip back cards
      if (file.includes('Back.jpg')) continue;

      const cardNumber = extractCardNumber(file);
      if (!cardNumber) continue;

      const name = extractCardName(file);
      const id = generateCardId(faction, cardNumber);
      const imagePath = `/images/Cartas ${faction === 'us' ? 'USMC' : 'PLAN'}/${file}`;

      // Get cost from manual mapping, default to 2 if not found
      const cost = MANUAL_COSTS[cardNumber] ?? 2;

      cards.push({
        id,
        name,
        faction,
        imagePath,
        cost,
      });
    }
  }

  return cards.sort((a, b) => a.id.localeCompare(b.id));
}

async function main() {
  const usmcDirectory = path.join(process.cwd(), 'images', 'Cartas USMC');
  const planDirectory = path.join(process.cwd(), 'images', 'Cartas PLAN');

  const usmcCards = processCardsInDirectory(usmcDirectory, 'us');
  const planCards = processCardsInDirectory(planDirectory, 'china');

  const allCards = [...usmcCards, ...planCards];

  console.log(`Processed ${usmcCards.length} USMC cards`);
  console.log(`Processed ${planCards.length} PLAN cards`);
  console.log(`Total: ${allCards.length} cards`);

  // Generate TypeScript file
  const output = `// Generated card data
// Este archivo contiene toda la información de las cartas del juego
import { Card } from '../types';

export const initialCards: Card[] = ${JSON.stringify(allCards, null, 2)};
`;

  fs.writeFileSync(path.join(process.cwd(), 'data', 'cards.ts'), output);
  console.log('✅ Cards data file generated at data/cards.ts');

  // Also generate a JSON file for Firestore import
  fs.writeFileSync(
    path.join(process.cwd(), 'cards-data.json'),
    JSON.stringify(allCards, null, 2)
  );
  console.log('✅ Cards JSON generated at cards-data.json');
}

main().catch(console.error);
