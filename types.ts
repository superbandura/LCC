export type Position = [number, number];

export interface Location {
  id: string;
  name: string;
  region: string;
  country: 'EE. UU.' | 'China';
  type: string;
  description: string;
  coords: Position;
  damagePoints: number; // Número total de puntos de daño
  currentDamage: boolean[]; // Estado de cada punto de daño (true = dañado)
  commandPoints?: number; // Puntos de Mando generados por esta base (0-100)
}

export interface OperationalArea {
  id: string;
  name: string;
  bounds: [Position, Position];
  color?: string;
  fillOpacity?: number;
  assignedCards?: string[]; // Instance IDs de cartas asignadas (permite múltiples instancias de la misma carta)
  playedCards?: string[]; // IDs de cartas que han sido jugadas/activadas en esta área
}

export interface FactionDamage {
  tacticalNetworkDamage: boolean[]; // 8 checkboxes
  airPatrolsDamage: boolean[]; // 2 checkboxes
  airPatrolsUsed: boolean; // checkbox for used patrols
}

export interface OperationalData {
  us: FactionDamage;
  plan: FactionDamage;
}

export interface MapLayer {
  name: string;
  url: string;
  attribution: string;
}

export type UnitCategory = 'ground' | 'naval' | 'artillery' | 'interception' | 'supply';

export interface Unit {
  id: string;
  name: string; // Unit identifier (e.g., "ALPHA 1", "DDG-56")
  type: string; // Unit type (e.g., 'INFANTRY PLATOON', 'ARLEIGH BURKE CLASS DDG', 'HIMARS SECTION')
  description: string; // Detailed description from tracker
  faction: 'us' | 'china';
  image: string; // Path to unit tracker image
  damagePoints: number; // Total HP/damage capacity (black counter)
  currentDamage: boolean[]; // Damage state array
  taskForceId?: string | null; // ID of the Task Force this unit is assigned to (null if unassigned)
  category?: UnitCategory; // Unit category (ground, naval, artillery, interception, supply)
  // Combat capabilities from tracker counters
  attackPrimary?: number; // Primary attack ammunition (red counter)
  attackSecondary?: number; // Secondary attack ammunition (orange counter)
  interception?: number; // Interception weapons (purple counter)
  supply?: number; // Supply points (blue counter)
  groundCombat?: number; // Ground combat ammunition (green counter)
  // Ammunition tracking - tracks spent ammunition for each capability
  attackPrimaryUsed?: number; // Spent primary attack ammunition
  attackSecondaryUsed?: number; // Spent secondary attack ammunition
  interceptionUsed?: number; // Spent interception weapons
  supplyUsed?: number; // Spent supply points
  groundCombatUsed?: number; // Spent ground combat ammunition
  // Detection status - for fog of war mechanics
  isDetected?: boolean; // Detection status (false = hidden/oculta, true = detected/detectada). Default: false
  // Card attachment - cards that provide bonuses to the unit
  attachedCard?: string; // ID of attached card (only 1 card allowed per unit)
  // Command points cost for deployment
  deploymentCost?: number; // Command points required to deploy this unit to a Task Force
  // Deployment time tracking
  deploymentTime?: number; // Days until activation (default 2 for reinforcements)
  isPendingDeployment?: boolean; // true if unit is in transit
}

export interface TaskForce {
  id: string;
  name: string;
  faction: 'us' | 'china';
  operationalAreaId: string | null; // Null cuando la TF no ha sido desplegada
  isDeployed?: boolean; // false = creada pero no desplegada, true = desplegada en área operacional
  isPendingDeployment?: boolean; // true if entire TF is in transit
}

export type CardType = 'attack' | 'maneuver' | 'interception' | 'intelligence' | 'communications';

export type SubmarineCardType = 'submarine' | 'asw' | 'asset';

