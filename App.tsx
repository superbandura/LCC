import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import EditAreasModal from './components/EditAreasModal';
import TaskForceModal from './components/TaskForceModal';
import CommandCenterModal from './components/CommandCenterModal';
import CardEditorModal from './components/CardEditorModal';
import AdminLoginModal from './components/AdminLoginModal';
import PlayerAssignmentModal from './components/PlayerAssignmentModal';
import CombatStatisticsModal from './components/CombatStatisticsModal';
import FactionSelector from './components/FactionSelector';
import DeploymentNotificationModal from './components/DeploymentNotificationModal';
import PlayedCardNotificationModal from './components/modals/PlayedCardNotificationModal';
import { Position, Location, OperationalArea, OperationalData, MapLayer, TaskForce, Unit, Card, CommandPoints, PurchaseHistory, CardPurchaseHistory, PurchasedCards, DestructionRecord, TurnState, PendingDeployments, InfluenceMarker, SubmarineCampaignState, SubmarineEvent } from './types';
import { LocationIcon, MenuIcon, EditIcon } from './components/Icons';
import { initialLocations } from './data/locations';
import { initialOperationalAreas } from './data/operationalAreas';
import { initialOperationalData } from './data/operationalData';
import { initialTaskForces } from './data/taskForces';
import { initialUnits } from './data/units';
import { initialCards, initialCommandPoints } from './data/cards';
import { initialPurchaseHistory } from './data/purchaseHistory';
import { initialCardPurchaseHistory } from './data/cardPurchaseHistory';
import { initialTurnState } from './data/turnState';
import { initialPendingDeployments } from './data/pendingDeployments';
import { initialInfluenceMarker } from './data/influenceMarker';
import { mapLayers } from './data/mapLayers';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  subscribeToOperationalAreas,
  subscribeToOperationalData,
  subscribeToLocations,
  subscribeToTaskForces,
  subscribeToUnits,
  subscribeToCards,
  subscribeToCommandPoints,
  subscribeToDestructionLog,
  subscribeToTurnState,
  subscribeToPurchasedCards,
  subscribeToPendingDeployments,
  subscribeToInfluenceMarker,
  subscribeToSubmarineCampaign,
  updateOperationalAreas,
  updateOperationalData,
  updateLocations,
  updateTaskForces,
  updateUnits,
  updateCards,
  updateCommandPoints,
  updatePreviousCommandPoints,
  updatePurchaseHistory,
  updateCardPurchaseHistory,
  updatePurchasedCards,
  updateDestructionLog,
  updateTurnState,
  updatePendingDeployments,
  updateInfluenceMarker,
  updateSubmarineCampaign,
  updateSubmarineCampaignTurn,
  addPlayedCardNotification,
  removePlayedCardNotification,
  deploySubmarineAndRemoveFromPurchased,
  initializeGameData,
  resetGameData,
  cleanOrphanedUnits,
  calculateCommandPoints,
  registerPlayer
} from './firestoreService';

// Import services for business logic
import { SubmarineCampaignOrchestrator } from './services/submarineCampaignOrchestrator';
import { TurnService } from './services/turnService';
import { DeploymentService } from './services/deploymentService';
import { DestructionService } from './services/destructionService';

// Import custom hooks
import { useGameState } from './hooks/useGameState';
import { useModal } from './hooks/useModal';

// Default coordinates for the Indo-Pacific region
const DEFAULT_COORDS: Position = [20.0, 121.5];

