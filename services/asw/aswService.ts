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
import { EventBuilder } from '../events/EventBuilder';
import { ASWTemplates } from '../events/EventTemplates';

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

    // 3. Collect patrol submarines (they can do ASW in their current zone only)
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
        areaId: sub.currentOrder?.targetId || sub.currentAreaId || 'south-china-sea',
        areaName: sub.currentOrder?.targetId || 'South China Sea'
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
      // Find enemy submarines not yet eliminated (in same zone for submarine ASW elements)
      const enemySubmarines = submarinesInSouthChinaSea.filter(sub => {
        if (sub.faction === aswElement.faction) return false;
        if (eliminatedSubmarineIds.includes(sub.id)) return false;

        // Zone filtering: submarines can only detect in their own zone
        if (aswElement.type === 'submarine') {
          const subAreaId = sub.currentOrder?.targetId || sub.currentAreaId || 'south-china-sea';
          return subAreaId === aswElement.areaId;
        }

        // Ships and ASW cards detect in their operational area
        if (aswElement.type === 'ship' && aswElement.areaId) {
          const subAreaId = sub.currentOrder?.targetId || sub.currentAreaId || 'south-china-sea';
          return subAreaId === aswElement.areaId;
        }

        // ASW cards without specific area can detect any enemy submarine
        return true;
      });

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

          // Create attacker event (ASW operator's view)
          const attackerEvent = new EventBuilder()
            .setSubmarineInfo(aswElement.id, aswElement.name, aswElement.id, aswElement.name, 'ASW')
            .setFaction(aswElement.faction)
            .setTurnState(currentTurnState)
            .setEventType('attack_success')
            .setTarget(targetSubmarine.id, targetSubmarine.submarineName, 'unit')
            .setDescription(ASWTemplates.eliminationAttacker(aswElement.type, aswElement.name, targetSubmarine.submarineName))
            .setRolls(detectionRoll, 1, eliminationRoll, 10)
            .setASWElementInfo(aswElement.id, aswElement.name, aswElement.type, aswElement.areaId, aswElement.areaName)
            .build();

          // Create defender event (submarine crew's view)
          const defenderEvent = new EventBuilder()
            .setSubmarine(targetSubmarine)
            .setTurnState(currentTurnState)
            .setEventType('destroyed')
            .setTarget(aswElement.id, aswElement.name, 'unit')
            .setDescription(ASWTemplates.eliminationDefender(targetSubmarine.submarineName, aswElement.type, aswElement.name))
            .setRolls(detectionRoll, 1, eliminationRoll, 10)
            .setASWElementInfo(aswElement.id, aswElement.name, aswElement.type, aswElement.areaId, aswElement.areaName)
            .build();

          events.push(attackerEvent, defenderEvent);
        } else {
          // Submarine evaded (only attacker knows)
          const attackerEvent = new EventBuilder()
            .setSubmarineInfo(aswElement.id, aswElement.name, aswElement.id, aswElement.name, 'ASW')
            .setFaction(aswElement.faction)
            .setTurnState(currentTurnState)
            .setEventType('detected')
            .setTarget(targetSubmarine.id, targetSubmarine.submarineName, 'unit')
            .setDescription(ASWTemplates.detectionEvaded(targetSubmarine.submarineName))
            .setRolls(detectionRoll, 1, eliminationRoll, 10)
            .setASWElementInfo(aswElement.id, aswElement.name, aswElement.type, aswElement.areaId, aswElement.areaName)
            .build();

          events.push(attackerEvent);
        }
      } else {
        // Detection failed - create event for admin detailed report
        const failedDetectionEvent = new EventBuilder()
          .setSubmarineInfo(aswElement.id, aswElement.name, aswElement.id, aswElement.name, 'ASW')
          .setFaction(aswElement.faction)
          .setTurnState(currentTurnState)
          .setEventType('detected')
          .setTarget(targetSubmarine.id, targetSubmarine.submarineName, 'unit')
          .setDescription(ASWTemplates.detectionFailed(targetSubmarine.submarineName))
          .setRolls(detectionRoll, 1)
          .setASWElementInfo(aswElement.id, aswElement.name, aswElement.type, aswElement.areaId, aswElement.areaName)
          .build();

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

}
