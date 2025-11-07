/**
 * ASWService (Anti-Submarine Warfare Service)
 *
 * Handles ASW operations:
 * - Location-based ASW detection from operational areas
 * - ASW cards in submarine campaign
 * - Patrol submarines performing ASW missions
 * - Detection mechanics: d20 ≤ 3 for ASW cards (15%), d20 ≤ 2 for destroyers/frigates (10%), d20 === 1 for patrol subs (5%)
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
   * Detection: d20 ≤ 3 for ASW cards (15%), d20 ≤ 2 for destroyers/frigates (10%), d20 === 1 for patrol subs (5%)
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

    // Collect all ASW elements from operational areas
    const allASWElements: ASWElement[] = [];

    // 1. Collect ASW cards from submarine campaign (they have assigned areas)
    const aswCardsInCampaign = sourceSubmarines
      .filter(sub => sub.submarineType === 'asw' && sub.status === 'active')
      .map(aswCard => ({
        id: aswCard.id,
        name: aswCard.submarineName,
        faction: aswCard.faction,
        type: 'card' as const,
        areaId: aswCard.currentOrder?.targetId || aswCard.currentAreaId,
        areaName: aswCard.currentOrder?.targetId || aswCard.currentAreaId || 'Unknown'
      }));

    allASWElements.push(...aswCardsInCampaign);

    // 2. Collect ASW ships from operational areas
    for (const area of operationalAreas) {
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

        // Zone filtering for all ASW element types
        const subAreaId = sub.currentOrder?.targetId || sub.currentAreaId || 'south-china-sea';

        if (aswElement.type === 'submarine') {
          // Patrol submarines: detect only in their zone
          return subAreaId === aswElement.areaId;
        }

        if (aswElement.type === 'ship' && aswElement.areaId) {
          // ASW ships: detect only in their operational area
          return subAreaId === aswElement.areaId;
        }

        if (aswElement.type === 'card') {
          // ASW cards ALWAYS have areaId (zone-restricted)
          return subAreaId === aswElement.areaId;
        }

        return true; // Fallback
      });

      if (enemySubmarines.length === 0) continue;

      // Pick random enemy submarine
      const targetSubmarine = enemySubmarines[Math.floor(Math.random() * enemySubmarines.length)];
      detectionAttempts++;

      // Determine detection threshold based on ASW element type
      let detectionThreshold = 1; // Default 5% (d20 === 1) for patrol submarines
      if (aswElement.type === 'card') {
        detectionThreshold = 3; // 15% (d20 ≤ 3) for ASW cards
      } else if (aswElement.type === 'ship') {
        // Find the unit to get its type for threshold calculation
        const aswUnit = units.find(u => u.id === aswElement.id);
        if (aswUnit) {
          detectionThreshold = this.getASWDetectionThreshold(aswUnit, aswElement.faction);
        }
      }

      // Roll detection: threshold depends on ASW element type
      const detectionRoll = this.rollD20();
      if (detectionRoll <= detectionThreshold) {
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
            .setDescription(ASWTemplates.eliminationAttacker(aswElement.type, aswElement.name))
            .setRolls(detectionRoll, detectionThreshold, eliminationRoll, 10)
            .setASWElementInfo(aswElement.id, aswElement.name, aswElement.type, aswElement.areaId, aswElement.areaName)
            .build();

          // Create defender event (submarine crew's view)
          const defenderEvent = new EventBuilder()
            .setSubmarine(targetSubmarine)
            .setTurnState(currentTurnState)
            .setEventType('destroyed')
            .setTarget(aswElement.id, aswElement.name, 'unit')
            .setDescription(ASWTemplates.eliminationDefender(targetSubmarine.submarineName, aswElement.type, aswElement.name))
            .setRolls(detectionRoll, detectionThreshold, eliminationRoll, 10)
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
            .setDescription(ASWTemplates.detectionEvaded(aswElement.areaName))
            .setRolls(detectionRoll, detectionThreshold, eliminationRoll, 10)
            .setASWElementInfo(aswElement.id, aswElement.name, aswElement.type, aswElement.areaId, aswElement.areaName)
            .build();

          events.push(attackerEvent);
        }
      } else {
        // Detection failed - create event for admin report only
        const failedDetectionEvent = new EventBuilder()
          .setSubmarineInfo(aswElement.id, aswElement.name, aswElement.id, aswElement.name, 'ASW')
          .setFaction(aswElement.faction)
          .setTurnState(currentTurnState)
          .setEventType('asw_failed')
          .setTarget(targetSubmarine.id, targetSubmarine.submarineName, 'unit')
          .setDescription(ASWTemplates.detectionFailed())
          .setRolls(detectionRoll, detectionThreshold)
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
    const areaTaskForces = taskForces.filter(tf => tf.operationalAreaId === area.id && !tf.isPendingDeployment);
    const aswShips: ASWElement[] = [];

    for (const tf of areaTaskForces) {
      const tfUnits = units.filter(u => u.taskForceId === tf.id && !u.isPendingDeployment);

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
   * Get ASW detection threshold for naval units (destroyers and frigates)
   * Destroyers and frigates have enhanced detection: d20 ≤ 2 (10% success rate)
   * ASW cards have superior detection: d20 ≤ 3 (15% success rate)
   * Patrol submarines maintain baseline: d20 === 1 (5% success rate)
   */
  private static getASWDetectionThreshold(unit: Unit, faction: Faction): number {
    // All ASW-capable ships (destroyers and frigates) get enhanced detection
    const ASW_SHIP_TYPES: Record<Faction, string[]> = {
      us: ['ARLEIGH BURKE CLASS DDG', 'DDG(X)'],
      china: ['TYPE 052D', 'TYPE 055 DDG', 'TYPE 054 FFG']
    };

    if (ASW_SHIP_TYPES[faction].includes(unit.type)) {
      return 2; // 10% detection rate (d20 ≤ 2)
    }

    return 1; // Default 5% detection rate (d20 === 1)
  }

}
