/**
 * AttackService
 *
 * Handles submarine attack operations:
 * - Attack mission execution with 50% success rate (roll ≤10 on d20)
 * - Base damage calculation (1-2 damage points)
 * - Event generation for both factions
 * - Submarine state updates after attack completion
 * - Automatic patrol order assignment after attacks
 *
 * This service is pure and testable - it doesn't directly modify Firebase,
 * but returns updated data structures for the caller to persist.
 */

import {
  SubmarineCampaignState,
  SubmarineEvent,
  SubmarineDeployment,
  SubmarineOrder,
  TurnState,
  Location
} from '../../types';

export interface SubmarineAttackResult {
  events: SubmarineEvent[];
  updatedSubmarines: SubmarineDeployment[];
  updatedLocations: Location[];
}

/**
 * AttackService class
 * Contains all submarine attack logic
 */
export class AttackService {
  /**
   * Process submarine attack orders
   * Attacks have 50% success rate (roll ≤10 on d20)
   * Successful attacks deal 1-2 damage points to target base
   */
  static async processAttacks(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    locations: Location[],
    submarines?: SubmarineDeployment[]
  ): Promise<SubmarineAttackResult> {
    if (!submarineCampaign) {
      return { events: [], updatedSubmarines: [], updatedLocations: [...locations] };
    }

    // Use provided submarines or fall back to campaign submarines
    const sourceSubmarines = submarines || submarineCampaign.deployedSubmarines;

    // Filter active attack orders ready for execution
    const pendingAttacks = sourceSubmarines.filter(
      sub => sub.status === 'active' &&
             sub.currentOrder?.orderType === 'attack' &&
             sub.currentOrder?.status === 'pending' &&
             sub.currentOrder?.executionDate !== undefined &&
             currentTurnState.currentDate >= sub.currentOrder.executionDate
    );

    if (pendingAttacks.length === 0) {
      return { events: [], updatedSubmarines: sourceSubmarines, updatedLocations: [...locations] };
    }

    const events: SubmarineEvent[] = [];
    let updatedLocations = [...locations];
    let updatedSubmarines = [...sourceSubmarines];
    let successfulAttacks = 0;
    let totalDamage = 0;

    for (const sub of pendingAttacks) {
      const attackRoll = this.rollD20();
      const targetBase = updatedLocations.find(loc => loc.id === sub.currentOrder?.targetId);
      const targetBaseName = targetBase?.name || 'Base Desconocida';

      if (attackRoll <= 10) {
        const { damageApplied, updatedDamage, damageRoll } = this.applyDamageToBase(targetBase);

        if (targetBase && damageApplied > 0) {
          updatedLocations = updatedLocations.map(loc =>
            loc.id === targetBase.id ? { ...loc, currentDamage: updatedDamage } : loc
          );
          totalDamage += damageApplied;
          successfulAttacks++;
        }

        const { attackerEvent, defenderEvent } = this.createAttackSuccessEvents(
          sub,
          currentTurnState,
          targetBaseName,
          attackRoll,
          damageRoll,
          damageApplied
        );

        events.push(attackerEvent);
        if (defenderEvent) events.push(defenderEvent);

        updatedSubmarines = this.updateSubmarineAfterAttack(
          updatedSubmarines,
          sub,
          currentTurnState,
          targetBase,
          updatedLocations,
          true
        );
      } else {
        const attackerEvent = this.createAttackFailureEvent(
          sub,
          currentTurnState,
          targetBaseName,
          attackRoll
        );
        events.push(attackerEvent);
        updatedSubmarines = this.updateSubmarineAfterAttack(
          updatedSubmarines,
          sub,
          currentTurnState,
          targetBase,
          updatedLocations,
          false
        );
      }
    }

    if (successfulAttacks > 0) {
      console.log(`🎯 Attacks: ${successfulAttacks}/${pendingAttacks.length} successful (${totalDamage} damage to bases)`);
    }

    return {
      events,
      updatedSubmarines,
      updatedLocations
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
   * Roll for damage (1-2 points for submarine attacks)
   */
  private static rollDamage(): number {
    return Math.floor(Math.random() * 2) + 1;
  }

  /**
   * Apply damage to a base and return the result
   */
  private static applyDamageToBase(
    targetBase: Location | undefined
  ): { damageApplied: number; updatedDamage: boolean[]; damageRoll: number } {
    if (!targetBase) {
      return { damageApplied: 0, updatedDamage: [], damageRoll: 0 };
    }

    const damageRoll = this.rollDamage();
    const updatedDamage = [...targetBase.currentDamage];
    let damageApplied = 0;

    for (let i = 0; i < damageRoll; i++) {
      const firstUndamagedIndex = updatedDamage.findIndex(d => !d);
      if (firstUndamagedIndex !== -1) {
        updatedDamage[firstUndamagedIndex] = true;
        damageApplied++;
      } else {
        break; // Base already fully damaged
      }
    }

    return { damageApplied, updatedDamage, damageRoll };
  }

  /**
   * Create attack success events (attacker and defender)
   */
  private static createAttackSuccessEvents(
    sub: SubmarineDeployment,
    currentTurnState: TurnState,
    targetBaseName: string,
    attackRoll: number,
    damageRoll: number,
    damageApplied: number
  ): { attackerEvent: SubmarineEvent; defenderEvent: SubmarineEvent | null } {
    // Event for attacker (no damage info)
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
        targetName: targetBaseName,
        targetType: 'base'
      },
      description: `Missile attack launched against ${targetBaseName}`,
      rollDetails: {
        primaryRoll: attackRoll,
        secondaryRoll: damageRoll,
        primaryThreshold: 10,
        secondaryThreshold: 2,
        executionTurn: sub.currentOrder?.executionTurn
      }
    };

    // Event for defender (with damage info)
    const defenderFaction = sub.faction === 'us' ? 'china' : 'us';
    const defenderEvent: SubmarineEvent = {
      eventId: `event-${sub.id}-defender-${Date.now()}`,
      submarineId: sub.id,
      submarineName: sub.submarineName,
      faction: defenderFaction, // Event belongs to defender's faction
      cardId: sub.cardId,
      cardName: sub.cardName,
      eventType: 'attack_success',
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: sub.currentOrder?.targetId || '',
        targetName: targetBaseName,
        targetType: 'base',
        damageDealt: damageApplied
      },
      description: `Base ${targetBaseName} attacked - ${damageApplied} damage ${damageApplied === 1 ? 'point' : 'points'}`,
      rollDetails: {
        primaryRoll: attackRoll,
        secondaryRoll: damageRoll,
        primaryThreshold: 10,
        secondaryThreshold: 2,
        executionTurn: sub.currentOrder?.executionTurn
      }
    };

