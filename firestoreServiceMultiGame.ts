/**
 * Multi-Game Firestore Service
 *
 * This file contains refactored versions of firestoreService functions
 * that support multi-game architecture with gameId parameter.
 *
 * These functions will gradually replace the legacy single-game functions.
 */

import { doc, getDoc, onSnapshot, setDoc, updateDoc, Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";
import {
  OperationalArea,
  OperationalData,
  Location,
  TaskForce,
  Unit,
  Card,
  CommandPoints,
  PurchaseHistory,
  CardPurchaseHistory,
  PurchasedCards,
  DestructionRecord,
  TurnState,
  PendingDeployments,
  InfluenceMarker,
  SubmarineCampaignState,
  PlayedCardNotification,
  PlayerAssignment,
  RegisteredPlayer,
  GameMetadata
} from "./types";
import { TurnService } from "./services/turnService";

/**
 * Get game document reference by game ID
 * @param gameId Game ID (use 'legacy' for game/current)
 * @returns Firestore document reference
 */
const getGameRef = (gameId: string) => {
  // Special case: 'legacy' maps to the old game/current path
  if (gameId === 'legacy') {
    return doc(db, "game", "current");
  }
  // Normal case: multi-game path
  return doc(db, "games", gameId);
};

/**
 * Helper to remove undefined fields (Firestore doesn't support undefined)
 */
const removeUndefinedFields = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields) as any;
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = removeUndefinedFields(obj[key]);
      }
    }
    return result;
  }

  return obj;
};

// =======================================
// SUBSCRIPTION FUNCTIONS (with gameId)
// =======================================

export const subscribeToOperationalAreas = (
  gameId: string,
  callback: (areas: OperationalArea[]) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.operationalAreas) {
        const fsAreas = data.operationalAreas as any[];
        const areas = fsAreas.map((area: any) => {
          // Convert from flat to nested bounds
          if (Array.isArray(area.bounds) && area.bounds.length === 4) {
            return {
              ...area,
              bounds: [
                [area.bounds[0], area.bounds[1]],
                [area.bounds[2], area.bounds[3]]
              ]
            };
          }
          return area;
        });
        callback(areas);
      } else {
        callback([]);
      }
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to operational areas:", error);
  });
};

export const subscribeToOperationalData = (
  gameId: string,
  callback: (data: Record<string, OperationalData>) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.operationalData as Record<string, OperationalData>) || {});
    } else {
      callback({});
    }
  }, (error) => {
    console.error("Error listening to operational data:", error);
  });
};

export const subscribeToLocations = (
  gameId: string,
  callback: (locations: Location[]) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.locations as Location[]) || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to locations:", error);
  });
};

export const subscribeToTaskForces = (
  gameId: string,
  callback: (taskForces: TaskForce[]) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.taskForces as TaskForce[]) || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to task forces:", error);
  });
};

export const subscribeToUnits = (
  gameId: string,
  callback: (units: Unit[]) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.units as Unit[]) || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to units:", error);
  });
};

export const subscribeToCards = (
  gameId: string,
  callback: (cards: Card[]) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.cards as Card[]) || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to cards:", error);
  });
};

export const subscribeToCommandPoints = (
  gameId: string,
  callback: (commandPoints: CommandPoints) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.commandPoints as CommandPoints) || { us: 0, china: 0 });
    } else {
      callback({ us: 0, china: 0 });
    }
  }, (error) => {
    console.error("Error listening to command points:", error);
  });
};

export const subscribeToPreviousCommandPoints = (
  gameId: string,
  callback: (commandPoints: CommandPoints | undefined) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback(data.previousCommandPoints as CommandPoints | undefined);
    } else {
      callback(undefined);
    }
  }, (error) => {
    console.error("Error listening to previous command points:", error);
  });
};

export const subscribeToPurchaseHistory = (
  gameId: string,
  callback: (history: PurchaseHistory) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.purchaseHistory as PurchaseHistory) || { us: 0, china: 0 });
    } else {
      callback({ us: 0, china: 0 });
    }
  }, (error) => {
    console.error("Error listening to purchase history:", error);
  });
};

export const subscribeToCardPurchaseHistory = (
  gameId: string,
  callback: (history: CardPurchaseHistory) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.cardPurchaseHistory as CardPurchaseHistory) || { us: {}, china: {} });
    } else {
      callback({ us: {}, china: {} });
    }
  }, (error) => {
    console.error("Error listening to card purchase history:", error);
  });
};

