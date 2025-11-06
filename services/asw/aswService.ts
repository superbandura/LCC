/**
 * ASWService (Anti-Submarine Warfare Service)
 *
 * Handles ASW operations:
 * - Location-based ASW detection from operational areas
 * - ASW cards in submarine campaign
 * - Patrol submarines performing ASW missions
 * - Detection mechanics: d20 = 1 (5% success rate)
 * - Elimination mechanics: d20 ≤ 10 (50% success rate if detected)
 * - Event generation for both factions
 * - Kill tracking and statistics
 *
 * This service is pure and testable - it doesn't directly modify Firebase,
 * but returns updated data structures for the caller to persist.
 */

import {
  SubmarineCampaignState,
  SubmarineEvent,
  SubmarineDeployment,
  TurnState,
  OperationalArea,
  TaskForce,
  Unit,
  Card,
  Faction
} from '../../types';

export interface ASWResult {
  events: SubmarineEvent[];
  updatedSubmarines: SubmarineDeployment[];
  eliminatedSubmarineIds: string[];
}

interface ASWElement {
  id: string;
  name: string;
  faction: Faction;
  type: 'card' | 'ship' | 'submarine';
  areaId?: string;
  areaName?: string;
}

/**
 * ASWService class
 * Contains all anti-submarine warfare logic
 */
export class ASWService {
  /**
   * Process ASW (Anti-Submarine Warfare) operations
   * Location-based system: ASW assets in operational areas detect submarines in South China Sea
   * Detection: d20 = 1 (5% success rate)
   * Elimination: d20 ≤ 10 (50% success rate if detected)
   */
  static async processASWPhase(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    operationalAreas: OperationalArea[],
    taskForces: TaskForce[],
    units: Unit[],
    cards: Card[],
    submarines?: SubmarineDeployment[]
  ): Promise<ASWResult> {
    if (!submarineCampaign) {
      return { events: [], updatedSubmarines: [], eliminatedSubmarineIds: [] };
    }

    // Use provided submarines or fall back to campaign submarines
    const sourceSubmarines = submarines || submarineCampaign.deployedSubmarines;

    // Identify submarines in South China Sea (attack or patrol orders)
    const submarinesInSouthChinaSea = sourceSubmarines.filter(
      sub => sub.status === 'active' &&
             sub.submarineType === 'submarine' &&
             sub.currentOrder &&
             (sub.currentOrder.orderType === 'attack' || sub.currentOrder.orderType === 'patrol')
    );

    if (submarinesInSouthChinaSea.length === 0) {
      return { events: [], updatedSubmarines: submarineCampaign.deployedSubmarines, eliminatedSubmarineIds: [] };
    }

    // Collect all ASW elements from operational areas and submarine campaign
    const allASWElements: ASWElement[] = [];

    // 1. Collect ASW cards from submarine campaign
    const aswCardsFromCampaign = submarineCampaign.deployedSubmarines
      .filter(sub => sub.status === 'active' && sub.submarineType === 'asw')
      .map(card => ({
        id: card.id,
        name: card.submarineName,
        faction: card.faction,
        type: 'card' as const,
        areaId: undefined,
        areaName: 'Submarine Campaign'
      }));

    allASWElements.push(...aswCardsFromCampaign);

    // 2. Collect ASW ships and cards from operational areas
    for (const area of operationalAreas) {
      // ASW cards played in operational areas
      const aswCardsInArea = this.getASWCardsInArea(area, cards);
      allASWElements.push(...aswCardsInArea);

      // ASW ships in task forces
      const aswShipsInArea = this.getASWShipsInArea(area, taskForces, units);
      allASWElements.push(...aswShipsInArea);
    }

    // 3. Collect patrol submarines (they can do ASW)
    const patrolSubmarines = submarinesInSouthChinaSea
      .filter(sub =>
        sub.currentOrder?.orderType === 'patrol' && // Only patrol orders
        sub.currentOrder?.status === 'pending'       // Must be active patrol
      )
      .map(sub => ({
        id: sub.id,
        name: sub.submarineName,
        faction: sub.faction,
        type: 'submarine' as const,
        areaId: undefined,
        areaName: 'South China Sea'
      }));

    allASWElements.push(...patrolSubmarines);

    // Deduplicate ASW elements by ID to prevent multiple detection attempts per element
    const uniqueASWElements = Array.from(
      new Map(allASWElements.map(elem => [elem.id, elem])).values()
    );

    if (uniqueASWElements.length === 0) {
      return { events: [], updatedSubmarines: submarineCampaign.deployedSubmarines, eliminatedSubmarineIds: [] };
    }

    // Process ASW detection attempts
    const events: SubmarineEvent[] = [];
    const eliminatedSubmarineIds: string[] = [];
    let updatedSubmarines = [...submarineCampaign.deployedSubmarines];
    let detectionAttempts = 0;
    let successfulDetections = 0;

    for (const aswElement of uniqueASWElements) {
      // Find enemy submarines not yet eliminated
      const enemySubmarines = submarinesInSouthChinaSea.filter(
        sub => sub.faction !== aswElement.faction && !eliminatedSubmarineIds.includes(sub.id)
      );

      if (enemySubmarines.length === 0) continue;

      // Pick random enemy submarine
      const targetSubmarine = enemySubmarines[Math.floor(Math.random() * enemySubmarines.length)];
      detectionAttempts++;

      // Roll detection: d20 === 1 (5%)
      const detectionRoll = this.rollD20();
      if (detectionRoll === 1) {
        successfulDetections++;

        // Roll elimination: d20 ≤ 10 (50%)
        const eliminationRoll = this.rollD20();
        if (eliminationRoll <= 10) {
          // Submarine eliminated
          eliminatedSubmarineIds.push(targetSubmarine.id);
          updatedSubmarines = updatedSubmarines.map(sub =>
            sub.id === targetSubmarine.id ? { ...sub, status: 'destroyed' as const } : sub
          );

          // Update kill count
          if (aswElement.type === 'card' || aswElement.type === 'submarine') {
            updatedSubmarines = updatedSubmarines.map(sub =>
              sub.id === aswElement.id
                ? { ...sub, totalKills: sub.totalKills + 1, missionsCompleted: sub.missionsCompleted + 1 }
                : sub
            );
          }

          // Create events
          const { attackerEvent, defenderEvent } = this.createASWEliminationEventsFromElement(
            aswElement,
            targetSubmarine,
            currentTurnState,
            detectionRoll,
            eliminationRoll
          );
          events.push(attackerEvent, defenderEvent);
        } else {
          // Submarine evaded (only attacker knows)
          const attackerEvent = this.createASWDetectionEventFromElement(
            aswElement,
            targetSubmarine,
            currentTurnState,
            detectionRoll,
            eliminationRoll
          );
          events.push(attackerEvent);
        }
      } else {
        // Detection failed - create event for admin detailed report
        const failedDetectionEvent = this.createASWFailedDetectionEvent(
          aswElement,
          targetSubmarine,
          currentTurnState,
          detectionRoll
        );
        events.push(failedDetectionEvent);
      }
    }

    console.log(`🎯 ASW: ${eliminatedSubmarineIds.length} eliminated (${detectionAttempts} attempts, ${successfulDetections} detected)`);

    return { events, updatedSubmarines, eliminatedSubmarineIds };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Roll a d20 (1-20)
   */
  private static rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
  }

