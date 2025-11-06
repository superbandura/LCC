import { doc, getDoc, onSnapshot, setDoc, updateDoc, Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";
import { OperationalArea, OperationalData, Location, TaskForce, Unit, Card, CommandPoints, PurchaseHistory, CardPurchaseHistory, PurchasedCards, DestructionRecord, DrawingAnnotation, TurnState, PendingDeployments, InfluenceMarker, SubmarineCampaignState, PlayedCardNotification, PlayerAssignment, RegisteredPlayer } from "./types";

// Reference to the main game document
const GAME_DOC_REF = doc(db, "game", "current");

// Helper functions to convert between nested arrays and flat structure
// Firestore doesn't support nested arrays, so we need to flatten/unflatten

interface FirestoreOperationalArea {
  id: string;
  name: string;
  bounds: number[]; // Flattened: [lat1, lng1, lat2, lng2]
  color?: string;
  fillOpacity?: number;
  assignedCards?: string[]; // IDs of cards assigned to this area
  playedCards?: string[]; // IDs of cards that have been played/activated in this area
}

const areaToFirestore = (area: OperationalArea): FirestoreOperationalArea => {
  // Handle both nested [[lat1,lng1],[lat2,lng2]] and flat [lat1,lng1,lat2,lng2] formats
  let flatBounds: number[];

  if (Array.isArray(area.bounds[0])) {
    // Nested format: [[lat1,lng1],[lat2,lng2]]
    flatBounds = [
      (area.bounds as any)[0][0], // lat1
      (area.bounds as any)[0][1], // lng1
      (area.bounds as any)[1][0], // lat2
      (area.bounds as any)[1][1], // lng2
    ];
  } else {
    // Already flat: [lat1, lng1, lat2, lng2]
    flatBounds = area.bounds as any;
  }

  return {
    ...area,
    bounds: flatBounds,
  };
};

const areaFromFirestore = (fsArea: FirestoreOperationalArea): OperationalArea => ({
  ...fsArea,
  bounds: [
    [fsArea.bounds[0], fsArea.bounds[1]], // [lat1, lng1]
    [fsArea.bounds[2], fsArea.bounds[3]], // [lat2, lng2]
  ],
});

/**
 * Subscribe to operational areas changes in real-time
 * @param callback Function called when operational areas change
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToOperationalAreas = (
  callback: (areas: OperationalArea[]) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.operationalAreas) {
        // Convert from Firestore format to app format
        const fsAreas = data.operationalAreas as FirestoreOperationalArea[];
        const areas = fsAreas.map(areaFromFirestore);
        callback(areas);
      }
    }
  }, (error) => {
    console.error("Error listening to operational areas:", error);
  });
};

/**
 * Subscribe to operational data changes in real-time
 * @param callback Function called when operational data changes
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToOperationalData = (
  callback: (data: Record<string, OperationalData>) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.operationalData) {
        callback(data.operationalData as Record<string, OperationalData>);
      }
    }
  }, (error) => {
    console.error("Error listening to operational data:", error);
  });
};

/**
 * Update operational areas in Firestore
 * @param areas New operational areas array
 */
export const updateOperationalAreas = async (
  areas: OperationalArea[]
): Promise<void> => {
  try {
    // Convert to Firestore-compatible format (flatten nested arrays) and remove undefined fields
    const fsAreas = areas.map(areaToFirestore).map(removeUndefinedFields);
    await setDoc(GAME_DOC_REF, { operationalAreas: fsAreas }, { merge: true });
  } catch (error) {
    console.error("Error updating operational areas:", error);
    throw error;
  }
};

/**
 * Update operational data in Firestore
 * @param data New operational data object
 */
export const updateOperationalData = async (
  data: Record<string, OperationalData>
): Promise<void> => {
  try {
    // Clean operational data (it's an object with nested objects)
    const cleanedOperationalData: Record<string, any> = {};
    for (const areaId in data) {
      cleanedOperationalData[areaId] = removeUndefinedFields(data[areaId]);
    }
    await setDoc(GAME_DOC_REF, { operationalData: cleanedOperationalData }, { merge: true });
  } catch (error) {
    console.error("Error updating operational data:", error);
    throw error;
  }
};

/**
 * Subscribe to locations changes in real-time
 * @param callback Function called when locations change
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToLocations = (
  callback: (locations: Location[]) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.locations) {
        callback(data.locations as Location[]);
      }
    }
  }, (error) => {
    console.error("Error listening to locations:", error);
  });
};

/**
 * Update locations in Firestore
 * @param locations New locations array
 */
export const updateLocations = async (
  locations: Location[]
): Promise<void> => {
  try {
    // Remove undefined fields from locations (Firestore doesn't support undefined)
    const cleanedLocations = locations.map(removeUndefinedFields);
    await setDoc(GAME_DOC_REF, { locations: cleanedLocations }, { merge: true });
  } catch (error) {
    console.error("Error updating locations:", error);
    throw error;
  }
};

/**
 * Subscribe to task forces changes in real-time
 * @param callback Function called when task forces change
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToTaskForces = (
  callback: (taskForces: TaskForce[]) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.taskForces) {
        callback(data.taskForces as TaskForce[]);
      }
    }
  }, (error) => {
    console.error("Error listening to task forces:", error);
  });
};

/**
 * Update task forces in Firestore
 * @param taskForces New task forces array
 */
export const updateTaskForces = async (
  taskForces: TaskForce[]
): Promise<void> => {
  try {
    // Remove undefined fields from task forces (Firestore doesn't support undefined)
    const cleanedTaskForces = taskForces.map(removeUndefinedFields);
    await setDoc(GAME_DOC_REF, { taskForces: cleanedTaskForces }, { merge: true });
  } catch (error) {
    console.error("Error updating task forces:", error);
    throw error;
  }
};

/**
 * Subscribe to units changes in real-time
 * @param callback Function called when units change
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToUnits = (
  callback: (units: Unit[]) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.units) {
        callback(data.units as Unit[]);
      }
    }
  }, (error) => {
    console.error("Error listening to units:", error);
  });
};

/**
 * Update units in Firestore
 * @param units New units array
 */
export const updateUnits = async (
  units: Unit[]
): Promise<void> => {
  try {
    // Remove undefined fields from units (Firestore doesn't support undefined)
    const cleanedUnits = units.map(removeUndefinedFields);
    await setDoc(GAME_DOC_REF, { units: cleanedUnits }, { merge: true });
  } catch (error) {
    console.error("Error updating units:", error);
    throw error;
  }
};

/**
 * Initialize the game document with default data if it doesn't exist
 * @param defaultAreas Default operational areas
 * @param defaultData Default operational data
 * @param defaultLocations Default locations (bases)
 * @param defaultTaskForces Default task forces
 * @param defaultUnits Default units
 */
// Helper function to recursively remove undefined fields from objects and arrays
// Firestore doesn't support undefined values
const removeUndefinedFields = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedFields(item)) as T;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        // Recursively clean nested objects/arrays
        cleaned[key] = removeUndefinedFields(obj[key]);
      } else if (key === 'isDetected') {
        // Preserve isDetected with default false value (for fog of war system)
        // This ensures all units always have isDetected field, preventing units from disappearing
        cleaned[key] = false;
      }
    }
    return cleaned as T;
  }

  // Return primitive values as-is
  return obj;
};

