/**
 * DeploymentService
 *
 * Handles all deployment-related mechanics including:
 * - Activation timing calculations
 * - Deployment status checks
 * - Cleanup of invalid deployments
 * - Arrival calculations and processing
 *
 * This service is pure and testable - it doesn't directly modify Firebase,
 * but returns updated data structures for the caller to persist.
 */

import {
  TurnState,
  PendingDeployments,
  PendingCardDeployment,
  PendingTaskForceDeployment,
  PendingUnitDeployment,
  Card,
  TaskForce,
  Unit,
  OperationalArea
} from '../types';

export interface ActivationTiming {
  activatesAtTurn: number;
  activatesAtDay: number;
}

export interface ArrivalResults {
  arrivedCards: Card[];
  arrivedTaskForces: TaskForce[];
  arrivedUnits: Unit[];
  arrivedCardDeployments: PendingCardDeployment[];
  arrivedTaskForceDeployments: PendingTaskForceDeployment[];
  arrivedUnitDeployments: PendingUnitDeployment[];
}

export interface ActivationResult {
  updatedAreas?: OperationalArea[];
  updatedCards?: Card[];
  updatedTaskForces?: TaskForce[];
  updatedUnits?: Unit[];
  updatedPendingDeployments: PendingDeployments;
}

/**
 * DeploymentService class
 * Contains all deployment timing and activation logic
 */
export class DeploymentService {
  /**
   * Calculate when a deployment will activate based on deployment time
   * Takes current turn state and deployment time (in days) and returns activation timing
   */
  static calculateActivationTiming(
    currentTurnState: TurnState,
    deploymentTime: number
  ): ActivationTiming {
    if (currentTurnState.isPlanningPhase) {
      // In planning phase, ignore deployment time - activate immediately
      return { activatesAtTurn: 0, activatesAtDay: currentTurnState.dayOfWeek };
    }

    let daysToAdd = deploymentTime;
    let currentDay = currentTurnState.dayOfWeek;
    let currentTurn = currentTurnState.turnNumber;

    while (daysToAdd > 0) {
      currentDay++;
      if (currentDay > 7) {
        currentDay = 1;
        currentTurn++;
      }
      daysToAdd--;
    }

    return { activatesAtTurn: currentTurn, activatesAtDay: currentDay };
  }

  /**
   * Check if a deployment is currently active
   * Returns true if deployment time has been reached
   */
  static isDeploymentActive(
    deployment: { activatesAtTurn: number; activatesAtDay: number },
    currentTurnState: TurnState
  ): boolean {
    if (currentTurnState.isPlanningPhase) {
      return true; // Everything operational in planning phase
    }

    // Compare turn and day
    if (deployment.activatesAtTurn < currentTurnState.turnNumber) {
      return true; // Past turn
    }
    if (deployment.activatesAtTurn === currentTurnState.turnNumber &&
        deployment.activatesAtDay <= currentTurnState.dayOfWeek) {
      return true; // Same turn, day reached
    }

    return false;
  }

