import React, { useState, useEffect, useMemo } from 'react';
import { OperationalData, OperationalArea, Location, TaskForce, Unit, Card, PendingDeployments, TurnState, InfluenceMarker, PlayedCardNotification } from '../../../types';
import { isLocationInBounds, getCompatibleUnitsForCard, getTaskForceUnits } from './helpers';
import { TacticalTab, PatrolsTab, TaskForcesTab, BasesTab, CardsTab } from './tabs';
import { CardPlayModal, TaskForceDetailWrapper } from './modals';
import DisembarkModal from './modals/DisembarkModal';
import DiceRollModal, { InfluenceRollDetails } from '../../DiceRollModal';
import { updatePlayedCardNotification } from '../../../firestoreService';
import TaskForceIcon from '../../../img/TaskForce.png';
import BaseIcon from '../../../img/Base.png';
import JccIcon from '../../../img/Jcc.png';
import RedTacticaIcon from '../../../img/RedTactica.png';
import PatrullaIcon from '../../../img/Patrulla.png';

interface DataEditorProps {
  areaId: string;
  initialData: OperationalData;
  onSave: (areaId: string, data: OperationalData) => void;
  area: OperationalArea;
  locations: Location[];
  onLocationsUpdate?: (locations: Location[]) => void;
  selectedFaction: 'us' | 'china';
  taskForces: TaskForce[];
  units: Unit[];
  cards: Card[];
  operationalAreas: OperationalArea[];
  onOperationalAreasUpdate: (areas: OperationalArea[]) => void;
  onUnitsUpdate: (units: Unit[]) => void;
  onCardsUpdate?: (cards: Card[]) => void;
  onTaskForcesUpdate?: (taskForces: TaskForce[]) => void;
  isAdmin: boolean;
  pendingDeployments?: PendingDeployments;
  turnState?: TurnState;
  influenceMarker?: InfluenceMarker;
  onInfluenceMarkerUpdate?: (marker: InfluenceMarker) => void;
  onAddPlayedCardNotification?: (notification: PlayedCardNotification) => void;
}