export const initializeGameData = async (
  defaultAreas: OperationalArea[],
  defaultData: Record<string, OperationalData>,
  defaultLocations: Location[],
  defaultTaskForces: TaskForce[],
  defaultUnits: Unit[],
  defaultCards: Card[],
  defaultCommandPoints: CommandPoints,
  defaultPurchaseHistory: PurchaseHistory,
  defaultTurnState: TurnState,
  defaultInfluenceMarker: InfluenceMarker
): Promise<void> => {
  try {
    // Check if the document already exists
    const docSnap = await getDoc(GAME_DOC_REF);

    // Only initialize if the document doesn't exist yet
    if (!docSnap.exists()) {
      console.log("Initializing game data with default values...");
      // Convert to Firestore-compatible format (flatten nested arrays)
      const fsAreas = defaultAreas.map(areaToFirestore).map(removeUndefinedFields);

      // Remove undefined fields from all data (Firestore doesn't support undefined)
      const cleanedUnits = defaultUnits.map(removeUndefinedFields);
      const cleanedLocations = defaultLocations.map(removeUndefinedFields);
      const cleanedCards = defaultCards.map(removeUndefinedFields);
      const cleanedTaskForces = defaultTaskForces.map(removeUndefinedFields);

      // Clean operational data (it's an object with nested objects)
      const cleanedOperationalData: Record<string, any> = {};
      for (const areaId in defaultData) {
        cleanedOperationalData[areaId] = removeUndefinedFields(defaultData[areaId]);
      }

      // Clean command points for consistency
      const cleanedCommandPoints = removeUndefinedFields(defaultCommandPoints) as CommandPoints;

      // Clean purchase history for consistency
      const cleanedPurchaseHistory = removeUndefinedFields(defaultPurchaseHistory) as PurchaseHistory;

      await setDoc(GAME_DOC_REF, {
        operationalAreas: fsAreas,
        operationalData: cleanedOperationalData,
        locations: cleanedLocations,
        taskForces: cleanedTaskForces,
        units: cleanedUnits,
        cards: cleanedCards,
        commandPoints: cleanedCommandPoints,
        purchaseHistory: cleanedPurchaseHistory, // Initialize purchase history counter
        cardPurchaseHistory: { us: {}, china: {} }, // Initialize per-card purchase history
        purchasedCards: { us: [], china: [] }, // Initialize purchased cards
        pendingDeployments: { cards: [], units: [], taskForces: [] }, // Initialize pending deployments
        turnState: defaultTurnState,
        influenceMarker: defaultInfluenceMarker, // Initialize influence marker
        submarineCampaign: { // Initialize submarine campaign
          deployedSubmarines: [],
          events: [],
          currentTurn: 0,
          usedSubmarineNames: {
            us: [],
            china: []
          },
          aswShips: [] // Initialize ASW ships snapshot
        },
      }, { merge: true });
    } else {
      console.log("Game data already exists, skipping initialization");
    }
  } catch (error) {
    console.error("Error initializing game data:", error);
    throw error;
  }
};

