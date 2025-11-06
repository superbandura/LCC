/**
 * useGameState Hook
 *
 * Centralized hook for managing all Firestore game state subscriptions.
 * Encapsulates 17 separate Firestore subscriptions into a single hook.
 *
 * Benefits:
 * - Single source of truth for game state
 * - Easier to test (can mock entire hook)
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
  subscribeToRegisteredPlayers,
  addPlayedCardNotification,
  removePlayedCardNotification,
  initializeGameData
} from '../firestoreService';

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
}

/**
 * Hook to subscribe to all game state from Firestore
 * Initializes game data on first mount and maintains real-time subscriptions
 */
export function useGameState(
  initialOperationalAreas: OperationalArea[],
  initialOperationalData: Record<string, OperationalData>,
  initialLocations: Location[],
  initialTaskForces: TaskForce[],
  initialUnits: Unit[],
  initialCards: Card[],
  initialCommandPoints: CommandPoints,
  initialPurchaseHistory: PurchaseHistory,
  initialTurnState: TurnState,
  initialInfluenceMarker: InfluenceMarker
): GameState {
  // State for all Firestore-synced data
  const [operationalAreas, setOperationalAreas] = useState<OperationalArea[]>(initialOperationalAreas);
  const [operationalData, setOperationalData] = useState<Record<string, OperationalData>>(initialOperationalData);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [taskForces, setTaskForces] = useState<TaskForce[]>(initialTaskForces);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [commandPoints, setCommandPoints] = useState<CommandPoints>(initialCommandPoints);
  const [previousCommandPoints, setPreviousCommandPoints] = useState<CommandPoints | undefined>(undefined);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory>(initialPurchaseHistory);
  const [cardPurchaseHistory, setCardPurchaseHistory] = useState<CardPurchaseHistory>({ us: {}, china: {} });
  const [purchasedCards, setPurchasedCards] = useState<PurchasedCards>({ us: [], china: [] });
  const [destructionLog, setDestructionLog] = useState<DestructionRecord[]>([]);
  const [turnState, setTurnState] = useState<TurnState>(initialTurnState);
  const [pendingDeployments, setPendingDeployments] = useState<PendingDeployments>({
    cards: [],
    taskForces: [],
    units: []
  });
  const [influenceMarker, setInfluenceMarker] = useState<InfluenceMarker>(initialInfluenceMarker);
  const [submarineCampaign, setSubmarineCampaign] = useState<SubmarineCampaignState>({
    deployedSubmarines: [],
    events: [],
    currentTurn: 0,
    usedSubmarineNames: {
      us: [],
      china: []
    }
  });
  const [playedCardNotifications, setPlayedCardNotifications] = useState<PlayedCardNotification[]>([]);
  const [playerAssignments, setPlayerAssignments] = useState<PlayerAssignment[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);

  // Initialize Firestore data and subscribe to real-time updates
  useEffect(() => {
    // Initialize the game document with default data
    initializeGameData(
      initialOperationalAreas,
      initialOperationalData,
      initialLocations,
      initialTaskForces,
      initialUnits,
      initialCards,
      initialCommandPoints,
      initialPurchaseHistory,
      initialTurnState,
      initialInfluenceMarker
    );

    // Subscribe to operational areas changes
    const unsubscribeAreas = subscribeToOperationalAreas((areas) => {
      // 🔍 LOG H: Debug React state update from Firestore subscription
      console.log('🔍 [HOOK-STATE] useGameState callback triggered');
      console.log('  ⏰ Timestamp:', new Date().toISOString());
      console.log('  📦 Areas to set in React state:', areas.length);
      areas.forEach(area => {
        if (area.assignedCards && area.assignedCards.length > 0) {
          console.log(`  📍 ${area.name}: ${area.assignedCards.length} cards`, area.assignedCards);
        }
      });

      setOperationalAreas(areas);

      console.log('  ✅ React state updated');
    });

    // Subscribe to operational data changes
    const unsubscribeData = subscribeToOperationalData((data) => {
      setOperationalData(data);
    });

    // Subscribe to locations changes
    const unsubscribeLocations = subscribeToLocations((locs) => {
      setLocations(locs);
    });

    // Subscribe to task forces changes
    const unsubscribeTaskForces = subscribeToTaskForces((forces) => {
      setTaskForces(forces);
    });

    // Subscribe to units changes
    const unsubscribeUnits = subscribeToUnits((unitsData) => {
      setUnits(unitsData);
    });

    // Subscribe to cards changes
    const unsubscribeCards = subscribeToCards((cardsData) => {
      setCards(cardsData);
    });

    // Subscribe to command points changes
    const unsubscribeCommandPoints = subscribeToCommandPoints((points) => {
      setCommandPoints(points);
    });

    // Subscribe to previous command points changes
    const unsubscribePreviousCommandPoints = subscribeToPreviousCommandPoints((points) => {
      setPreviousCommandPoints(points);
    });

    // Subscribe to purchase history changes
    const unsubscribePurchaseHistory = subscribeToPurchaseHistory((history) => {
      setPurchaseHistory(history);
    });

    // Subscribe to per-card purchase history changes
    const unsubscribeCardPurchaseHistory = subscribeToCardPurchaseHistory((history) => {
      setCardPurchaseHistory(history);
    });

    // Subscribe to purchased cards changes
    const unsubscribePurchasedCards = subscribeToPurchasedCards((cardsData) => {
      setPurchasedCards(cardsData);
    });

    // Subscribe to destruction log changes
    const unsubscribeDestructionLog = subscribeToDestructionLog((log) => {
      setDestructionLog(log);
    });

    // Subscribe to turn state changes
    const unsubscribeTurnState = subscribeToTurnState((state) => {
      setTurnState(state);
    });

    // Subscribe to pending deployments changes
    const unsubscribePendingDeployments = subscribeToPendingDeployments((deployments) => {
      setPendingDeployments(deployments);
    });

    // Subscribe to influence marker changes
    const unsubscribeInfluenceMarker = subscribeToInfluenceMarker((marker) => {
      setInfluenceMarker(marker);
    });

    // Subscribe to submarine campaign changes
    const unsubscribeSubmarineCampaign = subscribeToSubmarineCampaign((campaign) => {
      setSubmarineCampaign(campaign);
    });

    // Subscribe to played card notifications queue changes
    const unsubscribePlayedCardNotifications = subscribeToPlayedCardNotificationsQueue((notifications) => {
      console.log('🔔 [HOOK] useGameState callback triggered with notifications:', notifications.map(n => ({
        timestamp: n.timestamp,
        phase: n.notificationPhase,
        faction: n.faction,
        cardName: n.cardName
      })));
      setPlayedCardNotifications(notifications);
    });

    // Subscribe to player assignments changes
    const unsubscribePlayerAssignments = subscribeToPlayerAssignments((assignments) => {
      setPlayerAssignments(assignments);
    });

    // Subscribe to registered players changes
    const unsubscribeRegisteredPlayers = subscribeToRegisteredPlayers((players) => {
      setRegisteredPlayers(players);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeAreas();
      unsubscribeData();
      unsubscribeLocations();
      unsubscribeTaskForces();
      unsubscribeUnits();
      unsubscribeCards();
      unsubscribeCommandPoints();
      unsubscribePreviousCommandPoints();
      unsubscribePurchaseHistory();
      unsubscribeCardPurchaseHistory();
      unsubscribePurchasedCards();
      unsubscribeDestructionLog();
      unsubscribeTurnState();
      unsubscribePendingDeployments();
      unsubscribeInfluenceMarker();
      unsubscribeSubmarineCampaign();
      unsubscribePlayedCardNotifications();
      unsubscribePlayerAssignments();
      unsubscribeRegisteredPlayers();
    };
  }, []); // Empty deps - only run on mount

  // Return all game state as a single object
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
    registeredPlayers
  };
}