  /**
   * Get ASW cards deployed in an operational area
   */
  private static getASWCardsInArea(area: OperationalArea, cards: Card[]): ASWElement[] {
    if (!area.assignedCards || area.assignedCards.length === 0) return [];

    return area.assignedCards
      .map(instanceId => {
        const cardId = instanceId.split('_')[0];
        const card = cards.find(c => c.id === cardId);
        return card && card.submarineType === 'asw' ? {
          id: instanceId,
          name: card.name,
          faction: card.faction,
          type: 'card' as const,
          areaId: area.id,
          areaName: area.name
        } : null;
      })
      .filter((element): element is ASWElement => element !== null);
  }

  /**
   * Get ASW ships in an operational area
   */
  private static getASWShipsInArea(area: OperationalArea, taskForces: TaskForce[], units: Unit[]): ASWElement[] {
    const areaTaskForces = taskForces.filter(tf => tf.operationalAreaId === area.id);
    const aswShips: ASWElement[] = [];

    for (const tf of areaTaskForces) {
      const tfUnits = units.filter(u => u.taskForceId === tf.id);

      for (const unit of tfUnits) {
        if (unit.category === 'naval' && this.isASWCapable(unit, tf.faction)) {
          aswShips.push({
            id: unit.id,
            name: unit.name,
            faction: tf.faction,
            type: 'ship' as const,
            areaId: area.id,
            areaName: area.name
          });
        }
      }
    }

    return aswShips;
  }

  /**
   * Check if a unit has ASW capability
   */
  private static isASWCapable(unit: Unit, faction: Faction): boolean {
    const ASW_SHIP_TYPES: Record<Faction, string[]> = {
      us: ['ARLEIGH BURKE CLASS DDG', 'DDG(X)'],
      china: ['TYPE 052D', 'TYPE 055 DDG', 'TYPE 054 FFG']
    };
    return ASW_SHIP_TYPES[faction].includes(unit.type);
  }