export interface Card {
  id: string;
  name: string;
  faction: 'us' | 'china';
  imagePath: string;
  cost: number;
  cardType: CardType;
  // Unit attachment capabilities
  isAttachable?: boolean; // Indica si la carta puede adjuntarse a unidades
  attachableCategory?: UnitCategory; // Categoría única de unidad a la que se puede adjuntar
  hpBonus?: number; // Puntos de vida adicionales que otorga (0-10)
  secondaryAmmoBonus?: number; // Munición secundaria adicional que otorga (0-50)
  // Purchase conditions
  requiresBaseCondition?: boolean; // Indica si la carta tiene condición de base
  requiredBaseId?: string; // ID de la base requerida para comprar la carta
  requiredBaseMaxDamage?: number; // Umbral de daño: la base debe tener MENOS daño que este valor
  maxPurchases?: number; // Límite total de compras (incluyendo asignadas y no asignadas)
  // Deployment time
  deploymentTime?: number; // Days until card is operational (0 = immediate, 1-7 = days)
  // Transport capabilities
  isTransport?: boolean; // Indica si la carta es un vehículo de transporte
  transportCapacity?: number; // Número de unidades que puede transportar (1-20)
  transportSlots?: string[]; // Tipos de unidad permitidos por slot (array de longitud igual a transportCapacity)
  embarkedUnits?: string[]; // IDs de unidades embarcadas (se copia desde la instancia al enviar a área operacional)
  // Influence card capabilities
  isInfluenceCard?: boolean; // Indica si la carta afecta el marcador de influencia mediante tirada de dados
  influenceThresholds?: InfluenceThreshold[]; // Umbrales de tirada para efectos de influencia (solo para cartas de influencia)
  // Submarine campaign
  sub?: boolean; // Indica si la carta puede ser desplegada en la campaña submarina
  submarineType?: SubmarineCardType; // Tipo de carta submarina: submarino, ASW, o asset
  // Infinite uses
  infinite?: boolean; // Indica si la carta tiene usos infinitos (no desaparece al ser desplegada)
}

export interface CommandPoints {
  us: number;
  china: number;
}

export interface PurchaseHistory {
  us: number; // Total lifetime card purchases for US faction
  china: number; // Total lifetime card purchases for China faction
}

export interface CardPurchaseHistory {
  us: Record<string, number>; // Per-card lifetime purchase count for US (e.g., { "us-001": 3, "us-002": 1 })
  china: Record<string, number>; // Per-card lifetime purchase count for China (e.g., { "china-001": 2 })
}

export interface PurchasedCardInstance {
  instanceId: string; // Unique ID for this specific card instance (e.g., "us-attack-001_1234567890")
  cardId: string; // Reference to the card in the cards catalog
  embarkedUnits?: string[]; // IDs of units embarked on this transport card instance
  purchasedAt?: number; // Timestamp when purchased (for ordering)
}

export interface PurchasedCards {
  us: PurchasedCardInstance[]; // Array of card instances purchased by US but not yet deployed
  china: PurchasedCardInstance[]; // Array of card instances purchased by China but not yet deployed
}

export interface DestructionRecord {
  unitId: string;
  unitName: string;
  unitType: string;
  faction: 'us' | 'china';
  timestamp: number; // Unix timestamp
  operationalAreaId?: string;
  operationalAreaName?: string;
  taskForceId?: string;
  taskForceName?: string;
}

export interface FactionStats {
  total: number;
  operational: number;
  destroyed: number;
}

export interface CombatStatistics {
  us: FactionStats;
  china: FactionStats;
}

export interface TurnState {
  currentDate: string; // ISO date string (e.g., "2030-06-02")
  dayOfWeek: number; // 1-7 (1=lunes, 7=domingo)
  turnNumber: number; // Contador de semanas completadas (0 = Planificación)
  isPlanningPhase?: boolean; // true = turno especial de planificación, false/undefined = turno normal
}

// Deployment tracking for cards in transit
export interface PendingCardDeployment {
  cardId: string;               // Card definition ID (for looking up card data)
  cardInstanceId: string;       // Unique instance ID (stored in assignedCards when activated)
  areaId: string;
  faction: 'us' | 'china';
  deployedAtTurn: number;      // Turn when card was assigned
  deployedAtDay: number;        // Day of week (1-7) when assigned
  activatesAtTurn: number;      // Turn when card becomes operational
  activatesAtDay: number;       // Day when card becomes operational
  embarkedUnits?: string[];     // Units embarked on transport cards
}

