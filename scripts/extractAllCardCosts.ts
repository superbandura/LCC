import fs from 'fs';
import path from 'path';

// Script mejorado para extraer costos de TODAS las cartas
// Basado en análisis visual exhaustivo de las imágenes

interface CardData {
  id: string;
  name: string;
  faction: 'us' | 'china';
  imagePath: string;
  cost: number;
}

// Mapeo completo de costos extraídos visualmente
// Formato: número de carta -> costo visible en esquina superior izquierda
const USMC_COSTS: { [key: string]: number } = {
  '01': 0, '02': 0, '03': 4, '04': 1, '05': 5,
  '06': 3, '07': 0, '08': 4, '09': 2, '10': 3,
  '11': 4, '12': 0, '13': 1, '14': 2, '15': 2,
  '16': 2, '17': 5, '18': 5, '19': 2, '20': 3,
  '21': 4, '22': 3, '23': 2, '24': 2, '25': 2,
  '26': 1, '27': 3, '28': 2, '29': 3, '30': 1,
  '31': 1, '32': 3, '33': 3, '34': 2, '35': 1,
  '36': 1, '37': 2, '38': 3, '39': 2, '40': 1,
  '41': 2, '42': 3, '43': 3, '44': 3, '45': 3,
  '46': 2, '47': 2, '48': 4, '49': 2, '50': 2,
  '51': 3, '52': 3, '53': 2, '54': 3, '55': 4,
  '56': 2, '57': 2, '58': 1, '59': 3, '60': 3,
  '61': 3, '62': 3, '63': 3, '64': 5, '65': 1,
  '66': 3, '67': 3, '68': 2, '69': 4, '70': 5,
  '71': 2, '72': 2, '73': 2, '74': 3, '75': 5,
  '76': 2, '77': 4, '78': 3, '79': 3, '80': 3,
  '81': 2, '82': 3, '83': 4, '84': 1, '85': 5,
  '86': 2, '87': 3, '88': 3, '89': 2, '90': 3,
  '91': 2, '92': 2, '93': 2, '94': 4, '95': 4,
  '96': 2, '97': 1, '98': 2, '99': 3, '100': 3,
  '101': 3, '102': 3, '103': 3,
};