export const subscribeToPurchasedCards = (
  gameId: string,
  callback: (cards: PurchasedCards) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.purchasedCards as PurchasedCards) || { us: [], china: [] });
    } else {
      callback({ us: [], china: [] });
    }
  }, (error) => {
    console.error("Error listening to purchased cards:", error);
  });
};

export const subscribeToDestructionLog = (
  gameId: string,
  callback: (log: DestructionRecord[]) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.destructionLog as DestructionRecord[]) || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to destruction log:", error);
  });
};

export const subscribeToTurnState = (
  gameId: string,
  callback: (turnState: TurnState) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.turnState as TurnState) || TurnService.getInitialTurnState());
    } else {
      callback(TurnService.getInitialTurnState());
    }
  }, (error) => {
    console.error("Error listening to turn state:", error);
  });
};

export const subscribeToPendingDeployments = (
  gameId: string,
  callback: (deployments: PendingDeployments) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.pendingDeployments as PendingDeployments) || { cards: [], units: [], taskForces: [] });
    } else {
      callback({ cards: [], units: [], taskForces: [] });
    }
  }, (error) => {
    console.error("Error listening to pending deployments:", error);
  });
};

export const subscribeToInfluenceMarker = (
  gameId: string,
  callback: (marker: InfluenceMarker) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.influenceMarker as InfluenceMarker) || { value: 0 });
    } else {
      callback({ value: 0 });
    }
  }, (error) => {
    console.error("Error listening to influence marker:", error);
  });
};

export const subscribeToSubmarineCampaign = (
  gameId: string,
  callback: (campaign: SubmarineCampaignState) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.submarineCampaign as SubmarineCampaignState) || {
        deployedSubmarines: [],
        events: [],
        currentTurn: 0,
        usedSubmarineNames: { us: [], china: [] }
      });
    } else {
      callback({
        deployedSubmarines: [],
        events: [],
        currentTurn: 0,
        usedSubmarineNames: { us: [], china: [] }
      });
    }
  }, (error) => {
    console.error("Error listening to submarine campaign:", error);
  });
};

export const subscribeToPlayedCardNotificationsQueue = (
  gameId: string,
  callback: (notifications: PlayedCardNotification[]) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.playedCardNotificationsQueue as PlayedCardNotification[]) || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to played card notifications:", error);
  });
};

export const subscribeToPlayerAssignments = (
  gameId: string,
  callback: (assignments: PlayerAssignment[]) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.playerAssignments as PlayerAssignment[]) || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to player assignments:", error);
  });
};

export const subscribeToRegisteredPlayers = (
  gameId: string,
  callback: (players: RegisteredPlayer[]) => void
): Unsubscribe => {
  const gameRef = getGameRef(gameId);
  return onSnapshot(gameRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      callback((data.registeredPlayers as RegisteredPlayer[]) || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error listening to registered players:", error);
  });
};

// =======================================
// UPDATE FUNCTIONS (with gameId)
// =======================================

export const updateOperationalAreas = async (
  gameId: string,
  areas: OperationalArea[]
): Promise<void> => {
  try {
    const gameRef = getGameRef(gameId);
    // Convert to flat bounds format
    const fsAreas = areas.map(area => {
      const flatBounds = Array.isArray(area.bounds[0])
        ? [area.bounds[0][0], area.bounds[0][1], area.bounds[1][0], area.bounds[1][1]]
        : area.bounds;
      return { ...area, bounds: flatBounds };
    });
    await setDoc(gameRef, { operationalAreas: fsAreas }, { merge: true });
  } catch (error) {
    console.error("Error updating operational areas:", error);
    throw error;
  }
};

export const updateUnits = async (
  gameId: string,
  units: Unit[]
): Promise<void> => {
  try {
    const gameRef = getGameRef(gameId);
    await setDoc(gameRef, { units }, { merge: true });
  } catch (error) {
    console.error("Error updating units:", error);
    throw error;
  }
};

export const updateTaskForces = async (
  gameId: string,
  taskForces: TaskForce[]
): Promise<void> => {
  try {
    const gameRef = getGameRef(gameId);
    await setDoc(gameRef, { taskForces }, { merge: true });
  } catch (error) {
    console.error("Error updating task forces:", error);
    throw error;
  }
};

export const updateCommandPoints = async (
  gameId: string,
  commandPoints: CommandPoints
): Promise<void> => {
  try {
    const gameRef = getGameRef(gameId);
    await setDoc(gameRef, { commandPoints }, { merge: true });
  } catch (error) {
    console.error("Error updating command points:", error);
    throw error;
  }
};