/**
 * Subscribe to cards changes in real-time
 * @param callback Function called when cards change
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToCards = (
  callback: (cards: Card[]) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.cards) {
        callback(data.cards as Card[]);
      }
    }
  }, (error) => {
    console.error("Error listening to cards:", error);
  });
};

/**
 * Update cards in Firestore
 * @param cards New cards array
 */
export const updateCards = async (
  cards: Card[]
): Promise<void> => {
  try {
    // Remove undefined fields from cards (Firestore doesn't support undefined)
    const cleanedCards = cards.map(removeUndefinedFields);
    await setDoc(GAME_DOC_REF, { cards: cleanedCards }, { merge: true });
  } catch (error) {
    console.error("Error updating cards:", error);
    throw error;
  }
};

/**
 * Subscribe to command points changes in real-time
 * @param callback Function called when command points change
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToCommandPoints = (
  callback: (points: CommandPoints) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.commandPoints) {
        callback(data.commandPoints as CommandPoints);
      }
    }
  }, (error) => {
    console.error("Error listening to command points:", error);
  });
};

/**
 * Update command points in Firestore
 * @param points New command points object
 */
export const updateCommandPoints = async (
  points: CommandPoints
): Promise<void> => {
  try {
    await setDoc(GAME_DOC_REF, { commandPoints: points }, { merge: true });
  } catch (error) {
    console.error("Error updating command points:", error);
    throw error;
  }
};

/**
 * Subscribe to purchase history changes in real-time
 * @param callback Function called when purchase history changes
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToPurchaseHistory = (
  callback: (history: PurchaseHistory) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.purchaseHistory) {
        callback(data.purchaseHistory as PurchaseHistory);
      }
    }
  }, (error) => {
    console.error("Error listening to purchase history:", error);
  });
};

/**
 * Update purchase history in Firestore
 * @param history The updated purchase history object
 */
export const updatePurchaseHistory = async (
  history: PurchaseHistory
): Promise<void> => {
  try {
    await setDoc(GAME_DOC_REF, { purchaseHistory: history }, { merge: true });
  } catch (error) {
    console.error("Error updating purchase history:", error);
    throw error;
  }
};

/**
 * Subscribe to per-card purchase history changes in real-time
 * @param callback Function called when card purchase history changes
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToCardPurchaseHistory = (
  callback: (history: CardPurchaseHistory) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.cardPurchaseHistory) {
        callback(data.cardPurchaseHistory as CardPurchaseHistory);
      } else {
        // Initialize with empty objects if doesn't exist
        callback({ us: {}, china: {} });
      }
    }
  }, (error) => {
    console.error("Error listening to card purchase history:", error);
  });
};

/**
 * Update per-card purchase history in Firestore
 * @param history The updated card purchase history object
 */