  /**
   * Calculate which deployments have arrived for a specific faction
   * Returns arrays of arrived entities and their pending deployment records
   */
  static calculateArrivals(
    pendingDeployments: PendingDeployments,
    newTurnState: TurnState,
    faction: 'us' | 'china',
    cards: Card[],
    taskForces: TaskForce[],
    units: Unit[]
  ): ArrivalResults {
    const arrivedCards: Card[] = [];
    const arrivedTaskForces: TaskForce[] = [];
    const arrivedUnits: Unit[] = [];
    const arrivedCardDeployments: PendingCardDeployment[] = [];
    const arrivedTaskForceDeployments: PendingTaskForceDeployment[] = [];
    const arrivedUnitDeployments: PendingUnitDeployment[] = [];

    // Check which card deployments have arrived for this faction
    pendingDeployments.cards.forEach(pending => {
      if (this.isDeploymentActive(pending, newTurnState)) {
        const card = cards.find(c => c.id === pending.cardId);
        if (card && pending.faction === faction) {
          arrivedCards.push(card);
          arrivedCardDeployments.push(pending);
        }
      }
    });

    // Check which task force deployments have arrived for this faction
    pendingDeployments.taskForces.forEach(pending => {
      if (this.isDeploymentActive(pending, newTurnState)) {
        const tf = taskForces.find(t => t.id === pending.taskForceId);
        if (tf && pending.faction === faction) {
          arrivedTaskForces.push(tf);
          arrivedTaskForceDeployments.push(pending);
        }
      }
    });

    // Check which unit deployments have arrived for this faction
    pendingDeployments.units.forEach(pending => {
      if (this.isDeploymentActive(pending, newTurnState)) {
        const unit = units.find(u => u.id === pending.unitId);
        if (unit && pending.faction === faction) {
          arrivedUnits.push(unit);
          arrivedUnitDeployments.push(pending);
        }
      }
    });

    return {
      arrivedCards,
      arrivedTaskForces,
      arrivedUnits,
      arrivedCardDeployments,
      arrivedTaskForceDeployments,
      arrivedUnitDeployments
    };
  }

  /**
   * Process arrivals and activate deployed entities
   * Returns updated game state with deployments activated
   */
  static processArrivals(
    arrivals: ArrivalResults,
    operationalAreas: OperationalArea[],
    cards: Card[],
    taskForces: TaskForce[],
    units: Unit[],
    pendingDeployments: PendingDeployments,
    newTurnState: TurnState
  ): ActivationResult {
    let updatedAreas: OperationalArea[] | undefined;
    let updatedCards: Card[] | undefined;
    let updatedTaskForces: TaskForce[] | undefined;
    let updatedUnits: Unit[] | undefined;

    // Activate arrived cards (add to area.assignedCards)
    if (arrivals.arrivedCards.length > 0) {
      // Restore embarkedUnits to Cards that had them in pending deployments
      const deploymentsWithUnits = arrivals.arrivedCardDeployments.filter(
        p => p.embarkedUnits && p.embarkedUnits.length > 0
      );

      if (deploymentsWithUnits.length > 0) {
        updatedCards = cards.map(card => {
          const deployment = deploymentsWithUnits.find(p => p.cardId === card.id);
          if (deployment) {
            return {
              ...card,
              embarkedUnits: deployment.embarkedUnits
            };
          }
          return card;
        });
      }

      updatedAreas = operationalAreas.map(area => {
        const cardsForThisArea = arrivals.arrivedCardDeployments
          .filter(p => p.areaId === area.id)
          .map(p => p.cardInstanceId);

        if (cardsForThisArea.length > 0) {
          const currentCards = area.assignedCards || [];
          return {
            ...area,
            assignedCards: [...currentCards, ...cardsForThisArea],
          };
        }
        return area;
      });
    }

    // Activate arrived Task Forces (remove isPendingDeployment flag)
    if (arrivals.arrivedTaskForces.length > 0) {
      updatedTaskForces = taskForces.map(tf => {
        if (arrivals.arrivedTaskForces.some(a => a.id === tf.id)) {
          return { ...tf, isPendingDeployment: false };
        }
        return tf;
      });
    }

    // Activate arrived units (remove isPendingDeployment flag)
    if (arrivals.arrivedUnits.length > 0) {
      updatedUnits = units.map(u => {
        if (arrivals.arrivedUnits.some(a => a.id === u.id)) {
          return { ...u, isPendingDeployment: false };
        }
        return u;
      });
    }

    // Remove arrived deployments from pending
    const updatedPendingDeployments: PendingDeployments = {
      cards: pendingDeployments.cards.filter(
        pending => !this.isDeploymentActive(pending, newTurnState)
      ),
      taskForces: pendingDeployments.taskForces.filter(
        pending => !this.isDeploymentActive(pending, newTurnState)
      ),
      units: pendingDeployments.units.filter(
        pending => !this.isDeploymentActive(pending, newTurnState)
      )
    };

    return {
      updatedAreas,
      updatedCards,
      updatedTaskForces,
      updatedUnits,
      updatedPendingDeployments
    };
  }

