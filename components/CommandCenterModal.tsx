import React, { useState, useMemo, useEffect } from 'react';
import { Card, CommandPoints, PurchaseHistory, CardPurchaseHistory, PurchasedCards, OperationalArea, CardType, Location, OperationalData, Unit, TaskForce, SubmarineCampaignState, TurnState, PendingDeployments } from '../types';
import { CARD_TYPE_LABELS } from '../constants';
import BoardUnitsModal from './BoardUnitsModal';
import NotificationModal from './NotificationModal';
import { assignRandomSubmarineName } from '../constants/submarineNames';

interface CommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  commandPoints: CommandPoints;
  purchaseHistory: PurchaseHistory; // Total lifetime card purchases per faction
  cardPurchaseHistory: CardPurchaseHistory; // Per-card lifetime purchase count
  purchasedCards: PurchasedCards;
  operationalAreas: OperationalArea[];
  operationalData: Record<string, OperationalData>;
  selectedFaction: 'us' | 'china';
  onPurchaseCard: (cardInstanceId: string, areaId: string) => void;
  onUpdatePoints: (points: CommandPoints) => void;
  onUpdatePurchaseHistory: (history: PurchaseHistory) => void; // Update purchase history
  onUpdateCardPurchaseHistory: (history: CardPurchaseHistory) => void; // Update per-card purchase history
  onUpdatePurchasedCards: (cards: PurchasedCards) => Promise<void>;
  onOpenCardEditor: () => void;
  isAdmin: boolean;
  locations: Location[]; // Lista de bases para validar condiciones
  units: Unit[]; // Lista de unidades para adjuntar cartas
  taskForces: TaskForce[]; // Lista de task forces
  onUnitsUpdate: (units: Unit[]) => Promise<void>; // Función para actualizar unidades
  onCardsUpdate: (cards: Card[]) => Promise<void>; // Función para actualizar cartas
  submarineCampaign: SubmarineCampaignState; // Estado de campaña submarina
  onUpdateSubmarineCampaign: (campaign: SubmarineCampaignState) => Promise<void>; // Actualizar campaña submarina
  onDeploySubmarineAndRemoveFromPurchased: (campaign: SubmarineCampaignState, cards: PurchasedCards) => Promise<void>; // Operación atómica
  pendingDeployments: PendingDeployments; // Despliegues pendientes (cartas en tránsito)
  turnState: TurnState; // Estado del turno actual
}

interface PurchasedCard {
  instance: import('../types').PurchasedCardInstance;
  card: Card;
  areaId: string;
}