  /**
   * Create ASW elimination events from ASWElement
   */
  private static createASWEliminationEventsFromElement(
    aswElement: ASWElement,
    targetSubmarine: SubmarineDeployment,
    currentTurnState: TurnState,
    detectionRoll: number,
    eliminationRoll: number
  ): { attackerEvent: SubmarineEvent; defenderEvent: SubmarineEvent } {
    // Build ASW element info, only including defined fields (Firestore doesn't accept undefined)
    const aswElementInfo: any = {
      elementId: aswElement.id,
      elementName: aswElement.name,
      elementType: aswElement.type
    };

    // Only add area fields if they're defined
    if (aswElement.areaId !== undefined) {
      aswElementInfo.areaId = aswElement.areaId;
    }
    if (aswElement.areaName !== undefined) {
      aswElementInfo.areaName = aswElement.areaName;
    }

    const attackerEvent: SubmarineEvent = {
      eventId: `asw-elim-attacker-${Date.now()}-${Math.random()}`,
      submarineId: aswElement.id,
      submarineName: aswElement.name,
      faction: aswElement.faction,
      cardId: aswElement.id,
      cardName: aswElement.name,
      submarineType: 'ASW',
      eventType: 'attack_success',
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: targetSubmarine.id,
        targetName: targetSubmarine.submarineName,
        targetType: 'unit'
      },
      description: `ASW ${aswElement.type} ${aswElement.name} eliminated enemy submarine ${targetSubmarine.submarineName}`,
      rollDetails: {
        primaryRoll: detectionRoll,
        secondaryRoll: eliminationRoll,
        primaryThreshold: 1,
        secondaryThreshold: 10,
        aswElementInfo
      }
    };

    const defenderEvent: SubmarineEvent = {
      eventId: `asw-elim-defender-${Date.now()}-${Math.random()}`,
      submarineId: targetSubmarine.id,
      submarineName: targetSubmarine.submarineName,
      faction: targetSubmarine.faction,
      cardId: targetSubmarine.cardId,
      cardName: targetSubmarine.cardName,
      submarineType: targetSubmarine.submarineType,
      eventType: 'destroyed',
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: aswElement.id,
        targetName: aswElement.name,
        targetType: 'unit'
      },
      description: `Submarine ${targetSubmarine.submarineName} destroyed by enemy ${aswElement.type} (${aswElement.name})`,
      rollDetails: {
        primaryRoll: detectionRoll,
        secondaryRoll: eliminationRoll,
        primaryThreshold: 1,
        secondaryThreshold: 10,
        aswElementInfo
      }
    };

    return { attackerEvent, defenderEvent };
  }

  /**
   * Create ASW detection event from ASWElement
   */
  private static createASWDetectionEventFromElement(
    aswElement: ASWElement,
    targetSubmarine: SubmarineDeployment,
    currentTurnState: TurnState,
    detectionRoll: number,
    eliminationRoll: number
  ): SubmarineEvent {
    // Build ASW element info, only including defined fields (Firestore doesn't accept undefined)
    const aswElementInfo: any = {
      elementId: aswElement.id,
      elementName: aswElement.name,
      elementType: aswElement.type
    };

    // Only add area fields if they're defined
    if (aswElement.areaId !== undefined) {
      aswElementInfo.areaId = aswElement.areaId;
    }
    if (aswElement.areaName !== undefined) {
      aswElementInfo.areaName = aswElement.areaName;
    }

    return {
      eventId: `asw-detection-${Date.now()}-${Math.random()}`,
      submarineId: aswElement.id,
      submarineName: aswElement.name,
      faction: aswElement.faction,
      cardId: aswElement.id,
      cardName: aswElement.name,
      submarineType: 'ASW',
      eventType: 'detected',
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: targetSubmarine.id,
        targetName: targetSubmarine.submarineName,
        targetType: 'unit'
      },
      description: `Enemy submarine detected but evaded - ${targetSubmarine.submarineName} escaped`,
      rollDetails: {
        primaryRoll: detectionRoll,
        secondaryRoll: eliminationRoll,
        primaryThreshold: 1,
        secondaryThreshold: 10,
        aswElementInfo
      }
    };
  }

  /**
   * Create failed ASW detection event from ASWElement
   */
  private static createASWFailedDetectionEvent(
    aswElement: ASWElement,
    targetSubmarine: SubmarineDeployment,
    currentTurnState: TurnState,
    detectionRoll: number
  ): SubmarineEvent {
    // Build ASW element info, only including defined fields (Firestore doesn't accept undefined)
    const aswElementInfo: any = {
      elementId: aswElement.id,
      elementName: aswElement.name,
      elementType: aswElement.type
    };

    // Only add area fields if they're defined
    if (aswElement.areaId !== undefined) {
      aswElementInfo.areaId = aswElement.areaId;
    }
    if (aswElement.areaName !== undefined) {
      aswElementInfo.areaName = aswElement.areaName;
    }

    return {
      eventId: `asw-failed-${Date.now()}-${Math.random()}`,
      submarineId: aswElement.id,
      submarineName: aswElement.name,
      faction: aswElement.faction,
      cardId: aswElement.id,
      cardName: aswElement.name,
      submarineType: 'ASW',
      eventType: 'detected',
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: targetSubmarine.id,
        targetName: targetSubmarine.submarineName,
        targetType: 'unit'
      },
      description: `Detection attempt failed - ${targetSubmarine.submarineName} remained undetected`,
      rollDetails: {
        primaryRoll: detectionRoll,
        primaryThreshold: 1,
        aswElementInfo
      }
    };
  }
}
