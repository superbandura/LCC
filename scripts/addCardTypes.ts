import fs from 'fs';

// Script simple para agregar tipos a las cartas existentes basado en palabras clave

type CardType = 'attack' | 'maneuver' | 'interception' | 'intelligence' | 'communications';

function detectTypeFromName(name: string, number: string): CardType {
  const lowerName = name.toLowerCase();

  // Ataque (rojo) - keywords
  if (lowerName.match(/strike|attack|bomber|torpedo|missile|weapon|hypersonic|ballistic|fire|anti-tank|cluster|naval swarm|mines/)) {
    return 'attack';
  }

  // Maniobra (verde) - keywords
  if (lowerName.match(/movement|insertion|amphibious|vertical|logistics|transport|riverine|mobility|seaplane|lift|landing|law|ugvs|sabotage|mine clearing/)) {
    return 'maneuver';
  }

  // Intercepción (púrpura) - keywords
  if (lowerName.match(/thaad|aegis|patriot|iamd|defense.*ballistic|asw|uuv defense|radar|hq-|interceptor/)) {
    return 'interception';
  }

  // Inteligencia (amarillo) - keywords
  if (lowerName.match(/satellite|intelligence|surveillance|recon|isr|sigint|signal.*intel|open source|u-2|jstars|early warning|sensor|quadcopter|unmanned.*isr|v-bat|p-8/)) {
    return 'intelligence';
  }

  // Comunicaciones (azul) - default y keywords
  // network, cyber, c2, deception, jamming, ems, psyop, influence, etc.
  return 'communications';
}

// Leer el archivo de cartas actual
const cardsContent = fs.readFileSync('./data/cards.ts', 'utf8');

// Extraer el JSON de las cartas
const jsonMatch = cardsContent.match(/export const initialCards: Card\[\] = (\[[\s\S]*?\]);/);
if (!jsonMatch) {
  console.error('❌ No se pudo encontrar el array de cartas');
  process.exit(1);
}

const cardsArray = eval(jsonMatch[1]); // Usar eval solo para este script temporal

// Agregar cardType a cada carta
const updatedCards = cardsArray.map((card: any) => {
  const cardNumber = card.id.split('-')[1];
  const cardType = detectTypeFromName(card.name, cardNumber);
  return {
    ...card,
    cardType
  };
});

// Contar por tipo
const typeCounts = updatedCards.reduce((acc: any, card: any) => {
  acc[card.cardType] = (acc[card.cardType] || 0) + 1;
  return acc;
}, {});

console.log('📊 Card Types Distribution:');
Object.entries(typeCounts).forEach(([type, count]) => {
  console.log(`  ${type}: ${count} cards`);
});

// Generar nuevo archivo
const newContent = `// Generated card data - DO NOT EDIT MANUALLY
// Este archivo contiene toda la información de las cartas del juego
// Total: ${updatedCards.length} cartas
import { Card } from '../types';

export const initialCards: Card[] = ${JSON.stringify(updatedCards, null, 2)};

// Initial budget for each faction (Command Points)
export const initialCommandPoints = {
  us: 100,
  china: 100,
};
`;

fs.writeFileSync('./data/cards.ts', newContent, 'utf8');
console.log(`\n✅ Updated ${updatedCards.length} cards with cardType field`);
console.log('✅ File saved to data/cards.ts');
