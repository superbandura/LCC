/**
 * MineService (Maritime Mines Service)
 *
 * Handles maritime mine operations:
 * - Location-based mine detection in operational areas
 * - Maritime Mines cards (asset type) deployed in areas
 * - Affects enemy submarines and naval ships
 * - Detection mechanics: d20 = 1 (5% success rate)
 * - Each unit rolls once per mine present (2 mines = 2 rolls)
 * - Mines persist indefinitely (destroyed by separate asset later)
 * - Event generation for defender only
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
  Faction,
  MineResult
} from '../../types';
import { EventBuilder } from '../events/EventBuilder';
import { MineTemplates } from '../events/EventTemplates';

interface MineElement {
  id: string;
  name: string;
  faction: Faction;
  areaId: string;
  areaName: string;
}

interface VulnerableUnit {
  id: string;
  name: string;
  faction: Faction;
  type: 'submarine' | 'ship';
  unitType: string; // For display: "Submarine", "DDG", etc.
  areaId: string;
  areaName: string;
}

/**
 * MineService class
 * Contains all maritime mine warfare logic
 */
export class MineService {
  /**
   * Process Mine Phase
   * Location-based system: Maritime Mines in operational areas detect submarines and ships
   * Detection: d20 = 1 (5% success rate)
   * Each unit rolls once per mine (2 mines = 2 rolls per unit)
   * Successful detection = instant destruction
   */
  static async processMinePhase(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    operationalAreas: OperationalArea[],
    taskForces: TaskForce[],
    units: Unit[],
    cards: Card[],
    submarines?: SubmarineDeployment[]
  ): Promise<MineResult> {
    if (!submarineCampaign) {
      return {
        events: [],
        updatedSubmarines: [],
        updatedUnits: [...units],
        eliminatedSubmarineIds: [],
        eliminatedUnitIds: []
      };
    }

    // Use provided submarines or fall back to campaign submarines
    const sourceSubmarines = submarines || submarineCampaign.deployedSubmarines;

    // Collect all mine cards from operational areas
    const allMines: MineElement[] = [];
    for (const area of operationalAreas) {
      const minesInArea = this.getMineCardsInArea(area, cards);
      allMines.push(...minesInArea);
    }

    if (allMines.length === 0) {
      return {
        events: [],
        updatedSubmarines: sourceSubmarines,
        updatedUnits: [...units],
        eliminatedSubmarineIds: [],
        eliminatedUnitIds: []
      };
    }

    // Process mine detection attempts
    const events: SubmarineEvent[] = [];
    const eliminatedSubmarineIds: string[] = [];
    const eliminatedUnitIds: string[] = [];
    let updatedSubmarines = [...sourceSubmarines];
    let updatedUnits = [...units];
    let detectionAttempts = 0;
    let successfulHits = 0;

    // Get ALL vulnerable units (submarines + ships) across all areas
    const allVulnerableUnits = this.getAllVulnerableUnits(
      allMines,
      sourceSubmarines,
      taskForces,
      units,
      eliminatedSubmarineIds,
      eliminatedUnitIds
    );

    // For each mine, each vulnerable unit rolls for detection
    for (const mine of allMines) {
      // Filter units to only those that can be affected by this mine
      const unitsInRange = allVulnerableUnits.filter(unit => {
        // Submarines in South China Sea can be hit by any mine
        if (unit.type === 'submarine') {
          return unit.faction !== mine.faction;
        }
        // Ships can only be hit by mines in their area
        return unit.faction !== mine.faction && unit.areaId === mine.areaId;
      });

      // Each unit in range rolls for this mine
      for (const vulnerableUnit of unitsInRange) {
        // Skip if unit was already eliminated by a previous mine
        if (vulnerableUnit.type === 'submarine' && eliminatedSubmarineIds.includes(vulnerableUnit.id)) {
          continue;
        }
        if (vulnerableUnit.type === 'ship' && eliminatedUnitIds.includes(vulnerableUnit.id)) {
          continue;
        }

        detectionAttempts++;

        // Roll detection: d20 === 1 (5%)
        const detectionRoll = this.rollD20();
        const defenderFaction = vulnerableUnit.faction;

        if (detectionRoll === 1) {
          // SUCCESSFUL HIT - Destroy the unit
          successfulHits++;

          if (vulnerableUnit.type === 'submarine') {
            eliminatedSubmarineIds.push(vulnerableUnit.id);
            updatedSubmarines = updatedSubmarines.map(sub =>
              sub.id === vulnerableUnit.id ? { ...sub, status: 'destroyed' as const } : sub
            );
          } else {
            eliminatedUnitIds.push(vulnerableUnit.id);
            // Mark all damage points as destroyed
            updatedUnits = updatedUnits.map(unit =>
              unit.id === vulnerableUnit.id
                ? { ...unit, currentDamage: unit.currentDamage.map(() => true) }
                : unit
            );
          }

          // Create destroyed event (defender perspective)
          const destroyedEvent = new EventBuilder()
            .setSubmarineInfo(vulnerableUnit.id, vulnerableUnit.name, vulnerableUnit.id, vulnerableUnit.name, vulnerableUnit.unitType)
            .setFaction(defenderFaction)
            .setTurnState(currentTurnState)
            .setEventType('destroyed')
            .setTarget(mine.id, mine.name, 'unit')
            .setDescription(MineTemplates.hit(vulnerableUnit.name, vulnerableUnit.unitType, mine.areaName))
            .setRolls(detectionRoll, 1)
            .build();

          events.push(destroyedEvent);
        } else {
          // FAILED DETECTION - Create event for admin report
          const failedDetectionEvent = new EventBuilder()
            .setSubmarineInfo(vulnerableUnit.id, vulnerableUnit.name, vulnerableUnit.id, vulnerableUnit.name, vulnerableUnit.unitType)
            .setFaction(defenderFaction)
            .setTurnState(currentTurnState)
            .setEventType('detected')
            .setTarget(mine.id, mine.name, 'unit')
            .setDescription(MineTemplates.detectionFailed(vulnerableUnit.name, vulnerableUnit.unitType, mine.areaName))
            .setRolls(detectionRoll, 1)
            .build();

          events.push(failedDetectionEvent);
        }
      }
    }

    if (successfulHits > 0) {
      console.log(`💥 Mines: ${successfulHits} hits (${detectionAttempts} detection attempts)`);
    }

    return {
      events,
      updatedSubmarines,
      updatedUnits,
      eliminatedSubmarineIds,
      eliminatedUnitIds
    };
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
   * Get Maritime Mines cards deployed in an operational area
   */
  private static getMineCardsInArea(area: OperationalArea, cards: Card[]): MineElement[] {
    if (!area.assignedCards || area.assignedCards.length === 0) return [];

    return area.assignedCards
      .map(instanceId => {
        const cardId = instanceId.split('_')[0];
        const card = cards.find(c => c.id === cardId);
        return card && card.submarineType === 'asset' && card.name === 'Maritime Mines' ? {
          id: instanceId,
          name: card.name,
          faction: card.faction,
          areaId: area.id,
          areaName: area.name
        } : null;
      })
      .filter((element): element is MineElement => element !== null);
  }

  /**
   * Get all vulnerable units (submarines + naval ships) across all areas
   * Excludes already eliminated units
   */
  private static getAllVulnerableUnits(
    mines: MineElement[],
    submarines: SubmarineDeployment[],
    taskForces: TaskForce[],
    units: Unit[],
    eliminatedSubmarineIds: string[],
    eliminatedUnitIds: string[]
  ): VulnerableUnit[] {
    const vulnerableUnits: VulnerableUnit[] = [];

    // 1. Get ALL active submarines in South China Sea (attack or patrol orders)
    const activeSubmarines = submarines.filter(
      sub => sub.status === 'active' &&
             !eliminatedSubmarineIds.includes(sub.id) &&
             sub.submarineType === 'submarine' &&
             sub.currentOrder &&
             (sub.currentOrder.orderType === 'attack' || sub.currentOrder.orderType === 'patrol')
    );

    // Add submarines as vulnerable units
    for (const sub of activeSubmarines) {
      vulnerableUnits.push({
        id: sub.id,
        name: sub.submarineName,
        faction: sub.faction,
        type: 'submarine',
        unitType: 'Submarine',
        areaId: 'south-china-sea', // Special area for submarines
        areaName: 'South China Sea'
      });
    }

    // 2. Get ALL naval ships from areas where mines are deployed
    const mineAreaIds = [...new Set(mines.map(m => m.areaId))];

    for (const areaId of mineAreaIds) {
      const areaTaskForces = taskForces.filter(tf => tf.operationalAreaId === areaId);

      for (const tf of areaTaskForces) {
        const tfUnits = units.filter(u =>
          u.taskForceId === tf.id &&
          u.category === 'naval' &&
          !eliminatedUnitIds.includes(u.id) &&
          !this.isUnitDestroyed(u)
        );

        for (const unit of tfUnits) {
          vulnerableUnits.push({
            id: unit.id,
            name: unit.name,
            faction: tf.faction,
            type: 'ship',
            unitType: unit.type,
            areaId: areaId,
            areaName: `Area ${areaId}`
          });
        }
      }
    }

    return vulnerableUnits;
  }

  /**
   * Check if a unit is already destroyed (all damage points marked)
   */
  private static isUnitDestroyed(unit: Unit): boolean {
    return unit.currentDamage.every(dmg => dmg === true);
  }
}