const CommandCenterModal: React.FC<CommandCenterModalProps> = ({
  isOpen,
  onClose,
  cards,
  commandPoints,
  purchaseHistory,
  cardPurchaseHistory,
  purchasedCards: purchasedCardsFromFirestore,
  operationalAreas,
  operationalData,
  selectedFaction,
  onPurchaseCard,
  onUpdatePoints,
  onUpdatePurchaseHistory,
  onUpdateCardPurchaseHistory,
  onUpdatePurchasedCards,
  onOpenCardEditor,
  isAdmin,
  locations,
  units,
  taskForces,
  onUnitsUpdate,
  onCardsUpdate,
  submarineCampaign,
  pendingDeployments,
  turnState,
  onUpdateSubmarineCampaign,
  onDeploySubmarineAndRemoveFromPurchased,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<CardType | 'all'>('all');
  const [viewingPurchasedCard, setViewingPurchasedCard] = useState<string | null>(null);
  const [selectedPurchasedInstanceId, setSelectedPurchasedInstanceId] = useState<string | null>(null);
  const [selectedAreaForPurchasedCard, setSelectedAreaForPurchasedCard] = useState<string>('');
  const [selectedUnitForCardAttachment, setSelectedUnitForCardAttachment] = useState<string>('');
  const [isBoardUnitsModalOpen, setIsBoardUnitsModalOpen] = useState<boolean>(false);

  // Local copy of units to ensure immediate updates after boarding
  const [editedUnits, setEditedUnits] = useState<Unit[]>(units);

  // Local copy of cardPurchaseHistory for immediate UI updates (optimistic update)
  const [localCardPurchaseHistory, setLocalCardPurchaseHistory] = useState<CardPurchaseHistory>(cardPurchaseHistory);

  // State for Command Points flash animation
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevCommandPoints, setPrevCommandPoints] = useState(commandPoints);

  // State for notification modal
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showNotification = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  // Cards that can only be attached directly to specific unit types
  const AEGIS_BALLISTIC_DEFENSE_CARD_ID = 'us-033'; // US - attaches to DDG(X)
  const BALLISTIC_MISSILE_DEFENSE_CARD_ID = 'china-075'; // China - attaches to TYPE 055 DDG

  // Sync editedUnits when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setEditedUnits([...units]);
    }
  }, [isOpen]);

  // Sync when units prop changes from Firestore (but NOT when board modal is open, to preserve local edits)
  React.useEffect(() => {
    if (!isBoardUnitsModalOpen && isOpen) {
      setEditedUnits([...units]);
    }
  }, [units]);

  // Sync localCardPurchaseHistory when modal opens (fresh session)
  React.useEffect(() => {
    if (isOpen) {
      setLocalCardPurchaseHistory(cardPurchaseHistory);
    }
  }, [isOpen]);

  // Detect Command Points decrease and trigger flash animation
  React.useEffect(() => {
    const currentPoints = selectedFaction === 'us' ? commandPoints.us : commandPoints.china;
    const previousPoints = selectedFaction === 'us' ? prevCommandPoints.us : prevCommandPoints.china;

    // Check if Command Points decreased
    if (currentPoints < previousPoints) {
      setIsFlashing(true);
      // Remove flash after animation completes
      const timer = setTimeout(() => setIsFlashing(false), 600);
      return () => clearTimeout(timer);
    }

    // Update previous Command Points
    setPrevCommandPoints(commandPoints);
  }, [commandPoints, selectedFaction, prevCommandPoints]);

  // Convert purchased card instances from Firestore to PurchasedCard objects
  const purchasedCards = useMemo(() => {
    const instances = purchasedCardsFromFirestore[selectedFaction];
    return instances.map(instance => {
      const card = cards.find(c => c.id === instance.cardId);
      return card ? { instance, card, areaId: '' } : null;
    }).filter(pc => pc !== null) as PurchasedCard[];
  }, [purchasedCardsFromFirestore, selectedFaction, cards]);

  // Get purchased card IDs
  const purchasedCardIds = useMemo(() => {
    return new Set(purchasedCards.map(pc => pc.card.id));
  }, [purchasedCards]);

  // Get selected purchased card instance and derive card ID
  const selectedPurchasedInstance = useMemo(() => {
    return purchasedCards.find(pc => pc.instance.instanceId === selectedPurchasedInstanceId);
  }, [purchasedCards, selectedPurchasedInstanceId]);

  const selectedPurchasedCardId = selectedPurchasedInstance?.card.id || null;

  // Filter cards by current faction
  // Note: Cards are controlled by maxPurchases limit, not by assignedCards
  const availableCards = useMemo(() => {
    return cards.filter(card =>
      card.faction === selectedFaction
    );
  }, [cards, selectedFaction]);

  // Filter by card type
  const filteredCards = useMemo(() => {
    if (selectedTypeFilter === 'all') return availableCards;
    return availableCards.filter(card => card.cardType === selectedTypeFilter);
  }, [availableCards, selectedTypeFilter]);

  // Get selected card details
  const selectedCard = useMemo(() => {
    return cards.find(card => card.id === selectedCardId);
  }, [cards, selectedCardId]);

  // Get current faction command points
  const currentPoints = selectedFaction === 'us' ? commandPoints.us : commandPoints.china;

  // Count cards by type
  const cardTypeCounts = useMemo(() => {
    const counts: Record<CardType, number> = {
      attack: 0,
      maneuver: 0,
      interception: 0,
      intelligence: 0,
      communications: 0,
    };
    availableCards.forEach(card => {
      counts[card.cardType]++;
    });
    return counts;
  }, [availableCards]);

  // Count total purchased card instances for the selected faction (across all states)
  const totalPurchasedCardsCount = useMemo(() => {
    let total = 0;

    // Cards in purchased list (not yet deployed)
    total += purchasedCards.length;

    // Cards assigned to operational areas
    operationalAreas.forEach(area => {
      if (area.assignedCards) {
        // Filter by faction - extract card ID from instance ID and check if it belongs to selected faction
        total += area.assignedCards.filter(instanceId => {
          const cardId = instanceId.includes('_') ? instanceId.split('_')[0] : instanceId;
          return cards.some(c => c.id === cardId && c.faction === selectedFaction);
        }).length;
      }

      // Cards played/deployed in operational areas
      if (area.playedCards) {
        // Filter by faction
        total += area.playedCards.filter(id => {
          const cardId = id.includes('_') ? id.split('_')[0] : id;
          return cards.some(c => c.id === cardId && c.faction === selectedFaction);
        }).length;
      }
    });

    // Cards in pending deployments (in transit)
    if (pendingDeployments?.cards) {
      total += pendingDeployments.cards.filter(dep => dep.faction === selectedFaction).length;
    }

    // Cards attached to units (count by faction)
    editedUnits.forEach(unit => {
      if (unit.faction === selectedFaction && unit.attachedCard) {
        total++;
      }
    });

    // Cards deployed to submarine campaign (count by faction)
    if (submarineCampaign?.deployedSubmarines) {
      total += submarineCampaign.deployedSubmarines.filter(sub => sub.faction === selectedFaction).length;
    }

    return total;
  }, [purchasedCards, operationalAreas, pendingDeployments, editedUnits, submarineCampaign, selectedFaction, cards]);

  // Count how many times a card has been purchased (including assigned, played, in transit, attached to units, deployed to submarine campaign, and non-assigned)
  const countPurchasedCards = (cardId: string): number => {
    let count = 0;

    // Count cards in purchased list (not yet assigned to areas)
    count += purchasedCards.filter(pc => pc.card.id === cardId).length;

    // Count cards assigned to operational areas
    operationalAreas.forEach(area => {
      if (area.assignedCards) {
        count += area.assignedCards.filter(instanceId => {
          // Extract card ID from instance ID (format: "us-001_1234567890")
          const id = instanceId.includes('_') ? instanceId.split('_')[0] : instanceId;
          return id === cardId;
        }).length;
      }
      // Count cards played/deployed in operational areas
      if (area.playedCards) {
        count += area.playedCards.filter(id => {
          // playedCards might also use instance IDs, extract card ID
          const playedCardId = id.includes('_') ? id.split('_')[0] : id;
          return playedCardId === cardId;
        }).length;
      }
    });

    // Count cards in pending deployments (in transit)
    if (pendingDeployments?.cards) {
      count += pendingDeployments.cards.filter(dep => dep.cardId === cardId).length;
    }

    // Count cards attached to units
    editedUnits.forEach(unit => {
      if (unit.attachedCard === cardId) {
        count++;
      }
    });

    // Count cards deployed to submarine campaign
    if (submarineCampaign?.deployedSubmarines) {
      count += submarineCampaign.deployedSubmarines.filter(sub => sub.cardId === cardId).length;
    }

    return count;
  };

  // Get purchase limit indicator for a card
  const getPurchaseLimitIndicator = (card: Card): string => {
    // Use lifetime purchase history instead of counting cards in circulation
    const currentCount = localCardPurchaseHistory[selectedFaction][card.id] || 0;

    if (card.maxPurchases === 0) {
      return '∞'; // Unlimited
    } else if (card.maxPurchases !== undefined && card.maxPurchases > 0) {
      return `${currentCount}/${card.maxPurchases}`; // e.g., "2/4"
    } else {
      return `${currentCount}/1`; // Implicit limit of 1
    }
  };

  // Filter operational areas for Combat Air Patrol card deployment
  const availableAreasForCard = useMemo(() => {
    // Check if the selected purchased card is a Combat Air Patrol card
    const selectedCard = selectedPurchasedCardId
      ? cards.find(c => c.id === selectedPurchasedCardId)
      : null;

    const combatAirPatrolCardId = selectedFaction === 'us' ? 'us-002' : 'china-002';
    const isCombatAirPatrolCard = selectedCard?.id === combatAirPatrolCardId;

    if (!isCombatAirPatrolCard) {
      // For non-Combat Air Patrol cards, return all areas EXCEPT Command Centers
      return operationalAreas.filter(area => !area.isCommandCenter);
    }

    // For Combat Air Patrol cards, filter out Command Centers and areas that already have the card
    return operationalAreas.filter(area => {
      // Exclude Command Centers
      if (area.isCommandCenter) return false;
      // Check if Combat Air Patrol card has been assigned (but not played yet)
      const isCardAssigned = area.assignedCards?.includes(combatAirPatrolCardId) || false;

      // If card is assigned, area is NOT available
      if (isCardAssigned) {
        return false;
      }

      // Check if Combat Air Patrol card has been played in this area
      const isCardPlayed = area.playedCards?.includes(combatAirPatrolCardId) || false;

      // If card is not played, area is available
      if (!isCardPlayed) {
        return true;
      }

      // Card is played, check if patrol is still active (not destroyed, not used)
      const data = operationalData[area.id];
      if (!data) return true; // If no data, assume available

      const factionKey = selectedFaction === 'us' ? 'us' : 'plan';
      const factionData = data[factionKey];

      // Check if patrol is destroyed (both damage points taken)
      const isDestroyed = factionData.airPatrolsDamage.every(dmg => dmg === true);

      // Check if patrol is used
      const isUsed = factionData.airPatrolsUsed;

      // Area is NOT available if patrol is active (not destroyed and not used)
      const isPatrolActive = !isDestroyed && !isUsed;
      return !isPatrolActive;
    });
  }, [operationalAreas, selectedPurchasedCardId, cards, operationalData, selectedFaction]);

  // Get compatible DDG(X) units for Aegis Ballistic Defense card
  const compatibleDDGXUnits = useMemo(() => {
    // Only for Aegis Ballistic Defense card
    if (selectedPurchasedCardId !== AEGIS_BALLISTIC_DEFENSE_CARD_ID) return [];

    return editedUnits.filter(unit => {
      // Must be DDG(X) type
      if (unit.type !== 'DDG(X)') return false;

      // Must be assigned to a task force
      if (!unit.taskForceId) return false;

      // Must not have a card already attached
      if (unit.attachedCard) return false;

      // Must not be destroyed
      const damageCount = unit.currentDamage.filter(d => d).length;
      if (damageCount >= unit.damagePoints) return false;

      return true;
    });
  }, [editedUnits, selectedPurchasedCardId, AEGIS_BALLISTIC_DEFENSE_CARD_ID]);

  // Get compatible TYPE 055 DDG units for Ballistic Missile Defense card
  const compatibleType055Units = useMemo(() => {
    // Only for Ballistic Missile Defense card
    if (selectedPurchasedCardId !== BALLISTIC_MISSILE_DEFENSE_CARD_ID) return [];

    return editedUnits.filter(unit => {
      // Must be TYPE 055 DDG type
      if (unit.type !== 'TYPE 055 DDG') return false;

      // Must be assigned to a task force
      if (!unit.taskForceId) return false;

      // Must not have a card already attached
      if (unit.attachedCard) return false;

      // Must not be destroyed
      const damageCount = unit.currentDamage.filter(d => d).length;
      if (damageCount >= unit.damagePoints) return false;

      return true;
    });
  }, [editedUnits, selectedPurchasedCardId, BALLISTIC_MISSILE_DEFENSE_CARD_ID]);

  // Validate if a card can be purchased based on its conditions
  const validateCardConditions = (card: Card): { valid: boolean; reason?: string } => {
    // Check base condition if it exists
    if (card.requiresBaseCondition && card.requiredBaseId && card.requiredBaseMaxDamage !== undefined) {
      const base = locations.find(loc => loc.id === card.requiredBaseId);

      if (!base) {
        return { valid: false, reason: `Base not found (${card.requiredBaseId})` };
      }

      // Count current damage
      const damageCount = base.currentDamage.filter(d => d).length;

      // Check if base has reached or exceeded the damage threshold
      if (damageCount >= card.requiredBaseMaxDamage) {
        const isDestroyed = damageCount === base.damagePoints;
        return {
          valid: false,
          reason: isDestroyed
            ? `Requires ${base.name} operational (destroyed: ${damageCount}/${base.damagePoints} pts)`
            : `Requires ${base.name} with <${card.requiredBaseMaxDamage} damage pts (current: ${damageCount}/${base.damagePoints} pts)`
        };
      }
    }

    // Purchase limit logic:
    // - maxPurchases > 0: Explicit limit (e.g., 1, 2, 3)
    // - maxPurchases === 0: Unlimited purchases (no restriction)
    // - maxPurchases === undefined: Implicit limit of 1 purchase

    // Check explicit purchase limit (maxPurchases > 0)
    if (card.maxPurchases !== undefined && card.maxPurchases > 0) {
      const currentCount = localCardPurchaseHistory[selectedFaction][card.id] || 0;

      if (currentCount >= card.maxPurchases) {
        return {
          valid: false,
          reason: `Limit reached (${currentCount}/${card.maxPurchases} purchased)`
        };
      }
    }

    // Check unlimited purchases (maxPurchases === 0)
    // No restriction - card can be purchased indefinitely
    // Falls through to return { valid: true }

    // Check implicit limit (maxPurchases === undefined)
    // Apply default limit of 1 purchase for cards without explicit limit
    if (card.maxPurchases === undefined) {
      const currentCount = localCardPurchaseHistory[selectedFaction][card.id] || 0;

      if (currentCount > 0) {
        return {
          valid: false,
          reason: `Already purchased (${currentCount}/1)`
        };
      }
    }

    return { valid: true };
  };

  const handlePurchase = () => {
    if (!selectedCard) {
      showNotification('error', 'Selection Required', 'Please select a card from the catalog before purchasing.');
      return;
    }

    // Validate card conditions
    const validation = validateCardConditions(selectedCard);
    if (!validation.valid) {
      showNotification('error', 'Cannot Purchase Card', `${validation.reason}\n\nPlease check the card requirements and try again.`);
      return;
    }

    if (selectedCard.cost > currentPoints) {
      showNotification('error', 'Insufficient Command Points', `You need ${selectedCard.cost} CP to purchase this card.\n\nCurrent balance: ${currentPoints} CP\nRequired: ${selectedCard.cost} CP`);
      return;
    }

    // Deduct cost from command points
    const newPoints: CommandPoints = {
      ...commandPoints,
      [selectedFaction]: currentPoints - selectedCard.cost,
    };

    onUpdatePoints(newPoints);

    // Create new card instance with unique ID
    const newInstance = {
      instanceId: `${selectedCard.id}_${Date.now()}`,
      cardId: selectedCard.id,
      purchasedAt: Date.now(),
    };

    const updatedPurchasedCards = {
      ...purchasedCardsFromFirestore,
      [selectedFaction]: [...purchasedCardsFromFirestore[selectedFaction], newInstance]
    };
    onUpdatePurchasedCards(updatedPurchasedCards);

    // Increment purchase history (lifetime counter, never decreases)
    const updatedPurchaseHistory: PurchaseHistory = {
      ...purchaseHistory,
      [selectedFaction]: purchaseHistory[selectedFaction] + 1
    };
    onUpdatePurchaseHistory(updatedPurchaseHistory);

    // Increment per-card purchase history (lifetime counter for this specific card)
    const currentCardCount = cardPurchaseHistory[selectedFaction][selectedCard.id] || 0;
    const updatedCardPurchaseHistory: CardPurchaseHistory = {
      ...cardPurchaseHistory,
      [selectedFaction]: {
        ...cardPurchaseHistory[selectedFaction],
        [selectedCard.id]: currentCardCount + 1
      }
    };
    // Update local state immediately for instant UI feedback
    setLocalCardPurchaseHistory(updatedCardPurchaseHistory);
    // Update Firestore (will sync back via useEffect)
    onUpdateCardPurchaseHistory(updatedCardPurchaseHistory);

    // Reset selection
    setSelectedCardId(null);
  };

  const handleDeployToSubmarineCampaign = async () => {
    if (!selectedPurchasedInstanceId || !selectedPurchasedCardId) {
      showNotification('error', 'Selection Required', 'Please select a purchased card before deploying to Submarine Campaign.');
      return;
    }

    const card = cards.find(c => c.id === selectedPurchasedCardId);
    if (!card) return;

    // Validar que la carta tiene submarineType definido
    if (!card.submarineType) {
      showNotification('warning', 'Missing Submarine Type', 'This card does not have a submarine type defined.\n\nPlease edit the card in the card editor and select a type:\n• Submarino (Submarine)\n• ASW (Anti-Submarine Warfare)\n• Asset');
      return;
    }

    // Asignar nombre aleatorio de submarino
    const submarineName = assignRandomSubmarineName(
      selectedFaction,
      submarineCampaign.usedSubmarineNames[selectedFaction]
    );

    // Crear ID único para el submarino
    const submarineId = `${selectedFaction}-sub-${Date.now()}`;

    // For ASW and Asset cards, show the card name; for submarines, show the submarine name
    const displayName = (card.submarineType?.toLowerCase() === 'asw' || card.submarineType?.toLowerCase() === 'asset') ? card.name : submarineName;

    // Crear despliegue de submarino
    const newDeployment = {
      id: submarineId,
      cardId: card.id,
      cardName: card.name,
      cardType: card.cardType,
      submarineType: card.submarineType,
      submarineName: displayName,
      faction: selectedFaction,
      deployedAt: Date.now(),
      status: 'active' as const,
      missionsCompleted: 0,
      totalKills: 0,
    };

    // Crear evento de despliegue
    const newEvent = {
      eventId: `event-${Date.now()}`,
      submarineId,
      submarineName: displayName,
      faction: selectedFaction,
      cardId: card.id,
      cardName: card.name,
      submarineType: card.submarineType,
      eventType: 'deployment' as const,
      timestamp: Date.now(),
      turn: submarineCampaign.currentTurn,
      dayOfWeek: turnState.dayOfWeek,
      description: `${displayName} deployed to Submarine Campaign`,
    };

    // Preparar campaña submarina actualizada
    const updatedCampaign = {
      ...submarineCampaign,
      deployedSubmarines: [...submarineCampaign.deployedSubmarines, newDeployment],
      events: [...submarineCampaign.events, newEvent],
      usedSubmarineNames: {
        ...submarineCampaign.usedSubmarineNames,
        [selectedFaction]: [...submarineCampaign.usedSubmarineNames[selectedFaction], submarineName],
      },
    };

    // Preparar purchased cards actualizados (remover carta)
    const updatedPurchasedCards = {
      ...purchasedCardsFromFirestore,
      [selectedFaction]: purchasedCardsFromFirestore[selectedFaction].filter(
        instance => instance.instanceId !== selectedPurchasedInstanceId
      )
    };

    // Actualizar ambos en una sola operación atómica
    await onDeploySubmarineAndRemoveFromPurchased(updatedCampaign, updatedPurchasedCards);

    // Mostrar confirmación
    showNotification(
      'success',
      'Deployment Successful',
      `${displayName} has been successfully deployed to Submarine Campaign.\n\nType: ${card.submarineType}\nStatus: Active`
    );

    // Reset selection
    setSelectedPurchasedInstanceId(null);
    setSelectedAreaForPurchasedCard('');
    setViewingPurchasedCard(null);
    setSelectedCardId(null);
  };

  const handleSendPurchasedCard = () => {
    if (!selectedPurchasedInstanceId || !selectedPurchasedCardId) {
      showNotification('error', 'Selection Required', 'Please select a purchased card before deploying.');
      return;
    }

    if (!selectedAreaForPurchasedCard) {
      showNotification('error', 'Destination Required', 'Please select an operational area or deployment destination.');
      return;
    }

    // Si es despliegue a campaña submarina, usar función especial
    if (selectedAreaForPurchasedCard === 'SUBMARINE_CAMPAIGN') {
      handleDeployToSubmarineCampaign();
      return;
    }

    // If transport card with embarked units, copy them to the Card object
    if (selectedPurchasedInstance?.instance.embarkedUnits) {
      const updatedCards = cards.map(c => {
        if (c.id === selectedPurchasedCardId) {
          return {
            ...c,
            embarkedUnits: selectedPurchasedInstance.instance.embarkedUnits,
          };
        }
        return c;
      });
      onCardsUpdate(updatedCards);
    }

    // Send card to area
    onPurchaseCard(selectedPurchasedInstanceId, selectedAreaForPurchasedCard);

    // Remove card instance from purchased cards in Firestore
    const updatedPurchasedCards = {
      ...purchasedCardsFromFirestore,
      [selectedFaction]: purchasedCardsFromFirestore[selectedFaction].filter(
        instance => instance.instanceId !== selectedPurchasedInstanceId
      )
    };
    onUpdatePurchasedCards(updatedPurchasedCards);

    // Reset selection
    setSelectedPurchasedInstanceId(null);
    setSelectedAreaForPurchasedCard('');
    setViewingPurchasedCard(null);
    setSelectedCardId(null);
  };

  const handleAttachCardDirectly = () => {
    if (!selectedPurchasedCardId) {
      showNotification('error', 'Selection Required', 'Please select a purchased card before attaching.');
      return;
    }

    if (!selectedUnitForCardAttachment) {
      showNotification('error', 'Selection Required', 'Please select a unit to attach the card to.');
      return;
    }

    const card = cards.find(c => c.id === selectedPurchasedCardId);
    const unit = editedUnits.find(u => u.id === selectedUnitForCardAttachment);

    if (!card || !unit) return;

    // Validate: card must be attachable
    if (!card.isAttachable) {
      showNotification('error', 'Card Not Attachable', 'This card cannot be attached to units.\n\nOnly cards marked as attachable can be assigned to units.');
      return;
    }

    // Validate: unit category must match card's attachable category
    if (unit.category !== card.attachableCategory) {
      showNotification('error', 'Incompatible Unit Type', `This card can only be attached to ${card.attachableCategory} units.\n\nSelected unit type: ${unit.category}`);
      return;
    }

    // Validate: unit must not already have a card attached
    if (unit.attachedCard) {
      showNotification('error', 'Unit Already Has Card', 'This unit already has a card attached.\n\nRemove the existing card before attaching a new one.');
      return;
    }

    // Validate: unit must not be destroyed
    const damageCount = unit.currentDamage.filter(d => d).length;
    if (damageCount >= unit.damagePoints) {
      showNotification('error', 'Unit Destroyed', 'Cannot attach card to a destroyed unit.\n\nPlease select an active unit.');
      return;
    }

    // Update unit with attached card and apply bonuses
    const updatedUnits = editedUnits.map(u => {
      if (u.id === selectedUnitForCardAttachment) {
        const updated = { ...u };

        // Attach the card
        updated.attachedCard = selectedPurchasedCardId;

        // Apply HP bonus
        if (card.hpBonus && card.hpBonus > 0) {
          updated.damagePoints += card.hpBonus;
          // Extend currentDamage array with new HP slots (initialized as false)
          updated.currentDamage = [...updated.currentDamage, ...Array(card.hpBonus).fill(false)];
        }

        // Apply secondary ammo bonus
        if (card.secondaryAmmoBonus && card.secondaryAmmoBonus > 0) {
          updated.attackSecondary = (updated.attackSecondary || 0) + card.secondaryAmmoBonus;
        }

        return updated;
      }
      return u;
    });

    // Update local state immediately
    setEditedUnits(updatedUnits);

    // Remove card instance from purchased cards in Firestore
    const updatedPurchasedCards = {
      ...purchasedCardsFromFirestore,
      [selectedFaction]: purchasedCardsFromFirestore[selectedFaction].filter(
        instance => instance.instanceId !== selectedPurchasedInstanceId
      )
    };

    // Save changes
    onUnitsUpdate(updatedUnits);
    onUpdatePurchasedCards(updatedPurchasedCards);

    // Reset selection
    setSelectedPurchasedInstanceId(null);
    setSelectedUnitForCardAttachment('');
    setViewingPurchasedCard(null);
    setSelectedCardId(null);
  };

  const handleBoardUnits = (unitIds: string[]) => {
    if (!selectedPurchasedInstanceId) return;

    // Update the card instance with embarked units
    const updatedPurchasedCards = {
      ...purchasedCardsFromFirestore,
      [selectedFaction]: purchasedCardsFromFirestore[selectedFaction].map(instance => {
        if (instance.instanceId === selectedPurchasedInstanceId) {
          return {
            ...instance,
            embarkedUnits: unitIds,
          };
        }
        return instance;
      })
    };

    // Update units: mark them as embarked
    const updatedUnits = editedUnits.map(u => {
      // If the unit is in the embarked list
      if (unitIds.includes(u.id)) {
        return {
          ...u,
          taskForceId: `EMBARKED_${selectedPurchasedInstanceId}`,
        };
      }
      // If the unit was previously embarked on this card instance but no longer is
      if (u.taskForceId === `EMBARKED_${selectedPurchasedInstanceId}` && !unitIds.includes(u.id)) {
        return {
          ...u,
          taskForceId: null,
        };
      }
      return u;
    });

    // Update local state immediately
    setEditedUnits(updatedUnits);

    // Save changes to Firestore
    onUnitsUpdate(updatedUnits);
    onUpdatePurchasedCards(updatedPurchasedCards);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-green-900 bg-black/40">
          <div>
            <h2 className="text-2xl font-mono font-bold text-green-400 uppercase tracking-wider">
              COMMAND CENTER - {selectedFaction === 'us' ? 'USMC' : 'PLAN'}
            </h2>
            <p className="text-gray-400 font-mono text-xs mt-2 tracking-wide">
              COMMAND POINTS: <span className={`font-bold text-lg px-2 py-1 rounded transition-all duration-300 ${isFlashing ? 'text-red-500 bg-red-900/50 scale-110 shadow-lg shadow-red-500/50' : 'text-green-400'}`}>{currentPoints}</span>
              <span className="text-gray-600 ml-2">| AVAILABLE CARDS: {availableCards.length}</span>
              <span className="text-gray-600 ml-2">| PURCHASED CARDS: {purchaseHistory[selectedFaction]}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-green-400 text-3xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Main Content - 3 Sections */}
        <div className="flex-1 grid grid-cols-12 gap-4 p-6 overflow-hidden">
          {/* Left Section - Card List */}
          <div className="col-span-3 flex flex-col">
            <h3 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wide mb-3 border-b border-green-900 pb-2">
              CARD CATALOG
            </h3>

            {/* Type Filters */}
            <div className="flex gap-2 mb-2 flex-shrink-0 flex-wrap">
              <button
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-3 py-2 rounded font-mono text-xs font-medium uppercase tracking-wide transition-colors border ${
                  selectedTypeFilter === 'all'
                    ? 'bg-green-600 text-white border-green-500'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-800'
                }`}
                title={`All (${availableCards.length})`}
              >
                ALL
              </button>
              {(Object.keys(CARD_TYPE_LABELS) as CardType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`p-2 rounded transition-all border ${
                    selectedTypeFilter === type
                      ? 'ring-2 ring-green-400 bg-gray-700 border-green-500'
                      : 'bg-gray-800 hover:bg-gray-700 border-gray-800'
                  }`}
                  title={`${CARD_TYPE_LABELS[type].label} (${cardTypeCounts[type]})`}
                >
                  <img
                    src={CARD_TYPE_LABELS[type].icon}
                    alt={CARD_TYPE_LABELS[type].label}
                    className="w-8 h-8 object-contain"
                  />
                </button>
              ))}
            </div>

            {/* Scrollable Card List */}
            <div className="overflow-y-scroll bg-black/40 rounded border border-gray-800 pb-4" style={{ height: 'calc(90vh - 280px)' }}>
              {filteredCards.map(card => {
                const validation = validateCardConditions(card);
                const isValid = validation.valid;

                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      setSelectedCardId(card.id);
                      setViewingPurchasedCard(null);
                      setSelectedPurchasedInstanceId(null);
                      setSelectedAreaForPurchasedCard('');
                    }}
                    className={`w-full px-3 py-2 text-left border-b transition-colors relative font-mono ${
                      selectedCardId === card.id && !selectedPurchasedInstanceId
                        ? 'border-4 border-green-400 bg-gray-800/50'
                        : 'border-gray-800 text-gray-300 hover:bg-gray-800'
                    } ${!isValid ? 'bg-red-950/30' : ''}`}
                    title={!isValid ? validation.reason : ''}
                  >
                    {/* Line 1: Card Name */}
                    <div className="text-xs truncate uppercase tracking-wide">
                      {card.name}
                    </div>

                    {/* Line 2: Type Label + Informational Badges */}
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-mono text-gray-500 uppercase tracking-wide">
                        {CARD_TYPE_LABELS[card.cardType].label}
                      </span>
                      <div className="flex items-center gap-2">
                        {card.isTransport && (
                          <span
                            className="bg-gray-600 text-white text-xs font-mono font-bold px-2 py-1 rounded border border-gray-500"
                            title="Transport Card"
                          >
                            T
                          </span>
                        )}
                        {card.isInfluenceCard && (
                          <span
                            className="bg-blue-600 text-white text-xs font-mono font-bold px-2 py-1 rounded border border-blue-500"
                            title="Influence Card"
                          >
                            I
                          </span>
                        )}
                        {card.sub && (
                          <span
                            className="bg-blue-600 text-white text-xs font-mono px-1.5 py-0.5 rounded"
                            title={`Submarine Campaign: ${
                              card.submarineType === 'submarine' ? 'Submarino' :
                              card.submarineType === 'asw' ? 'Unidad ASW' :
                              card.submarineType === 'asset' ? 'Asset de Soporte' :
                              'Sin tipo'
                            }`}
                          >
                            {card.submarineType === 'submarine' ? 'Sub' :
                             card.submarineType === 'asw' ? 'ASW' :
                             card.submarineType === 'asset' ? 'Ast' :
                             '?'}
                          </span>
                        )}
                        {/* Infinite badge */}
                        {card.infinite && (
                          <span
                            className="bg-purple-600 text-white text-xs font-mono font-bold px-2 py-1 rounded border border-purple-500"
                            title="Infinite Uses"
                          >
                            ∞
                          </span>
                        )}
                        <span className="bg-yellow-500 text-black text-xs font-mono font-bold px-2 py-1 rounded">
                          {card.cost}
                        </span>
                        {card.deploymentTime !== undefined && card.deploymentTime > 0 && (
                          <span
                            className="bg-gray-800 text-white text-xs font-mono font-bold px-2 py-1 rounded flex items-center gap-1 border border-gray-700"
                            title={`Deployment time: ${card.deploymentTime} day${card.deploymentTime === 1 ? '' : 's'}`}
                          >
                            ⏳ {card.deploymentTime}
                          </span>
                        )}
                        <span className="bg-gray-700 text-white text-xs font-mono font-bold px-2 py-1 rounded border border-gray-600">
                          {getPurchaseLimitIndicator(card)}
                        </span>
                      </div>
                    </div>
                    {!isValid && (
                      <div className="text-xs font-mono text-yellow-400 mt-1 truncate flex items-center gap-1">
                        <span className="text-base" title={validation.reason}>🚫</span>
                        {validation.reason}
                      </div>
                    )}
                  </button>
                );
              })}
              {filteredCards.length === 0 && (
                <div className="text-center text-gray-500 font-mono py-8 text-xs uppercase tracking-wide">
                  No cards available
                </div>
              )}
              {/* Spacer para permitir scroll completo en tablets */}
              <div style={{ height: '80px' }}></div>
            </div>
          </div>

          {/* Center Section - Card Viewer */}
          <div className="col-span-5 flex flex-col">
            <h3 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wide mb-3 border-b border-green-900 pb-2">
              CARD VIEWER
            </h3>
            <div className="overflow-y-scroll bg-black/40 rounded border border-gray-800 p-4" style={{ height: 'calc(90vh - 230px)', WebkitOverflowScrolling: 'touch' }}>
              {selectedCard ? (
                <div className="flex flex-col items-center gap-6 py-4">
                  {/* Card Image - Scaled to fit */}
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <div className="relative rounded overflow-hidden border-2 border-green-400 max-w-full">
                      <img
                        src={selectedCard.imagePath}
                        alt={selectedCard.name}
                        className="max-w-full object-contain"
                        style={{ maxHeight: '500px' }}
                      />
                    </div>
                  </div>

                  {/* Purchase Button OR Send Controls OR Attach Controls */}
                  {selectedPurchasedInstanceId ? (
                    // Check if this is a special card that attaches directly to units
                    (() => {
                      const isAegisCard = selectedPurchasedCardId === AEGIS_BALLISTIC_DEFENSE_CARD_ID;
                      const isBallisticMissileDefenseCard = selectedPurchasedCardId === BALLISTIC_MISSILE_DEFENSE_CARD_ID;

                      if (isAegisCard) {
                        // Show dropdown of DDG(X) units and attach button
                        return (
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <div className="flex gap-3 items-center">
                              <select
                                value={selectedUnitForCardAttachment}
                                onChange={(e) => setSelectedUnitForCardAttachment(e.target.value)}
                                className="px-4 py-2 bg-black/40 text-white font-mono text-xs rounded border border-gray-800 focus:outline-none focus:border-green-500 uppercase tracking-wide"
                              >
                                <option value="">-- SELECT DDG(X) UNIT --</option>
                                {compatibleDDGXUnits.map(unit => {
                                  const taskForce = taskForces.find(tf => tf.id === unit.taskForceId);
                                  return (
                                    <option key={unit.id} value={unit.id}>
                                      {unit.name} - {taskForce?.name || 'No TF'}
                                    </option>
                                  );
                                })}
                              </select>
                              <button
                                onClick={handleAttachCardDirectly}
                                disabled={!selectedUnitForCardAttachment}
                                className={`px-6 py-2 rounded font-mono font-medium text-xs uppercase tracking-wide border ${
                                  selectedUnitForCardAttachment
                                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-500'
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-800'
                                }`}
                              >
                                🔗 ATTACH
                              </button>
                            </div>
                            {compatibleDDGXUnits.length === 0 && (
                              <p className="text-xs font-mono text-yellow-400 uppercase tracking-wide">
                                ⚠️ No DDG(X) units available to attach this card
                              </p>
                            )}
                          </div>
                        );
                      } else if (isBallisticMissileDefenseCard) {
                        // Show dropdown of TYPE 055 DDG units and attach button
                        return (
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <div className="flex gap-3 items-center">
                              <select
                                value={selectedUnitForCardAttachment}
                                onChange={(e) => setSelectedUnitForCardAttachment(e.target.value)}
                                className="px-4 py-2 bg-black/40 text-white font-mono text-xs rounded border border-gray-800 focus:outline-none focus:border-green-500 uppercase tracking-wide"
                              >
                                <option value="">-- SELECT TYPE 055 DDG UNIT --</option>
                                {compatibleType055Units.map(unit => {
                                  const taskForce = taskForces.find(tf => tf.id === unit.taskForceId);
                                  return (
                                    <option key={unit.id} value={unit.id}>
                                      {unit.name} - {taskForce?.name || 'No TF'}
                                    </option>
                                  );
                                })}
                              </select>
                              <button
                                onClick={handleAttachCardDirectly}
                                disabled={!selectedUnitForCardAttachment}
                                className={`px-6 py-2 rounded font-mono font-medium text-xs uppercase tracking-wide border ${
                                  selectedUnitForCardAttachment
                                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-500'
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-800'
                                }`}
                              >
                                🔗 ATTACH
                              </button>
                            </div>
                            {compatibleType055Units.length === 0 && (
                              <p className="text-xs font-mono text-yellow-400 uppercase tracking-wide">
                                ⚠️ No TYPE 055 DDG units available to attach this card
                              </p>
                            )}
                          </div>
                        );
                      } else {
                        // Show dropdown of operational areas and send button (normal flow)
                        const selectedCard = cards.find(c => c.id === selectedPurchasedCardId);
                        const isTransportCard = selectedCard?.isTransport || false;
                        const hasEmbarkedUnits = (selectedPurchasedInstance?.instance.embarkedUnits?.length || 0) > 0;

                        return (
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {/* Botón Embarcar (solo para cartas de transporte) */}
                            {isTransportCard && (
                              <button
                                onClick={() => setIsBoardUnitsModalOpen(true)}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-mono font-medium text-xs uppercase tracking-wide border border-green-500"
                              >
                                {hasEmbarkedUnits ? 'MODIFY BOARDING' : 'BOARD UNITS'}
                              </button>
                            )}

                            {/* Mostrar unidades embarcadas si existen */}
                            {hasEmbarkedUnits && (
                              <div className="bg-gray-800 border border-gray-700 rounded p-2">
                                <p className="text-xs font-mono text-gray-300 font-medium mb-1 uppercase tracking-wide">
                                  Embarked units: {selectedPurchasedInstance?.instance.embarkedUnits?.length || 0}
                                </p>
                                <div className="text-xs font-mono text-gray-400 space-y-0.5">
                                  {selectedPurchasedInstance?.instance.embarkedUnits?.map((unitId, idx) => {
                                    const unit = editedUnits.find(u => u.id === unitId);
                                    return unit ? (
                                      <div key={unitId}>• {unit.name}</div>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-3 items-center">
                              <select
                                value={selectedAreaForPurchasedCard}
                                onChange={(e) => setSelectedAreaForPurchasedCard(e.target.value)}
                                className="px-4 py-2 bg-black/40 text-white font-mono text-xs rounded border border-gray-800 focus:outline-none focus:border-green-500 uppercase tracking-wide"
                              >
                                <option value="">-- SELECT DESTINATION --</option>

                                {/* Opción de Campaña Submarina si la carta tiene sub=true */}
                                {(() => {
                                  const selectedCard = cards.find(c => c.id === selectedPurchasedCardId);
                                  if (selectedCard?.sub) {
                                    if (!selectedCard.submarineType) {
                                      return (
                                        <option value="SUBMARINE_CAMPAIGN" disabled>
                                          🌊 SUBMARINE CAMPAIGN (⚠️ Sin tipo definido)
                                        </option>
                                      );
                                    }
                                    return <option value="SUBMARINE_CAMPAIGN">🌊 SUBMARINE CAMPAIGN</option>;
                                  }
                                  return null;
                                })()}

                                {/* Áreas operacionales regulares */}
                                {availableAreasForCard.map(area => (
                                  <option key={area.id} value={area.id}>
                                    {area.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={handleSendPurchasedCard}
                                disabled={!selectedAreaForPurchasedCard}
                                className={`px-6 py-2 rounded font-mono font-medium text-xs uppercase tracking-wide border ${
                                  selectedAreaForPurchasedCard
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-800'
                                }`}
                              >
                                SEND
                              </button>
                            </div>
                            {(() => {
                              const selectedCard = cards.find(c => c.id === selectedPurchasedCardId);
                              const combatAirPatrolCardId = selectedFaction === 'us' ? 'us-002' : 'china-002';
                              const isCombatAirPatrolCard = selectedCard?.id === combatAirPatrolCardId;

                              if (isCombatAirPatrolCard && availableAreasForCard.length === 0) {
                                return (
                                  <p className="text-xs font-mono text-yellow-400 uppercase tracking-wide">
                                    ⚠️ All operational areas have active Combat Air Patrol
                                  </p>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        );
                      }
                    })()
                  ) : !viewingPurchasedCard && (() => {
                    // Show purchase button for catalog cards
                    const validation = validateCardConditions(selectedCard);
                    const insufficientPoints = selectedCard.cost > currentPoints;
                    const isDisabled = !validation.valid || insufficientPoints;

                    let tooltipText = 'Purchase card';
                    if (!validation.valid) {
                      tooltipText = validation.reason || 'Does not meet conditions';
                    } else if (insufficientPoints) {
                      tooltipText = 'Insufficient Command Points';
                    }

                    return (
                      <button
                        onClick={handlePurchase}
                        disabled={isDisabled}
                        className={`w-16 h-16 rounded-full font-bold text-white transition-all flex items-center justify-center flex-shrink-0 ${
                          isDisabled
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-green-600 hover:bg-green-700 hover:scale-110 shadow-lg'
                        }`}
                        title={tooltipText}
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center font-mono">
                    <p className="text-sm mb-2 uppercase tracking-wide">Select a card</p>
                    <p className="text-xs uppercase tracking-wide">from the catalog to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Purchased Cards */}
          <div className="col-span-4 flex flex-col">
            <h3 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wide mb-3 border-b border-green-900 pb-2">
              PURCHASED CARDS
            </h3>
            <div className="overflow-y-scroll bg-black/40 rounded border border-gray-800 p-3 space-y-2" style={{ height: 'calc(90vh - 230px)' }}>
              {purchasedCards.length === 0 ? (
                <p className="text-gray-500 font-mono text-center mt-8 text-xs uppercase tracking-wide">
                  No cards purchased yet
                </p>
              ) : (
                purchasedCards.map((pc) => (
                  <div
                    key={pc.instance.instanceId}
                    onClick={() => {
                      setSelectedPurchasedInstanceId(pc.instance.instanceId);
                      setSelectedCardId(pc.card.id);
                      setViewingPurchasedCard(null);
                      setSelectedAreaForPurchasedCard('');
                    }}
                    className={`w-full ${CARD_TYPE_LABELS[pc.card.cardType].bgColor} rounded p-3 relative border transition-all cursor-pointer ${
                      selectedPurchasedInstanceId === pc.instance.instanceId
                        ? 'border-green-400 ring-2 ring-green-400'
                        : 'border-gray-700 hover:border-green-600'
                    }`}
                  >
                    {/* Info icon in top-right corner */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingPurchasedCard(pc.card.id);
                        setSelectedCardId(pc.card.id);
                        setSelectedPurchasedInstanceId(null);
                      }}
                      className="absolute top-2 right-2 text-green-400 hover:text-green-300 transition-colors z-10"
                      title="View card (read-only)"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    <div className="pr-6 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-mono font-medium text-xs uppercase tracking-wide">{pc.card.name}</p>
                        {pc.card.isTransport && (
                          <span
                            className="bg-gray-600 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-gray-500"
                            title="Transport Card"
                          >
                            T
                          </span>
                        )}
                        {pc.card.isInfluenceCard && (
                          <span
                            className="bg-blue-600 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-blue-500"
                            title="Influence Card"
                          >
                            I
                          </span>
                        )}
                        {pc.card.sub && (
                          <span
                            className="bg-blue-600 text-white text-xs font-mono px-1.5 py-0.5 rounded"
                            title={`Submarine Campaign: ${
                              pc.card.submarineType === 'submarine' ? 'Submarino' :
                              pc.card.submarineType === 'asw' ? 'Unidad ASW' :
                              pc.card.submarineType === 'asset' ? 'Asset de Soporte' :
                              'Sin tipo'
                            }`}
                          >
                            {pc.card.submarineType === 'submarine' ? 'Sub' :
                             pc.card.submarineType === 'asw' ? 'ASW' :
                             pc.card.submarineType === 'asset' ? 'Ast' :
                             '?'}
                          </span>
                        )}
                        {/* Infinite badge */}
                        {pc.card.infinite && (
                          <span
                            className="bg-purple-600 text-white text-xs font-mono font-bold px-2 py-1 rounded border border-purple-500"
                            title="Infinite Uses"
                          >
                            ∞
                          </span>
                        )}
                      </div>

                      {/* Badge de unidades embarcadas */}
                      {(pc.instance.embarkedUnits?.length || 0) > 0 && (
                        <div className="mt-1">
                          <span className="inline-flex items-center bg-green-600 text-white font-mono text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                            {pc.instance.embarkedUnits?.length} {pc.instance.embarkedUnits?.length === 1 ? 'unit' : 'units'} embarked
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {/* Spacer para permitir scroll completo en tablets */}
              <div style={{ height: '80px' }}></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-green-900 p-4 flex items-center bg-black/40">
          {isAdmin && (
            <button
              onClick={onOpenCardEditor}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-mono font-medium text-xs uppercase tracking-wide transition-colors border border-yellow-500"
              title="Edit Cards"
            >
              ✏️ EDIT CARDS
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-mono font-medium uppercase tracking-wide text-xs transition-colors border border-gray-800"
          >
            CLOSE
          </button>
        </div>
      </div>

      {/* Modal de Embarque de Unidades */}
      {selectedPurchasedInstanceId && (() => {
        const selectedCard = cards.find(c => c.id === selectedPurchasedCardId);
        if (selectedCard?.isTransport) {
          // Filtrar unidades disponibles (sin task force, excepto las ya embarcadas en esta carta)
          const availableUnits = editedUnits.filter(u => {
            // Verificar facción primero
            if (u.faction !== selectedFaction) return false;

            // Permitir unidades ya embarcadas en esta carta (para re-edición)
            if (u.taskForceId === `EMBARKED_${selectedPurchasedInstanceId}`) {
              return true;
            }

            // Excluir unidades con cualquier taskForceId (incluye otras cartas embarcadas)
            if (u.taskForceId) return false;

            // Permitir unidades sin task force
            return true;
          });

          return (
            <BoardUnitsModal
              isOpen={isBoardUnitsModalOpen}
              onClose={() => setIsBoardUnitsModalOpen(false)}
              transportCard={selectedCard}
              availableUnits={availableUnits}
              currentEmbarkedUnits={selectedPurchasedInstance?.instance.embarkedUnits}
              onBoard={handleBoardUnits}
            />
          );
        }
        return null;
      })()}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
};

export default CommandCenterModal;