  /**
   * Clean up pending deployments for destroyed units and Task Forces
   * Called when units are updated to ensure pending deployments remain valid
   */
  static cleanupDestroyedDeployments(
    updatedUnits: Unit[],
    currentTaskForces: TaskForce[],
    currentPendingDeployments: PendingDeployments
  ): PendingDeployments {
    // Find destroyed units (damageCount >= damagePoints)
    const destroyedUnitIds = new Set(
      updatedUnits
        .filter(unit => {
          const damageCount = unit.currentDamage.filter(d => d).length;
          return damageCount >= unit.damagePoints;
        })
        .map(unit => unit.id)
    );

    // Find completely destroyed Task Forces (all units destroyed)
    const destroyedTaskForceIds = new Set<string>();
    currentTaskForces.forEach(tf => {
      const tfUnits = updatedUnits.filter(u => u.taskForceId === tf.id);
      if (tfUnits.length > 0) {
        const allDestroyed = tfUnits.every(unit => {
          const damageCount = unit.currentDamage.filter(d => d).length;
          return damageCount >= unit.damagePoints;
        });
        if (allDestroyed) {
          destroyedTaskForceIds.add(tf.id);
        }
      }
    });

    // Clean up pending deployments
    const cleanedPending: PendingDeployments = {
      cards: currentPendingDeployments.cards, // Cards not affected by unit destruction
      units: currentPendingDeployments.units.filter(p => !destroyedUnitIds.has(p.unitId)),
      taskForces: currentPendingDeployments.taskForces.filter(p => !destroyedTaskForceIds.has(p.taskForceId))
    };

    return cleanedPending;
  }

  /**
   * Clean up pending card deployments for deleted operational areas
   * Called when operational areas are updated
   */
  static cleanupDeletedAreaDeployments(
    updatedAreas: OperationalArea[],
    currentPendingDeployments: PendingDeployments
  ): PendingDeployments {
    const validAreaIds = new Set(updatedAreas.map(area => area.id));

    // Remove pending cards for deleted areas
    const cleanedPending: PendingDeployments = {
      cards: currentPendingDeployments.cards.filter(p => validAreaIds.has(p.areaId)),
      units: currentPendingDeployments.units,
      taskForces: currentPendingDeployments.taskForces
    };

    return cleanedPending;
  }

  /**
   * Clean up pending unit deployments for deleted Task Forces
   * Called when task forces are updated
   */
  static cleanupDeletedTaskForceDeployments(
    updatedTaskForces: TaskForce[],
    currentPendingDeployments: PendingDeployments
  ): PendingDeployments {
    const validTaskForceIds = new Set(updatedTaskForces.map(tf => tf.id));

    // Remove pending units and TFs for deleted Task Forces
    const cleanedPending: PendingDeployments = {
      cards: currentPendingDeployments.cards,
      units: currentPendingDeployments.units.filter(p => validTaskForceIds.has(p.taskForceId)),
      taskForces: currentPendingDeployments.taskForces.filter(p => validTaskForceIds.has(p.taskForceId))
    };

    return cleanedPending;
  }

  /**
   * Unified cleanup function that checks all invalid deployment scenarios
   * Returns cleaned pending deployments
   */
  static cleanupAllInvalidDeployments(
    pendingDeployments: PendingDeployments,
    units: Unit[],
    taskForces: TaskForce[],
    operationalAreas: OperationalArea[]
  ): PendingDeployments {
    // First, cleanup destroyed units/task forces
    let cleaned = this.cleanupDestroyedDeployments(units, taskForces, pendingDeployments);

    // Then, cleanup deleted areas
    cleaned = this.cleanupDeletedAreaDeployments(operationalAreas, cleaned);

    // Finally, cleanup deleted task forces
    cleaned = this.cleanupDeletedTaskForceDeployments(taskForces, cleaned);

    return cleaned;
  }
}