    return { attackerEvent, defenderEvent };
  }

  /**
   * Create attack failure event (attacker only)
   */
  private static createAttackFailureEvent(
    sub: SubmarineDeployment,
    currentTurnState: TurnState,
    targetBaseName: string,
    attackRoll: number
  ): SubmarineEvent {
    return {
      eventId: `event-${sub.id}-attacker-${Date.now()}`,
      submarineId: sub.id,
      submarineName: sub.submarineName,
      faction: sub.faction,
      cardId: sub.cardId,
      cardName: sub.cardName,
      eventType: 'attack_success', // We still report as success to attacker
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: sub.currentOrder?.targetId || '',
        targetName: targetBaseName,
        targetType: 'base'
      },
      description: `Missile attack launched against ${targetBaseName}`,
      rollDetails: {
        primaryRoll: attackRoll,
        primaryThreshold: 10,
        executionTurn: sub.currentOrder?.executionTurn
      }
    };
  }

  /**
   * Update submarine state after attack mission
   */
  private static updateSubmarineAfterAttack(
    submarines: SubmarineDeployment[],
    sub: SubmarineDeployment,
    currentTurnState: TurnState,
    targetBase: Location | undefined,
    updatedLocations: Location[],
    success: boolean
  ): SubmarineDeployment[] {
    const subIndex = submarines.findIndex(s => s.id === sub.id);
    if (subIndex === -1) return submarines;

    // Create new patrol order in south-china-sea
    const newPatrolOrder: SubmarineOrder = {
      orderId: `order-${sub.id}-patrol-${Date.now()}`,
      submarineId: sub.id,
      orderType: 'patrol',
      status: 'pending',
      targetId: 'south-china-sea',
      targetType: 'area',
      assignedTurn: currentTurnState.turnNumber,
      assignedDate: currentTurnState.currentDate
    };

    // Check if target was destroyed
    const wasTargetDestroyed = targetBase &&
      updatedLocations.find(l => l.id === targetBase.id)?.currentDamage.every(d => d);

    const updated = [...submarines];
    updated[subIndex] = {
      ...updated[subIndex],
      currentOrder: newPatrolOrder,
      missionsCompleted: updated[subIndex].missionsCompleted + 1,
      totalKills: updated[subIndex].totalKills + (success && wasTargetDestroyed ? 1 : 0)
    };

    console.log(`🔄 POST-ATTACK - ${sub.submarineName}: ${success ? 'Attack completed' : 'Attack failed'}, assigned patrol order in South China Sea`);

    return updated;
  }
}
