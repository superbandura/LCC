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
import { EventBuilder } from '../events/EventBuilder';
import { AttackTemplates } from '../events/EventTemplates';

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

        const targetId = sub.currentOrder?.targetId || '';
        const defenderFaction = sub.faction === 'us' ? 'china' : 'us';

        // Create attacker event (no damage info)
        const attackerEvent = new EventBuilder()
          .setSubmarine(sub)
          .setTurnState(currentTurnState)
          .setEventType('attack_success')
          .setTarget(targetId, targetBaseName, 'base')
          .setDescription(AttackTemplates.launchedAttacker(targetBaseName))
          .setRolls(attackRoll, 10, damageRoll, 2)
          .setExecutionTurn(sub.currentOrder?.executionTurn)
          .build();

        // Create defender event (with damage info)
        const defenderEvent = new EventBuilder()
          .setSubmarine(sub)
          .setFaction(defenderFaction)
          .setTurnState(currentTurnState)
          .setEventType('attack_success')
          .setTarget(targetId, targetBaseName, 'base')
          .setDamage(damageApplied)
          .setDescription(AttackTemplates.successDefender(targetBaseName, damageApplied))
          .setRolls(attackRoll, 10, damageRoll, 2)
          .setExecutionTurn(sub.currentOrder?.executionTurn)
          .build();

        events.push(attackerEvent, defenderEvent);

        updatedSubmarines = this.updateSubmarineAfterAttack(
          updatedSubmarines,
          sub,
          currentTurnState,
          targetBase,
          updatedLocations,
          true
        );
      } else {
        const targetId = sub.currentOrder?.targetId || '';

        // Create attacker event only (failed attacks are not detected by defender - fog of war)
        const attackerEvent = new EventBuilder()
          .setSubmarine(sub)
          .setTurnState(currentTurnState)
          .setEventType('attack_failure')
          .setTarget(targetId, targetBaseName, 'base')
          .setDescription(AttackTemplates.launchedAttacker(targetBaseName))
          .setRolls(attackRoll, 10)
          .setExecutionTurn(sub.currentOrder?.executionTurn)
          .build();

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
