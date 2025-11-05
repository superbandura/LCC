import { describe, it, expect } from 'vitest';
import { DeploymentService } from './deploymentService';
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

describe('DeploymentService', () => {
  describe('calculateActivationTiming', () => {
    it('should return immediate activation during planning phase', () => {
      const planningState: TurnState = {
        currentDate: '2030-06-01',
        dayOfWeek: 0,
        turnNumber: 0,
        isPlanningPhase: true,
      };

      const result = DeploymentService.calculateActivationTiming(planningState, 3);

      expect(result.activatesAtTurn).toBe(0);
      expect(result.activatesAtDay).toBe(0);
    });

    it('should calculate activation timing for same week deployment', () => {
      const mondayState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = DeploymentService.calculateActivationTiming(mondayState, 3);

      expect(result.activatesAtTurn).toBe(1); // Same turn
      expect(result.activatesAtDay).toBe(4); // Thursday (1 + 3 days)
    });

    it('should calculate activation timing crossing into next week', () => {
      const fridayState: TurnState = {
        currentDate: '2030-06-07',
        dayOfWeek: 5,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = DeploymentService.calculateActivationTiming(fridayState, 4);

      expect(result.activatesAtTurn).toBe(2); // Next turn
      expect(result.activatesAtDay).toBe(2); // Tuesday (5 + 4 = 9, wraps to 2 of next week)
    });

    it('should calculate activation timing crossing multiple weeks', () => {
      const mondayState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = DeploymentService.calculateActivationTiming(mondayState, 14);

      expect(result.activatesAtTurn).toBe(3); // Two weeks later
      expect(result.activatesAtDay).toBe(1); // Monday again (1 + 14 days = 2 full weeks)
    });

    it('should handle 0 days deployment time', () => {
      const wednesdayState: TurnState = {
        currentDate: '2030-06-05',
        dayOfWeek: 3,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = DeploymentService.calculateActivationTiming(wednesdayState, 0);

      expect(result.activatesAtTurn).toBe(1);
      expect(result.activatesAtDay).toBe(3); // Same day
    });

    it('should calculate activation for 7 days (exactly one week)', () => {
      const mondayState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = DeploymentService.calculateActivationTiming(mondayState, 7);

      expect(result.activatesAtTurn).toBe(2); // Next turn
      expect(result.activatesAtDay).toBe(1); // Monday of next week
    });
  });

  describe('isDeploymentActive', () => {
    it('should return true during planning phase', () => {
      const planningState: TurnState = {
        currentDate: '2030-06-01',
        dayOfWeek: 0,
        turnNumber: 0,
        isPlanningPhase: true,
      };

      const deployment = { activatesAtTurn: 1, activatesAtDay: 5 };

      expect(DeploymentService.isDeploymentActive(deployment, planningState)).toBe(true);
    });

    it('should return true if deployment turn is in the past', () => {
      const currentState: TurnState = {
        currentDate: '2030-06-17',
        dayOfWeek: 1,
        turnNumber: 3,
        isPlanningPhase: false,
      };

      const deployment = { activatesAtTurn: 1, activatesAtDay: 5 };

      expect(DeploymentService.isDeploymentActive(deployment, currentState)).toBe(true);
    });

    it('should return true if same turn and day has passed', () => {
      const currentState: TurnState = {
        currentDate: '2030-06-05',
        dayOfWeek: 3,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const deployment = { activatesAtTurn: 1, activatesAtDay: 2 };

      expect(DeploymentService.isDeploymentActive(deployment, currentState)).toBe(true);
    });

    it('should return true if same turn and same day', () => {
      const currentState: TurnState = {
        currentDate: '2030-06-05',
        dayOfWeek: 3,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const deployment = { activatesAtTurn: 1, activatesAtDay: 3 };

      expect(DeploymentService.isDeploymentActive(deployment, currentState)).toBe(true);
    });

    it('should return false if same turn but day not yet reached', () => {
      const currentState: TurnState = {
        currentDate: '2030-06-04',
        dayOfWeek: 2,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const deployment = { activatesAtTurn: 1, activatesAtDay: 5 };

      expect(DeploymentService.isDeploymentActive(deployment, currentState)).toBe(false);
    });

    it('should return false if future turn', () => {
      const currentState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const deployment = { activatesAtTurn: 3, activatesAtDay: 1 };

      expect(DeploymentService.isDeploymentActive(deployment, currentState)).toBe(false);
    });
  });

  describe('calculateArrivals', () => {
    const mockCards: Card[] = [
      { id: 'card-1', faction: 'us', name: 'Test Card 1' } as Card,
      { id: 'card-2', faction: 'china', name: 'Test Card 2' } as Card,
    ];

    const mockTaskForces: TaskForce[] = [
      { id: 'tf-1', faction: 'us', name: 'Test TF 1' } as TaskForce,
      { id: 'tf-2', faction: 'china', name: 'Test TF 2' } as TaskForce,
    ];

    const mockUnits: Unit[] = [
      { id: 'unit-1', faction: 'us', name: 'Test Unit 1' } as Unit,
      { id: 'unit-2', faction: 'china', name: 'Test Unit 2' } as Unit,
    ];

    it('should calculate arrived cards for US faction', () => {
      const pendingDeployments: PendingDeployments = {
        cards: [
          { cardId: 'card-1', faction: 'us', activatesAtTurn: 1, activatesAtDay: 1, areaId: 'area-1' },
          { cardId: 'card-2', faction: 'china', activatesAtTurn: 1, activatesAtDay: 1, areaId: 'area-1' },
        ],
        taskForces: [],
        units: [],
      };

      const turnState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = DeploymentService.calculateArrivals(
        pendingDeployments,
        turnState,
        'us',
        mockCards,
        mockTaskForces,
        mockUnits
      );

      expect(result.arrivedCards).toHaveLength(1);
      expect(result.arrivedCards[0].id).toBe('card-1');
      expect(result.arrivedCardDeployments).toHaveLength(1);
      expect(result.arrivedTaskForces).toHaveLength(0);
      expect(result.arrivedUnits).toHaveLength(0);
    });

    it('should calculate arrived task forces for China faction', () => {
      const pendingDeployments: PendingDeployments = {
        cards: [],
        taskForces: [
          { taskForceId: 'tf-1', faction: 'us', activatesAtTurn: 1, activatesAtDay: 1 },
          { taskForceId: 'tf-2', faction: 'china', activatesAtTurn: 1, activatesAtDay: 1 },
        ],
        units: [],
      };

      const turnState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = DeploymentService.calculateArrivals(
        pendingDeployments,
        turnState,
        'china',
        mockCards,
        mockTaskForces,
        mockUnits
      );

      expect(result.arrivedTaskForces).toHaveLength(1);
      expect(result.arrivedTaskForces[0].id).toBe('tf-2');
      expect(result.arrivedTaskForceDeployments).toHaveLength(1);
    });

    it('should not return non-active deployments', () => {
      const pendingDeployments: PendingDeployments = {
        cards: [
          { cardId: 'card-1', faction: 'us', activatesAtTurn: 3, activatesAtDay: 5, areaId: 'area-1' },
        ],
        taskForces: [],
        units: [],
      };

      const turnState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = DeploymentService.calculateArrivals(
        pendingDeployments,
        turnState,
        'us',
        mockCards,
        mockTaskForces,
        mockUnits
      );

      expect(result.arrivedCards).toHaveLength(0);
    });

    it('should handle empty pending deployments', () => {
      const pendingDeployments: PendingDeployments = {
        cards: [],
        taskForces: [],
        units: [],
      };

      const turnState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = DeploymentService.calculateArrivals(
        pendingDeployments,
        turnState,
        'us',
        mockCards,
        mockTaskForces,
        mockUnits
      );

      expect(result.arrivedCards).toHaveLength(0);
      expect(result.arrivedTaskForces).toHaveLength(0);
      expect(result.arrivedUnits).toHaveLength(0);
    });
  });

  describe('cleanupDestroyedDeployments', () => {
    it('should remove pending deployments for destroyed units', () => {
      const destroyedUnit: Unit = {
        id: 'unit-1',
        faction: 'us',
        name: 'Destroyed Unit',
        damagePoints: 3,
        currentDamage: [true, true, true], // All damage points taken
      } as Unit;

      const aliveUnit: Unit = {
        id: 'unit-2',
        faction: 'us',
        name: 'Alive Unit',
        damagePoints: 3,
        currentDamage: [true, false, false],
      } as Unit;

      const taskForces: TaskForce[] = [];

      const pendingDeployments: PendingDeployments = {
        cards: [],
        units: [
          { unitId: 'unit-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, taskForceId: 'tf-1' },
          { unitId: 'unit-2', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, taskForceId: 'tf-1' },
        ],
        taskForces: [],
      };

      const result = DeploymentService.cleanupDestroyedDeployments(
        [destroyedUnit, aliveUnit],
        taskForces,
        pendingDeployments
      );

      expect(result.units).toHaveLength(1);
      expect(result.units[0].unitId).toBe('unit-2');
    });

    it('should remove pending deployments for completely destroyed task forces', () => {
      const destroyedUnit1: Unit = {
        id: 'unit-1',
        faction: 'us',
        name: 'Destroyed Unit 1',
        taskForceId: 'tf-destroyed',
        damagePoints: 2,
        currentDamage: [true, true],
      } as Unit;

      const destroyedUnit2: Unit = {
        id: 'unit-2',
        faction: 'us',
        name: 'Destroyed Unit 2',
        taskForceId: 'tf-destroyed',
        damagePoints: 2,
        currentDamage: [true, true],
      } as Unit;

      const aliveUnit: Unit = {
        id: 'unit-3',
        faction: 'us',
        name: 'Alive Unit',
        taskForceId: 'tf-alive',
        damagePoints: 2,
        currentDamage: [true, false],
      } as Unit;

      const taskForces: TaskForce[] = [
        { id: 'tf-destroyed', faction: 'us', name: 'Destroyed TF', units: ['unit-1', 'unit-2'] } as TaskForce,
        { id: 'tf-alive', faction: 'us', name: 'Alive TF', units: ['unit-3'] } as TaskForce,
      ];

      const pendingDeployments: PendingDeployments = {
        cards: [],
        units: [],
        taskForces: [
          { taskForceId: 'tf-destroyed', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1 },
          { taskForceId: 'tf-alive', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1 },
        ],
      };

      const result = DeploymentService.cleanupDestroyedDeployments(
        [destroyedUnit1, destroyedUnit2, aliveUnit],
        taskForces,
        pendingDeployments
      );

      expect(result.taskForces).toHaveLength(1);
      expect(result.taskForces[0].taskForceId).toBe('tf-alive');
    });

    it('should not remove card deployments', () => {
      const destroyedUnit: Unit = {
        id: 'unit-1',
        faction: 'us',
        name: 'Destroyed Unit',
        damagePoints: 2,
        currentDamage: [true, true],
      } as Unit;

      const taskForces: TaskForce[] = [];

      const pendingDeployments: PendingDeployments = {
        cards: [
          { cardId: 'card-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, areaId: 'area-1' },
        ],
        units: [
          { unitId: 'unit-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, taskForceId: 'tf-1' },
        ],
        taskForces: [],
      };

      const result = DeploymentService.cleanupDestroyedDeployments(
        [destroyedUnit],
        taskForces,
        pendingDeployments
      );

      expect(result.cards).toHaveLength(1);
    });
  });

  describe('cleanupDeletedAreaDeployments', () => {
    it('should remove pending card deployments for deleted areas', () => {
      const areas: OperationalArea[] = [
        { id: 'area-1', name: 'Area 1' } as OperationalArea,
        { id: 'area-2', name: 'Area 2' } as OperationalArea,
      ];

      const pendingDeployments: PendingDeployments = {
        cards: [
          { cardId: 'card-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, areaId: 'area-1' },
          { cardId: 'card-2', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, areaId: 'area-deleted' },
          { cardId: 'card-3', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, areaId: 'area-2' },
        ],
        units: [],
        taskForces: [],
      };

      const result = DeploymentService.cleanupDeletedAreaDeployments(areas, pendingDeployments);

      expect(result.cards).toHaveLength(2);
      expect(result.cards.find(c => c.cardId === 'card-2')).toBeUndefined();
    });

    it('should not affect unit or task force deployments', () => {
      const areas: OperationalArea[] = [
        { id: 'area-1', name: 'Area 1' } as OperationalArea,
      ];

      const pendingDeployments: PendingDeployments = {
        cards: [
          { cardId: 'card-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, areaId: 'area-deleted' },
        ],
        units: [
          { unitId: 'unit-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, taskForceId: 'tf-1' },
        ],
        taskForces: [
          { taskForceId: 'tf-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1 },
        ],
      };

      const result = DeploymentService.cleanupDeletedAreaDeployments(areas, pendingDeployments);

      expect(result.units).toHaveLength(1);
      expect(result.taskForces).toHaveLength(1);
    });
  });

  describe('cleanupDeletedTaskForceDeployments', () => {
    it('should remove pending deployments for deleted task forces', () => {
      const taskForces: TaskForce[] = [
        { id: 'tf-1', faction: 'us', name: 'TF 1' } as TaskForce,
      ];

      const pendingDeployments: PendingDeployments = {
        cards: [],
        units: [
          { unitId: 'unit-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, taskForceId: 'tf-1' },
          { unitId: 'unit-2', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, taskForceId: 'tf-deleted' },
        ],
        taskForces: [
          { taskForceId: 'tf-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1 },
          { taskForceId: 'tf-deleted', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1 },
        ],
      };

      const result = DeploymentService.cleanupDeletedTaskForceDeployments(taskForces, pendingDeployments);

      expect(result.units).toHaveLength(1);
      expect(result.units[0].unitId).toBe('unit-1');
      expect(result.taskForces).toHaveLength(1);
      expect(result.taskForces[0].taskForceId).toBe('tf-1');
    });

    it('should not affect card deployments', () => {
      const taskForces: TaskForce[] = [];

      const pendingDeployments: PendingDeployments = {
        cards: [
          { cardId: 'card-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, areaId: 'area-1' },
        ],
        units: [
          { unitId: 'unit-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, taskForceId: 'tf-deleted' },
        ],
        taskForces: [],
      };

      const result = DeploymentService.cleanupDeletedTaskForceDeployments(taskForces, pendingDeployments);

      expect(result.cards).toHaveLength(1);
    });
  });

  describe('cleanupAllInvalidDeployments', () => {
    it('should perform all cleanup operations in sequence', () => {
      const destroyedUnit: Unit = {
        id: 'unit-destroyed',
        faction: 'us',
        name: 'Destroyed Unit',
        damagePoints: 2,
        currentDamage: [true, true],
      } as Unit;

      const aliveUnit: Unit = {
        id: 'unit-alive',
        faction: 'us',
        name: 'Alive Unit',
        damagePoints: 2,
        currentDamage: [false, false],
        taskForceId: 'tf-deleted',
      } as Unit;

      const taskForces: TaskForce[] = [
        { id: 'tf-valid', faction: 'us', name: 'Valid TF' } as TaskForce,
      ];

      const areas: OperationalArea[] = [
        { id: 'area-valid', name: 'Valid Area' } as OperationalArea,
      ];

      const pendingDeployments: PendingDeployments = {
        cards: [
          { cardId: 'card-1', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, areaId: 'area-valid' },
          { cardId: 'card-2', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, areaId: 'area-deleted' },
        ],
        units: [
          { unitId: 'unit-destroyed', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, taskForceId: 'tf-valid' },
          { unitId: 'unit-alive', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1, taskForceId: 'tf-deleted' },
        ],
        taskForces: [
          { taskForceId: 'tf-valid', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1 },
          { taskForceId: 'tf-deleted', faction: 'us', activatesAtTurn: 2, activatesAtDay: 1 },
        ],
      };

      const result = DeploymentService.cleanupAllInvalidDeployments(
        pendingDeployments,
        [destroyedUnit, aliveUnit],
        taskForces,
        areas
      );

      // Should only keep valid card deployment
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].cardId).toBe('card-1');

      // Should remove destroyed unit and unit from deleted TF
      expect(result.units).toHaveLength(0);

      // Should remove deleted TF
      expect(result.taskForces).toHaveLength(1);
      expect(result.taskForces[0].taskForceId).toBe('tf-valid');
    });
  });
});