export const updateTurnState = async (
  gameId: string,
  turnState: TurnState
): Promise<void> => {
  try {
    const gameRef = getGameRef(gameId);
    await setDoc(gameRef, { turnState }, { merge: true });
  } catch (error) {
    console.error("Error updating turn state:", error);
    throw error;
  }
};

// =======================================
// GAME INITIALIZATION
// =======================================

/**
 * Initialize a new game with seed data
 * @param gameId Game ID to initialize
 * @param seedData Seed data for the game
 */
export const initializeGameWithSeedData = async (
  gameId: string,
  seedData: {
    operationalAreas: OperationalArea[];
    operationalData: Record<string, OperationalData>;
    locations: Location[];
    taskForces: TaskForce[];
    units: Unit[];
    cards: Card[];
    commandPoints: CommandPoints;
    purchaseHistory: PurchaseHistory;
    cardPurchaseHistory: CardPurchaseHistory;
    turnState: TurnState;
    influenceMarker: InfluenceMarker;
  }
): Promise<void> => {
  try {
    const gameRef = getGameRef(gameId);

    // First, read the existing document to preserve metadata
    const existingDoc = await getDoc(gameRef);
    if (!existingDoc.exists()) {
      throw new Error(`Game document ${gameId} does not exist. Create the game first with createGame().`);
    }

    const existingData = existingDoc.data();

    // Get initial command points from metadata (with fallback to seedData)
    const initialCommandPoints = existingData.metadata?.initialCommandPoints || seedData.commandPoints;

    // Convert operational areas to flat format for Firestore
    const flatOperationalAreas = seedData.operationalAreas.map(area => {
      const flatBounds = Array.isArray(area.bounds[0])
        ? [area.bounds[0][0], area.bounds[0][1], area.bounds[1][0], area.bounds[1][1]]
        : area.bounds;
      return { ...area, bounds: flatBounds };
    });

    // Write all data together, preserving existing metadata
    await setDoc(gameRef, {
      // Preserve existing metadata
      metadata: existingData.metadata,
      // Add game data
      operationalAreas: flatOperationalAreas,
      operationalData: seedData.operationalData,
      locations: seedData.locations,
      taskForces: seedData.taskForces,
      units: seedData.units,
      cards: seedData.cards,
      commandPoints: initialCommandPoints,
      purchaseHistory: seedData.purchaseHistory,
      cardPurchaseHistory: seedData.cardPurchaseHistory,
      purchasedCards: { us: [], china: [] },
      destructionLog: [],
      turnState: seedData.turnState,
      pendingDeployments: { cards: [], units: [], taskForces: [] },
      influenceMarker: seedData.influenceMarker,
      submarineCampaign: {
        deployedSubmarines: [],
        events: [],
        currentTurn: 0,
        usedSubmarineNames: { us: [], china: [] }
      },
      playedCardNotificationsQueue: [],
      playerAssignments: [],
      registeredPlayers: []
    });

    console.log('Game initialized successfully:', gameId);
  } catch (error) {
    console.error('Error initializing game:', error);
    throw error;
  }
};

// =======================================
// PLAYER MANAGEMENT
// =======================================

/**
 * Update a player's faction in a game
 * @param gameId Game ID
 * @param uid User UID
 * @param faction New faction to assign
 */
export const updatePlayerFaction = async (
  gameId: string,
  uid: string,
  faction: 'us' | 'china'
): Promise<void> => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const docSnapshot = await getDoc(gameRef);

    if (!docSnapshot.exists()) {
      throw new Error('Game not found');
    }

    const data = docSnapshot.data();
    const metadata = data.metadata as GameMetadata;

    if (!metadata.players[uid]) {
      throw new Error('User is not in this game');
    }

    // Update player's faction
    await updateDoc(gameRef, {
      [`metadata.players.${uid}.faction`]: faction,
      'metadata.lastActivityAt': new Date().toISOString(),
    });

    console.log('Player faction updated:', uid, faction, gameId);
  } catch (error) {
    console.error('Error updating player faction:', error);
    throw error;
  }
};

/**
 * Change a player's faction and remove all their current area assignments
 * @param gameId Game ID
 * @param uid User UID
 * @param playerName Player's display name
 * @param newFaction New faction to assign
 */