const PLAN_COSTS: { [key: string]: number } = {
  '01': 0, '02': 0, '03': 1, '04': 3, '05': 4,
  '06': 3, '07': 2, '08': 0, '09': 2, '10': 2,
  '11': 4, '12': 0, '13': 2, '14': 2, '15': 3,
  '16': 2, '17': 3, '18': 4, '19': 4, '20': 1,
  '21': 2, '22': 3, '23': 2, '24': 3, '25': 3,
  '26': 2, '27': 4, '28': 3, '29': 1, '30': 3,
  '31': 3, '32': 3, '33': 2, '34': 1, '35': 2,
  '36': 3, '37': 1, '38': 2, '39': 2, '40': 1,
  '41': 2, '42': 2, '43': 3, '44': 2, '45': 3,
  '46': 3, '47': 3, '48': 3, '49': 2, '50': 3,
  '51': 2, '52': 1, '53': 4, '54': 5, '55': 2,
  '56': 2, '57': 3, '58': 3, '59': 2, '60': 2,
  '61': 2, '62': 3, '63': 3, '64': 3, '65': 3,
  '66': 4, '67': 2, '68': 3, '69': 4, '70': 5,
  '71': 2, '72': 2, '73': 2, '74': 2, '75': 3,
  '76': 2, '77': 3, '78': 4, '79': 4, '80': 2,
  '81': 3, '82': 3, '83': 3, '84': 1, '85': 2,
  '86': 3, '87': 3, '88': 3, '89': 1, '90': 2,
  '91': 3, '92': 2, '93': 5, '94': 3,
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

function processCardsInDirectory(
  directory: string,
  faction: 'us' | 'china',
  costsMap: { [key: string]: number }
): CardData[] {
  const cards: CardData[] = [];

  if (!fs.existsSync(directory)) {
    console.error(`Directory not found: ${directory}`);
    return cards;
  }

  const files = fs.readdirSync(directory);

  for (const file of files) {
    if (file.endsWith('.jpg') && file.match(/LCC (USMC|PLAN) \d+/)) {
      // Skip back cards
      if (file.includes('Back.jpg')) continue;

      // Skip duplicates (some files have the same number)
      const cardNumber = extractCardNumber(file);
      if (!cardNumber) continue;

      // Check if we already have this card number
      if (cards.some(c => c.id === generateCardId(faction, cardNumber))) {
        console.log(`⚠️  Skipping duplicate: ${file}`);
        continue;
      }

      const name = extractCardName(file);
      const id = generateCardId(faction, cardNumber);
      const imagePath = `/images/Cartas ${faction === 'us' ? 'USMC' : 'PLAN'}/${file}`;

      // Get cost from mapping
      const cost = costsMap[cardNumber];

      if (cost === undefined) {
        console.warn(`⚠️  No cost found for ${faction.toUpperCase()} card ${cardNumber} (${name}), defaulting to 2`);
      }

      cards.push({
        id,
        name,
        faction,
        imagePath,
        cost: cost ?? 2,
      });
    }
  }

  return cards.sort((a, b) => {
    const aNum = parseInt(a.id.split('-')[1]);
    const bNum = parseInt(b.id.split('-')[1]);
    return aNum - bNum;
  });
}

async function main() {
  console.log('🃏 Extracting card data...\n');

  const usmcDirectory = path.join(process.cwd(), 'images', 'Cartas USMC');
  const planDirectory = path.join(process.cwd(), 'images', 'Cartas PLAN');

  const usmcCards = processCardsInDirectory(usmcDirectory, 'us', USMC_COSTS);
  const planCards = processCardsInDirectory(planDirectory, 'china', PLAN_COSTS);

  const allCards = [...usmcCards, ...planCards];

  console.log(`\n✅ Processed ${usmcCards.length} USMC cards`);
  console.log(`✅ Processed ${planCards.length} PLAN cards`);
  console.log(`✅ Total: ${allCards.length} cards\n`);

  // Calculate statistics
  const usmcTotalCost = usmcCards.reduce((sum, card) => sum + card.cost, 0);
  const planTotalCost = planCards.reduce((sum, card) => sum + card.cost, 0);
  const usmcAvgCost = (usmcTotalCost / usmcCards.length).toFixed(2);
  const planAvgCost = (planTotalCost / planCards.length).toFixed(2);

  console.log(`📊 USMC: Total cost ${usmcTotalCost}, Average ${usmcAvgCost}`);
  console.log(`📊 PLAN: Total cost ${planTotalCost}, Average ${planAvgCost}\n`);

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Generate TypeScript file
  const output = `// Generated card data - DO NOT EDIT MANUALLY
// Este archivo contiene toda la información de las cartas del juego
// Total: ${allCards.length} cartas (${usmcCards.length} USMC, ${planCards.length} PLAN)
import { Card } from '../types';

export const initialCards: Card[] = ${JSON.stringify(allCards, null, 2).replace(/"(\w+)":/g, '$1:')};

// Initial budget for each faction (Command Points)
export const initialCommandPoints = {
  us: 100,
  china: 100,
};
`;

  const cardsFilePath = path.join(dataDir, 'cards.ts');
  fs.writeFileSync(cardsFilePath, output);
  console.log(`✅ Cards data file generated at ${cardsFilePath}`);

  // Also generate a JSON file for reference
  const jsonOutput = {
    cards: allCards,
    stats: {
      total: allCards.length,
      usmc: {
        count: usmcCards.length,
        totalCost: usmcTotalCost,
        averageCost: parseFloat(usmcAvgCost),
      },
      plan: {
        count: planCards.length,
        totalCost: planTotalCost,
        averageCost: parseFloat(planAvgCost),
      },
    },
  };

  const jsonPath = path.join(process.cwd(), 'cards-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2));
  console.log(`✅ Cards JSON generated at ${jsonPath}\n`);

  console.log('🎉 Card extraction complete!');
}

main().catch(console.error);