// Custom hook to track previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function App() {
  const [selectedFaction, setSelectedFaction] = useState<'us' | 'china' | null>(null);
  const [playerName, setPlayerName] = useState<string>(() => {
    // Load player name from localStorage on init
    return localStorage.getItem('lcc_playerName') || '';
  });
  const [position, setPosition] = useState<Position>(DEFAULT_COORDS);
  const [zoom, setZoom] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Modal state management (replaces 7 individual useState declarations)
  const modals = useModal();

  // Admin authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // State for base quick edit from popup
  const [selectedBaseForEdit, setSelectedBaseForEdit] = useState<string | null>(null);
  const [arrivedCards, setArrivedCards] = useState<Card[]>([]);
  const [arrivedTaskForces, setArrivedTaskForces] = useState<TaskForce[]>([]);
  const [arrivedUnits, setArrivedUnits] = useState<Unit[]>([]);
  const [arrivedCardDeployments, setArrivedCardDeployments] = useState<any[]>([]);
  const [arrivedTaskForceDeployments, setArrivedTaskForceDeployments] = useState<any[]>([]);
  const [arrivedUnitDeployments, setArrivedUnitDeployments] = useState<any[]>([]);
  const [turnSubmarineEvents, setTurnSubmarineEvents] = useState<import('./types').SubmarineEvent[]>([]);

  // Use custom hook for Firestore game state management
  // This encapsulates all 14 Firestore subscriptions in one hook
  const gameState = useGameState(
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

  // Destructure game state for easier access
  const {
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
  } = gameState;

  // Local state (not synced with Firestore)

  const [previewArea, setPreviewArea] = useState<OperationalArea | null>(null);
  const [currentTileLayer, setCurrentTileLayer] = useState<MapLayer>(mapLayers[0]);

  // State for coordinate selection mode
  const [coordinatesSelectionMode, setCoordinatesSelectionMode] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Position | null>(null);
  const [shouldResetModalState, setShouldResetModalState] = useState(true);

  const [filters, setFilters] = useState({
    'EE. UU.': true,
    'China': true,
  });

  // Calculate player's assigned operational area IDs
  const myAssignedAreaIds = useMemo(() => {
    if (!playerName || !selectedFaction) return [];

    return playerAssignments
      .filter(pa => pa.playerName === playerName && pa.faction === selectedFaction)
      .map(pa => pa.operationalAreaId);
  }, [playerAssignments, playerName, selectedFaction]);

  // Track previous turn number and date for change detection
  const prevTurnNumber = usePrevious(turnState.turnNumber);
  const prevCurrentDate = usePrevious(turnState.currentDate);

  // Track last date when modal was opened to prevent duplicate opens
  const lastModalOpenDate = useRef<string | null>(null);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser !== null); // If logged in, user is admin
    });

    return () => unsubscribe();
  }, []);

  // Track previous taskForces to detect deletions
  const prevTaskForcesRef = useRef<TaskForce[]>([]);

  // Clean orphaned units only when taskForces are DELETED (not when added)
  useEffect(() => {
    if (units.length > 0 && taskForces.length >= 0) { // taskForces can be empty array
      const prevTaskForces = prevTaskForcesRef.current;
      const prevTaskForceIds = new Set(prevTaskForces.map(tf => tf.id));
      const currentTaskForceIds = new Set(taskForces.map(tf => tf.id));

      // Check if any task forces were DELETED (exist in prev but not in current)
      const wasDeleted = prevTaskForces.some(tf => !currentTaskForceIds.has(tf.id));

      // Only clean orphaned units if a task force was actually deleted
      if (wasDeleted) {
        const cleanedUnits = cleanOrphanedUnits(units, taskForces);

        // Only update if there are orphaned units
        const hasOrphans = cleanedUnits.some((unit, index) =>
          unit.taskForceId !== units[index].taskForceId
        );

        if (hasOrphans) {
          console.log('Task Force deleted - cleaning orphaned units');
          updateUnits(cleanedUnits);
        }
      }

      // Update the ref for next comparison
      prevTaskForcesRef.current = taskForces;
    }
  }, [units, taskForces]); // Need both dependencies for correct cleanup logic

  // Note: Command points are now managed manually during the turn.
  // They should only be recalculated at the start of each turn (when turn system is implemented).
  // calculateCommandPoints(locations) will be called explicitly by "Next Turn" button.

  // Detect unit destructions/resurrections and manage destruction log
  useEffect(() => {
    // Use DestructionService to track unit destructions and revivals
    const result = DestructionService.trackDestructions(
      units,
      taskForces,
      operationalAreas,
      destructionLog
    );

    // Only update Firestore if log actually changed
    if (result.logChanged) {
      updateDestructionLog(result.updatedLog);
    }
  }, [units, taskForces, operationalAreas, destructionLog]);

  // Detect turn changes and show notification modal for all clients
  useEffect(() => {
    // Skip planning phase, initial mount, or no faction selected
    if (turnState.isPlanningPhase || turnState.turnNumber === 0 || !selectedFaction) {
      return;
    }

    // Detect day advance (date changed)
    // Only open modal once per date change (prevent duplicate opens from submarineCampaign updates)
    if (prevCurrentDate !== undefined &&
        prevCurrentDate !== turnState.currentDate &&
        lastModalOpenDate.current !== turnState.currentDate) {

      console.log('🔔 Day changed detected:', prevCurrentDate, '→', turnState.currentDate);
      console.log('📅 Turn:', turnState.turnNumber, '| Day:', turnState.dayOfWeek);

      // Mark this date as processed
      lastModalOpenDate.current = turnState.currentDate;

      // NOTE: Arrivals are already saved to state by handleAdvanceTurn
      // We only need to filter submarine events and open the modal

      // Get submarine events for this turn, day, and faction
      // Events are already in submarineCampaign.events because handleAdvanceTurn
      // processes submarines BEFORE updating turnState
      const mySubmarineEvents = submarineCampaign?.events.filter(
        e => e.turn === turnState.turnNumber &&
             e.faction === selectedFaction &&
             e.dayOfWeek === turnState.dayOfWeek
      ) || [];

      // Log modal content summary
      console.log(`📊 Modal: ${arrivedCards.length} cards, ${arrivedTaskForces.length} TFs, ${arrivedUnits.length} units, ${mySubmarineEvents.length} submarine events`);

      // Set submarine events and open modal
      // (arrivals are already in state, set by handleAdvanceTurn)
      setTurnSubmarineEvents(mySubmarineEvents);
      modals.open('deploymentNotification');

      console.log('✅ Modal opened');
    }
  }, [turnState.currentDate, selectedFaction, submarineCampaign]);

  // Helper functions for deployment time calculations
  const calculateActivationTiming = useCallback((
    currentTurnState: TurnState,
    deploymentTime: number
  ): { activatesAtTurn: number; activatesAtDay: number } => {
    if (currentTurnState.isPlanningPhase) {
      // In planning phase, ignore deployment time - activate immediately
      return { activatesAtTurn: 0, activatesAtDay: currentTurnState.dayOfWeek };
    }

    let daysToAdd = deploymentTime;
    let currentDay = currentTurnState.dayOfWeek;
    let currentTurn = currentTurnState.turnNumber;

    while (daysToAdd > 0) {
      currentDay++;
      if (currentDay > 7) {
        currentDay = 1;
        currentTurn++;
      }
      daysToAdd--;
    }

    return { activatesAtTurn: currentTurn, activatesAtDay: currentDay };
  }, []);

  const isDeploymentActive = useCallback((
    deployment: { activatesAtTurn: number; activatesAtDay: number },
    currentTurnState: TurnState
  ): boolean => {
    if (currentTurnState.isPlanningPhase) {
      return true; // Everything operational in planning phase
    }

    // Compare turn and day
    if (deployment.activatesAtTurn < currentTurnState.turnNumber) {
      return true; // Past turn
    }
    if (deployment.activatesAtTurn === currentTurnState.turnNumber &&
        deployment.activatesAtDay <= currentTurnState.dayOfWeek) {
      return true; // Same turn, day reached
    }

    return false;
  }, []);

  const handleFactionSelect = useCallback(async (faction: 'us' | 'china', playerName: string) => {
    setSelectedFaction(faction);
    setPlayerName(playerName);
    // Save player name to localStorage for persistence
    localStorage.setItem('lcc_playerName', playerName);

    // Register player in Firestore so admin can see them
    try {
      await registerPlayer(playerName, faction);
    } catch (error) {
      console.error('Error registering player:', error);
      // Don't block the user if registration fails
    }
  }, []);

  const handleFilterChange = useCallback((country: string) => {
    setFilters(prev => ({ ...prev, [country]: !prev[country] }));
  }, []);
  
  const filteredLocations = useMemo(() => {
    return locations.filter(location => filters[location.country as keyof typeof filters]);
  }, [filters, locations]);

  const findMyLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setZoom(15);
        setLoading(false);
      },
      (err) => {
        setError('Could not obtain location. Please enable location permissions.');
        setLoading(false);
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const handleLocationSelect = useCallback((location: Location) => {
    setPosition(location.coords);
    setZoom(12);
    if(window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);
  
  const handleCloseModal = useCallback(() => {
    modals.close('editAreas');
    setPreviewArea(null);
    // Reset modal state when closing normally
    setShouldResetModalState(true);
    // Clear selected base for edit
    setSelectedBaseForEdit(null);
  }, [modals]);

  const handleSaveOperationalAreas = useCallback(async (updatedAreas: OperationalArea[]) => {
    // Clean up pending deployments for deleted areas
    const cleanedPending = DeploymentService.cleanupDeletedAreaDeployments(
      updatedAreas,
      pendingDeployments
    );

    // Check if there were any changes to pending deployments
    const pendingChanged = cleanedPending.cards.length !== pendingDeployments.cards.length;

    // Update Firestore - await to ensure completion before continuing
    await updateOperationalAreas(updatedAreas);

    // Update pending deployments if there were changes
    if (pendingChanged) {
      await updatePendingDeployments(cleanedPending);
    }
  }, [pendingDeployments]);

  const handleOperationalDataUpdate = useCallback((areaId: string, updatedData: OperationalData) => {
    const newData = {
      ...operationalData,
      [areaId]: updatedData,
    };
    // Update Firestore - the real-time listener will update the local state
    updateOperationalData(newData);
  }, [operationalData]);

  const handleLocationsUpdate = useCallback((updatedLocations: Location[]) => {
    // Update Firestore - the real-time listener will update the local state
    updateLocations(updatedLocations);
  }, []);

  const handleEditBase = useCallback((locationId: string) => {
    // Set the base to be preselected in EditAreasModal
    setSelectedBaseForEdit(locationId);
    // Open EditAreasModal
    modals.open('editAreas');
  }, [modals]);

  const handleTaskForcesUpdate = useCallback(async (updatedTaskForces: TaskForce[]) => {
    // Validation logging
    console.log('💾 Guardando Task Forces:');
    console.log('  Total:', updatedTaskForces.length);
    console.log('  US:', updatedTaskForces.filter(tf => tf.faction === 'us').length);
    console.log('  China:', updatedTaskForces.filter(tf => tf.faction === 'china').length);

    // Clean up pending deployments for deleted Task Forces
    const cleanedPending = DeploymentService.cleanupDeletedTaskForceDeployments(
      updatedTaskForces,
      pendingDeployments
    );

    // Check if there were any changes to pending deployments
    const pendingChanged =
      cleanedPending.units.length !== pendingDeployments.units.length ||
      cleanedPending.taskForces.length !== pendingDeployments.taskForces.length;

    // Update Firestore - await to ensure completion before continuing
    await updateTaskForces(updatedTaskForces);

    // Update pending deployments if there were changes
    if (pendingChanged) {
      await updatePendingDeployments(cleanedPending);
    }
  }, [pendingDeployments]);

  const handleUnitsUpdate = useCallback(async (updatedUnits: Unit[]) => {
    // Clean up pending deployments for destroyed units/TFs
    const cleanedPending = DeploymentService.cleanupDestroyedDeployments(
      updatedUnits,
      taskForces,
      pendingDeployments
    );

    // Check if there were any changes to pending deployments
    const pendingChanged =
      cleanedPending.units.length !== pendingDeployments.units.length ||
      cleanedPending.taskForces.length !== pendingDeployments.taskForces.length;

    // Update Firestore - await to ensure completion before continuing
    await updateUnits(updatedUnits);

    // Update pending deployments if there were changes
    if (pendingChanged) {
      await updatePendingDeployments(cleanedPending);
    }
  }, [taskForces, pendingDeployments]);

  const handleInfluenceMarkerUpdate = useCallback((updatedMarker: InfluenceMarker) => {
    // Update Firestore - the real-time listener will update the local state
    updateInfluenceMarker(updatedMarker);
  }, []);

  const handleCardsUpdate = useCallback(async (updatedCards: Card[]) => {
    // Update Firestore - await to ensure completion before continuing
    await updateCards(updatedCards);
  }, []);

  const handleCardPurchase = useCallback((cardInstanceId: string, areaId: string) => {
    // Extract cardId from instanceId (format: "us-001_1234567890")
    const cardId = cardInstanceId.includes('_') ? cardInstanceId.split('_')[0] : cardInstanceId;
    const card = cards.find(c => c.id === cardId);
    const deploymentTime = card?.deploymentTime ?? 0;

    // Handle submarine campaign cards
    if (areaId === 'SUBMARINE_CAMPAIGN') {
      // TODO: Implement submarine campaign logic
      console.log(`🌊 Carta "${card?.name}" enviada a Campaña Submarina`);
      return;
    }

    if (turnState.isPlanningPhase || deploymentTime === 0) {
      // Immediate assignment (current behavior)
      const updatedAreas = operationalAreas.map(area => {
        if (area.id === areaId) {
          const currentCards = area.assignedCards || [];
          return {
            ...area,
            assignedCards: [...currentCards, cardInstanceId],
          };
        }
        return area;
      });
      updateOperationalAreas(updatedAreas);
    } else {
      // Add to pending deployments
      const timing = calculateActivationTiming(turnState, deploymentTime);
      const newPendingCard: import('./types').PendingCardDeployment = {
        cardId,
        cardInstanceId,
        areaId,
        faction: selectedFaction!,
        deployedAtTurn: turnState.turnNumber,
        deployedAtDay: turnState.dayOfWeek,
        activatesAtTurn: timing.activatesAtTurn,
        activatesAtDay: timing.activatesAtDay,
        ...(card?.embarkedUnits && { embarkedUnits: card.embarkedUnits }), // Preserve embarked units for transport cards
      };

      const updatedPending = {
        ...pendingDeployments,
        cards: [...pendingDeployments.cards, newPendingCard],
      };
      updatePendingDeployments(updatedPending);

      console.log(`Card ${card?.name} scheduled for deployment. ETA: Turn ${timing.activatesAtTurn}, Day ${timing.activatesAtDay}`);
    }
  }, [cards, turnState, operationalAreas, selectedFaction, pendingDeployments, calculateActivationTiming]);

  const handleCommandPointsUpdate = useCallback((points: CommandPoints) => {
    updateCommandPoints(points);
  }, []);

  const handlePurchaseHistoryUpdate = useCallback((history: PurchaseHistory) => {
    updatePurchaseHistory(history);
  }, []);

  const handleCardPurchaseHistoryUpdate = useCallback((history: CardPurchaseHistory) => {
    updateCardPurchaseHistory(history);
  }, []);

  // Calculate arrivals for a specific faction and turn state
  const calculateArrivals = useCallback((faction: 'us' | 'china', newTurnState: TurnState) => {
    const arrivedCardsList: Card[] = [];
    const arrivedTaskForcesList: TaskForce[] = [];
    const arrivedUnitsList: Unit[] = [];
    const arrivedCardDeployments: any[] = [];
    const arrivedTaskForceDeployments: any[] = [];
    const arrivedUnitDeployments: any[] = [];

    // Check which deployments have arrived for this faction
    pendingDeployments.cards.forEach(pending => {
      if (isDeploymentActive(pending, newTurnState)) {
        const card = cards.find(c => c.id === pending.cardId);
        if (card && pending.faction === faction) {
          arrivedCardsList.push(card);
          arrivedCardDeployments.push(pending);
        }
      }
    });

    pendingDeployments.taskForces.forEach(pending => {
      if (isDeploymentActive(pending, newTurnState)) {
        const tf = taskForces.find(t => t.id === pending.taskForceId);
        if (tf && pending.faction === faction) {
          arrivedTaskForcesList.push(tf);
          arrivedTaskForceDeployments.push(pending);
        }
      }
    });

    pendingDeployments.units.forEach(pending => {
      if (isDeploymentActive(pending, newTurnState)) {
        const unit = units.find(u => u.id === pending.unitId);
        if (unit && pending.faction === faction) {
          arrivedUnitsList.push(unit);
          arrivedUnitDeployments.push(pending);
        }
      }
    });

    return {
      arrivedCardsList,
      arrivedTaskForcesList,
      arrivedUnitsList,
      arrivedCardDeployments,
      arrivedTaskForceDeployments,
      arrivedUnitDeployments
    };
  }, [pendingDeployments, isDeploymentActive, cards, taskForces, units]);

  // Process complete submarine campaign turn - NOW USING SubmarineCampaignOrchestrator
  const processSubmarineCampaignTurn = async (currentTurnState: TurnState, updatedAreas?: OperationalArea[]) => {
    // Use orchestrator to execute all five phases in correct sequence:
    // -1. Asset Deploy Phase - deploy assets (mines, sensors) to areas
    // 0. Mine Phase - maritime mines eliminate submarines/ships
    // 1. ASW Phase - detect and eliminate submarines
    // 2. Attack Phase - execute missile attacks on bases
    // 3. Patrol Phase - conduct patrol operations
    const result = await SubmarineCampaignOrchestrator.executeFullTurn(
      submarineCampaign,
      currentTurnState,
      commandPoints,
      updatedAreas || operationalAreas, // Use updated areas if provided (includes newly arrived cards)
      taskForces,
      units,
      cards,
      locations
    );

    // Update operational areas if assets were deployed
    if (result.updatedOperationalAreas.length > 0) {
      await updateOperationalAreas(result.updatedOperationalAreas);
    }

    // Update command points if changed by patrols
    if (result.updatedCommandPoints.us !== commandPoints.us ||
        result.updatedCommandPoints.china !== commandPoints.china) {
      await updateCommandPoints(result.updatedCommandPoints);
    }

    // Update locations if damage was applied by attacks
    if (result.updatedLocations.length > 0) {
      await updateLocations(result.updatedLocations);
    }

    // Return result WITHOUT updating submarine campaign (will be done in batch)
    return result;
  };

  const handleAdvanceTurn = async () => {
    // Use TurnService to calculate new turn state
    const { newTurnState, completedWeek, isPlanningPhaseTransition } = TurnService.advanceTurn(turnState);

    // CASE 1: Handle Planning Phase → Turn 1 transition
    if (isPlanningPhaseTransition) {
      updateTurnState(newTurnState);

      // Calculate command points based on controlled bases (WITHOUT influence bonus)
      // Influence bonus is only applied at end of week, not during planning phase
      const newCommandPoints = calculateCommandPoints(locations, 0, false);
      updateCommandPoints(newCommandPoints);

      // FIX: Sync submarineCampaign.currentTurn with turnState.turnNumber
      if (submarineCampaign) {
        updateSubmarineCampaign({
          ...submarineCampaign,
          currentTurn: newTurnState.turnNumber
        });
      }

      console.log('Command Points calculated from bases (planning phase):', newCommandPoints);
      console.log('Influence bonus NOT applied (only at end of week)');
      console.log('Submarine campaign turn synchronized:', newTurnState.turnNumber);
      return; // Exit early
    }

    // CASE 2: Normal day advancement

    // Process pending deployments BEFORE updating turn state
    // Use calculateArrivals function to get arrivals for selected faction
    const {
      arrivedCardsList,
      arrivedTaskForcesList,
      arrivedUnitsList,
      arrivedCardDeployments,
      arrivedTaskForceDeployments,
      arrivedUnitDeployments
    } = selectedFaction ? calculateArrivals(selectedFaction, newTurnState) : {
      arrivedCardsList: [],
      arrivedTaskForcesList: [],
      arrivedUnitsList: [],
      arrivedCardDeployments: [],
      arrivedTaskForceDeployments: [],
      arrivedUnitDeployments: []
    };

    // CRITICAL: Save arrivals to state IMMEDIATELY before cleaning pendingDeployments
    // This ensures the modal can display them even after pendingDeployments is cleared
    if (selectedFaction) {
      setArrivedCards(arrivedCardsList);
      setArrivedTaskForces(arrivedTaskForcesList);
      setArrivedUnits(arrivedUnitsList);
      setArrivedCardDeployments(arrivedCardDeployments);
      setArrivedTaskForceDeployments(arrivedTaskForceDeployments);
      setArrivedUnitDeployments(arrivedUnitDeployments);

      console.log('💾 Arrivals saved to state:', {
        cards: arrivedCardsList.length,
        taskForces: arrivedTaskForcesList.length,
        units: arrivedUnitsList.length
      });
    }

    // Remove arrived deployments from pending
    const remainingCards = pendingDeployments.cards.filter(pending =>
      !isDeploymentActive(pending, newTurnState)
    );

    const remainingTaskForces = pendingDeployments.taskForces.filter(pending =>
      !isDeploymentActive(pending, newTurnState)
    );

    const remainingUnits = pendingDeployments.units.filter(pending =>
      !isDeploymentActive(pending, newTurnState)
    );

    // Update pending deployments
    const updatedPending: PendingDeployments = {
      cards: remainingCards,
      taskForces: remainingTaskForces,
      units: remainingUnits,
    };

    // 🔍 LOG A: Debug card deployment cleanup
    console.log('🔍 [DEPLOY-1] About to remove arrived cards from pending deployments');
    console.log('  📦 Arrived cards:', arrivedCardsList.map(c => ({ id: c.id, name: c.name })));
    if (arrivedCardsList.length > 0) {
      const cardDeploymentsPreview = pendingDeployments.cards.filter(p =>
        arrivedCardsList.some(c => c.id === p.cardId)
      );
      console.log('  📋 Card deployments:', cardDeploymentsPreview.map(d => ({
        cardId: d.cardId,
        cardInstanceId: d.cardInstanceId,
        areaId: d.areaId
      })));
    }
    console.log('  🗑️ Pending before cleanup:', {
      cardsCount: pendingDeployments.cards.length,
      cardIds: pendingDeployments.cards.map(c => c.cardInstanceId)
    });
    console.log('  ✅ Remaining after cleanup:', {
      cardsCount: remainingCards.length,
      cardIds: remainingCards.map(c => c.cardInstanceId)
    });

    await updatePendingDeployments(updatedPending);

    // Track updated operational areas with newly arrived cards
    let areasWithArrivedCards = operationalAreas;

    // Activate arrived cards (add to area.assignedCards)
    if (arrivedCardsList.length > 0) {
      const cardDeployments = pendingDeployments.cards.filter(p =>
        arrivedCardsList.some(c => c.id === p.cardId)
      );

      // Restore embarkedUnits to Cards that had them in pending deployments
      const deploymentsWithUnits = cardDeployments.filter(p => p.embarkedUnits && p.embarkedUnits.length > 0);
      if (deploymentsWithUnits.length > 0) {
        const updatedCards = cards.map(card => {
          const deployment = deploymentsWithUnits.find(p => p.cardId === card.id);
          if (deployment) {
            return {
              ...card,
              ...(deployment.embarkedUnits && { embarkedUnits: deployment.embarkedUnits })
            };
          }
          return card;
        });
        await updateCards(updatedCards);
      }

      // 🔍 LOG B: Debug card assignment to areas
      console.log('🔍 [DEPLOY-2] About to add arrived cards to area.assignedCards');
      console.log('  📦 Card deployments to process:', cardDeployments.map(d => ({
        cardInstanceId: d.cardInstanceId,
        areaId: d.areaId,
        cardName: cards.find(c => c.id === d.cardId)?.name
      })));
      console.log('  🗺️ Current operational areas assignedCards:');
      operationalAreas.forEach(area => {
        if (area.assignedCards && area.assignedCards.length > 0) {
          console.log(`    - ${area.name}: ${area.assignedCards.length} cards`, area.assignedCards);
        }
      });

      const updatedAreas = operationalAreas.map(area => {
        const cardsForThisArea = cardDeployments
          .filter(p => p.areaId === area.id)
          .map(p => p.cardInstanceId);

        if (cardsForThisArea.length > 0) {
          const currentCards = area.assignedCards || [];
          return {
            ...area,
            assignedCards: [...currentCards, ...cardsForThisArea],
          };
        }
        return area;
      });

      // 🔍 LOG C: Debug updatedAreas built with new cards
      console.log('🔍 [DEPLOY-3] Built updatedAreas with new assignedCards');
      updatedAreas.forEach(area => {
        const original = operationalAreas.find(a => a.id === area.id);
        const originalCount = original?.assignedCards?.length || 0;
        const newCount = area.assignedCards?.length || 0;
        if (originalCount !== newCount) {
          console.log(`  📍 ${area.name}:`);
          console.log(`    - Before: ${originalCount} cards`, original?.assignedCards || []);
          console.log(`    - After: ${newCount} cards`, area.assignedCards || []);
          console.log(`    - Added: ${newCount - originalCount} cards`);
        }
      });
      console.log('  🚀 Calling updateOperationalAreas with', updatedAreas.length, 'areas');

      await updateOperationalAreas(updatedAreas);

      // Save for submarine orchestrator (prevents overwrite with stale data)
      areasWithArrivedCards = updatedAreas;

      // 🔍 LOG D: Debug Firestore write completed
      console.log('🔍 [DEPLOY-4] updateOperationalAreas completed');
      console.log('  ⏰ Timestamp:', new Date().toISOString());
      console.log('  🎯 Next: Wait for Firestore subscription to fire...');
    }

    // Activate arrived Task Forces (remove isPendingDeployment flag)
    if (arrivedTaskForcesList.length > 0) {
      const updatedTFs = taskForces.map(tf => {
        if (arrivedTaskForcesList.some(a => a.id === tf.id)) {
          return { ...tf, isPendingDeployment: false };
        }
        return tf;
      });
      await updateTaskForces(updatedTFs);
    }

    // Activate arrived units (remove isPendingDeployment flag)
    if (arrivedUnitsList.length > 0) {
      const updatedUnits = units.map(u => {
        if (arrivedUnitsList.some(a => a.id === u.id)) {
          return { ...u, isPendingDeployment: false };
        }
        return u;
      });
      await updateUnits(updatedUnits);
    }

    // CRITICAL: Process submarine operations in correct order for end-of-week
    // Order: ASW → Attacks → CP Reset → Patrols → Turn Update
    console.log('🔄 Processing end-of-turn operations in sequence...');

    // STEP 0: Snapshot ASW ships at turn start (locked until next turn)
    if (submarineCampaign) {
      const aswShips = SubmarineCampaignOrchestrator.snapshotAswShips(units, taskForces, operationalAreas);
      await updateSubmarineCampaign({
        ...submarineCampaign,
        aswShips
      });
      console.log(`  ✅ ASW ships snapshot: ${aswShips.length} ships locked for this turn`);
    }

    // STEP 1: Process complete submarine campaign turn (ASW → Attack → Patrol)
    // The orchestrator handles phase chaining automatically
    // Pass areasWithArrivedCards to prevent overwriting newly arrived cards with stale data
    const submarineResult = await processSubmarineCampaignTurn(newTurnState, areasWithArrivedCards);
    console.log(`  ✅ Submarine campaign events: ${submarineResult.events.length}`);

    // STEP 2: If week completed, recalculate command points (considers damaged bases from attacks)
    if (completedWeek) {
      // Save previous command points before recalculating
      await updatePreviousCommandPoints({ ...commandPoints });

      // Recalculate with influence bonus (uses current base states, including newly damaged)
      // IMPORTANT: Influence bonus is ONLY applied here (end of week), not during planning phase or mid-week
      const newCommandPoints = calculateCommandPoints(locations, influenceMarker.value, true);
      updateCommandPoints(newCommandPoints);

      console.log('📊 Week completed! Command Points recalculated from bases:');
      console.log('  - Previous CP:', commandPoints);
      console.log('  - New CP (with influence bonus):', newCommandPoints);
      console.log('  - Influence modifier:', influenceMarker.value);
    }

    // STEP 3: Combine ALL events and do ONE atomic update to submarine campaign
    const allEvents = submarineResult.events;

    if (allEvents.length > 0 && submarineCampaign) {
      console.log(`📋 Total submarine events: ${allEvents.length}`);
      console.log(`🔵 [BATCH UPDATE] Current events in campaign: ${submarineCampaign.events.length}`);
      console.log(`🔵 [BATCH UPDATE] Adding events: ${allEvents.length}`);

      // Use orchestrator result submarines (they have all accumulated changes from ASW → Attack → Patrol)
      await updateSubmarineCampaign({
        ...submarineCampaign,
        deployedSubmarines: submarineResult.updatedSubmarines,
        events: [...submarineCampaign.events, ...allEvents]
      });

      console.log(`🔵 [BATCH UPDATE] Total after update: ${submarineCampaign.events.length + allEvents.length}`);
    }

    // STEP 6: Update turn state AND sync submarine campaign turn
    console.log('✅ All operations complete. Updating turn state...');
    updateTurnState(newTurnState);

    // Sync submarineCampaign.currentTurn with turnState.turnNumber (atomic partial update)
    await updateSubmarineCampaignTurn(newTurnState.turnNumber);
    console.log('🔄 Submarine campaign turn synchronized:', newTurnState.turnNumber);

    // Auto-reset previousCommandPoints after Monday (day 1) ends
    // This ensures the detailed breakdown only shows on Monday after end of week
    if (!completedWeek && newTurnState.dayOfWeek === 2 && previousCommandPoints !== undefined) {
      console.log('🧹 Auto-resetting previousCommandPoints after Monday');
      await updatePreviousCommandPoints(null);
    }

    if (!completedWeek) {
      console.log('Day advanced:', newTurnState.dayOfWeek, '/', 7);
    }

    // Log arrivals (modal will be opened by useEffect for all clients)
    const hasArrivals = arrivedCardsList.length > 0 || arrivedTaskForcesList.length > 0 || arrivedUnitsList.length > 0;
    const hasSubmarineEvents = allEvents.length > 0;

    // Note: Modal opening is now handled by useEffect to ensure sync across all clients
    // The useEffect will detect the turn change and open the modal with proper data

    if (hasArrivals) {
      console.log('Deployments arrived:', {
        cards: arrivedCardsList.length,
        taskForces: arrivedTaskForcesList.length,
        units: arrivedUnitsList.length,
      });
    }
  };

  // Filter task forces by selected faction
  const factionTaskForces = useMemo(() => {
    if (!selectedFaction) return [];
    return taskForces.filter(tf => tf.faction === selectedFaction);
  }, [taskForces, selectedFaction]);

  const handleLayerChange = useCallback((layerName: string) => {
    const selectedLayer = mapLayers.find(layer => layer.name === layerName);
    if (selectedLayer) {
      setCurrentTileLayer(selectedLayer);
    }
  }, []);

  const handleCoordinatesSelected = useCallback((coords: Position) => {
    setSelectedCoordinates(coords);
    setCoordinatesSelectionMode(false);
    modals.open('editAreas');
  }, [modals]);

  const handleStartCoordinateSelection = useCallback(() => {
    setCoordinatesSelectionMode(true);
    setSelectedCoordinates(null);
    setShouldResetModalState(false); // Preserve modal state
    modals.close('editAreas'); // Close modal temporarily
  }, [modals]);

  const handleStopCoordinateSelection = useCallback(() => {
    setCoordinatesSelectionMode(false);
    // Clear coordinates after a delay to allow modal to process them
    setTimeout(() => {
      setSelectedCoordinates(null);
    }, 500);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // User and isAdmin states will be updated by onAuthStateChanged listener
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Error signing out");
    }
  };

  const handleResetGame = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This will reset ALL game data to initial values.\n\n" +
      "You will lose:\n" +
      "- All created Task Forces\n" +
      "- All assigned cards\n" +
      "- All operational area changes\n" +
      "- All edited or created bases\n" +
      "- All recorded damage\n" +
      "- Card budget\n\n" +
      "Are you sure you want to continue?"
    );

    if (!confirmed) return;

    try {
      await resetGameData(
        initialOperationalAreas,
        initialOperationalData,
        initialLocations,
        initialTaskForces,
        initialUnits,
        initialCards,
        initialCommandPoints,
        initialTurnState,
        initialInfluenceMarker
      );
      alert("✓ Game reset successfully");
    } catch (err) {
      console.error("Error resetting game:", err);
      setError("Error resetting game");
    }
  };

  if (!selectedFaction) {
    return <FactionSelector onSelect={handleFactionSelect} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className={`backdrop-blur-sm shadow-lg p-4 z-20 w-full flex items-center justify-between ${
        selectedFaction === 'china' ? 'bg-red-900/50' : 'bg-gray-800/50'
      }`}>
        <div className="flex items-center gap-4">
          {/* Admin toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={() => {
                  if (!isAdmin) {
                    // Open login modal to become admin
                    modals.open('adminLogin');
                  } else {
                    // Logout
                    handleLogout();
                  }
                }}
                className={`w-5 h-5 bg-gray-700 border-gray-600 rounded focus:ring-2 cursor-pointer ${
                  selectedFaction === 'china' ? 'text-red-600 focus:ring-red-500' : 'text-cyan-600 focus:ring-cyan-500'
                }`}
              />
              <span className="ml-2 text-xs font-mono font-medium text-gray-300 group-hover:text-white uppercase tracking-wide">
                Admin
              </span>
            </label>
            {isAdmin && (
              <span className={`text-xs px-2 py-1 text-white rounded-full font-semibold ${
                selectedFaction === 'china' ? 'bg-red-600' : 'bg-cyan-600'
              }`}>
                {user?.email?.split('@')[0] || 'Admin'}
              </span>
            )}
          </div>
          {/* Reset game button - only visible for admin */}
          {isAdmin && (
            <button
              onClick={handleResetGame}
              className="px-3 py-1.5 text-lg font-mono bg-red-600 hover:bg-red-700 text-white rounded border border-red-500 transition-colors"
              title="Reset Game to Initial Values"
            >
              🔄
            </button>
          )}
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className={`text-xl md:text-3xl font-bold ${
            selectedFaction === 'china' ? 'text-red-400' : 'text-cyan-400'
          }`}>
            Littoral Commander Campaign
          </h1>
          {playerName && (
            <div className="text-sm font-mono text-green-400 mt-1 tracking-wide">
              PLAYER: {playerName.toUpperCase()}
              {myAssignedAreaIds.length > 0 && (
                <span className="mx-2">|</span>
              )}
              {myAssignedAreaIds.length > 0 ? (
                <>
                  AREAS: {operationalAreas
                    .filter(area => myAssignedAreaIds.includes(area.id))
                    .map(area => area.name)
                    .join(', ')}
                </>
              ) : (
                <span className="text-yellow-400">UNASSIGNED</span>
              )}
            </div>
          )}
        </div>
        <div className="w-32"></div> {/* Spacer for balance */}
      </header>
      <div className="flex flex-grow overflow-hidden relative">
        <Sidebar 
          locations={filteredLocations} 
          onLocationSelect={handleLocationSelect}
          filters={filters}
          onFilterChange={handleFilterChange}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <main className="flex-grow relative">
           {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-24 left-4 z-[1000] p-3 bg-gray-900/90 hover:bg-gray-800 text-green-400 rounded border border-green-900 transition-colors"
              aria-label="Show Locations"
            >
              <MenuIcon />
            </button>
          )}
          <div className="absolute top-4 right-4 z-[1000]">
            <select
              onChange={(e) => handleLayerChange(e.target.value)}
              value={currentTileLayer.name}
              className="bg-gray-900/90 text-green-400 font-mono text-xs p-2 rounded border border-green-900 focus:ring-green-400 focus:border-green-400 cursor-pointer appearance-none uppercase tracking-wide"
              aria-label="Select Map Layer"
            >
              {mapLayers.map(layer => (
                <option key={layer.name} value={layer.name}>
                  {layer.name}
                </option>
              ))}
            </select>
          </div>
          <Map
            center={position}
            zoom={zoom}
            locations={filteredLocations}
            operationalAreas={operationalAreas}
            operationalData={operationalData}
            onOperationalDataUpdate={handleOperationalDataUpdate}
            previewArea={previewArea}
            tileLayer={currentTileLayer}
            coordinatesSelectionMode={coordinatesSelectionMode}
            onCoordinatesSelected={handleCoordinatesSelected}
            selectedCoordinates={selectedCoordinates}
            onLocationsUpdate={handleLocationsUpdate}
            selectedFaction={selectedFaction}
            taskForces={taskForces}
            units={units}
            cards={cards}
            onOperationalAreasUpdate={handleSaveOperationalAreas}
            onUnitsUpdate={handleUnitsUpdate}
            onCardsUpdate={handleCardsUpdate}
            onTaskForcesUpdate={handleTaskForcesUpdate}
            isAdmin={isAdmin}
            onEditBase={handleEditBase}
            turnState={turnState}
            onAdvanceTurn={handleAdvanceTurn}
            influenceMarker={influenceMarker}
            onInfluenceMarkerUpdate={handleInfluenceMarkerUpdate}
            pendingDeployments={pendingDeployments}
            onAddPlayedCardNotification={addPlayedCardNotification}
            sidebarOpen={sidebarOpen}
          />
          <div className="absolute bottom-16 right-4 z-[1000] flex flex-col space-y-2">
            <button
              onClick={() => modals.open('commandCenter')}
              className="flex items-center justify-center w-16 h-12 bg-black/80 hover:bg-gray-900 text-green-400 hover:text-green-300 font-mono font-bold border-2 border-green-900 hover:border-green-700 transition-colors focus:outline-none"
              aria-label="Command Center"
            >
              <span className="text-sm">CC</span>
            </button>
            <button
              onClick={() => modals.open('taskForce')}
              className="flex items-center justify-center w-16 h-12 bg-black/80 hover:bg-gray-900 text-red-400 hover:text-red-300 font-mono font-bold border-2 border-red-900 hover:border-red-700 transition-colors focus:outline-none"
              aria-label="Manage Task Forces"
            >
              <span className="text-sm">TF</span>
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => modals.open('editAreas')}
                  className="flex items-center justify-center w-16 h-12 bg-black/80 hover:bg-gray-900 text-blue-400 hover:text-blue-300 font-mono font-bold border-2 border-blue-900 hover:border-blue-700 transition-colors focus:outline-none"
                  aria-label="Edit Operational Areas"
                >
                  <span className="text-sm">ED</span>
                </button>
                <button
                  onClick={() => modals.open('playerAssignment')}
                  className="flex items-center justify-center w-16 h-12 bg-black/80 hover:bg-gray-900 text-green-400 hover:text-green-300 font-mono font-bold border-2 border-green-900 hover:border-green-700 transition-colors focus:outline-none"
                  aria-label="Player Assignments"
                  title="Assign players to operational areas"
                >
                  <span className="text-sm">PA</span>
                </button>
              </>
            )}
            <button
              onClick={() => modals.open('combatStats')}
              className="flex items-center justify-center w-16 h-12 bg-black/80 hover:bg-gray-900 text-purple-400 hover:text-purple-300 font-mono font-bold border-2 border-purple-900 hover:border-purple-700 transition-colors focus:outline-none"
              aria-label="Combat Statistics"
            >
              <span className="text-sm">ST</span>
            </button>
          </div>
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/80 text-white p-3 rounded-lg shadow-xl z-[1000] text-sm">
              {error}
            </div>
          )}
        </main>
      </div>

      <EditAreasModal
        isOpen={modals.isOpen('editAreas')}
        onClose={handleCloseModal}
        areas={operationalAreas}
        onSave={handleSaveOperationalAreas}
        onPreview={setPreviewArea}
        locations={locations}
        onLocationsUpdate={handleLocationsUpdate}
        onStartCoordinateSelection={handleStartCoordinateSelection}
        onStopCoordinateSelection={handleStopCoordinateSelection}
        selectedCoordinates={selectedCoordinates}
        shouldResetState={shouldResetModalState}
        isAdmin={isAdmin}
        initialSelectedBaseId={selectedBaseForEdit}
      />

      {selectedFaction && (
        <TaskForceModal
          isOpen={modals.isOpen('taskForce')}
          onClose={() => modals.close('taskForce')}
          taskForces={taskForces}
          onSave={handleTaskForcesUpdate}
          operationalAreas={operationalAreas}
          selectedFaction={selectedFaction}
          units={units}
          onUnitsUpdate={handleUnitsUpdate}
          isAdmin={isAdmin}
          commandPoints={commandPoints}
          onCommandPointsUpdate={handleCommandPointsUpdate}
          turnState={turnState}
          pendingDeployments={pendingDeployments}
          onPendingDeploymentsUpdate={updatePendingDeployments}
          calculateActivationTiming={calculateActivationTiming}
          cards={cards}
          purchasedCards={purchasedCards}
          onPurchasedCardsUpdate={updatePurchasedCards}
        />
      )}

      {selectedFaction && (
        <CommandCenterModal
          isOpen={modals.isOpen('commandCenter')}
          onClose={() => modals.close('commandCenter')}
          cards={cards}
          commandPoints={commandPoints}
          purchaseHistory={purchaseHistory}
          cardPurchaseHistory={cardPurchaseHistory}
          purchasedCards={purchasedCards}
          operationalAreas={operationalAreas}
          operationalData={operationalData}
          selectedFaction={selectedFaction}
          onPurchaseCard={handleCardPurchase}
          onUpdatePoints={handleCommandPointsUpdate}
          onUpdatePurchaseHistory={handlePurchaseHistoryUpdate}
          onUpdateCardPurchaseHistory={handleCardPurchaseHistoryUpdate}
          onUpdatePurchasedCards={updatePurchasedCards}
          onOpenCardEditor={() => modals.open('cardEditor')}
          isAdmin={isAdmin}
          locations={locations}
          units={units}
          taskForces={taskForces}
          onUnitsUpdate={updateUnits}
          onCardsUpdate={updateCards}
          submarineCampaign={submarineCampaign}
          onUpdateSubmarineCampaign={updateSubmarineCampaign}
          onDeploySubmarineAndRemoveFromPurchased={deploySubmarineAndRemoveFromPurchased}
          pendingDeployments={pendingDeployments}
          turnState={turnState}
        />
      )}

      {/* Card Editor Modal */}
      {modals.isOpen('cardEditor') && (
        <CardEditorModal
          isOpen={modals.isOpen('cardEditor')}
          onClose={() => modals.close('cardEditor')}
          cards={cards}
          onUpdateCards={updateCards}
          isAdmin={isAdmin}
          locations={locations}
          units={units}
        />
      )}

      {/* Combat Statistics Modal */}
      {selectedFaction && (
        <CombatStatisticsModal
          isOpen={modals.isOpen('combatStats')}
          onClose={() => modals.close('combatStats')}
          units={units}
          taskForces={taskForces}
          destructionLog={destructionLog}
          influenceMarker={influenceMarker}
          onInfluenceMarkerUpdate={handleInfluenceMarkerUpdate}
          isAdmin={isAdmin}
          submarineCampaign={submarineCampaign}
          onUpdateSubmarineCampaign={updateSubmarineCampaign}
          locations={locations}
          operationalAreas={operationalAreas}
          operationalData={operationalData}
          selectedFaction={selectedFaction}
          pendingDeployments={pendingDeployments}
          turnState={turnState}
          commandPoints={commandPoints}
          onCommandPointsUpdate={handleCommandPointsUpdate}
        />
      )}

      {/* Deployment Notification Modal */}
      {selectedFaction && (
        <DeploymentNotificationModal
          isOpen={modals.isOpen('deploymentNotification')}
          onClose={() => modals.close('deploymentNotification')}
          arrivedCards={arrivedCards}
          arrivedTaskForces={arrivedTaskForces}
          arrivedUnits={arrivedUnits}
          faction={selectedFaction}
          operationalAreas={operationalAreas}
          units={units}
          taskForces={taskForces}
          pendingDeployments={pendingDeployments}
          arrivedCardDeployments={arrivedCardDeployments}
          arrivedTaskForceDeployments={arrivedTaskForceDeployments}
          arrivedUnitDeployments={arrivedUnitDeployments}
          commandPoints={commandPoints}
          previousCommandPoints={previousCommandPoints}
          influenceMarker={influenceMarker}
          submarineEvents={turnSubmarineEvents}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={modals.isOpen('adminLogin')}
        onClose={() => modals.close('adminLogin')}
      />

      {/* Player Assignment Modal */}
      <PlayerAssignmentModal
        isOpen={modals.isOpen('playerAssignment')}
        onClose={() => modals.close('playerAssignment')}
        operationalAreas={operationalAreas}
        playerAssignments={playerAssignments}
        registeredPlayers={registeredPlayers}
      />

      {/* Played Card Notification Modal */}
      {(() => {
        // Filter notifications by player's assigned operational areas
        const filteredNotifications = playedCardNotifications.filter(notification => {
          // If player has no assigned areas, show no notifications
          if (myAssignedAreaIds.length === 0) return false;

          // Find the operational area for this notification
          const area = operationalAreas.find(a => a.name === notification.areaName);

          // Show notification only if it's from one of the player's assigned areas
          return area && myAssignedAreaIds.includes(area.id);
        });

        // Get the last notification (most recent)
        const currentNotification = filteredNotifications.length > 0
          ? filteredNotifications[filteredNotifications.length - 1]
          : null;

        // Skip Phase 1 if it's MY faction's card (I'm the active player in DiceRollModal)
        const shouldShowNotification = currentNotification && (() => {
          const isMyCard = currentNotification.faction === selectedFaction;
          const isPhase1 = currentNotification.notificationPhase === 'card_shown';

          // Skip if: MY card AND Phase 1 (I'm the active player, using DiceRollModal)
          if (isMyCard && isPhase1) {
            console.log('📋 [APP] Skipping Phase 1 notification (active player is in DiceRollModal)');
            return false;
          }

          // Show in all other cases:
          // - Opposing faction card (any phase)
          // - Phase 2 (result_ready) for any faction
          return true;
        })();

        console.log('📋 [APP] Total notifications (filtered by area):', filteredNotifications.length);
        if (currentNotification) {
          console.log('📋 [APP] Notification:', {
            timestamp: currentNotification.timestamp,
            phase: currentNotification.notificationPhase,
            faction: currentNotification.faction,
            cardName: currentNotification.cardName,
            shouldShow: shouldShowNotification
          });
        }

        return shouldShowNotification && (
          <PlayedCardNotificationModal
            key={`${currentNotification.timestamp}-${currentNotification.notificationPhase}`}
            notification={currentNotification}
            onClose={() => removePlayedCardNotification(currentNotification.timestamp)}
          />
        );
      })()}
    </div>
  );
}

export default App;