export const updateCardPurchaseHistory = async (
  history: CardPurchaseHistory
): Promise<void> => {
  try {
    await setDoc(GAME_DOC_REF, { cardPurchaseHistory: history }, { merge: true });
  } catch (error) {
    console.error("Error updating card purchase history:", error);
    throw error;
  }
};

/**
 * Subscribe to purchased cards changes in real-time
 * @param callback Function to call with updated purchased cards
 * @returns Unsubscribe function
 */
export const subscribeToPurchasedCards = (
  callback: (purchasedCards: PurchasedCards) => void
): (() => void) => {
  return onSnapshot(GAME_DOC_REF, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const purchasedCards = data.purchasedCards || { us: [], china: [] };
      callback(purchasedCards);
    } else {
      callback({ us: [], china: [] });
    }
  }, (error) => {
    console.error("Error listening to purchased cards:", error);
  });
};

/**
 * Update purchased cards in Firestore
 * @param purchasedCards New purchased cards object
 */
export const updatePurchasedCards = async (
  purchasedCards: PurchasedCards
): Promise<void> => {
  try {
    await setDoc(GAME_DOC_REF, { purchasedCards }, { merge: true });
  } catch (error) {
    console.error("Error updating purchased cards:", error);
    throw error;
  }
};

/**
 * Calculate command points from bases
 * Command points are reduced proportionally based on damage
 * Influence marker affects final command points: each point = 10% bonus/penalty
 * IMPORTANT: Influence bonus should only be applied at end of week, not mid-week or planning phase
 * @param locations Array of bases/locations
 * @param influenceValue Influence marker value (-10 to +10)
 * @param applyInfluenceBonus Whether to apply influence bonus (default: true). Set to false for planning phase.
 * @returns Total command points for each faction
 */
export const calculateCommandPoints = (
  locations: Location[],
  influenceValue: number = 0,
  applyInfluenceBonus: boolean = true
): CommandPoints => {
  const points: CommandPoints = { us: 0, china: 0 };

  locations.forEach(loc => {
    // Skip bases without command points
    if (!loc.commandPoints || loc.commandPoints === 0) return;

    // Calculate damage ratio
    const damageCount = loc.currentDamage.filter(d => d === true).length;
    const damageRatio = damageCount / loc.damagePoints;

    // Calculate effective command points (reduced by damage)
    const effectivePoints = Math.floor(loc.commandPoints * (1 - damageRatio));

    // Add to the appropriate faction
    if (loc.country === 'EE. UU.') {
      points.us += effectivePoints;
    } else if (loc.country === 'China') {
      points.china += effectivePoints;
    }
  });

  // Apply influence modifier ONLY if flag is true (each point = 10% bonus/penalty)
  // This should only be applied at end of week, not during planning phase
  if (applyInfluenceBonus && influenceValue !== 0) {
    const influenceMultiplier = Math.abs(influenceValue) * 0.1;

    if (influenceValue > 0) {
      // Positive influence: US gets bonus, China gets penalty
      points.us = Math.floor(points.us * (1 + influenceMultiplier));
      points.china = Math.floor(points.china * (1 - influenceMultiplier));
    } else {
      // Negative influence: China gets bonus, US gets penalty
      points.china = Math.floor(points.china * (1 + influenceMultiplier));
      points.us = Math.floor(points.us * (1 - influenceMultiplier));
    }
  }

  return points;
};

/**
 * Clean orphaned units - units that reference non-existent task forces
 * @param units Array of units to clean
 * @param taskForces Array of existing task forces
 * @returns Cleaned units array with orphaned references set to null
 */
export const cleanOrphanedUnits = (units: Unit[], taskForces: TaskForce[]): Unit[] => {
  const validTaskForceIds = new Set(taskForces.map(tf => tf.id));

  return units.map(unit => {
    // Skip units that are embarked on transport cards (EMBARKED_ prefix)
    if (unit.taskForceId?.startsWith('EMBARKED_')) {
      return unit; // Don't clean embarked units
    }

    // If unit has a taskForceId that doesn't exist in task forces, set it to null
    if (unit.taskForceId && !validTaskForceIds.has(unit.taskForceId)) {
      console.warn(`Unit ${unit.id} (${unit.name}) has orphaned taskForceId: ${unit.taskForceId}. Cleaning...`);
      return { ...unit, taskForceId: null };
    }
    return unit;
  });
};

