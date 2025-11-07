import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PatrolService } from './patrol/patrolService';
import { AttackService } from './attack/attackService';
import { ASWService } from './asw/aswService';
import {
  SubmarineCampaignState,
  SubmarineDeployment,
  TurnState,
  CommandPoints,
  Location,
  OperationalArea,
  TaskForce,
  Unit,
  Card
} from '../types';

describe('SubmarineService', () => {
  // Mock Math.random for deterministic tests
  let originalRandom: () => number;

  beforeEach(() => {
    originalRandom = Math.random;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  const createMockTurnState = (): TurnState => ({
    currentDate: '2030-06-03',
    dayOfWeek: 1,
    turnNumber: 1,
    isPlanningPhase: false,
  });

  const createMockCommandPoints = (): CommandPoints => ({
    us: 50,
    china: 50,
  });

  const createMockOperationalAreas = (): OperationalArea[] => [
    { id: 'area-1', name: 'Test Area' } as OperationalArea,
  ];

  const createMockLocations = (): Location[] => [
    {
      id: 'base-1',
      name: 'Test Base',
      coords: [0, 0],
      country: 'China',
      damagePoints: 3,
      currentDamage: [false, false, false],
    } as Location,
  ];

  const createMockTaskForces = (): TaskForce[] => [];

  const createMockUnits = (): Unit[] => [];

  const createMockCards = (): Card[] => [];

  describe('processPatrols', () => {
    it('should return empty result when submarine campaign is null', async () => {
      const turnState = createMockTurnState();
      const commandPoints = createMockCommandPoints();
      const areas = createMockOperationalAreas();

      const result = await PatrolService.processPatrols(
        null,
        turnState,
        commandPoints,
        areas
      );

      expect(result.events).toHaveLength(0);
      expect(result.updatedSubmarines).toHaveLength(0);
      expect(result.updatedCommandPoints).toEqual(commandPoints);
    });

    it('should return empty result when no active submarines', async () => {
      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [],
        events: [],
      };

      const result = await PatrolService.processPatrols(
        submarineCampaign,
        createMockTurnState(),
        createMockCommandPoints(),
        createMockOperationalAreas()
      );

      expect(result.events).toHaveLength(0);
      expect(result.updatedSubmarines).toHaveLength(0);
    });

    it('should reset completed patrol orders to pending', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Test Sub',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Test Card',
        status: 'active',
        submarineType: 'submarine',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'completed', // Will be reset to pending
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1,
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
      };

      // Mock roll to fail (>18) so we don't process the patrol
      Math.random = () => 0.95; // Will result in roll of 20

      const result = await PatrolService.processPatrols(
        submarineCampaign,
        createMockTurnState(),
        createMockCommandPoints(),
        createMockOperationalAreas()
      );

      // Submarine should have its order reset to pending
      expect(result.updatedSubmarines[0].currentOrder?.status).toBe('pending');
    });

    it('should process successful patrol and damage enemy command points', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Test',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        status: 'active',
        submarineType: 'submarine',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1,
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
      };

      const commandPoints = createMockCommandPoints();

      // Mock rolls: patrol success (roll 2) and damage roll (10)
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.05; // Patrol roll = 2 (success)
        if (callCount === 2) return 0.45; // Damage roll = 10
        return 0.5;
      };

      const result = await PatrolService.processPatrols(
        submarineCampaign,
        createMockTurnState(),
        commandPoints,
        createMockOperationalAreas()
      );

      // Should create 2 events (attacker + defender)
      expect(result.events).toHaveLength(2);

      // Should damage enemy (China) command points by 10
      expect(result.updatedCommandPoints.china).toBe(40);
      expect(result.updatedCommandPoints.us).toBe(50);

      // Submarine should increment missions
      expect(result.updatedSubmarines[0].missionsCompleted).toBe(1);
    });

    it('should handle failed patrol (roll > 2)', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Test',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        status: 'active',
        submarineType: 'submarine',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1,
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
      };

      const commandPoints = createMockCommandPoints();

      // Mock roll to fail (19)
      Math.random = () => 0.9; // Results in roll of 19

      const result = await PatrolService.processPatrols(
        submarineCampaign,
        createMockTurnState(),
        commandPoints,
        createMockOperationalAreas()
      );

      // Failed patrols now create 2 events (attacker + defender) for admin detailed report
      expect(result.events).toHaveLength(2);

      // Command points unchanged
      expect(result.updatedCommandPoints).toEqual(commandPoints);

      // Submarine still increments missions (attempted)
      expect(result.updatedSubmarines[0].missionsCompleted).toBe(1);
    });

    it('should not go below 0 command points', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Test',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        status: 'active',
        submarineType: 'submarine',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1,
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
      };

      const commandPoints: CommandPoints = { us: 50, china: 5 }; // Low China CP

      // Mock rolls: success and high damage (20)
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.05; // Patrol success (roll 2)
        if (callCount === 2) return 0.95; // Damage = 20
        return 0.5;
      };

      const result = await PatrolService.processPatrols(
        submarineCampaign,
        createMockTurnState(),
        commandPoints,
        createMockOperationalAreas()
      );

      // Should clamp to 0, not go negative
      expect(result.updatedCommandPoints.china).toBe(0);
    });

    it('should exclude ASW cards from patrol operations', async () => {
      const aswCard: SubmarineDeployment = {
        id: 'asw-1',
        submarineName: 'P-8A Surveillance',
        faction: 'us',
        cardId: 'card-asw',
        cardName: 'P-8A Poseidon',
        status: 'active',
        submarineType: 'asw',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'asw-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1,
        },
      };

      const regularSub: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Test',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        status: 'active',
        submarineType: 'submarine',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-2',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1,
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [aswCard, regularSub],
        events: [],
      };

      const commandPoints = createMockCommandPoints();

      // Mock successful patrol roll
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.05; // Patrol roll = 2 (success)
        if (callCount === 2) return 0.45; // Damage roll = 10
        return 0.5;
      };

      const result = await PatrolService.processPatrols(
        submarineCampaign,
        createMockTurnState(),
        commandPoints,
        createMockOperationalAreas()
      );

      // Should only process the regular submarine, not the ASW card
      // 2 events: 1 attacker + 1 defender (only for regular sub)
      expect(result.events).toHaveLength(2);

      // Verify only the regular submarine incremented missions
      const updatedASW = result.updatedSubmarines.find(s => s.id === 'asw-1');
      const updatedSub = result.updatedSubmarines.find(s => s.id === 'sub-1');

      expect(updatedASW?.missionsCompleted).toBe(0); // ASW card should not patrol
      expect(updatedSub?.missionsCompleted).toBe(1); // Regular sub should patrol

      // Command points should only reflect the regular sub's patrol
      expect(result.updatedCommandPoints.china).toBe(40); // 50 - 10 damage
    });
  });

  describe('processAttacks', () => {
    it('should return empty result when submarine campaign is null', async () => {
      const turnState = createMockTurnState();
      const locations = createMockLocations();

      const result = await AttackService.processAttacks(null, turnState, locations);

      expect(result.events).toHaveLength(0);
      expect(result.updatedSubmarines).toHaveLength(0);
      expect(result.updatedLocations).toEqual(locations);
    });

    it('should return empty result when no pending attacks', async () => {
      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [],
        events: [],
      };

      const result = await AttackService.processAttacks(
        submarineCampaign,
        createMockTurnState(),
        createMockLocations()
      );

      expect(result.events).toHaveLength(0);
    });

    it('should not execute attacks before executionTurn', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Test',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'attack',
          status: 'pending',
          targetId: 'base-1',
          targetType: 'base',
          assignedTurn: 1,
          assignedDate: '2030-06-01',
          executionTurn: 3, // Executes on turn 3
          executionDate: '2030-06-10', // Future date - should not execute
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
      };

      const turnState = createMockTurnState(); // Turn 1

      const result = await AttackService.processAttacks(
        submarineCampaign,
        turnState,
        createMockLocations()
      );

      // Attack not executed yet
      expect(result.events).toHaveLength(0);
    });

    it('should process successful attack and damage base', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Test',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'attack',
          status: 'pending',
          targetId: 'base-1',
          targetType: 'base',
          assignedTurn: 1,
          assignedDate: '2030-06-01',
          executionTurn: 1,
          executionDate: '2030-06-03', // Current date - should execute
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
      };

      const locations = createMockLocations();

      // Mock rolls: attack success (10) and damage (2)
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.45; // Attack roll = 10 (success)
        if (callCount === 2) return 0.99; // Damage roll = 2
        return 0.5;
      };

      const result = await AttackService.processAttacks(
        submarineCampaign,
        createMockTurnState(),
        locations
      );

      // Should create 2 events (attacker + defender)
      expect(result.events).toHaveLength(2);

      // Base should have 2 damage points applied
      const damagedBase = result.updatedLocations.find(l => l.id === 'base-1');
      expect(damagedBase?.currentDamage.filter(d => d).length).toBe(2);

      // Submarine should be assigned patrol order after attack
      expect(result.updatedSubmarines[0].currentOrder?.orderType).toBe('patrol');
      expect(result.updatedSubmarines[0].currentOrder?.targetId).toBe('south-china-sea');
    });

    it('should handle failed attack (roll > 10)', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Test',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'attack',
          status: 'pending',
          targetId: 'base-1',
          targetType: 'base',
          assignedTurn: 1,
          assignedDate: '2030-06-01',
          executionTurn: 1,
          executionDate: '2030-06-03', // Current date - should execute
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
      };

      const locations = createMockLocations();

      // Mock roll to fail (15)
      Math.random = () => 0.7; // Results in roll of 15

      const result = await AttackService.processAttacks(
        submarineCampaign,
        createMockTurnState(),
        locations
      );

      // Should create 1 event (attacker only, defender doesn't see failed attacks)
      expect(result.events).toHaveLength(1);
      expect(result.events[0].faction).toBe('us'); // Attacker event

      // Base should have no damage
      const base = result.updatedLocations.find(l => l.id === 'base-1');
      expect(base?.currentDamage.filter(d => d).length).toBe(0);

      // Submarine still gets patrol order
      expect(result.updatedSubmarines[0].currentOrder?.orderType).toBe('patrol');
    });

    it('should not damage beyond base max damage points', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Test',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'attack',
          status: 'pending',
          targetId: 'base-1',
          targetType: 'base',
          assignedTurn: 1,
          assignedDate: '2030-06-01',
          executionTurn: 1,
          executionDate: '2030-06-03', // Current date - should execute
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
      };

      // Base with only 1 undamaged point left
      const locations: Location[] = [
        {
          id: 'base-1',
          name: 'Test Base',
          coords: [0, 0],
          country: 'China',
          damagePoints: 3,
          currentDamage: [true, true, false], // Only 1 HP left
        } as Location,
      ];

      // Mock successful attack with 2 damage
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.45; // Attack success
        if (callCount === 2) return 0.99; // Damage = 2 (but only 1 will apply)
        return 0.5;
      };

      const result = await AttackService.processAttacks(
        submarineCampaign,
        createMockTurnState(),
        locations
      );

      // Base should be fully destroyed (all 3 damage points)
      const base = result.updatedLocations.find(l => l.id === 'base-1');
      expect(base?.currentDamage.every(d => d)).toBe(true);
      expect(base?.currentDamage.filter(d => d).length).toBe(3);
    });

    it('should increment totalKills when base is destroyed', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Test',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'attack',
          status: 'pending',
          targetId: 'base-1',
          targetType: 'base',
          assignedTurn: 1,
          assignedDate: '2030-06-01',
          executionTurn: 1,
          executionDate: '2030-06-03', // Current date - should execute
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
      };

      // Base with only 1 HP left
      const locations: Location[] = [
        {
          id: 'base-1',
          name: 'Test Base',
          coords: [0, 0],
          country: 'China',
          damagePoints: 3,
          currentDamage: [true, true, false],
        } as Location,
      ];

      // Mock successful attack that will destroy the base
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.45; // Attack success
        if (callCount === 2) return 0.49; // Damage = 1 (destroys base)
        return 0.5;
      };

      const result = await AttackService.processAttacks(
        submarineCampaign,
        createMockTurnState(),
        locations
      );

      // Submarine should have totalKills incremented
      expect(result.updatedSubmarines[0].totalKills).toBe(1);
    });

    it('should process multiple attacks in same turn', async () => {
      const submarine1: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Test 1',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'attack',
          status: 'pending',
          targetId: 'base-1',
          targetType: 'base',
          assignedTurn: 1,
          assignedDate: '2030-06-01',
          executionTurn: 1,
          executionDate: '2030-06-03', // Current date - should execute
        },
      };

      const submarine2: SubmarineDeployment = {
        id: 'sub-2',
        submarineName: 'USS Test 2',
        faction: 'us',
        cardId: 'card-2',
        cardName: 'Submarine Card 2',
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-2',
          submarineId: 'sub-2',
          orderType: 'attack',
          status: 'pending',
          targetId: 'base-1',
          targetType: 'base',
          assignedTurn: 1,
          assignedDate: '2030-06-01',
          executionTurn: 1,
          executionDate: '2030-06-03', // Current date - should execute
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine1, submarine2],
        events: [],
      };

      const locations = createMockLocations();

      // Mock both attacks to succeed
      // Note: EventBuilder.build() also calls Math.random() for event ID generation
      let callCount = 0;
      Math.random = () => {
        callCount++;
        // Attack 1: success (roll 10) + damage 1
        if (callCount === 1) return 0.45; // attack roll
        if (callCount === 2) return 0.49; // damage roll
        if (callCount === 3) return 0.1;  // EventBuilder ID for attacker event
        if (callCount === 4) return 0.2;  // EventBuilder ID for defender event
        // Attack 2: success (roll 10) + damage 1
        if (callCount === 5) return 0.45; // attack roll
        if (callCount === 6) return 0.49; // damage roll
        if (callCount === 7) return 0.3;  // EventBuilder ID for attacker event
        if (callCount === 8) return 0.4;  // EventBuilder ID for defender event
        return 0.5;
      };

      const result = await AttackService.processAttacks(
        submarineCampaign,
        createMockTurnState(),
        locations
      );

      // Should create 4 events (2 attacks Ã— 2 events each)
      expect(result.events).toHaveLength(4);

      // Base should have 2 damage points
      const base = result.updatedLocations.find(l => l.id === 'base-1');
      expect(base?.currentDamage.filter(d => d).length).toBe(2);

      // Both submarines should have patrol orders
      expect(result.updatedSubmarines.every(s => s.currentOrder?.orderType === 'patrol')).toBe(true);
    });
  });

  describe('processASWPhase', () => {
    it('should return empty result when submarine campaign is null', async () => {
      const turnState = createMockTurnState();
      const areas = createMockOperationalAreas();

      const result = await ASWService.processASWPhase(
        null,
        turnState,
        areas,
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      expect(result.events).toHaveLength(0);
      expect(result.updatedSubmarines).toHaveLength(0);
      expect(result.eliminatedSubmarineIds).toHaveLength(0);
    });

    it('should return empty result when no ASW cards active', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Test Sub',
        faction: 'us',
        cardId: 'card-1',
        cardName: 'Virginia-Class Sub',
        cardType: 'maneuver',
        submarineType: 'submarine',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] },
      };

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      expect(result.events).toHaveLength(0);
      expect(result.eliminatedSubmarineIds).toHaveLength(0);
    });

    it('should return empty result when no enemy submarines active', async () => {
      const aswCard: SubmarineDeployment = {
        id: 'asw-1',
        submarineName: 'P-8A Surveillance',
        faction: 'us',
        cardId: 'card-asw-1',
        cardName: 'P-8A Surveillance',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [aswCard],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] },
      };

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      expect(result.events).toHaveLength(0);
      expect(result.eliminatedSubmarineIds).toHaveLength(0);
    });

    it('should not detect submarine when roll !== 1', async () => {
      const aswCard: SubmarineDeployment = {
        id: 'asw-1',
        submarineName: 'P-8A Surveillance',
        faction: 'us',
        cardId: 'card-asw-1',
        cardName: 'P-8A Surveillance',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-asw-1',
          submarineId: 'asw-1',
          orderType: 'asw',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1
        }
      };

      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Chinese Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'SUI-Class Sub',
        cardType: 'maneuver',
        submarineType: 'submarine',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1,
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [aswCard, submarine],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] },
      };

      // Mock failed detection (roll > 3 for ASW cards)
      Math.random = () => 0.2; // Roll 5 (above ASW card threshold of 3)

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      // Failed detection now creates 1 event for admin detailed report
      expect(result.events).toHaveLength(1);
      expect(result.events[0].description).toContain('Detection attempt failed');
      expect(result.events[0].rollDetails?.primaryRoll).toBe(5);
      expect(result.eliminatedSubmarineIds).toHaveLength(0);
      expect(result.updatedSubmarines.find(s => s.id === 'sub-1')?.status).toBe('active');
    });

    it('should detect but not eliminate submarine when elimination roll > 10', async () => {
      const aswCard: SubmarineDeployment = {
        id: 'asw-1',
        submarineName: 'P-8A Surveillance',
        faction: 'us',
        cardId: 'card-asw-1',
        cardName: 'P-8A Surveillance',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-asw-1',
          submarineId: 'asw-1',
          orderType: 'asw',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1
        }
      };

      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Chinese Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'SUI-Class Sub',
        cardType: 'maneuver',
        submarineType: 'submarine',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1,
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [aswCard, submarine],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] },
      };

      // Mock detection success but elimination failure
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.0; // Target selection (index 0)
        if (callCount === 2) return 0.0; // Detection roll = 1 (success)
        if (callCount === 3) return 0.55; // Elimination roll = 12 (failure, > 10)
        return 0.5;
      };

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      // Should create 1 event for attacker only (submarine evaded)
      expect(result.events).toHaveLength(1);
      expect(result.events[0].faction).toBe('us'); // ASW operator's event
      expect(result.events[0].eventType).toBe('detected');
      expect(result.events[0].description).toContain('evaded');

      // Submarine should still be active
      expect(result.eliminatedSubmarineIds).toHaveLength(0);
      expect(result.updatedSubmarines.find(s => s.id === 'sub-1')?.status).toBe('active');
    });

    it('should detect and eliminate submarine when both rolls succeed', async () => {
      const aswCard: SubmarineDeployment = {
        id: 'asw-1',
        submarineName: 'P-8A Surveillance',
        faction: 'us',
        cardId: 'card-asw-1',
        cardName: 'P-8A Surveillance',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-asw-1',
          submarineId: 'asw-1',
          orderType: 'asw',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1
        }
      };

      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Chinese Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'SUI-Class Sub',
        cardType: 'maneuver',
        submarineType: 'submarine',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1,
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [aswCard, submarine],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] },
      };

      // Mock successful detection and elimination
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.0; // Target selection (index 0)
        if (callCount === 2) return 0.0; // Detection roll = 1 (success)
        if (callCount === 3) return 0.45; // Elimination roll = 10 (success, â‰¤ 10)
        return 0.5;
      };

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      // Should create 2 events (attacker + defender)
      expect(result.events).toHaveLength(2);

      // Attacker event
      const attackerEvent = result.events.find(e => e.faction === 'us');
      expect(attackerEvent).toBeDefined();
      expect(attackerEvent?.eventType).toBe('attack_success');
      expect(attackerEvent?.description).toContain('eliminated');

      // Defender event
      const defenderEvent = result.events.find(e => e.faction === 'china');
      expect(defenderEvent).toBeDefined();
      expect(defenderEvent?.eventType).toBe('destroyed');
      expect(defenderEvent?.description).toContain('destroyed');

      // Submarine should be eliminated
      expect(result.eliminatedSubmarineIds).toEqual(['sub-1']);
      expect(result.updatedSubmarines.find(s => s.id === 'sub-1')?.status).toBe('destroyed');

      // ASW card should have kill count incremented
      expect(result.updatedSubmarines.find(s => s.id === 'asw-1')?.totalKills).toBe(1);
      expect(result.updatedSubmarines.find(s => s.id === 'asw-1')?.missionsCompleted).toBe(1);
    });

    it.skip('should process multiple ASW cards independently', async () => {
      const aswCard1: SubmarineDeployment = {
        id: 'asw-1',
        submarineName: 'P-8A Surveillance',
        faction: 'us',
        cardId: 'card-asw-1',
        cardName: 'P-8A Surveillance',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
      };

      const aswCard2: SubmarineDeployment = {
        id: 'asw-2',
        submarineName: 'Helo ASW',
        faction: 'us',
        cardId: 'card-asw-2',
        cardName: 'Helo ASW',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
      };

      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Chinese Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'SUI-Class Sub',
        cardType: 'maneuver',
        submarineType: 'submarine',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1,
        },
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [aswCard1, aswCard2, submarine],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] },
      };

      // Mock: first ASW fails, second ASW succeeds
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.0; // ASW 1 target selection (index 0)
        if (callCount === 2) return 0.1; // ASW 1 detection roll = 3 (fail)
        if (callCount === 3) return 0.0; // ASW 2 target selection (index 0)
        if (callCount === 4) return 0.0; // ASW 2 detection roll = 1 (success)
        if (callCount === 5) return 0.45; // ASW 2 elimination roll = 10 (success)
        return 0.5;
      };

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      // ASW 1 fails detection but submarine is eliminated before creating failed event
      // because submarine is also in allASWElements and gets filtered out
      // ASW 2 succeeds: 2 events (attacker + defender)
      expect(result.events).toHaveLength(2);
      expect(result.eliminatedSubmarineIds).toEqual(['sub-1']);

      // Only second ASW should have kill
      expect(result.updatedSubmarines.find(s => s.id === 'asw-1')?.totalKills).toBe(0);
      expect(result.updatedSubmarines.find(s => s.id === 'asw-2')?.totalKills).toBe(1);
    });

    it('should only target enemy submarines (not same faction)', async () => {
      const aswCard: SubmarineDeployment = {
        id: 'asw-1',
        submarineName: 'P-8A Surveillance',
        faction: 'us',
        cardId: 'card-asw-1',
        cardName: 'P-8A Surveillance',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
      };

      const friendlySubmarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Virginia Sub',
        faction: 'us', // Same faction as ASW
        cardId: 'card-1',
        cardName: 'Virginia-Class Sub',
        cardType: 'maneuver',
        submarineType: 'submarine',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [aswCard, friendlySubmarine],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] },
      };

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      // Should not target friendly submarines
      expect(result.events).toHaveLength(0);
      expect(result.eliminatedSubmarineIds).toHaveLength(0);
    });

    it('should detect with roll â‰¤ 2 for ASW destroyers (10% rate)', async () => {
      // Create ASW destroyer unit
      const destroyer: Unit = {
        id: 'destroyer-1',
        name: 'DDG-56',
        type: 'ARLEIGH BURKE CLASS DDG',
        faction: 'us',
        category: 'naval',
        damagePoints: 3,
        currentDamage: [false, false, false],
        taskForceId: 'tf-1'
      };

      const taskForce: TaskForce = {
        id: 'tf-1',
        name: 'Task Force Alpha',
        faction: 'us',
        operationalAreaId: 'south-china-sea',
        units: ['destroyer-1']
      };

      const area: OperationalArea = {
        id: 'south-china-sea',
        name: 'South China Sea',
        bounds: [[10, 110], [20, 120]],
        color: '#3388ff'
      };

      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Chinese Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'SHANG-Class Sub',
        cardType: 'maneuver',
        submarineType: 'submarine',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] }
      };

      // Mock roll = 2 (should detect for destroyers, not for ASW cards)
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.0; // Target selection
        if (callCount === 2) return 0.05; // Detection roll = 2 (success for destroyer)
        if (callCount === 3) return 0.45; // Elimination roll = 10 (success)
        return 0.5;
      };

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        [area],
        [taskForce],
        [destroyer],
        createMockCards()
      );

      // Destroyer should detect with roll=2 (10% threshold)
      expect(result.events.length).toBeGreaterThan(0);
      expect(result.eliminatedSubmarineIds).toContain('sub-1');
      expect(result.updatedSubmarines.find(s => s.id === 'sub-1')?.status).toBe('destroyed');
    });

    it('should detect with roll = 2 OR 3 for ASW cards (15% rate)', async () => {
      const aswCard: SubmarineDeployment = {
        id: 'asw-1',
        submarineName: 'P-8A Surveillance',
        faction: 'us',
        cardId: 'card-asw-1',
        cardName: 'P-8A Surveillance',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-asw-1',
          submarineId: 'asw-1',
          orderType: 'asw',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1
        }
      };

      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Chinese Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'SHANG-Class Sub',
        cardType: 'maneuver',
        submarineType: 'submarine',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [aswCard, submarine],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] }
      };

      // Mock roll = 2 (should detect for ASW cards with 15% threshold)
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.0; // Target selection
        if (callCount === 2) return 0.05; // Detection roll = 2 (success for ASW card)
        if (callCount === 3) return 0.45; // Elimination roll = 10 (success)
        return 0.5;
      };

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      // ASW card should detect with roll=2 or roll=3 (15% threshold)
      expect(result.events.length).toBeGreaterThan(0);
      expect(result.eliminatedSubmarineIds).toContain('sub-1');
      expect(result.updatedSubmarines.find(s => s.id === 'sub-1')?.status).toBe('destroyed');
    });

    it('should NOT detect with roll = 4 for ASW cards (15% rate limit)', async () => {
      const aswCard: SubmarineDeployment = {
        id: 'asw-1',
        submarineName: 'P-8A Surveillance',
        faction: 'us',
        cardId: 'card-asw-1',
        cardName: 'P-8A Surveillance',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-asw-1',
          submarineId: 'asw-1',
          orderType: 'asw',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1
        }
      };

      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Chinese Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'SHANG-Class Sub',
        cardType: 'maneuver',
        submarineType: 'submarine',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [aswCard, submarine],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] }
      };

      // Mock roll = 4 (should NOT detect for ASW cards, threshold is 3)
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.0; // Target selection
        if (callCount === 2) return 0.15; // Detection roll = 4 (failure for ASW card)
        return 0.5;
      };

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      // ASW card should NOT detect with roll=4 (threshold is 3)
      expect(result.events).toHaveLength(1); // Only failed detection event
      expect(result.events[0].description).toContain('Detection attempt failed');
      expect(result.eliminatedSubmarineIds).toHaveLength(0);
      expect(result.updatedSubmarines.find(s => s.id === 'sub-1')?.status).toBe('active');
    });

    it('should only activate ASW cards with active ASW orders', async () => {
      // ASW card WITH active ASW order
      const aswWithOrder: SubmarineDeployment = {
        id: 'asw-1',
        submarineName: 'P-8A Active',
        faction: 'us',
        cardId: 'card-asw-1',
        cardName: 'P-8A Poseidon',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-asw-1',
          submarineId: 'asw-1',
          orderType: 'asw',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1
        }
      };

      // ASW card WITHOUT order
      const aswWithoutOrder: SubmarineDeployment = {
        id: 'asw-2',
        submarineName: 'P-8A Inactive',
        faction: 'us',
        cardId: 'card-asw-2',
        cardName: 'P-8A Poseidon',
        cardType: 'intelligence',
        submarineType: 'asw',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0
        // No currentOrder
      };

      // Enemy submarine
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Chinese Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'SHANG-Class Sub',
        cardType: 'maneuver',
        submarineType: 'submarine',
        deployedAt: Date.now(),
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 1
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [aswWithOrder, aswWithoutOrder, submarine],
        events: [],
        currentTurn: 1,
        usedSubmarineNames: { us: [], china: [] }
      };

      // Mock successful detection
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.0; // Target selection
        if (callCount === 2) return 0.0; // Detection roll = 1 (success)
        if (callCount === 3) return 0.45; // Elimination roll = 10 (success)
        return 0.5;
      };

      const result = await ASWService.processASWPhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      // Only ASW card with active order should participate
      // Should detect and eliminate the submarine
      expect(result.eliminatedSubmarineIds).toContain('sub-1');
      expect(result.updatedSubmarines.find(s => s.id === 'sub-1')?.status).toBe('destroyed');

      // ASW card with order should increment kill count
      expect(result.updatedSubmarines.find(s => s.id === 'asw-1')?.totalKills).toBe(1);

      // ASW card without order should NOT participate (no kill count change)
      expect(result.updatedSubmarines.find(s => s.id === 'asw-2')?.totalKills).toBe(0);
    });
  });
});