export const changeFactionAndClearAssignments = async (
  gameId: string,
  uid: string,
  playerName: string,
  newFaction: 'us' | 'china'
): Promise<void> => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const docSnapshot = await getDoc(gameRef);

    if (!docSnapshot.exists()) {
      throw new Error('Game not found');
    }

    const data = docSnapshot.data();
    const metadata = data.metadata as GameMetadata;

    if (!metadata.players[uid]) {
      throw new Error('User is not in this game');
    }

    // 1. Remove all player assignments for this player
    const currentAssignments = (data.playerAssignments as PlayerAssignment[]) || [];
    const filteredAssignments = currentAssignments.filter(
      a => a.playerName !== playerName
    );

    // 2. Update RegisteredPlayer faction
    const currentRegistered = (data.registeredPlayers as RegisteredPlayer[]) || [];
    const updatedRegistered = currentRegistered.map(rp =>
      rp.playerName === playerName
        ? { ...rp, faction: newFaction }
        : rp
    );

    // 3. Atomic update of all three fields
    await updateDoc(gameRef, {
      playerAssignments: filteredAssignments,
      [`metadata.players.${uid}.faction`]: newFaction,
      registeredPlayers: updatedRegistered,
      'metadata.lastActivityAt': new Date().toISOString(),
    });

    console.log('Faction changed and assignments cleared:', playerName, newFaction, gameId);
  } catch (error) {
    console.error('Error changing faction and clearing assignments:', error);
    throw error;
  }
};

/**
 * Assign a player to an operational area
 * @param gameId Game ID
 * @param playerName Player's display name
 * @param operationalAreaId Operational area ID
 * @param faction Player's faction
 */
export const assignPlayerToAreaMultiGame = async (
  gameId: string,
  playerName: string,
  operationalAreaId: string,
  faction: 'us' | 'china'
): Promise<void> => {
  try {
    const gameRef = getGameRef(gameId);
    const docSnapshot = await getDoc(gameRef);

    if (!docSnapshot.exists()) {
      throw new Error('Game not found');
    }

    const data = docSnapshot.data();

    // Get operational areas to check faction restriction
    const fsAreas = data.operationalAreas as any[];
    const operationalAreas: OperationalArea[] = fsAreas ? fsAreas.map((area: any) => {
      // Convert from flat to nested bounds
      if (Array.isArray(area.bounds) && area.bounds.length === 4) {
        return {
          ...area,
          bounds: [
            [area.bounds[0], area.bounds[1]],
            [area.bounds[2], area.bounds[3]]
          ]
        };
      }
      return area;
    }) : [];

    const targetArea = operationalAreas.find(a => a.id === operationalAreaId);

    // Validate faction match for Command Centers
    if (targetArea?.isCommandCenter && targetArea.faction && targetArea.faction !== faction) {
      const factionName = faction === 'us' ? 'US Navy' : 'PLAN';
      const areaFactionName = targetArea.faction === 'us' ? 'US Navy' : 'PLAN';
      throw new Error(`Cannot assign ${factionName} player to ${areaFactionName} Command Center`);
    }

    const assignments = (data.playerAssignments as PlayerAssignment[]) || [];

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
        faction
      };
      await setDoc(gameRef, {
        playerAssignments: [...assignments, newAssignment]
      }, { merge: true });
      console.log('Player assigned to area:', playerName, operationalAreaId, faction, gameId);
    } else {
      console.log('Player already assigned to this area:', playerName, operationalAreaId);
    }
  } catch (error) {
    console.error('Error assigning player to area:', error);
    throw error;
  }
};

/**
 * Remove a player's assignment from an operational area
 * @param gameId Game ID
 * @param playerName Player's display name
 * @param operationalAreaId Operational area ID
 * @param faction Player's faction
 */
export const removePlayerAssignmentMultiGame = async (
  gameId: string,
  playerName: string,
  operationalAreaId: string,
  faction: 'us' | 'china'
): Promise<void> => {
  try {
    const gameRef = getGameRef(gameId);
    const docSnapshot = await getDoc(gameRef);

    if (!docSnapshot.exists()) {
      throw new Error('Game not found');
    }

    const data = docSnapshot.data();
    const assignments = (data.playerAssignments as PlayerAssignment[]) || [];

    // Filter out the matching assignment
    const filtered = assignments.filter(
      (a: PlayerAssignment) =>
        !(a.playerName === playerName &&
          a.operationalAreaId === operationalAreaId &&
          a.faction === faction)
    );

    await setDoc(gameRef, { playerAssignments: filtered }, { merge: true });
    console.log('Player assignment removed:', playerName, operationalAreaId, faction, gameId);
  } catch (error) {
    console.error('Error removing player assignment:', error);
    throw error;
  }
};