/**
 * Reset game data to initial/default values
 * WARNING: This will overwrite ALL game data!
 * @param defaultAreas Default operational areas
 * @param defaultData Default operational data
 * @param defaultLocations Default locations (bases)
 * @param defaultTaskForces Default task forces
 * @param defaultUnits Default units
 * @param defaultCards Default cards
 * @param defaultCommandPoints Default command points
 * @param defaultTurnState Default turn state
 */
export const resetGameData = async (
  defaultAreas: OperationalArea[],
  defaultData: Record<string, OperationalData>,
  defaultLocations: Location[],
  defaultTaskForces: TaskForce[],
  defaultUnits: Unit[],
  defaultCards: Card[],
  defaultCommandPoints: CommandPoints,
  defaultTurnState: TurnState,
  defaultInfluenceMarker: InfluenceMarker
): Promise<void> => {
  try {
    console.log("Resetting game data to initial values...");
    // Convert to Firestore-compatible format (flatten nested arrays)
    const fsAreas = defaultAreas.map(areaToFirestore).map(removeUndefinedFields);

    // Remove undefined fields from all data (Firestore doesn't support undefined)
    const cleanedUnits = defaultUnits.map(removeUndefinedFields);
    const cleanedLocations = defaultLocations.map(removeUndefinedFields);
    const cleanedCards = defaultCards.map(removeUndefinedFields);
    const cleanedTaskForces = defaultTaskForces.map(removeUndefinedFields);

    // Clean operational data (it's an object with nested objects)
    const cleanedOperationalData: Record<string, any> = {};
    for (const areaId in defaultData) {
      cleanedOperationalData[areaId] = removeUndefinedFields(defaultData[areaId]);
    }

    // Clean command points for consistency
    const cleanedCommandPoints = removeUndefinedFields(defaultCommandPoints) as CommandPoints;

    // Prepare data object to save
    const dataToSave = {
      operationalAreas: fsAreas,
      operationalData: cleanedOperationalData,
      locations: cleanedLocations,
      taskForces: cleanedTaskForces,
      units: cleanedUnits,
      cards: cleanedCards,
      commandPoints: cleanedCommandPoints,
      purchasedCards: { us: [], china: [] }, // Reset purchased cards
      pendingDeployments: { cards: [], units: [], taskForces: [] }, // Reset pending deployments
      turnState: defaultTurnState,
      influenceMarker: defaultInfluenceMarker, // Reset influence marker
    };

    // Debug logging to identify any remaining undefined values
    console.log("🔍 DEBUG - Data to save:", JSON.stringify(dataToSave, (key, value) => {
      if (value === undefined) {
        console.error(`⚠️ Found undefined value for key: ${key}`);
        return '<<UNDEFINED>>';
      }
      return value;
    }, 2));

    // Overwrite entire document with default values
    await setDoc(GAME_DOC_REF, dataToSave);

    console.log("Game data reset successfully");
  } catch (error) {
    console.error("Error resetting game data:", error);
    throw error;
  }
};

/**
 * Subscribe to destruction log changes in real-time
 * @param callback Function called when destruction log changes
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToDestructionLog = (
  callback: (log: DestructionRecord[]) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.destructionLog) {
        callback(data.destructionLog as DestructionRecord[]);
      } else {
        // Initialize with empty array if doesn't exist
        callback([]);
      }
    }
  }, (error) => {
    console.error("Error listening to destruction log:", error);
  });
};

/**
 * Update destruction log in Firestore
 * @param log New destruction log array
 */
export const updateDestructionLog = async (
  log: DestructionRecord[]
): Promise<void> => {
  try {
    await setDoc(GAME_DOC_REF, { destructionLog: log }, { merge: true });
  } catch (error) {
    console.error("Error updating destruction log:", error);
    throw error;
  }
};

/**
 * Subscribe to turn state changes in real-time
 * @param callback Function called when turn state changes
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToTurnState = (
  callback: (turnState: TurnState) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.turnState) {
        callback(data.turnState as TurnState);
      }
    }
  }, (error) => {
    console.error("Error listening to turn state:", error);
  });
};

/**
 * Update turn state in Firestore
 * @param turnState New turn state object
 */
