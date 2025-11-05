/**
 * DestructionService
 *
 * Handles all unit destruction tracking mechanics including:
 * - Detection of newly destroyed units
 * - Detection of revived units (by admin)
 * - Creation of destruction records
 * - Log management
 *
 * This service is pure and testable - it doesn't directly modify Firebase,
 * but returns updated data structures for the caller to persist.
 */

import {
  Unit,
  TaskForce,
  OperationalArea,
  DestructionRecord
} from '../types';

export interface DestructionTrackingResult {
  updatedLog: DestructionRecord[];
  logChanged: boolean;
  newDestructions: DestructionRecord[];
  revivals: string[]; // Array of unit IDs that were revived
}

/**
 * DestructionService class
 * Contains all destruction tracking logic
 */
export class DestructionService {
  /**
   * Track unit destructions and revivals
   * Compares current unit state with existing destruction log
   * Returns updated log and change information
   */
  static trackDestructions(
    units: Unit[],
    taskForces: TaskForce[],
    operationalAreas: OperationalArea[],
    currentDestructionLog: DestructionRecord[]
  ): DestructionTrackingResult {
    // Skip if no units (initial state)
    if (units.length === 0) {
      return {
        updatedLog: currentDestructionLog,
        logChanged: false,
        newDestructions: [],
        revivals: []
      };
    }

    let logChanged = false;
    let updatedLog = [...currentDestructionLog];
    const newDestructions: DestructionRecord[] = [];
    const revivals: string[] = [];

    // Check each unit for destruction or resurrection
    units.forEach((unit) => {
      const damageCount = unit.currentDamage.filter(d => d).length;
      const isDestroyed = damageCount === unit.damagePoints;
      const isLogged = currentDestructionLog.some(record => record.unitId === unit.id);

      if (isDestroyed && !isLogged) {
        // Unit just got destroyed - add to log
        const destructionRecord = this.createDestructionRecord(
          unit,
          taskForces,
          operationalAreas
        );

        updatedLog = [...updatedLog, destructionRecord];
        newDestructions.push(destructionRecord);
        logChanged = true;

        console.log(`Unit destroyed: ${unit.name} (${unit.type})`);
      } else if (!isDestroyed && isLogged) {
        // Unit was revived by admin - remove from log
        updatedLog = updatedLog.filter(record => record.unitId !== unit.id);
        revivals.push(unit.id);
        logChanged = true;

        console.log(`Unit revived by admin: ${unit.name} (${unit.type})`);
      }
    });

    return {
      updatedLog,
      logChanged,
      newDestructions,
      revivals
    };
  }

  /**
   * Create a destruction record for a unit
   * Includes context about task force and operational area
   */
  static createDestructionRecord(
    unit: Unit,
    taskForces: TaskForce[],
    operationalAreas: OperationalArea[]
  ): DestructionRecord {
    const taskForce = taskForces.find(tf => tf.id === unit.taskForceId);
    const operationalArea = taskForce
      ? operationalAreas.find(area => area.id === taskForce.operationalAreaId)
      : undefined;

    return {
      unitId: unit.id,
      unitName: unit.name,
      unitType: unit.type,
      faction: unit.faction,
      timestamp: Date.now(),
      operationalAreaId: operationalArea?.id,
      operationalAreaName: operationalArea?.name,
      taskForceId: taskForce?.id,
      taskForceName: taskForce?.name,
    };
  }

  /**
   * Check if a unit is destroyed
   */
  static isUnitDestroyed(unit: Unit): boolean {
    const damageCount = unit.currentDamage.filter(d => d).length;
    return damageCount >= unit.damagePoints;
  }

  /**
   * Get all destroyed units
   */
  static getDestroyedUnits(units: Unit[]): Unit[] {
    return units.filter(unit => this.isUnitDestroyed(unit));
  }

  /**
   * Get destruction statistics by faction
   */
  static getDestructionStatsByFaction(
    destructionLog: DestructionRecord[]
  ): { us: number; china: number } {
    return {
      us: destructionLog.filter(record => record.faction === 'us').length,
      china: destructionLog.filter(record => record.faction === 'china').length
    };
  }

  /**
   * Get destruction statistics by unit type
   */
  static getDestructionStatsByType(
    destructionLog: DestructionRecord[]
  ): Record<string, number> {
    const stats: Record<string, number> = {};

    destructionLog.forEach(record => {
      const type = record.unitType;
      stats[type] = (stats[type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get recent destructions within a time window (in milliseconds)
   */
  static getRecentDestructions(
    destructionLog: DestructionRecord[],
    timeWindowMs: number = 3600000 // Default: 1 hour
  ): DestructionRecord[] {
    const now = Date.now();
    return destructionLog.filter(
      record => (now - record.timestamp) <= timeWindowMs
    );
  }

  /**
   * Get destructions for a specific operational area
   */
  static getDestructionsByArea(
    destructionLog: DestructionRecord[],
    areaId: string
  ): DestructionRecord[] {
    return destructionLog.filter(
      record => record.operationalAreaId === areaId
    );
  }

  /**
   * Get destructions for a specific task force
   */
  static getDestructionsByTaskForce(
    destructionLog: DestructionRecord[],
    taskForceId: string
  ): DestructionRecord[] {
    return destructionLog.filter(
      record => record.taskForceId === taskForceId
    );
  }

  /**
   * Calculate combat effectiveness (% of units still operational)
   * For a specific faction
   */
  static calculateCombatEffectiveness(
    units: Unit[],
    faction: 'us' | 'china'
  ): number {
    const factionUnits = units.filter(u => u.faction === faction);
    if (factionUnits.length === 0) return 100;

    const operationalUnits = factionUnits.filter(u => !this.isUnitDestroyed(u));
    return Math.round((operationalUnits.length / factionUnits.length) * 100);
  }

  /**
   * Check if a task force is completely destroyed
   * (all units destroyed)
   */
  static isTaskForceDestroyed(
    taskForce: TaskForce,
    units: Unit[]
  ): boolean {
    const tfUnits = units.filter(u => u.taskForceId === taskForce.id);

    if (tfUnits.length === 0) {
      return false; // No units = not destroyed, just empty
    }

    return tfUnits.every(unit => this.isUnitDestroyed(unit));
  }

  /**
   * Get all completely destroyed task forces
   */
  static getDestroyedTaskForces(
    taskForces: TaskForce[],
    units: Unit[]
  ): TaskForce[] {
    return taskForces.filter(tf => this.isTaskForceDestroyed(tf, units));
  }
}
