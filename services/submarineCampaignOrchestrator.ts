/**
 * SubmarineCampaignOrchestrator
 *
 * Coordinates all submarine campaign operations in the correct sequence:
 * 1. ASW Phase - Detect and eliminate submarines
 * 2. Attack Phase - Execute missile attacks on bases
 * 3. Patrol Phase - Conduct patrol operations
 *
 * Ensures phase chaining: each phase receives updated submarine state from previous phase.
 * This prevents state inconsistencies like eliminated submarines attacking or
 * patrol orders being lost after attacks.
 *
 * This orchestrator is the single entry point for all submarine campaign operations,
 * replacing the direct service calls from App.tsx.
 */

import {
  SubmarineCampaignState,
  SubmarineEvent,
  SubmarineDeployment,
  TurnState,
  CommandPoints,
  Location,
  OperationalArea,
  TaskForce,
  Unit,
  Card,
  AswShipDeployment,
  Faction,
  OperationalData
} from '../types';

import { PatrolService, SubmarinePatrolResult } from './patrol/patrolService';
import { AttackService, SubmarineAttackResult } from './attack/attackService';
import { ASWService, ASWResult } from './asw/aswService';

export interface SubmarineCampaignTurnResult {
  events: SubmarineEvent[];
  updatedSubmarines: SubmarineDeployment[];
  updatedLocations: Location[];
  updatedCommandPoints: CommandPoints;
  eliminatedSubmarineIds: string[];
}

/**
 * SubmarineCampaignOrchestrator class
 * Orchestrates all submarine campaign phases in correct sequence
 */
export class SubmarineCampaignOrchestrator {
  /**
   * Execute complete submarine campaign turn with all three phases
   *
   * Phase execution order (CRITICAL):
   * 1. ASW Phase - eliminates submarines first
   * 2. Attack Phase - eliminated subs cannot attack
   * 3. Patrol Phase - receives patrol orders created by attack phase
   *
   * @param submarineCampaign Current submarine campaign state
   * @param currentTurnState Current turn information
   * @param commandPoints Current command points
   * @param operationalAreas All operational areas
   * @param taskForces All task forces
   * @param units All units
   * @param cards All cards
   * @param locations All locations (bases)
   * @returns Combined results from all three phases
   */
  static async executeFullTurn(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    commandPoints: CommandPoints,
    operationalAreas: OperationalArea[],
    taskForces: TaskForce[],
    units: Unit[],
    cards: Card[],
    locations: Location[]
  ): Promise<SubmarineCampaignTurnResult> {
    if (!submarineCampaign) {
      return {
        events: [],
        updatedSubmarines: [],
        updatedLocations: [...locations],
        updatedCommandPoints: { ...commandPoints },
        eliminatedSubmarineIds: []
      };
    }

    const allEvents: SubmarineEvent[] = [];

    // PHASE 1: ASW Phase - Detect and eliminate submarines FIRST
    console.log('🎯 Executing ASW Phase...');
    const aswResult: ASWResult = await ASWService.processASWPhase(
      submarineCampaign,
      currentTurnState,
      operationalAreas,
      taskForces,
      units,
      cards
    );
    allEvents.push(...aswResult.events);

    // PHASE 2: Attack Phase - Uses ASW results (propagates eliminations)
    console.log('🚀 Executing Attack Phase...');
    const attackResult: SubmarineAttackResult = await AttackService.processAttacks(
      submarineCampaign,
      currentTurnState,
      locations,
      aswResult.updatedSubmarines // Pass ASW submarines (includes eliminations)
    );
    allEvents.push(...attackResult.events);

    // PHASE 3: Patrol Phase - Uses Attack results (propagates order changes)
    console.log('🔍 Executing Patrol Phase...');
    const patrolResult: SubmarinePatrolResult = await PatrolService.processPatrols(
      submarineCampaign,
      currentTurnState,
      commandPoints,
      operationalAreas,
      attackResult.updatedSubmarines // Pass Attack submarines (includes patrol orders)
    );
    allEvents.push(...patrolResult.events);

    // Return combined results with final chained state
    return {
      events: allEvents,
      updatedSubmarines: patrolResult.updatedSubmarines, // Contains all accumulated changes
      updatedLocations: attackResult.updatedLocations,
      updatedCommandPoints: patrolResult.updatedCommandPoints,
      eliminatedSubmarineIds: aswResult.eliminatedSubmarineIds
    };
  }