export const updateTurnState = async (
  turnState: TurnState
): Promise<void> => {
  try {
    await setDoc(GAME_DOC_REF, { turnState }, { merge: true });
  } catch (error) {
    console.error("Error updating turn state:", error);
    throw error;
  }
};

/**
 * Subscribe to pending deployments changes in real-time
 * @param callback Function called when pending deployments change
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToPendingDeployments = (
  callback: (pendingDeployments: PendingDeployments) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.pendingDeployments) {
        callback(data.pendingDeployments as PendingDeployments);
      } else {
        // Initialize with empty arrays if doesn't exist
        callback({ cards: [], units: [], taskForces: [] });
      }
    }
  }, (error) => {
    console.error("Error listening to pending deployments:", error);
  });
};

/**
 * Update pending deployments in Firestore
 * @param pendingDeployments New pending deployments object
 */
export const updatePendingDeployments = async (
  pendingDeployments: PendingDeployments
): Promise<void> => {
  try {
    await setDoc(GAME_DOC_REF, { pendingDeployments }, { merge: true });
  } catch (error) {
    console.error("Error updating pending deployments:", error);
    throw error;
  }
};

/**
 * Subscribe to influence marker changes in real-time
 * @param callback Function called when influence marker changes
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToInfluenceMarker = (
  callback: (influenceMarker: InfluenceMarker) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.influenceMarker) {
        callback(data.influenceMarker as InfluenceMarker);
      } else {
        // Initialize with neutral value if doesn't exist
        callback({ value: 0 });
      }
    }
  }, (error) => {
    console.error("Error listening to influence marker:", error);
  });
};

/**
 * Update influence marker in Firestore
 * @param influenceMarker New influence marker object
 */
export const updateInfluenceMarker = async (
  influenceMarker: InfluenceMarker
): Promise<void> => {
  try {
    // Clamp value to valid range [-10, 10]
    const clampedValue = Math.max(-10, Math.min(10, influenceMarker.value));
    await setDoc(GAME_DOC_REF, { influenceMarker: { value: clampedValue } }, { merge: true });
  } catch (error) {
    console.error("Error updating influence marker:", error);
    throw error;
  }
};

/**
 * Subscribe to submarine campaign changes in real-time
 * @param callback Function called when submarine campaign state changes
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToSubmarineCampaign = (
  callback: (submarineCampaign: SubmarineCampaignState) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.submarineCampaign) {
        callback(data.submarineCampaign as SubmarineCampaignState);
      } else {
        // Initialize with empty state if doesn't exist
        callback({
          deployedSubmarines: [],
          events: [],
          currentTurn: 0,
          usedSubmarineNames: {
            us: [],
            china: []
          },
          aswShips: []
        });
      }
    }
  }, (error) => {
    console.error("Error listening to submarine campaign:", error);
  });
};

/**
 * Update submarine campaign state in Firestore
 * @param submarineCampaign New submarine campaign state object
 */
export const updateSubmarineCampaign = async (
  submarineCampaign: SubmarineCampaignState
): Promise<void> => {
  try {
    await setDoc(GAME_DOC_REF, { submarineCampaign }, { merge: true });
  } catch (error) {
    console.error("Error updating submarine campaign:", error);
    throw error;
  }
};

/**
 * Update only the currentTurn field of submarine campaign (atomic partial update)
 * Prevents race conditions and state overwrites during turn advancement
 * @param turnNumber New turn number to set
 */
export const updateSubmarineCampaignTurn = async (
  turnNumber: number
): Promise<void> => {
  try {
    await updateDoc(GAME_DOC_REF, {
      'submarineCampaign.currentTurn': turnNumber
    });
  } catch (error) {
    console.error("Error updating submarine campaign turn:", error);
    throw error;
  }
};

/**
 * Deploy submarine and update purchased cards in a single atomic operation
 * @param submarineCampaign Updated submarine campaign state
 * @param purchasedCards Updated purchased cards state
 */
export const deploySubmarineAndRemoveFromPurchased = async (
  submarineCampaign: SubmarineCampaignState,
  purchasedCards: PurchasedCards
): Promise<void> => {
  try {
    // Single atomic update to both fields
    await setDoc(GAME_DOC_REF, {
      submarineCampaign,
      purchasedCards
    }, { merge: true });
  } catch (error) {
    console.error("Error deploying submarine:", error);
    throw error;
  }
};

