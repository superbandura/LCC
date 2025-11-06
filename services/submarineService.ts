/**
 * SubmarineService
 *
 * Handles all submarine campaign mechanics including:
 * - Patrol operations and logistics damage
 * - Attack operations against bases
 * - Event generation for both factions
 * - Submarine state updates
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
  CommandPoints,
  Location,
  OperationalArea,
  OperationalData,
  TaskForce,
  Unit,
  Card,
  Faction,
  AswShipDeployment
} from '../types';

export interface SubmarinePatrolResult {
  events: SubmarineEvent[];
  updatedSubmarines: SubmarineDeployment[];
  updatedCommandPoints: CommandPoints;
}

export interface SubmarineAttackResult {
  events: SubmarineEvent[];
  updatedSubmarines: SubmarineDeployment[];
  updatedLocations: Location[];
}

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
 * SubmarineService class
 * Contains all submarine campaign logic
 */
export class SubmarineService {
  /**
   * Process submarine patrol orders
   * Patrols have 10% success rate (roll ≤2 on d20)
   * Successful patrols deal d20 damage to enemy command points
   */
  static async processPatrols(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    commandPoints: CommandPoints,
    operationalAreas: OperationalArea[]
  ): Promise<SubmarinePatrolResult> {
    if (!submarineCampaign) {
      return { events: [], updatedSubmarines: [], updatedCommandPoints: { ...commandPoints } };
    }

    // Reset completed patrol orders
    let updatedSubmarinesForReset = submarineCampaign.deployedSubmarines.map(sub => {
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

    // Filter active submarines with pending patrol orders
    const activeSubmarines = updatedSubmarinesForReset.filter(
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

  /**
   * Process submarine attack orders
   * Attacks have 50% success rate (roll ≤10 on d20)
   * Successful attacks deal 1-2 damage points to target base
   */
  static async processAttacks(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    locations: Location[]
  ): Promise<SubmarineAttackResult> {
    if (!submarineCampaign) {
      return { events: [], updatedSubmarines: [], updatedLocations: [...locations] };
    }

    // Filter active attack orders ready for execution
    const pendingAttacks = submarineCampaign.deployedSubmarines.filter(
      sub => sub.status === 'active' &&
             sub.currentOrder?.orderType === 'attack' &&
             sub.currentOrder?.status === 'pending' &&
             sub.currentOrder?.executionTurn !== undefined &&
             currentTurnState.turnNumber >= sub.currentOrder.executionTurn
    );

    if (pendingAttacks.length === 0) {
      return { events: [], updatedSubmarines: submarineCampaign.deployedSubmarines, updatedLocations: [...locations] };
    }

    const events: SubmarineEvent[] = [];
    let updatedLocations = [...locations];
    let updatedSubmarines = [...submarineCampaign.deployedSubmarines];
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
  // COMMUNICATION FAILURE MECHANICS
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

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

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
    cards: Card[]
  ): Promise<ASWResult> {
    if (!submarineCampaign) {
      return { events: [], updatedSubmarines: [], eliminatedSubmarineIds: [] };
    }

    // Identify submarines in South China Sea (attack or patrol orders)
    const submarinesInSouthChinaSea = submarineCampaign.deployedSubmarines.filter(
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
      .filter(sub => sub.currentOrder?.orderType === 'patrol')
      .map(sub => ({
        id: sub.id,
        name: sub.submarineName,
        faction: sub.faction,
        type: 'submarine' as const,
        areaId: undefined,
        areaName: 'South China Sea'
      }));

    allASWElements.push(...patrolSubmarines);

    if (allASWElements.length === 0) {
      return { events: [], updatedSubmarines: submarineCampaign.deployedSubmarines, eliminatedSubmarineIds: [] };
    }

    // Process ASW detection attempts
    const events: SubmarineEvent[] = [];
    const eliminatedSubmarineIds: string[] = [];
    let updatedSubmarines = [...submarineCampaign.deployedSubmarines];
    let detectionAttempts = 0;
    let successfulDetections = 0;

    for (const aswElement of allASWElements) {
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
   * Roll for damage (1-2 points for submarine attacks)
   */
  private static rollDamage(): number {
    return Math.floor(Math.random() * 2) + 1;
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
      assignedTurn: currentTurnState.turnNumber
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

  /**
   * Create ASW elimination events (attacker and defender perspectives)
   */
  private static createASWEliminationEvents(
    aswCard: SubmarineDeployment,
    targetSubmarine: SubmarineDeployment,
    currentTurnState: TurnState
  ): { attackerEvent: SubmarineEvent; defenderEvent: SubmarineEvent } {
    // Event for ASW operator (attacker)
    const attackerEvent: SubmarineEvent = {
      eventId: `asw-elim-attacker-${Date.now()}-${Math.random()}`,
      submarineId: aswCard.id,
      submarineName: aswCard.submarineName,
      faction: aswCard.faction,
      cardId: aswCard.cardId,
      cardName: aswCard.cardName,
      submarineType: aswCard.submarineType,
      eventType: 'attack_success', // Reuse existing event type
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: targetSubmarine.id,
        targetName: targetSubmarine.submarineName,
        targetType: 'unit' // Submarine is a unit
      },
      description: `ASW operation successful - Enemy submarine ${targetSubmarine.submarineName} detected and eliminated`
    };

    // Event for submarine crew (defender)
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
        targetId: aswCard.id,
        targetName: aswCard.submarineName,
        targetType: 'unit'
      },
      description: `Submarine ${targetSubmarine.submarineName} destroyed by enemy ASW forces (${aswCard.cardName})`
    };

    return { attackerEvent, defenderEvent };
  }

  /**
   * Create ASW detection event (only for attacker - defender doesn't know)
   */
  private static createASWDetectionEvent(
    aswCard: SubmarineDeployment,
    targetSubmarine: SubmarineDeployment,
    currentTurnState: TurnState
  ): SubmarineEvent {
    return {
      eventId: `asw-detection-${Date.now()}-${Math.random()}`,
      submarineId: aswCard.id,
      submarineName: aswCard.submarineName,
      faction: aswCard.faction,
      cardId: aswCard.cardId,
      cardName: aswCard.cardName,
      submarineType: aswCard.submarineType,
      eventType: 'detected',
      timestamp: Date.now(),
      turn: currentTurnState.turnNumber,
      dayOfWeek: currentTurnState.dayOfWeek,
      targetInfo: {
        targetId: targetSubmarine.id,
        targetName: targetSubmarine.submarineName,
        targetType: 'unit'
      },
      description: `Enemy submarine detected but evaded - ${targetSubmarine.submarineName} escaped`
    };
  }
}