  /**
   * Execute only ASW phase (for isolated testing or manual execution)
   */
  static async executeASWPhase(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    operationalAreas: OperationalArea[],
    taskForces: TaskForce[],
    units: Unit[],
    cards: Card[],
    submarines?: SubmarineDeployment[]
  ): Promise<ASWResult> {
    return ASWService.processASWPhase(
      submarineCampaign,
      currentTurnState,
      operationalAreas,
      taskForces,
      units,
      cards,
      submarines
    );
  }

  /**
   * Execute only Attack phase (for isolated testing or manual execution)
   */
  static async executeAttackPhase(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    locations: Location[],
    submarines?: SubmarineDeployment[]
  ): Promise<SubmarineAttackResult> {
    return AttackService.processAttacks(
      submarineCampaign,
      currentTurnState,
      locations,
      submarines
    );
  }

  /**
   * Execute only Patrol phase (for isolated testing or manual execution)
   */
  static async executePatrolPhase(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    commandPoints: CommandPoints,
    operationalAreas: OperationalArea[],
    submarines?: SubmarineDeployment[]
  ): Promise<SubmarinePatrolResult> {
    return PatrolService.processPatrols(
      submarineCampaign,
      currentTurnState,
      commandPoints,
      operationalAreas,
      submarines
    );
  }

  // ============================================================================
  // UTILITY METHODS (from original SubmarineService)
  // ============================================================================

  /**
   * Check if communication failure occurs based on tactical network damage
   * @param damageCount Number of damage points on tactical network (0-8)
   * @returns Result with failure status, roll, and threshold
   */
  static checkCommunicationFailure(damageCount: number): {
    failed: boolean;
    roll: number;
    threshold: number;
  } {
    // No damage: communication always succeeds
    if (damageCount <= 1) {
      return { failed: false, roll: 0, threshold: 0 };
    }

    const roll = this.rollD20();
    let threshold: number;

    // 2-3 damage: minor effect, threshold = 4
    if (damageCount <= 3) {
      threshold = 4;
    }
    // 4+ damage: major effect, threshold = 7
    else {
      threshold = 7;
    }

    const failed = roll <= threshold;
    return { failed, roll, threshold };
  }

  /**
   * Calculate average tactical network damage across all operational areas for a faction
   * @param operationalData All operational area data
   * @param faction Faction to calculate for ('us' or 'china')
   * @returns Average damage count (0-8)
   */
  static getAverageTacticalNetworkDamage(
    operationalData: Record<string, OperationalData>,
    faction: Faction
  ): number {
    const factionKey = faction === 'us' ? 'us' : 'plan';
    const areas = Object.values(operationalData);

    if (areas.length === 0) {
      return 0;
    }

    const totalDamage = areas.reduce((sum, area) => {
      const damageArray = area[factionKey]?.tacticalNetworkDamage || [];
      const damageCount = damageArray.filter(dmg => dmg === true).length;
      return sum + damageCount;
    }, 0);

    return Math.round(totalDamage / areas.length);
  }

  /**
   * Get current operational area ID for a submarine deployment
   * Priority: currentAreaId > currentOrder.targetId > 'south-china-sea'
   * @param deployment Submarine deployment
   * @returns Operational area ID
   */
  static getCurrentAreaId(deployment: SubmarineDeployment): string {
    if (deployment.currentAreaId) {
      return deployment.currentAreaId;
    }
    if (deployment.currentOrder?.targetId) {
      return deployment.currentOrder.targetId;
    }
    return 'south-china-sea';
  }

  /**
   * Snapshot all ASW-capable ships deployed to operational areas
   * This captures the current state at turn start for submarine campaign calculations
   * Ships are locked until the next turn snapshot
   */
  static snapshotAswShips(
    units: Unit[],
    taskForces: TaskForce[],
    operationalAreas: OperationalArea[]
  ): AswShipDeployment[] {
    const aswShips: AswShipDeployment[] = [];

    // Iterate through all operational areas
    for (const area of operationalAreas) {
      // Find task forces in this area
      const areaTaskForces = taskForces.filter(tf => tf.operationalAreaId === area.id);

      for (const tf of areaTaskForces) {
        // Find units in this task force
        const tfUnits = units.filter(u => u.taskForceId === tf.id);

        for (const unit of tfUnits) {
          // Check if unit is naval and has ASW capability
          if (unit.category === 'naval' && this.isASWCapable(unit, tf.faction)) {
            aswShips.push({
              unitId: unit.id,
              unitName: unit.name,
              unitType: unit.type,
              taskForceId: tf.id,
              taskForceName: tf.name,
              operationalAreaId: area.id,
              operationalAreaName: area.name,
              faction: tf.faction
            });
          }
        }
      }
    }

    return aswShips;
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