/**
 * Add played card notification to queue
 * @param notification New played card notification to add to queue
 */
export const addPlayedCardNotification = async (
  notification: PlayedCardNotification
): Promise<void> => {
  try {
    const docSnapshot = await getDoc(GAME_DOC_REF);
    if (!docSnapshot.exists()) return;

    const data = docSnapshot.data();
    const queue = data.playedCardNotificationsQueue || [];
    queue.push(notification);

    await setDoc(GAME_DOC_REF, { playedCardNotificationsQueue: queue }, { merge: true });
  } catch (error) {
    console.error('Error adding played card notification:', error);
    throw error;
  }
};

/**
 * Subscribe to played card notifications queue in real-time
 * @param callback Function called when queue changes
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToPlayedCardNotificationsQueue = (
  callback: (notifications: PlayedCardNotification[]) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const queue = data.playedCardNotificationsQueue || [];
      console.log('📡 [SUBSCRIPTION] onSnapshot triggered - queue received:', queue.map((n: PlayedCardNotification) => ({
        timestamp: n.timestamp,
        phase: n.notificationPhase,
        faction: n.faction,
        cardName: n.cardName
      })));
      callback(queue);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to played card notifications queue:", error);
  });
};

/**
 * Remove played card notification from queue by timestamp
 * @param timestamp Timestamp of notification to remove
 */
export const removePlayedCardNotification = async (timestamp: string): Promise<void> => {
  try {
    const docSnapshot = await getDoc(GAME_DOC_REF);
    if (!docSnapshot.exists()) return;

    const data = docSnapshot.data();
    const queue = data.playedCardNotificationsQueue || [];
    const filtered = queue.filter((n: PlayedCardNotification) => n.timestamp !== timestamp);

    await setDoc(GAME_DOC_REF, { playedCardNotificationsQueue: filtered }, { merge: true });
  } catch (error) {
    console.error('Error removing played card notification:', error);
    throw error;
  }
};

/**
 * Update played card notification in queue by timestamp
 * @param timestamp Timestamp of notification to update
 * @param updates Partial notification object with fields to update
 */
export const updatePlayedCardNotification = async (
  timestamp: string,
  updates: Partial<PlayedCardNotification>
): Promise<void> => {
  try {
    const docSnapshot = await getDoc(GAME_DOC_REF);
    if (!docSnapshot.exists()) return;

    const data = docSnapshot.data();
    const queue = data.playedCardNotificationsQueue || [];

    console.log('🔍 [UPDATE] Attempting to update notification with timestamp:', timestamp);
    console.log('🔍 [UPDATE] Current queue:', queue.map((n: PlayedCardNotification) => ({
      timestamp: n.timestamp,
      phase: n.notificationPhase,
      faction: n.faction
    })));
    console.log('🔍 [UPDATE] Updates to apply:', updates);

    let matchFound = false;
    const updatedQueue = queue.map((n: PlayedCardNotification) => {
      if (n.timestamp === timestamp) {
        matchFound = true;
        console.log('✅ [UPDATE] MATCH FOUND! Updating notification from', n.notificationPhase, 'to', updates.notificationPhase);
        return { ...n, ...updates };
      }
      // IMPORTANT: Always return a new object to ensure Firestore detects the change
      return { ...n };
    });

    if (!matchFound) {
      console.error('❌ [UPDATE] NO MATCH FOUND for timestamp:', timestamp);
      console.error('❌ [UPDATE] Available timestamps:', queue.map((n: PlayedCardNotification) => n.timestamp));
    } else {
      console.log('✅ [UPDATE] Successfully updated notification, writing to Firestore...');
    }

    await setDoc(GAME_DOC_REF, {
      playedCardNotificationsQueue: updatedQueue
    }, { merge: true });
    console.log('✅ [UPDATE] Firestore setDoc completed. Updated queue:', updatedQueue.map((n: PlayedCardNotification) => ({
      timestamp: n.timestamp,
      phase: n.notificationPhase,
      faction: n.faction
    })));
  } catch (error) {
    console.error('Error updating played card notification:', error);
    throw error;
  }
};

// =======================================
// PLAYER ASSIGNMENT FUNCTIONS
// =======================================