const DataEditor: React.FC<DataEditorProps> = ({
  areaId,
  initialData,
  onSave,
  area,
  locations,
  onLocationsUpdate,
  selectedFaction,
  taskForces,
  units,
  cards,
  operationalAreas,
  onOperationalAreasUpdate,
  onUnitsUpdate,
  onCardsUpdate,
  onTaskForcesUpdate,
  isAdmin,
  pendingDeployments,
  turnState,
  influenceMarker,
  onInfluenceMarkerUpdate,
  onAddPlayedCardNotification
}) => {
  // State management
  const [data, setData] = useState<OperationalData>(initialData);
  const [activeTab, setActiveTab] = useState<'tactical' | 'patrols' | 'bases' | 'cards' | 'taskforces'>('tactical');
  const [baseDamage, setBaseDamage] = useState<Record<string, boolean[]>>({});
  const [selectedTaskForceForDetail, setSelectedTaskForceForDetail] = useState<TaskForce | null>(null);
  const [selectedCardToPlay, setSelectedCardToPlay] = useState<Card | null>(null);
  const [selectedCardInstanceId, setSelectedCardInstanceId] = useState<string | null>(null);
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
  const [selectedUnitForCardAttachment, setSelectedUnitForCardAttachment] = useState<string>('');
  const [selectedCardForDisembark, setSelectedCardForDisembark] = useState<Card | null>(null);
  const [selectedInfluenceCard, setSelectedInfluenceCard] = useState<Card | null>(null);
  const [opposingNotificationTimestamp, setOpposingNotificationTimestamp] = useState<string | null>(null);

  // Calculate nearby bases within the operational area
  const nearbyBases = useMemo(() => {
    return locations.filter(location => isLocationInBounds(location.coords, area.bounds));
  }, [locations, area.bounds]);

  // Initialize base damage state for nearby bases and sync with locations
  useEffect(() => {
    const syncedBaseDamage: Record<string, boolean[]> = {};
    nearbyBases.forEach(base => {
      const normalizedDamage = [...base.currentDamage];

      // Normalize the array length to match damagePoints
      if (normalizedDamage.length < base.damagePoints) {
        while (normalizedDamage.length < base.damagePoints) {
          normalizedDamage.push(false);
        }
      } else if (normalizedDamage.length > base.damagePoints) {
        normalizedDamage.length = base.damagePoints;
      }

      syncedBaseDamage[base.id] = normalizedDamage;
    });

    setBaseDamage(syncedBaseDamage);
  }, [nearbyBases]);

  // Filter task forces for this area (only show deployed and operational ones, exclude pending)
  const areaTaskForces = useMemo(() => {
    return taskForces.filter(tf =>
      tf.operationalAreaId === area.id &&
      (tf.isDeployed ?? true) &&
      !tf.isPendingDeployment // Exclude pending deployments
    );
  }, [taskForces, area.id]);

  // Map instance IDs to card definitions for this area (preserving instanceId for React keys)
  const areaCards = useMemo(() => {
    if (!area.assignedCards) return [];

    return area.assignedCards
      .map(instanceId => {
        // Extract cardId from instanceId (format: "us-001_1234567890")
        const cardId = instanceId.includes('_') ? instanceId.split('_')[0] : instanceId;
        const card = cards.find(c => c.id === cardId);
        return card ? { card, instanceId } : null;
      })
      .filter((item): item is { card: Card; instanceId: string } =>
        item !== null && item.card.faction === selectedFaction
      );
  }, [cards, area.assignedCards, selectedFaction]);

  // Get pending cards for this area
  const pendingCards = useMemo(() => {
    if (!pendingDeployments || !turnState) return [];

    return pendingDeployments.cards
      .filter(p => p.areaId === area.id && p.faction === selectedFaction)
      .map(p => {
        const card = cards.find(c => c.id === p.cardId);
        return {
          card,
          eta: { turn: p.activatesAtTurn, day: p.activatesAtDay }
        };
      })
      .filter(item => item.card !== undefined);
  }, [pendingDeployments, area.id, selectedFaction, cards, turnState]);

  // Get pending task forces for this area
  const pendingTaskForces = useMemo(() => {
    if (!pendingDeployments || !turnState) return [];

    const pendingTFIds = pendingDeployments.taskForces
      .filter(p => p.faction === selectedFaction)
      .map(p => p.taskForceId);

    return taskForces.filter(tf =>
      tf.operationalAreaId === area.id &&
      tf.isPendingDeployment &&
      pendingTFIds.includes(tf.id)
    ).map(tf => {
      const pending = pendingDeployments.taskForces.find(p => p.taskForceId === tf.id);
      return {
        taskForce: tf,
        eta: pending ? { turn: pending.activatesAtTurn, day: pending.activatesAtDay } : null
      };
    });
  }, [pendingDeployments, taskForces, area.id, selectedFaction, turnState]);

  // Event handlers
  const handleCheckboxChange = (
    faction: 'us' | 'plan',
    field: 'tacticalNetworkDamage' | 'airPatrolsDamage',
    index: number
  ) => {
    const newData = { ...data };
    newData[faction][field][index] = !newData[faction][field][index];
    setData(newData);
    // Auto-save to Firestore
    onSave(areaId, newData);
  };

  const handleUsedChange = (faction: 'us' | 'plan') => {
    const newData = { ...data };
    newData[faction].airPatrolsUsed = !newData[faction].airPatrolsUsed;
    setData(newData);
    // Auto-save to Firestore
    onSave(areaId, newData);
  };

  const handleBaseDamageChange = (baseId: string, index: number) => {
    if (!onLocationsUpdate) return;

    const updatedLocations = locations.map(loc => {
      if (loc.id === baseId) {
        const base = nearbyBases.find(b => b.id === baseId);
        const current = baseDamage[baseId] || (base ? Array(base.damagePoints).fill(false) : []);
        const newDamage = [...current];
        newDamage[index] = !newDamage[index];
        return { ...loc, currentDamage: newDamage };
      }
      return loc;
    });

    onLocationsUpdate(updatedLocations);
  };

  const handlePlayCard = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    // If it's an influence card, create Phase 1 notification then open DiceRollModal
    if (card.isInfluenceCard && card.influenceThresholds && card.influenceThresholds.length > 0) {
      // Create Phase 1 notification (card played, waiting for roll) - BOTH players see this
      if (turnState && !turnState.isPlanningPhase && onAddPlayedCardNotification) {
        const timestamp = new Date().toISOString();

        console.log('🃏 [PLAY] Creating Phase 1 notification (for BOTH players) with timestamp:', timestamp);

        const notification: PlayedCardNotification = {
          cardId: card.id,
          cardName: card.name,
          cardImagePath: card.imagePath,
          areaName: area.name,
          faction: card.faction,
          timestamp,
          turn: turnState.turnNumber,
          dayOfWeek: turnState.dayOfWeek,
          isInfluenceCard: true,
          notificationPhase: 'card_shown',
          // No rollDetails yet - this indicates Phase 1 (waiting)
        };
        onAddPlayedCardNotification(notification);
        // Save timestamp to update this notification later
        setOpposingNotificationTimestamp(timestamp);

        console.log('🃏 [PLAY] Saved timestamp to state:', timestamp);
      }

      setSelectedCardToPlay(null);
      setSelectedInfluenceCard(card);
      return;
    }

    const updatedAreas = operationalAreas.map(area => {
      if (area.id === areaId) {
        const currentAssigned = area.assignedCards || [];
        const currentPlayed = area.playedCards || [];

        // Remove from assigned cards using instanceId (unless infinite), add base cardId to played cards
        return {
          ...area,
          assignedCards: card.infinite
            ? currentAssigned
            : currentAssigned.filter(cId => cId !== selectedCardInstanceId),
          playedCards: [...currentPlayed, cardId]
        };
      }
      return area;
    });

    onOperationalAreasUpdate(updatedAreas);

    // Create notification for BOTH players if NOT in planning phase
    if (turnState && !turnState.isPlanningPhase && onAddPlayedCardNotification) {
      const notification: PlayedCardNotification = {
        cardId: card.id,
        cardName: card.name,
        cardImagePath: card.imagePath,
        areaName: area.name,
        faction: card.faction,
        timestamp: new Date().toISOString(),
        turn: turnState.turnNumber,
        dayOfWeek: turnState.dayOfWeek
      };
      onAddPlayedCardNotification(notification);
    }

    setSelectedCardToPlay(null);
    setSelectedCardInstanceId(null);
  };

  const handleCardClick = (card: Card, instanceId: string) => {
    // Check if infinite card is already played
    const isInfiniteAndPlayed = card.infinite && (area.playedCards || []).includes(card.id);

    if (isInfiniteAndPlayed) {
      // Card is not clickable - do nothing
      return;
    }

    // Store instanceId for later use when removing from assignedCards
    setSelectedCardInstanceId(instanceId);

    // Check if it's a transport card with embarked units
    if (card.isTransport && card.embarkedUnits && card.embarkedUnits.length > 0) {
      setSelectedCardForDisembark(card);
    } else {
      // All other cards (including influence cards) use CardPlayModal
      setSelectedCardToPlay(card);
    }
  };

  const handleUpdatePlayedCards = (areaId: string, newPlayedCards: string[]) => {
    const updatedAreas = operationalAreas.map(area => {
      if (area.id === areaId) {
        return {
          ...area,
          playedCards: newPlayedCards
        };
      }
      return area;
    });

    onOperationalAreasUpdate(updatedAreas);
  };

  const handleApplyInfluence = (newInfluence: InfluenceMarker, card: Card, rollDetails?: InfluenceRollDetails) => {
    // Update influence marker
    if (onInfluenceMarkerUpdate) {
      onInfluenceMarkerUpdate(newInfluence);
    }

    // Move card from assigned to played (card is consumed, unless infinite)
    const updatedAreas = operationalAreas.map(area => {
      if (area.id === areaId) {
        const currentAssigned = area.assignedCards || [];
        const currentPlayed = area.playedCards || [];

        return {
          ...area,
          assignedCards: card.infinite
            ? currentAssigned
            : currentAssigned.filter(cId => cId !== selectedCardInstanceId),
          playedCards: [...currentPlayed, card.id]
        };
      }
      return area;
    });

    onOperationalAreasUpdate(updatedAreas);

    // Update the SINGLE notification from Phase 1 to Phase 2 (BOTH players will see via onSnapshot)
    if (turnState && !turnState.isPlanningPhase && rollDetails) {
      console.log('🎲 [APPLY] handleApplyInfluence called');
      console.log('🎲 [APPLY] opposingNotificationTimestamp from state:', opposingNotificationTimestamp);
      console.log('🎲 [APPLY] rollDetails:', rollDetails);

      // Update the existing Phase 1 notification to Phase 2
      // This update will be seen by BOTH players via onSnapshot
      if (opposingNotificationTimestamp) {
        console.log('🎲 [APPLY] Updating notification to Phase 2 immediately (DiceRollModal already waited 2 seconds)');

        // Update notification immediately (no delay)
        // The DiceRollModal already kept itself open for 2 seconds before calling this
        updatePlayedCardNotification(opposingNotificationTimestamp, {
          notificationPhase: 'result_ready',
          diceRoll: rollDetails.roll,
          influenceEffect: rollDetails.effect.influenceEffect,
          influenceDescription: rollDetails.effect.description,
          previousInfluence: rollDetails.previousValue,
          newInfluence: newInfluence.value
        });

        console.log('🎲 [APPLY] Update initiated - both players will see Phase 2 via onSnapshot');
      } else {
        console.error('❌ [APPLY] opposingNotificationTimestamp is NULL or undefined!');
      }
    }

    setSelectedInfluenceCard(null);
    setSelectedCardInstanceId(null);
  };

  const handleDisembarkUnits = async (cardId: string, config: any) => {
    if (!onCardsUpdate || !onTaskForcesUpdate) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || !card.embarkedUnits) return;

    let updatedUnits = [...units];
    let updatedTaskForces = [...taskForces];

    // Create new task forces
    config.newTaskForces.forEach((ntf: any) => {
      const realId = `tf_${selectedFaction}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newTF: TaskForce = {
        id: realId,
        name: ntf.name,
        faction: selectedFaction,
        operationalAreaId: areaId,
        isDeployed: true,
        isPendingDeployment: false
      };
      updatedTaskForces.push(newTF);

      // Assign units to new TF
      ntf.unitIds.forEach((unitId: string) => {
        updatedUnits = updatedUnits.map(u =>
          u.id === unitId ? { ...u, taskForceId: realId } : u
        );
      });
    });

    // Assign units to existing TFs
    config.existingTFAssignments.forEach((assignment: any) => {
      updatedUnits = updatedUnits.map(u =>
        u.id === assignment.unitId
          ? { ...u, taskForceId: assignment.taskForceId }
          : u
      );
    });

    // Remove card from area (consumed, unless infinite) using instanceId
    const updatedAreas = operationalAreas.map(a => {
      if (a.id === areaId) {
        return {
          ...a,
          assignedCards: card.infinite
            ? (a.assignedCards || [])
            : (a.assignedCards || []).filter(cId => cId !== selectedCardInstanceId)
        };
      }
      return a;
    });

    // Remove embarkedUnits from Card
    const updatedCards = cards.map(c => {
      if (c.id === cardId) {
        const { embarkedUnits, ...rest } = c;
        return rest as Card;
      }
      return c;
    });

    // Create notification for BOTH players if NOT in planning phase
    if (turnState && !turnState.isPlanningPhase && onAddPlayedCardNotification) {
      const notification: PlayedCardNotification = {
        cardId: card.id,
        cardName: card.name,
        cardImagePath: card.imagePath,
        areaName: area.name,
        faction: card.faction,
        timestamp: new Date().toISOString(),
        turn: turnState.turnNumber,
        dayOfWeek: turnState.dayOfWeek
      };
      onAddPlayedCardNotification(notification);
    }
    // Save all changes - await to ensure proper order
    // Update units FIRST to ensure taskForceId is set before TF appears in UI
    await onUnitsUpdate(updatedUnits);
    await onTaskForcesUpdate(updatedTaskForces);
    await onOperationalAreasUpdate(updatedAreas);
    await onCardsUpdate(updatedCards);

    setSelectedCardForDisembark(null);
    setSelectedCardInstanceId(null);
  };

  const handleAttachCardToUnit = (cardId: string, unitId: string) => {
    const card = cards.find(c => c.id === cardId);
    const unit = units.find(u => u.id === unitId);

    if (!card || !unit) return;

    // Validate: card must be attachable
    if (!card.isAttachable) return;

    // Validate: unit category must match card's attachable category
    if (unit.category !== card.attachableCategory) return;

    // Validate: unit must not already have a card attached
    if (unit.attachedCard) return;

    // Validate: unit must not be destroyed
    const damageCount = unit.currentDamage.filter(d => d).length;
    if (damageCount >= unit.damagePoints) return;

    // Update unit with attached card and apply bonuses
    const updatedUnits = units.map(u => {
      if (u.id === unitId) {
        const updated = { ...u };

        // Attach the card
        updated.attachedCard = cardId;

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

    // Remove card from operational area (unless infinite) using instanceId
    const updatedAreas = operationalAreas.map(area => {
      if (area.id === areaId) {
        const currentCards = area.assignedCards || [];
        return {
          ...area,
          assignedCards: card.infinite
            ? currentCards
            : currentCards.filter(cId => cId !== selectedCardInstanceId)
        };
      }
      return area;
    });

    // Save changes
    onUnitsUpdate(updatedUnits);
    onOperationalAreasUpdate(updatedAreas);
    setSelectedCardToPlay(null);
    setSelectedCardInstanceId(null);
  };

  const renderCheckboxes = (
    faction: 'us' | 'plan',
    field: 'tacticalNetworkDamage' | 'airPatrolsDamage',
    count: number,
    color: string
  ) => {
    return (
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: count }).map((_, index) => (
          <label key={index} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data[faction][field][index]}
              onChange={() => handleCheckboxChange(faction, field, index)}
              className="sr-only peer"
            />
            <div className={`w-5 h-5 border-2 rounded ${data[faction][field][index] ? color + ' ' + color.replace('bg-', 'border-') : 'bg-gray-700 border-gray-600'}`}></div>
          </label>
        ))}
      </div>
    );
  };

  // Get compatible units for card attachment
  const areaUnitsIds = useMemo(() => {
    const ids = new Set<string>();
    areaTaskForces.forEach(tf => {
      const tfUnits = getTaskForceUnits(tf.id, units);
      tfUnits.forEach(u => ids.add(u.id));
    });
    return ids;
  }, [areaTaskForces, units]);

  const compatibleUnits = selectedCardToPlay
    ? getCompatibleUnitsForCard(selectedCardToPlay, units, areaUnitsIds)
    : [];

  return (
    <div className="text-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-600 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('tactical')}
          className={`px-4 py-2 text-sm font-medium transition flex items-center justify-center ${
            activeTab === 'tactical'
              ? 'border-b-2 border-cyan-500 text-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <img src={RedTacticaIcon} alt="Tactical Network" className="w-8 h-8" />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('patrols')}
          className={`px-4 py-2 text-sm font-medium transition flex items-center justify-center ${
            activeTab === 'patrols'
              ? 'border-b-2 border-cyan-500 text-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <img src={PatrullaIcon} alt="Patrullas Aéreas" className="w-8 h-8" />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('taskforces')}
          className={`px-4 py-2 text-sm font-medium transition flex items-center justify-center ${
            activeTab === 'taskforces'
              ? 'border-b-2 border-cyan-500 text-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <img src={TaskForceIcon} alt="Task Forces" className="w-8 h-8" />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bases')}
          className={`px-4 py-2 text-sm font-medium transition flex items-center justify-center ${
            activeTab === 'bases'
              ? 'border-b-2 border-cyan-500 text-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <img src={BaseIcon} alt="Bases" className="w-8 h-8" />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 text-sm font-medium transition flex items-center justify-center ${
            activeTab === 'cards'
              ? 'border-b-2 border-cyan-500 text-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <img src={JccIcon} alt="Cartas" className="w-8 h-8" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'tactical' && (
          <TacticalTab
            data={data}
            onCheckboxChange={handleCheckboxChange}
            renderCheckboxes={renderCheckboxes}
            selectedFaction={selectedFaction}
          />
        )}

        {activeTab === 'patrols' && (
          <PatrolsTab
            data={data}
            onCheckboxChange={handleCheckboxChange}
            onUsedChange={handleUsedChange}
            renderCheckboxes={renderCheckboxes}
            playedCards={area.playedCards || []}
            selectedFaction={selectedFaction}
            cards={cards}
          />
        )}

        {activeTab === 'taskforces' && (
          <TaskForcesTab
            areaTaskForces={areaTaskForces}
            units={units}
            selectedFaction={selectedFaction}
            onSelectTaskForce={setSelectedTaskForceForDetail}
            pendingTaskForces={pendingTaskForces}
            turnState={turnState}
          />
        )}

        {activeTab === 'bases' && (
          <BasesTab
            nearbyBases={nearbyBases}
            selectedBaseId={selectedBaseId}
            baseDamage={baseDamage}
            onSelectBase={setSelectedBaseId}
            onBaseDamageChange={handleBaseDamageChange}
          />
        )}

        {activeTab === 'cards' && (
          <CardsTab
            areaCards={areaCards}
            onSelectCard={handleCardClick}
            pendingCards={pendingCards}
            turnState={turnState}
            units={units}
            playedCards={area.playedCards || []}
            areaId={area.id}
            onUpdatePlayedCards={handleUpdatePlayedCards}
          />
        )}
      </div>

      {/* Task Force Detail Modal */}
      {selectedTaskForceForDetail && (
        <TaskForceDetailWrapper
          taskForce={selectedTaskForceForDetail}
          units={units}
          cards={cards}
          operationalAreas={operationalAreas}
          selectedFaction={selectedFaction}
          isAdmin={isAdmin}
          taskForces={taskForces}
          onClose={() => setSelectedTaskForceForDetail(null)}
          onUnitsUpdate={onUnitsUpdate}
          onOperationalAreasUpdate={onOperationalAreasUpdate}
          pendingDeployments={pendingDeployments}
          turnState={turnState}
        />
      )}

      {/* Card Play Modal */}
      {selectedCardToPlay && (
        <CardPlayModal
          card={selectedCardToPlay}
          compatibleUnits={compatibleUnits}
          selectedUnitId={selectedUnitForCardAttachment}
          onSelectUnit={setSelectedUnitForCardAttachment}
          onAttach={() => {
            if (selectedUnitForCardAttachment) {
              handleAttachCardToUnit(selectedCardToPlay.id, selectedUnitForCardAttachment);
              setSelectedUnitForCardAttachment('');
            }
          }}
          onPlay={() => handlePlayCard(selectedCardToPlay.id)}
          onCancel={() => {
            setSelectedCardToPlay(null);
            setSelectedUnitForCardAttachment('');
          }}
        />
      )}

      {/* Disembark Units Modal */}
      {selectedCardForDisembark && (() => {
        const embarkedUnits = (selectedCardForDisembark.embarkedUnits || [])
          .map(uid => units.find(u => u.id === uid))
          .filter((u): u is Unit => u !== undefined);

        const areaTaskForces = taskForces.filter(tf =>
          tf.operationalAreaId === areaId &&
          tf.faction === selectedFaction &&
          tf.isDeployed
        );

        const existingTFNames = areaTaskForces.map(tf => tf.name);

        return (
          <DisembarkModal
            card={selectedCardForDisembark}
            embarkedUnits={embarkedUnits}
            areaTaskForces={areaTaskForces}
            existingTFNames={existingTFNames}
            onDisembark={(config) => handleDisembarkUnits(selectedCardForDisembark.id, config)}
            onCancel={() => setSelectedCardForDisembark(null)}
          />
        );
      })()}

      {/* Dice Roll Modal for Influence Cards */}
      {selectedInfluenceCard && influenceMarker && onInfluenceMarkerUpdate && (
        <DiceRollModal
          isOpen={true}
          onClose={() => {
            setSelectedInfluenceCard(null);
            setOpposingNotificationTimestamp(null);
          }}
          card={selectedInfluenceCard}
          currentInfluence={influenceMarker}
          onApplyInfluence={handleApplyInfluence}
          opposingNotificationTimestamp={opposingNotificationTimestamp}
        />
      )}
    </div>
  );
};

export default DataEditor;