// Deployment tracking for units in transit (reinforcements)
export interface PendingUnitDeployment {
  unitId: string;
  taskForceId: string;
  faction: 'us' | 'china';
  deployedAtTurn: number;
  deployedAtDay: number;
  activatesAtTurn: number;
  activatesAtDay: number;
}

// Deployment tracking for entire Task Forces in transit
export interface PendingTaskForceDeployment {
  taskForceId: string;
  faction: 'us' | 'china';
  deployedAtTurn: number;
  deployedAtDay: number;
  activatesAtTurn: number;
  activatesAtDay: number;
}

// Global collection of pending deployments
export interface PendingDeployments {
  cards: PendingCardDeployment[];
  units: PendingUnitDeployment[];
  taskForces: PendingTaskForceDeployment[];
}

// Influence marker for tracking campaign progress (-10 to +10)
export interface InfluenceMarker {
  value: number; // Range: -10 to -1 (China advantage) | 0 (neutral) | +1 to +10 (US advantage)
}

// Notification for played cards (shown to both players)
export interface PlayedCardNotification {
  cardId: string;                    // ID of the played card
  cardName: string;                  // Name of the played card
  cardImagePath: string;             // Image path for display
  areaName: string;                  // Operational area where card was played
  faction: 'us' | 'china';           // Faction that played the card
  timestamp: string;                 // ISO timestamp when card was played
  turn: number;                      // Turn number when played
  dayOfWeek: number;                 // Day of week (1-7) when played
  // Optional fields for influence cards
  isInfluenceCard?: boolean;         // Indicates this is an influence card notification
  diceRoll?: number;                 // The d20 roll result (1-20)
  influenceEffect?: number;          // Change to marker (-10 to +10)
  influenceDescription?: string;     // Effect description from threshold
  previousInfluence?: number;        // Influence before card (-10 to +10)
  newInfluence?: number;             // Influence after card (-10 to +10)
  notificationPhase?: 'card_shown' | 'result_ready';  // Phase for influence cards (card display → result display)
}

// Influence card dice roll thresholds
export interface InfluenceThreshold {
  minRoll: number;         // Minimum roll value (inclusive, 1-20)
  maxRoll: number;         // Maximum roll value (inclusive, 1-20)
  influenceEffect: number; // Effect on influence marker (-10 to +10)
  description: string;     // Description of the effect (e.g., "Decisive Success (+3)")
}

// =======================================
// SUBMARINE CAMPAIGN SYSTEM
// =======================================

// Order status for submarine operations
export type OrderStatus = 'pending' | 'executing' | 'completed' | 'failed';

// Types of submarine orders
export type SubmarineOrderType = 'patrol' | 'attack' | 'deploy';

// Types of submarine events
export type SubmarineEventType = 'deployment' | 'attack_success' | 'attack_failure' | 'detected' | 'destroyed' | 'return' | 'communication_failure';

// Status of deployed submarines
export type SubmarineStatus = 'active' | 'destroyed' | 'returned';

// Target types for submarine attacks
export type SubmarineTargetType = 'base' | 'unit' | 'area';

// Submarine order interface
export interface SubmarineOrder {
  orderId: string;                      // Unique order ID
  submarineId: string;                  // ID of submarine executing order
  orderType: SubmarineOrderType;        // Type of order (patrol, attack)
  status: OrderStatus;                  // Current status
  targetId?: string;                    // Target ID (for attacks)
  targetType?: SubmarineTargetType;     // Target type (for attacks)
  assignedTurn: number;                 // Turn when order was assigned
  executionTurn?: number;               // Turn when order will be executed (for delayed attacks)
  resolvedTurn?: number;                // Turn when order was resolved
  result?: 'success' | 'failure' | 'detected'; // Order result
}