/**
 * Subscribe to player assignments in real-time
 * @param callback Function called when player assignments change
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToPlayerAssignments = (
  callback: (assignments: PlayerAssignment[]) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const assignments = data.playerAssignments || [];
      callback(assignments);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to player assignments:", error);
  });
};

/**
 * Assign a player to an operational area
 * @param playerName Player's chosen name
 * @param operationalAreaId ID of the operational area
 * @param faction Player's faction
 */
export const assignPlayerToArea = async (
  playerName: string,
  operationalAreaId: string,
  faction: 'us' | 'china'
): Promise<void> => {
  try {
    const docSnapshot = await getDoc(GAME_DOC_REF);
    if (!docSnapshot.exists()) return;

    const data = docSnapshot.data();
    const assignments = data.playerAssignments || [];

    // Check if this exact assignment already exists
    const existingIndex = assignments.findIndex(
      (a: PlayerAssignment) =>
        a.playerName === playerName &&
        a.operationalAreaId === operationalAreaId &&
        a.faction === faction
    );

    if (existingIndex === -1) {
      // Add new assignment
      const newAssignment: PlayerAssignment = {
        playerName,
        operationalAreaId,
        faction,
        assignedAt: new Date().toISOString()
      };
      assignments.push(newAssignment);
    }

    await setDoc(GAME_DOC_REF, { playerAssignments: assignments }, { merge: true });
  } catch (error) {
    console.error('Error assigning player to area:', error);
    throw error;
  }
};

/**
 * Remove a player assignment from an operational area
 * @param playerName Player's name
 * @param operationalAreaId ID of the operational area
 * @param faction Player's faction
 */
export const removePlayerAssignment = async (
  playerName: string,
  operationalAreaId: string,
  faction: 'us' | 'china'
): Promise<void> => {
  try {
    const docSnapshot = await getDoc(GAME_DOC_REF);
    if (!docSnapshot.exists()) return;

    const data = docSnapshot.data();
    const assignments = data.playerAssignments || [];

    // Filter out the matching assignment
    const filtered = assignments.filter(
      (a: PlayerAssignment) =>
        !(a.playerName === playerName &&
          a.operationalAreaId === operationalAreaId &&
          a.faction === faction)
    );

    await setDoc(GAME_DOC_REF, { playerAssignments: filtered }, { merge: true });
  } catch (error) {
    console.error('Error removing player assignment:', error);
    throw error;
  }
};

/**
 * Get all player assignments (one-time read, not real-time)
 * @returns Promise that resolves to array of player assignments
 */
export const getPlayerAssignments = async (): Promise<PlayerAssignment[]> => {
  try {
    const docSnapshot = await getDoc(GAME_DOC_REF);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return data.playerAssignments || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting player assignments:', error);
    throw error;
  }
};

// =======================================
// REGISTERED PLAYERS FUNCTIONS
// =======================================

/**
 * Subscribe to registered players in real-time
 * @param callback Function called when registered players change
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToRegisteredPlayers = (
  callback: (players: RegisteredPlayer[]) => void
): Unsubscribe => {
  return onSnapshot(GAME_DOC_REF, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const players = data.registeredPlayers || [];
      callback(players);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to registered players:", error);
  });
};

/**
 * Register a player when they enter the game
 * @param playerName Player's chosen name
 * @param faction Player's faction
 */
export const registerPlayer = async (
  playerName: string,
  faction: 'us' | 'china'
): Promise<void> => {
  try {
    const docSnapshot = await getDoc(GAME_DOC_REF);
    if (!docSnapshot.exists()) return;

    const data = docSnapshot.data();
    const players = data.registeredPlayers || [];

    // Check if this player is already registered with this faction
    const existingIndex = players.findIndex(
      (p: RegisteredPlayer) =>
        p.playerName === playerName &&
        p.faction === faction
    );

    if (existingIndex === -1) {
      // Add new registration
      const newPlayer: RegisteredPlayer = {
        playerName,
        faction,
        registeredAt: new Date().toISOString()
      };
      players.push(newPlayer);

      await setDoc(GAME_DOC_REF, { registeredPlayers: players }, { merge: true });
      console.log('Player registered:', playerName, faction);
    } else {
      // Update registration timestamp
      players[existingIndex].registeredAt = new Date().toISOString();
      await setDoc(GAME_DOC_REF, { registeredPlayers: players }, { merge: true });
      console.log('Player re-registered:', playerName, faction);
    }
  } catch (error) {
    console.error('Error registering player:', error);
    throw error;
  }
};

