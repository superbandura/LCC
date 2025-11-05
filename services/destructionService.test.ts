import { describe, it, expect } from 'vitest';
import { DestructionService } from './destructionService';
import {
  Unit,
  TaskForce,
  OperationalArea,
  DestructionRecord
} from '../types';

describe('DestructionService', () => {
  describe('isUnitDestroyed', () => {
    it('should return true when all damage points are taken', () => {
      const unit: Unit = {
        id: 'unit-1',
        faction: 'us',
        name: 'Test Unit',
        damagePoints: 3,
        currentDamage: [true, true, true],
      } as Unit;

      expect(DestructionService.isUnitDestroyed(unit)).toBe(true);
    });

    it('should return false when some damage points remain', () => {
      const unit: Unit = {
        id: 'unit-1',
        faction: 'us',
        name: 'Test Unit',
        damagePoints: 3,
        currentDamage: [true, true, false],
      } as Unit;

      expect(DestructionService.isUnitDestroyed(unit)).toBe(false);
    });

    it('should return false when no damage taken', () => {
      const unit: Unit = {
        id: 'unit-1',
        faction: 'us',
        name: 'Test Unit',
        damagePoints: 3,
        currentDamage: [false, false, false],
      } as Unit;

      expect(DestructionService.isUnitDestroyed(unit)).toBe(false);
    });

    it('should handle unit with 1 damage point', () => {
      const destroyedUnit: Unit = {
        id: 'unit-1',
        faction: 'us',
        name: 'Test Unit',
        damagePoints: 1,
        currentDamage: [true],
      } as Unit;

      const aliveUnit: Unit = {
        id: 'unit-2',
        faction: 'us',
        name: 'Test Unit 2',
        damagePoints: 1,
        currentDamage: [false],
      } as Unit;

      expect(DestructionService.isUnitDestroyed(destroyedUnit)).toBe(true);
      expect(DestructionService.isUnitDestroyed(aliveUnit)).toBe(false);
    });
  });

  describe('getDestroyedUnits', () => {
    it('should return only destroyed units', () => {
      const units: Unit[] = [
        {
          id: 'unit-1',
          faction: 'us',
          name: 'Destroyed Unit',
          damagePoints: 2,
          currentDamage: [true, true],
        } as Unit,
        {
          id: 'unit-2',
          faction: 'us',
          name: 'Damaged Unit',
          damagePoints: 3,
          currentDamage: [true, false, false],
        } as Unit,
        {
          id: 'unit-3',
          faction: 'china',
          name: 'Another Destroyed Unit',
          damagePoints: 2,
          currentDamage: [true, true],
        } as Unit,
      ];

      const destroyed = DestructionService.getDestroyedUnits(units);

      expect(destroyed).toHaveLength(2);
      expect(destroyed.find(u => u.id === 'unit-1')).toBeDefined();
      expect(destroyed.find(u => u.id === 'unit-3')).toBeDefined();
    });

    it('should return empty array when no units are destroyed', () => {
      const units: Unit[] = [
        {
          id: 'unit-1',
          faction: 'us',
          name: 'Alive Unit',
          damagePoints: 2,
          currentDamage: [false, false],
        } as Unit,
      ];

      const destroyed = DestructionService.getDestroyedUnits(units);

      expect(destroyed).toHaveLength(0);
    });
  });

  describe('createDestructionRecord', () => {
    it('should create a destruction record with task force and area context', () => {
      const unit: Unit = {
        id: 'unit-1',
        faction: 'us',
        name: 'Test Unit',
        type: 'Infantry',
        taskForceId: 'tf-1',
      } as Unit;

      const taskForces: TaskForce[] = [
        {
          id: 'tf-1',
          name: 'Test TF',
          operationalAreaId: 'area-1',
        } as TaskForce,
      ];

      const areas: OperationalArea[] = [
        {
          id: 'area-1',
          name: 'Test Area',
        } as OperationalArea,
      ];

      const record = DestructionService.createDestructionRecord(unit, taskForces, areas);

      expect(record.unitId).toBe('unit-1');
      expect(record.unitName).toBe('Test Unit');
      expect(record.unitType).toBe('Infantry');
      expect(record.faction).toBe('us');
      expect(record.taskForceId).toBe('tf-1');
      expect(record.taskForceName).toBe('Test TF');
      expect(record.operationalAreaId).toBe('area-1');
      expect(record.operationalAreaName).toBe('Test Area');
      expect(record.timestamp).toBeGreaterThan(0);
    });

    it('should handle unit without task force', () => {
      const unit: Unit = {
        id: 'unit-1',
        faction: 'us',
        name: 'Test Unit',
        type: 'Infantry',
        taskForceId: undefined,
      } as Unit;

      const record = DestructionService.createDestructionRecord(unit, [], []);

      expect(record.unitId).toBe('unit-1');
      expect(record.taskForceId).toBeUndefined();
      expect(record.operationalAreaId).toBeUndefined();
    });
  });

  describe('trackDestructions', () => {
    it('should detect new destruction and add to log', () => {
      const units: Unit[] = [
        {
          id: 'unit-1',
          faction: 'us',
          name: 'Test Unit',
          type: 'Infantry',
          damagePoints: 2,
          currentDamage: [true, true], // Destroyed
        } as Unit,
      ];

      const taskForces: TaskForce[] = [];
      const areas: OperationalArea[] = [];
      const currentLog: DestructionRecord[] = [];

      const result = DestructionService.trackDestructions(units, taskForces, areas, currentLog);

      expect(result.logChanged).toBe(true);
      expect(result.updatedLog).toHaveLength(1);
      expect(result.newDestructions).toHaveLength(1);
      expect(result.revivals).toHaveLength(0);
      expect(result.updatedLog[0].unitId).toBe('unit-1');
    });

    it('should detect revival and remove from log', () => {
      const units: Unit[] = [
        {
          id: 'unit-1',
          faction: 'us',
          name: 'Test Unit',
          type: 'Infantry',
          damagePoints: 2,
          currentDamage: [true, false], // Revived by admin
        } as Unit,
      ];

      const taskForces: TaskForce[] = [];
      const areas: OperationalArea[] = [];
      const currentLog: DestructionRecord[] = [
        {
          unitId: 'unit-1',
          unitName: 'Test Unit',
          unitType: 'Infantry',
          faction: 'us',
          timestamp: Date.now(),
        },
      ];

      const result = DestructionService.trackDestructions(units, taskForces, areas, currentLog);

      expect(result.logChanged).toBe(true);
      expect(result.updatedLog).toHaveLength(0);
      expect(result.newDestructions).toHaveLength(0);
      expect(result.revivals).toHaveLength(1);
      expect(result.revivals[0]).toBe('unit-1');
    });

    it('should not change log when no destructions or revivals', () => {
      const units: Unit[] = [
        {
          id: 'unit-1',
          faction: 'us',
          name: 'Test Unit',
          type: 'Infantry',
          damagePoints: 2,
          currentDamage: [true, false],
        } as Unit,
      ];

      const taskForces: TaskForce[] = [];
      const areas: OperationalArea[] = [];
      const currentLog: DestructionRecord[] = [];

      const result = DestructionService.trackDestructions(units, taskForces, areas, currentLog);

      expect(result.logChanged).toBe(false);
      expect(result.updatedLog).toHaveLength(0);
      expect(result.newDestructions).toHaveLength(0);
      expect(result.revivals).toHaveLength(0);
    });

    it('should handle empty units array', () => {
      const units: Unit[] = [];
      const taskForces: TaskForce[] = [];
      const areas: OperationalArea[] = [];
      const currentLog: DestructionRecord[] = [];

      const result = DestructionService.trackDestructions(units, taskForces, areas, currentLog);

      expect(result.logChanged).toBe(false);
      expect(result.updatedLog).toHaveLength(0);
    });

    it('should handle multiple destructions and revivals simultaneously', () => {
      const units: Unit[] = [
        {
          id: 'unit-1',
          faction: 'us',
          name: 'Newly Destroyed',
          type: 'Infantry',
          damagePoints: 2,
          currentDamage: [true, true], // Just destroyed
        } as Unit,
        {
          id: 'unit-2',
          faction: 'us',
          name: 'Revived Unit',
          type: 'Tank',
          damagePoints: 3,
          currentDamage: [true, false, false], // Revived
        } as Unit,
        {
          id: 'unit-3',
          faction: 'china',
          name: 'Stays Destroyed',
          type: 'Artillery',
          damagePoints: 2,
          currentDamage: [true, true], // Already destroyed
        } as Unit,
      ];

      const taskForces: TaskForce[] = [];
      const areas: OperationalArea[] = [];
      const currentLog: DestructionRecord[] = [
        {
          unitId: 'unit-2',
          unitName: 'Revived Unit',
          unitType: 'Tank',
          faction: 'us',
          timestamp: Date.now() - 1000,
        },
        {
          unitId: 'unit-3',
          unitName: 'Stays Destroyed',
          unitType: 'Artillery',
          faction: 'china',
          timestamp: Date.now() - 2000,
        },
      ];

      const result = DestructionService.trackDestructions(units, taskForces, areas, currentLog);

      expect(result.logChanged).toBe(true);
      expect(result.newDestructions).toHaveLength(1);
      expect(result.newDestructions[0].unitId).toBe('unit-1');
      expect(result.revivals).toHaveLength(1);
      expect(result.revivals[0]).toBe('unit-2');
      expect(result.updatedLog).toHaveLength(2); // unit-3 and unit-1
    });
  });

  describe('getDestructionStatsByFaction', () => {
    it('should count destructions by faction', () => {
      const log: DestructionRecord[] = [
        { unitId: '1', faction: 'us' } as DestructionRecord,
        { unitId: '2', faction: 'us' } as DestructionRecord,
        { unitId: '3', faction: 'china' } as DestructionRecord,
        { unitId: '4', faction: 'us' } as DestructionRecord,
      ];

      const stats = DestructionService.getDestructionStatsByFaction(log);

      expect(stats.us).toBe(3);
      expect(stats.china).toBe(1);
    });

    it('should handle empty log', () => {
      const stats = DestructionService.getDestructionStatsByFaction([]);

      expect(stats.us).toBe(0);
      expect(stats.china).toBe(0);
    });
  });

  describe('getDestructionStatsByType', () => {
    it('should count destructions by unit type', () => {
      const log: DestructionRecord[] = [
        { unitId: '1', unitType: 'Infantry' } as DestructionRecord,
        { unitId: '2', unitType: 'Tank' } as DestructionRecord,
        { unitId: '3', unitType: 'Infantry' } as DestructionRecord,
        { unitId: '4', unitType: 'Infantry' } as DestructionRecord,
        { unitId: '5', unitType: 'Artillery' } as DestructionRecord,
      ];

      const stats = DestructionService.getDestructionStatsByType(log);

      expect(stats['Infantry']).toBe(3);
      expect(stats['Tank']).toBe(1);
      expect(stats['Artillery']).toBe(1);
    });

    it('should handle empty log', () => {
      const stats = DestructionService.getDestructionStatsByType([]);

      expect(Object.keys(stats)).toHaveLength(0);
    });
  });

  describe('getRecentDestructions', () => {
    it('should return only recent destructions within time window', () => {
      const now = Date.now();
      const log: DestructionRecord[] = [
        { unitId: '1', timestamp: now - 1000 } as DestructionRecord, // 1 second ago
        { unitId: '2', timestamp: now - 5000 } as DestructionRecord, // 5 seconds ago
        { unitId: '3', timestamp: now - 3700000 } as DestructionRecord, // Over 1 hour ago
      ];

      const recent = DestructionService.getRecentDestructions(log, 3600000); // 1 hour

      expect(recent).toHaveLength(2);
      expect(recent.find(r => r.unitId === '3')).toBeUndefined();
    });

    it('should use default time window of 1 hour', () => {
      const now = Date.now();
      const log: DestructionRecord[] = [
        { unitId: '1', timestamp: now - 1000 } as DestructionRecord,
        { unitId: '2', timestamp: now - 7200000 } as DestructionRecord, // 2 hours ago
      ];

      const recent = DestructionService.getRecentDestructions(log);

      expect(recent).toHaveLength(1);
      expect(recent[0].unitId).toBe('1');
    });

    it('should handle empty log', () => {
      const recent = DestructionService.getRecentDestructions([]);

      expect(recent).toHaveLength(0);
    });
  });

  describe('getDestructionsByArea', () => {
    it('should filter destructions by operational area', () => {
      const log: DestructionRecord[] = [
        { unitId: '1', operationalAreaId: 'area-1' } as DestructionRecord,
        { unitId: '2', operationalAreaId: 'area-2' } as DestructionRecord,
        { unitId: '3', operationalAreaId: 'area-1' } as DestructionRecord,
        { unitId: '4', operationalAreaId: undefined } as DestructionRecord,
      ];

      const areaDestructions = DestructionService.getDestructionsByArea(log, 'area-1');

      expect(areaDestructions).toHaveLength(2);
      expect(areaDestructions.every(r => r.operationalAreaId === 'area-1')).toBe(true);
    });

    it('should return empty array when no matches', () => {
      const log: DestructionRecord[] = [
        { unitId: '1', operationalAreaId: 'area-1' } as DestructionRecord,
      ];

      const areaDestructions = DestructionService.getDestructionsByArea(log, 'area-nonexistent');

      expect(areaDestructions).toHaveLength(0);
    });
  });

  describe('getDestructionsByTaskForce', () => {
    it('should filter destructions by task force', () => {
      const log: DestructionRecord[] = [
        { unitId: '1', taskForceId: 'tf-1' } as DestructionRecord,
        { unitId: '2', taskForceId: 'tf-2' } as DestructionRecord,
        { unitId: '3', taskForceId: 'tf-1' } as DestructionRecord,
        { unitId: '4', taskForceId: undefined } as DestructionRecord,
      ];

      const tfDestructions = DestructionService.getDestructionsByTaskForce(log, 'tf-1');

      expect(tfDestructions).toHaveLength(2);
      expect(tfDestructions.every(r => r.taskForceId === 'tf-1')).toBe(true);
    });

    it('should return empty array when no matches', () => {
      const log: DestructionRecord[] = [
        { unitId: '1', taskForceId: 'tf-1' } as DestructionRecord,
      ];

      const tfDestructions = DestructionService.getDestructionsByTaskForce(log, 'tf-nonexistent');

      expect(tfDestructions).toHaveLength(0);
    });
  });

  describe('calculateCombatEffectiveness', () => {
    it('should calculate percentage of operational units', () => {
      const units: Unit[] = [
        {
          id: 'unit-1',
          faction: 'us',
          damagePoints: 2,
          currentDamage: [false, false], // Operational
        } as Unit,
        {
          id: 'unit-2',
          faction: 'us',
          damagePoints: 2,
          currentDamage: [true, true], // Destroyed
        } as Unit,
        {
          id: 'unit-3',
          faction: 'us',
          damagePoints: 3,
          currentDamage: [true, false, false], // Operational
        } as Unit,
        {
          id: 'unit-4',
          faction: 'china',
          damagePoints: 2,
          currentDamage: [true, true], // China unit, shouldn't count
        } as Unit,
      ];

      const effectiveness = DestructionService.calculateCombatEffectiveness(units, 'us');

      expect(effectiveness).toBe(67); // 2 out of 3 = 66.67% rounded to 67
    });

    it('should return 100 when all units are operational', () => {
      const units: Unit[] = [
        {
          id: 'unit-1',
          faction: 'us',
          damagePoints: 2,
          currentDamage: [false, false],
        } as Unit,
        {
          id: 'unit-2',
          faction: 'us',
          damagePoints: 2,
          currentDamage: [true, false],
        } as Unit,
      ];

      const effectiveness = DestructionService.calculateCombatEffectiveness(units, 'us');

      expect(effectiveness).toBe(100);
    });

    it('should return 0 when all units are destroyed', () => {
      const units: Unit[] = [
        {
          id: 'unit-1',
          faction: 'us',
          damagePoints: 2,
          currentDamage: [true, true],
        } as Unit,
        {
          id: 'unit-2',
          faction: 'us',
          damagePoints: 3,
          currentDamage: [true, true, true],
        } as Unit,
      ];

      const effectiveness = DestructionService.calculateCombatEffectiveness(units, 'us');

      expect(effectiveness).toBe(0);
    });

    it('should return 100 when faction has no units', () => {
      const units: Unit[] = [
        {
          id: 'unit-1',
          faction: 'china',
          damagePoints: 2,
          currentDamage: [true, true],
        } as Unit,
      ];

      const effectiveness = DestructionService.calculateCombatEffectiveness(units, 'us');

      expect(effectiveness).toBe(100);
    });
  });

  describe('isTaskForceDestroyed', () => {
    it('should return true when all units in task force are destroyed', () => {
      const taskForce: TaskForce = {
        id: 'tf-1',
        name: 'Test TF',
      } as TaskForce;

      const units: Unit[] = [
        {
          id: 'unit-1',
          taskForceId: 'tf-1',
          damagePoints: 2,
          currentDamage: [true, true],
        } as Unit,
        {
          id: 'unit-2',
          taskForceId: 'tf-1',
          damagePoints: 3,
          currentDamage: [true, true, true],
        } as Unit,
      ];

      expect(DestructionService.isTaskForceDestroyed(taskForce, units)).toBe(true);
    });

    it('should return false when some units are still operational', () => {
      const taskForce: TaskForce = {
        id: 'tf-1',
        name: 'Test TF',
      } as TaskForce;

      const units: Unit[] = [
        {
          id: 'unit-1',
          taskForceId: 'tf-1',
          damagePoints: 2,
          currentDamage: [true, true],
        } as Unit,
        {
          id: 'unit-2',
          taskForceId: 'tf-1',
          damagePoints: 3,
          currentDamage: [true, false, false], // Still operational
        } as Unit,
      ];

      expect(DestructionService.isTaskForceDestroyed(taskForce, units)).toBe(false);
    });

    it('should return false when task force has no units', () => {
      const taskForce: TaskForce = {
        id: 'tf-1',
        name: 'Test TF',
      } as TaskForce;

      const units: Unit[] = [];

      expect(DestructionService.isTaskForceDestroyed(taskForce, units)).toBe(false);
    });
  });

  describe('getDestroyedTaskForces', () => {
    it('should return only completely destroyed task forces', () => {
      const taskForces: TaskForce[] = [
        { id: 'tf-1', name: 'Destroyed TF' } as TaskForce,
        { id: 'tf-2', name: 'Operational TF' } as TaskForce,
        { id: 'tf-3', name: 'Empty TF' } as TaskForce,
      ];

      const units: Unit[] = [
        {
          id: 'unit-1',
          taskForceId: 'tf-1',
          damagePoints: 2,
          currentDamage: [true, true],
        } as Unit,
        {
          id: 'unit-2',
          taskForceId: 'tf-1',
          damagePoints: 2,
          currentDamage: [true, true],
        } as Unit,
        {
          id: 'unit-3',
          taskForceId: 'tf-2',
          damagePoints: 2,
          currentDamage: [true, false], // Operational
        } as Unit,
      ];

      const destroyed = DestructionService.getDestroyedTaskForces(taskForces, units);

      expect(destroyed).toHaveLength(1);
      expect(destroyed[0].id).toBe('tf-1');
    });

    it('should return empty array when no task forces are destroyed', () => {
      const taskForces: TaskForce[] = [
        { id: 'tf-1', name: 'Operational TF' } as TaskForce,
      ];

      const units: Unit[] = [
        {
          id: 'unit-1',
          taskForceId: 'tf-1',
          damagePoints: 2,
          currentDamage: [false, false],
        } as Unit,
      ];

      const destroyed = DestructionService.getDestroyedTaskForces(taskForces, units);

      expect(destroyed).toHaveLength(0);
    });
  });
});
