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
    const activeSubmarines = uniqueSubmarines.filter(
      sub => sub.status === 'active' &&
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

        const zoneName = this.getZoneName(sub.currentOrder?.targetId || '', operationalAreas);
        const { attackerEvent, defenderEvent } = this.createPatrolEvents(
          sub,
          currentTurnState,
          zoneName,
          patrolRoll,
          damageRoll,
          enemyFaction
        );

        events.push(attackerEvent, defenderEvent);
        updatedSubmarines = this.updateSubmarineAfterPatrol(updatedSubmarines, sub, currentTurnState, true);
      } else {
        // Failed patrol - create failure events for admin detailed report
        const zoneName = this.getZoneName(sub.currentOrder?.targetId || '', operationalAreas);
        const { attackerEvent, defenderEvent } = this.createPatrolFailureEvents(
          sub,
          currentTurnState,
          zoneName,
          patrolRoll
        );

        events.push(attackerEvent, defenderEvent);
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
   * Get zone name from target ID
   */
  private static getZoneName(targetId: string, operationalAreas: OperationalArea[]): string {
    if (targetId === 'south-china-sea') {
      return 'Mar de China';
    }
    const area = operationalAreas.find(a => a.id === targetId);
    return area?.name || 'Zona desconocida';
  }

  /**
   * Create dual patrol events (attacker and defender perspectives)
   */
  private static createPatrolEvents(
    sub: SubmarineDeployment,
    currentTurnState: TurnState,
    zoneName: string,
    patrolRoll: number,
    damageRoll: number,
    enemyFaction: 'us' | 'china'
  ): { attackerEvent: SubmarineEvent; defenderEvent: SubmarineEvent } {
    // Event for attacker (no damage info - generic success message)
    const attackerEvent: SubmarineEvent = {
      eventId: `event-${sub.id}-attacker-${Date.now()}`,
      submarineId: sub.id,
      submarineName: sub.submarineName,
      faction: sub.faction,
      cardId: sub.cardId,
      cardName: sub.cardName,
      eventType: 'attack_success',
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: sub.currentOrder?.targetId || '',
        targetName: zoneName,
        targetType: 'area'
      },
      description: `Successful patrol in ${zoneName} - Enemy logistics affected`,
      rollDetails: {
        primaryRoll: patrolRoll,
        secondaryRoll: damageRoll,
        primaryThreshold: 2,
        secondaryThreshold: 20
      }
    };

    // Event for defender (with damage info showing command points lost)
    const defenderEvent: SubmarineEvent = {
      eventId: `event-${sub.id}-defender-${Date.now()}`,
      submarineId: sub.id,
      submarineName: sub.submarineName,
      faction: enemyFaction, // Event belongs to defender's faction
      cardId: sub.cardId,
      cardName: sub.cardName,
      eventType: 'attack_success',
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: sub.currentOrder?.targetId || '',
        targetName: zoneName,
        targetType: 'area',
        damageDealt: damageRoll
      },
      description: `Logistics affected in ${zoneName} - ${damageRoll} command ${damageRoll === 1 ? 'point' : 'points'} lost`,
      rollDetails: {
        primaryRoll: patrolRoll,
        secondaryRoll: damageRoll,
        primaryThreshold: 2,
        secondaryThreshold: 20
      }
    };

    return { attackerEvent, defenderEvent };
  }

  /**
   * Create dual patrol failure events (attacker and defender perspectives)
   */
  private static createPatrolFailureEvents(
    sub: SubmarineDeployment,
    currentTurnState: TurnState,
    zoneName: string,
    patrolRoll: number
  ): { attackerEvent: SubmarineEvent; defenderEvent: SubmarineEvent } {
    // Event for attacker (submarine operator's view)
    const attackerEvent: SubmarineEvent = {
      eventId: `event-${sub.id}-attacker-failed-${Date.now()}`,
      submarineId: sub.id,
      submarineName: sub.submarineName,
      faction: sub.faction,
      cardId: sub.cardId,
      cardName: sub.cardName,
      eventType: 'attack_failure',
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: sub.currentOrder?.targetId || '',
        targetName: zoneName,
        targetType: 'area'
      },
      description: `Failed patrol in ${zoneName} - No enemy activity detected`,
      rollDetails: {
        primaryRoll: patrolRoll,
        primaryThreshold: 2
      }
    };

    // Event for defender (enemy faction's view - patrol detected and avoided)
    const enemyFaction = sub.faction === 'us' ? 'china' : 'us';
    const defenderEvent: SubmarineEvent = {
      eventId: `event-${sub.id}-defender-failed-${Date.now()}`,
      submarineId: sub.id,
      submarineName: sub.submarineName,
      faction: enemyFaction,
      cardId: sub.cardId,
      cardName: sub.cardName,
      eventType: 'attack_failure',
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: sub.currentOrder?.targetId || '',
        targetName: zoneName,
        targetType: 'area'
      },
      description: `Enemy patrol in ${zoneName} - No impact on operations`,
      rollDetails: {
        primaryRoll: patrolRoll,
        primaryThreshold: 2
      }
    };

    return { attackerEvent, defenderEvent };
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
