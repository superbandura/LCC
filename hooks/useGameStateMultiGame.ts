/**
 * useGameState Hook (Multi-Game Version)
 *
 * Centralized hook for managing all Firestore game state subscriptions.
 * Updated to support multi-game architecture with gameId parameter.
 *
 * Benefits:
 * - Single source of truth for game state
 * - Supports multiple concurrent games
 * - Cleaner component code
 * - Centralized state management
 */

import { useState, useEffect } from 'react';
import {
  Location,
  OperationalArea,
  OperationalData,
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
  RegisteredPlayer
} from '../types';
import {
  subscribeToOperationalAreas,
  subscribeToOperationalData,
  subscribeToLocations,
  subscribeToTaskForces,
  subscribeToUnits,
  subscribeToCards,
  subscribeToCommandPoints,
  subscribeToPreviousCommandPoints,
  subscribeToPurchaseHistory,
  subscribeToCardPurchaseHistory,
  subscribeToPurchasedCards,
  subscribeToDestructionLog,
  subscribeToTurnState,
  subscribeToPendingDeployments,
  subscribeToInfluenceMarker,
  subscribeToSubmarineCampaign,
  subscribeToPlayedCardNotificationsQueue,
  subscribeToPlayerAssignments,
  subscribeToRegisteredPlayers
} from '../firestoreServiceMultiGame';

export interface GameState {
  operationalAreas: OperationalArea[];
  operationalData: Record<string, OperationalData>;
  locations: Location[];
  taskForces: TaskForce[];
  units: Unit[];
  cards: Card[];
  commandPoints: CommandPoints;
  previousCommandPoints: CommandPoints | undefined;
  purchaseHistory: PurchaseHistory;
  cardPurchaseHistory: CardPurchaseHistory;
  purchasedCards: PurchasedCards;
  destructionLog: DestructionRecord[];
  turnState: TurnState;
  pendingDeployments: PendingDeployments;
  influenceMarker: InfluenceMarker;
  submarineCampaign: SubmarineCampaignState;
  playedCardNotifications: PlayedCardNotification[];
  playerAssignments: PlayerAssignment[];
  registeredPlayers: RegisteredPlayer[];
  loading: boolean;
}

/**
 * Hook to subscribe to all game state from Firestore for a specific game
 * @param gameId Game ID to subscribe to (required for multi-game)
 * @returns Game state object with loading flag
 */
export function useGameStateMultiGame(gameId: string | null): GameState {
  // State for all Firestore-synced data
  const [operationalAreas, setOperationalAreas] = useState<OperationalArea[]>([]);
  const [operationalData, setOperationalData] = useState<Record<string, OperationalData>>({});
  const [locations, setLocations] = useState<Location[]>([]);
  const [taskForces, setTaskForces] = useState<TaskForce[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [commandPoints, setCommandPoints] = useState<CommandPoints>({ us: 0, china: 0 });
  const [previousCommandPoints, setPreviousCommandPoints] = useState<CommandPoints | undefined>(undefined);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory>({ us: 0, china: 0 });
  const [cardPurchaseHistory, setCardPurchaseHistory] = useState<CardPurchaseHistory>({ us: {}, china: {} });
  const [purchasedCards, setPurchasedCards] = useState<PurchasedCards>({ us: [], china: [] });
  const [destructionLog, setDestructionLog] = useState<DestructionRecord[]>([]);
  const [turnState, setTurnState] = useState<TurnState>({
    currentDate: '2030-06-02',
    dayOfWeek: 1,
    turnNumber: 0,
    isPlanningPhase: true
  });
  const [pendingDeployments, setPendingDeployments] = useState<PendingDeployments>({
    cards: [],
    units: [],
    taskForces: []
  });
  const [influenceMarker, setInfluenceMarker] = useState<InfluenceMarker>({ value: 0 });
  const [submarineCampaign, setSubmarineCampaign] = useState<SubmarineCampaignState>({
    deployedSubmarines: [],
    events: [],
    currentTurn: 0,
    usedSubmarineNames: { us: [], china: [] }
  });
  const [playedCardNotifications, setPlayedCardNotifications] = useState<PlayedCardNotification[]>([]);
  const [playerAssignments, setPlayerAssignments] = useState<PlayerAssignment[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  // Set up all Firestore subscriptions when gameId changes
  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribers: (() => void)[] = [];

    // Subscribe to all game state fields
    unsubscribers.push(subscribeToOperationalAreas(gameId, setOperationalAreas));
    unsubscribers.push(subscribeToOperationalData(gameId, setOperationalData));
    unsubscribers.push(subscribeToLocations(gameId, setLocations));
    unsubscribers.push(subscribeToTaskForces(gameId, setTaskForces));
    unsubscribers.push(subscribeToUnits(gameId, setUnits));
    unsubscribers.push(subscribeToCards(gameId, setCards));
    unsubscribers.push(subscribeToCommandPoints(gameId, setCommandPoints));
    unsubscribers.push(subscribeToPreviousCommandPoints(gameId, setPreviousCommandPoints));
    unsubscribers.push(subscribeToPurchaseHistory(gameId, setPurchaseHistory));
    unsubscribers.push(subscribeToCardPurchaseHistory(gameId, setCardPurchaseHistory));
    unsubscribers.push(subscribeToPurchasedCards(gameId, setPurchasedCards));
    unsubscribers.push(subscribeToDestructionLog(gameId, setDestructionLog));
    unsubscribers.push(subscribeToTurnState(gameId, setTurnState));
    unsubscribers.push(subscribeToPendingDeployments(gameId, setPendingDeployments));
    unsubscribers.push(subscribeToInfluenceMarker(gameId, setInfluenceMarker));
    unsubscribers.push(subscribeToSubmarineCampaign(gameId, setSubmarineCampaign));
    unsubscribers.push(subscribeToPlayedCardNotificationsQueue(gameId, setPlayedCardNotifications));
    unsubscribers.push(subscribeToPlayerAssignments(gameId, setPlayerAssignments));
    unsubscribers.push(subscribeToRegisteredPlayers(gameId, setRegisteredPlayers));

    // Mark as loaded after subscriptions are set up
    setTimeout(() => setLoading(false), 500);

    // Cleanup function - unsubscribe from all listeners
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [gameId]);

  return {
    operationalAreas,
    operationalData,
    locations,
    taskForces,
    units,
    cards,
    commandPoints,
    previousCommandPoints,
    purchaseHistory,
    cardPurchaseHistory,
    purchasedCards,
    destructionLog,
    turnState,
    pendingDeployments,
    influenceMarker,
    submarineCampaign,
    playedCardNotifications,
    playerAssignments,
    registeredPlayers,
    loading
  };
}
