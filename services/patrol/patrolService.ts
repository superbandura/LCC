/**
 * PatrolService
 *
 * Handles submarine patrol operations:
 * - Patrol mission execution with 10% success rate (roll ≤2 on d20)
 * - Command point damage calculation
 * - Event generation for both factions
 * - Submarine state updates after patrol completion
 *
 * This service is pure and testable - it doesn't directly modify Firebase,
 * but returns updated data structures for the caller to persist.
 */

import {
  SubmarineCampaignState,
  SubmarineEvent,
  SubmarineDeployment,
  TurnState,
  CommandPoints,
  OperationalArea,
  Faction
} from '../../types';
import { EventBuilder } from '../events/EventBuilder';
import { PatrolTemplates, formatZoneName } from '../events/EventTemplates';

export interface SubmarinePatrolResult {
  events: SubmarineEvent[];
  updatedSubmarines: SubmarineDeployment[];
  updatedCommandPoints: CommandPoints;
}

/**
 * PatrolService class
 * Contains all submarine patrol logic
 */
export class PatrolService {
  /**
   * Process submarine patrol orders
   * Patrols have 10% success rate (roll ≤2 on d20)
   * Successful patrols deal d20 damage to enemy command points
   */
  static async processPatrols(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    commandPoints: CommandPoints,
    operationalAreas: OperationalArea[],
    submarines?: SubmarineDeployment[]
  ): Promise<SubmarinePatrolResult> {
    if (!submarineCampaign) {
      return { events: [], updatedSubmarines: [], updatedCommandPoints: { ...commandPoints } };
    }

    // Use provided submarines or fall back to campaign submarines
    const sourceSubmarines = submarines || submarineCampaign.deployedSubmarines;

    // Reset completed patrol orders
    let updatedSubmarinesForReset = sourceSubmarines.map(sub => {
      if (sub.status === 'active' &&
          sub.currentOrder?.orderType === 'patrol' &&
          sub.currentOrder?.status === 'completed') {
        return {
          ...sub,
          currentOrder: { ...sub.currentOrder, status: 'pending' as const }
        };
      }
      return sub;
    });

    // Deduplicate submarines by ID before filtering
    const uniqueSubmarines = Array.from(
      new Map(updatedSubmarinesForReset.map(sub => [sub.id, sub])).values()
    );

    // Filter active submarines with pending patrol orders
    // Exclude ASW cards - they only perform ASW detection, not offensive patrols
    const activeSubmarines = uniqueSubmarines.filter(
      sub => sub.status === 'active' &&
             sub.submarineType === 'submarine' &&
             sub.currentOrder?.orderType === 'patrol' &&
             sub.currentOrder?.status === 'pending'
    );

    if (activeSubmarines.length === 0) {
      return { events: [], updatedSubmarines: updatedSubmarinesForReset, updatedCommandPoints: { ...commandPoints } };
    }

    const events: SubmarineEvent[] = [];
    let updatedCommandPoints = { ...commandPoints };
    let updatedSubmarines = [...updatedSubmarinesForReset];
    let successfulPatrols = 0;
    let totalDamage = { us: 0, china: 0 };

    for (const sub of activeSubmarines) {
      const patrolRoll = this.rollD20();

      if (patrolRoll <= 2) {
        const damageRoll = this.rollD20();
        const enemyFaction = sub.faction === 'us' ? 'china' : 'us';

        updatedCommandPoints[enemyFaction] = Math.max(0, updatedCommandPoints[enemyFaction] - damageRoll);
        totalDamage[enemyFaction] += damageRoll;
        successfulPatrols++;

        const zoneName = formatZoneName(sub.currentOrder?.targetId || '', operationalAreas);
        const targetId = sub.currentOrder?.targetId || '';

        // Create attacker event (no damage info)
        const attackerEvent = new EventBuilder()
          .setSubmarine(sub)
          .setTurnState(currentTurnState)
          .setEventType('attack_success')
          .setTarget(targetId, zoneName, 'area')
          .setDescription(PatrolTemplates.successAttacker(zoneName))
          .setRolls(patrolRoll, 2, damageRoll, 20)
          .build();

        // Create defender event (with damage info)
        const defenderEvent = new EventBuilder()
          .setSubmarine(sub)
          .setFaction(enemyFaction)
          .setTurnState(currentTurnState)
          .setEventType('attack_success')
          .setTarget(targetId, zoneName, 'area')
          .setDamage(damageRoll)
          .setDescription(PatrolTemplates.successDefender(zoneName, damageRoll))
          .setRolls(patrolRoll, 2, damageRoll, 20)
          .build();

        events.push(attackerEvent, defenderEvent);
        updatedSubmarines = this.updateSubmarineAfterPatrol(updatedSubmarines, sub, currentTurnState, true);
      } else {
        // Failed patrol - no events created (fog of war)
        updatedSubmarines = this.updateSubmarineAfterPatrol(updatedSubmarines, sub, currentTurnState, false);
      }
    }

    if (successfulPatrols > 0) {
      console.log(`🔍 Patrols: ${successfulPatrols}/${activeSubmarines.length} successful (US: -${totalDamage.us} CP, China: -${totalDamage.china} CP)`);
    }

    return { events, updatedSubmarines, updatedCommandPoints };
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
   * Update submarine state after patrol mission
   */
  private static updateSubmarineAfterPatrol(
    submarines: SubmarineDeployment[],
    sub: SubmarineDeployment,
    currentTurnState: TurnState,
    success: boolean
  ): SubmarineDeployment[] {
    const subIndex = submarines.findIndex(s => s.id === sub.id);
    if (subIndex === -1) return submarines;

    const updated = [...submarines];
    updated[subIndex] = {
      ...updated[subIndex],
      currentOrder: sub.currentOrder ? {
        ...sub.currentOrder,
        status: 'pending', // Keep patrol active for next turn
        resolvedTurn: currentTurnState.turnNumber,
        result: success ? 'success' : 'failure'
      } : undefined,
      missionsCompleted: updated[subIndex].missionsCompleted + 1
    };

    return updated;
  }
}
