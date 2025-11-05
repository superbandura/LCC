import fs from 'fs';
import path from 'path';

// Mapeo manual de cartas a tipos basado en análisis visual del color del encabezado
// Rojo = attack, Verde = maneuver, Púrpura = interception, Amarillo = intelligence, Azul = communications

type CardType = 'attack' | 'maneuver' | 'interception' | 'intelligence' | 'communications';

// Mapeo de palabras clave en nombres de cartas para detectar el tipo
const typeKeywords: Record<CardType, string[]> = {
  attack: ['Strike', 'Attack', 'Bomber', 'Torpedo', 'Missile', 'Weapon', 'Hypersonic', 'Ballistic', 'Fire', 'HIMARS', 'Anti-Tank', 'Cluster Bombs'],
  maneuver: ['Movement', 'Insertion', 'Amphibious', 'Vertical', 'Helo', 'Logistics', 'Transport', 'Riverine', 'Mobility', 'Seaplanes', 'Lift', 'Landing', 'LAW'],
  interception: ['Defense', 'THAAD', 'Aegis', 'Patriot', 'IAMD', 'Intercept', 'ASW', 'UUV Defense'],
  intelligence: ['Satellites', 'Intelligence', 'Surveillance', 'Recon', 'ISR', 'SIGINT', 'Signal Intelligence', 'Open Source', 'U-2', 'JSTARS', 'Early Warning', 'Sensor'],
  communications: ['Network', 'Cyber', 'C2', 'Tactical Network', 'Deception', 'Jamming', 'EMS', 'Electro-Magnetic', 'PSYOP', 'Influence', 'Disinformation', 'Combat Camera', 'Public Affairs', 'Civil Affairs', 'AI-Enabled']
};

// Mapeo manual explícito por número de carta (basado en análisis visual)
const USMC_CARD_TYPES: Record<string, CardType> = {
  '01': 'communications', // Tactical Network - amarillo
  '02': 'communications', // Combat Air Patrols - amarillo
  '03': 'attack', // Deep Strike - rojo
  '04': 'attack', // Unmanned Helo - rojo (ataque con helo)
  '05': 'interception', // THAAD - púrpura
  '06': 'attack', // Maritime Strike Tomahawk - rojo
  '07': 'intelligence', // Space Satellites - amarillo
  '08': 'attack', // B-1B Lancer - rojo
  '09': 'communications', // EMS Jamming - azul
  '10': 'communications', // EMS Defense - azul
  '11': 'attack', // Attack on C2 - rojo
  '12': 'communications', // Tactical Cyber Defenses - azul
  '13': 'communications', // Defensive Cyber - azul
  '14': 'communications', // Offensive Cyber - azul
  '15': 'communications', // Military Deception - azul
  '16': 'maneuver', // Logistics Unmanned - verde
  '17': 'attack', // B-2 Bomber - rojo
  '18': 'attack', // B-52 - rojo
  '19': 'communications', // Network Resiliency - azul
  '20': 'attack', // Maritime Mines - rojo
  '21': 'attack', // Submarine Strike - rojo
  '22': 'maneuver', // Vertical Insertion - verde
  '23': 'maneuver', // Mine Clearing - verde
  '24': 'maneuver', // Host Nation Logistics - verde
  '25': 'maneuver', // Behind Enemy Lines - verde
  '26': 'intelligence', // Ground Sensors - amarillo
  '27': 'maneuver', // Stealth Helo - verde
  '28': 'communications', // GPS Spoofing - azul
  '29': 'attack', // Precision Strike - rojo
  '30': 'interception', // G ATOR Radar - púrpura
  '31': 'intelligence', // Open Source Intel - amarillo
  '32': 'attack', // Naval Swarm - rojo
  '33': 'interception', // Aegis Ballistic Defense - púrpura
  '34': 'communications', // Blindspot - azul
  '35': 'intelligence', // Quadcopter Drone - amarillo
  '36': 'intelligence', // Unmanned Underwater ISR - amarillo
  '37': 'attack', // Scatterable Landmines - rojo
  '38': 'communications', // Cut The Link - azul
  '39': 'maneuver', // UGVs - verde
  '40': 'communications', // Coordinated Deception - azul
  '41': 'attack', // Anti-Tank Missile - rojo
  '42': 'maneuver', // LAW - verde
  '43': 'maneuver', // Raider Sabotage - verde
  '44': 'attack', // Joint Fires - rojo
  '45': 'intelligence', // Signal Intelligence - amarillo (basado en imagen vista)
  '46': 'communications', // Naval Deception - azul
  '47': 'maneuver', // Riverine Squadron - verde
  '48': 'attack', // F-22 Escorts - rojo
  '49': 'intelligence', // P-8A Surveillance - amarillo
  '50': 'intelligence', // V-BAT - amarillo
};

function detectCardType(cardNumber: string, cardName: string): CardType {
  // 1. Primero verificar mapeo manual
  if (USMC_CARD_TYPES[cardNumber]) {
    return USMC_CARD_TYPES[cardNumber];
  }

  // 2. Detectar por palabras clave en el nombre
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    for (const keyword of keywords) {
      if (cardName.toLowerCase().includes(keyword.toLowerCase())) {
        return type as CardType;
      }
    }
  }

  // 3. Default: communications (más común)
  return 'communications';
}

// Exportar función para uso en otros scripts
export { detectCardType, typeKeywords };

// Mostrar estadísticas si se ejecuta directamente
if (require.main === module) {
  console.log('📊 Card Type Detection System');
  console.log('\nType Keywords:');
  Object.entries(typeKeywords).forEach(([type, keywords]) => {
    console.log(`  ${type}: ${keywords.slice(0, 5).join(', ')}...`);
  });
  console.log(`\n✅ ${Object.keys(USMC_CARD_TYPES).length} USMC cards manually mapped`);
}