// Deployed submarine interface
export interface SubmarineDeployment {
  id: string;                           // Unique submarine deployment ID
  cardId: string;                       // Original card ID (e.g., "us-069")
  cardName: string;                     // Original card name (e.g., "Virginia-Class Sub")
  cardType: CardType;                   // Original card type
  submarineType?: SubmarineCardType;    // Type of submarine card (submarine, ASW, asset)
  submarineName: string;                // Assigned submarine name (e.g., "USS Virginia")
  faction: 'us' | 'china';              // Faction
  deployedAt: number;                   // Deployment timestamp
  currentOrder?: SubmarineOrder;        // Current assigned order
  pendingOrder?: SubmarineOrder;        // Pending order (not confirmed, no CP cost yet)
  currentAreaId?: string;               // Current operational area ID (for communication checks)
  communicationBlockedUntilDay?: number; // Day of week (0-6) until communication is blocked due to failure
  status: SubmarineStatus;              // Submarine status
  missionsCompleted: number;            // Number of completed missions
  totalKills: number;                   // Number of targets destroyed
}

// Target information for submarine events
export interface SubmarineEventTarget {
  targetId: string;                     // Target ID
  targetName: string;                   // Target name
  targetType: SubmarineTargetType;      // Target type
  damageDealt?: number;                 // Damage dealt (if applicable)
}

// Detailed roll information for admin report (optional)
export interface SubmarineEventRollDetails {
  primaryRoll?: number;                 // Primary d20 roll (patrol/attack/detection)
  secondaryRoll?: number;               // Secondary d20 roll (damage/elimination)
  primaryThreshold?: number;            // Success threshold for primary roll
  secondaryThreshold?: number;          // Success threshold for secondary roll
  executionTurn?: number;               // For attacks: turn when attack executes
  aswElementInfo?: {                    // For ASW events: details of detecting element
    elementId: string;                  // ASW element ID
    elementName: string;                // ASW element name
    elementType: 'card' | 'ship' | 'submarine'; // Type of ASW element
    areaId?: string;                    // Area where ASW element is located
    areaName?: string;                  // Area name
  };
}

// Submarine event interface
export interface SubmarineEvent {
  eventId: string;                      // Unique event ID
  submarineId: string;                  // Submarine ID
  submarineName: string;                // Submarine name
  faction: 'us' | 'china';              // Faction
  cardId: string;                       // Original card ID
  cardName: string;                     // Original card name
  submarineType?: SubmarineCardType;    // Submarine type (submarine, asw, asset)
  eventType: SubmarineEventType;        // Event type
  timestamp: number;                    // Event timestamp
  turn: number;                         // Campaign turn number
  dayOfWeek?: number;                   // Day of week when event occurred (1-7)
  targetInfo?: SubmarineEventTarget;    // Target information (if applicable)
  description: string;                  // Event description for UI
  rollDetails?: SubmarineEventRollDetails; // Detailed roll information for admin report
}

// ASW-capable surface ship deployment (locked at turn start)
export interface AswShipDeployment {
  unitId: string;                             // Unit ID
  unitName: string;                           // Unit name
  unitType: string;                           // Unit type (DDG, FFG, etc.)
  taskForceId: string;                        // Task Force ID
  taskForceName: string;                      // Task Force name
  operationalAreaId: string;                  // Operational Area ID
  operationalAreaName: string;                // Operational Area name
  faction: 'us' | 'china';                    // Faction
}

// Submarine campaign state interface
export interface SubmarineCampaignState {
  deployedSubmarines: SubmarineDeployment[];  // All deployed submarines
  events: SubmarineEvent[];                   // Event log
  currentTurn: number;                        // Current campaign turn
  usedSubmarineNames: {                       // Track used names to avoid duplicates
    us: string[];
    china: string[];
  };
  aswShips?: AswShipDeployment[];             // ASW-capable ships (locked at turn start)
}

// =======================================
// PLAYER ASSIGNMENT SYSTEM
// =======================================

// Registered player (auto-registered when entering game)
export interface RegisteredPlayer {
  playerName: string;           // Player's chosen name
  faction: 'us' | 'china';      // Player's faction
  registeredAt: string;         // ISO timestamp when registered
}

// Player assignment to operational areas
export interface PlayerAssignment {
  playerName: string;           // Player's chosen name
  operationalAreaId: string;    // ID of assigned operational area
  faction: 'us' | 'china';      // Player's faction
  assignedAt: string;           // ISO timestamp when assigned
}

