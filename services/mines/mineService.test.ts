/**
 * MineService Tests
 *
 * Tests for maritime mine warfare mechanics:
 * - Mine detection (5% success rate, d20 = 1)
 * - Submarine destruction
 * - Naval ship destruction
 * - Multiple mines = multiple rolls per unit
 * - Only affects enemy units
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MineService } from './mineService';
import {
  SubmarineCampaignState,
  SubmarineDeployment,
  TurnState,
  OperationalArea,
  TaskForce,
  Unit,
  Card
} from '../../types';

describe('MineService', () => {
  const createMockTurnState = (): TurnState => ({
    turnNumber: 1,
    currentDate: '2030-06-03',
    dayOfWeek: 2,
    isPlanningPhase: false
  });

  const createMockOperationalAreas = (assignedCards: string[] = []): OperationalArea[] => [
    {
      id: 'area-1',
      name: 'Test Area',
      bounds: [[0, 0], [1, 1]],
      assignedCards
    } as OperationalArea
  ];

  const createMockTaskForces = (): TaskForce[] => [
    {
      id: 'tf-1',
      name: 'Task Force 1',
      faction: 'china',
      operationalAreaId: 'area-1',
      units: ['unit-1']
    } as TaskForce
  ];

  const createMockUnits = (): Unit[] => [
    {
      id: 'unit-1',
      name: 'Test DDG',
      type: 'TYPE 052D',
      faction: 'china',
      category: 'naval',
      taskForceId: 'tf-1',
      damagePoints: 3,
      currentDamage: [false, false, false]
    } as Unit
  ];

  const createMockCards = (faction: 'us' | 'china' = 'us'): Card[] => [
    {
      id: `${faction}-020`,
      name: 'Maritime Mines',
      faction: faction,
      submarineType: 'asset',
      cardType: 'attack',
      cost: 3
    } as Card
  ];

  beforeEach(() => {
    // Reset Math.random to default
    Math.random = () => Math.random();
  });

  describe('processMinePhase', () => {
    it('should return empty result when submarine campaign is null', async () => {
      const turnState = createMockTurnState();
      const areas = createMockOperationalAreas();

      const result = await MineService.processMinePhase(
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
      expect(result.eliminatedUnitIds).toHaveLength(0);
    });

    it('should return empty result when no mines deployed', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'Test Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        submarineType: 'submarine',
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
          assignedDate: '2030-06-03'
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: []
      };

      const result = await MineService.processMinePhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas([]), // No mines
        createMockTaskForces(),
        createMockUnits(),
        createMockCards()
      );

      expect(result.events).toHaveLength(0);
      expect(result.eliminatedSubmarineIds).toHaveLength(0);
      expect(result.eliminatedUnitIds).toHaveLength(0);
    });

    it('should not hit submarine when roll !== 1', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'PLAN Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        submarineType: 'submarine',
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
          assignedDate: '2030-06-03'
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: []
      };

      // Mock roll to fail (any number except 1)
      Math.random = () => 0.1; // Results in roll of 3

      const result = await MineService.processMinePhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(['us-020_instance1']),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards('us')
      );

      // Should not eliminate submarine or ship
      expect(result.eliminatedSubmarineIds).toHaveLength(0);
      expect(result.eliminatedUnitIds).toHaveLength(0);

      // Should create events for all detection attempts (submarine + ship)
      expect(result.events).toHaveLength(2); // 1 mine vs 2 units (submarine + ship)
      expect(result.events.every(e => e.eventType === 'detected')).toBe(true);
      expect(result.events.every(e => e.description.includes('passed through minefield'))).toBe(true);
    });

    it('should destroy submarine when roll = 1', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'PLAN Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        submarineType: 'submarine',
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
          assignedDate: '2030-06-03'
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: []
      };

      // Mock roll to succeed for submarine, fail for ship
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.0; // Detection roll = 1 (submarine destroyed)
        if (callCount === 2) return 0.5; // EventBuilder ID
        if (callCount === 3) return 0.5; // Detection roll ≠ 1 (ship evades)
        if (callCount === 4) return 0.5; // EventBuilder ID
        return 0.5;
      };

      const result = await MineService.processMinePhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(['us-020_instance1']),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards('us')
      );

      expect(result.eliminatedSubmarineIds).toHaveLength(1);
      expect(result.eliminatedSubmarineIds[0]).toBe('sub-1');
      expect(result.events).toHaveLength(2); // Submarine destroyed + ship evaded

      // First event should be submarine destroyed
      const destroyedEvent = result.events.find(e => e.eventType === 'destroyed');
      expect(destroyedEvent).toBeDefined();
      expect(destroyedEvent?.faction).toBe('china'); // Defender's faction

      // Second event should be ship detection failed
      const detectedEvent = result.events.find(e => e.eventType === 'detected');
      expect(detectedEvent).toBeDefined();

      expect(result.updatedSubmarines[0].status).toBe('destroyed');
    });

    it('should destroy naval ship when roll = 1', async () => {
      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [],
        events: []
      };

      // Mock roll to succeed
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.0; // Detection roll = 1
        if (callCount === 2) return 0.5; // EventBuilder ID
        return 0.5;
      };

      const result = await MineService.processMinePhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(['us-020_instance1']),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards('us')
      );

      expect(result.eliminatedUnitIds).toHaveLength(1);
      expect(result.eliminatedUnitIds[0]).toBe('unit-1');
      expect(result.events).toHaveLength(1);
      expect(result.events[0].eventType).toBe('destroyed');
      expect(result.events[0].faction).toBe('china'); // Ship's faction

      // Verify ship is fully destroyed
      const destroyedUnit = result.updatedUnits.find(u => u.id === 'unit-1');
      expect(destroyedUnit?.currentDamage.every(d => d)).toBe(true);
    });

    it('should process multiple rolls when multiple mines present', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'PLAN Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        submarineType: 'submarine',
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
          assignedDate: '2030-06-03'
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: []
      };

      // Mock: 2 mines, 2 units (submarine + ship)
      // Order: submarines are checked BEFORE ships (getAllVulnerableUnits adds subs first)
      // Mine 1: submarine fail, ship fail
      // Mine 2: submarine success, ship fail
      // Each detection attempt needs EventBuilder ID call
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.1; // Mine 1 → submarine: roll = 3 (fail)
        if (callCount === 2) return 0.5; // EventBuilder ID for failed detection
        if (callCount === 3) return 0.1; // Mine 1 → ship: roll = 3 (fail)
        if (callCount === 4) return 0.5; // EventBuilder ID for failed detection
        if (callCount === 5) return 0.0; // Mine 2 → submarine: roll = 1 (success)
        if (callCount === 6) return 0.5; // EventBuilder ID for destroyed event
        if (callCount === 7) return 0.1; // Mine 2 → ship: roll = 3 (fail)
        if (callCount === 8) return 0.5; // EventBuilder ID for failed detection
        return 0.5;
      };

      const result = await MineService.processMinePhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(['us-020_instance1', 'us-020_instance2']), // 2 mines
        createMockTaskForces(),
        createMockUnits(),
        createMockCards('us')
      );

      expect(result.eliminatedSubmarineIds).toHaveLength(1);
      expect(result.eliminatedUnitIds).toHaveLength(0); // Ship not hit
      expect(result.events).toHaveLength(4); // All detection attempts: 3 failed + 1 destroyed

      // Verify event types
      const destroyedEvents = result.events.filter(e => e.eventType === 'destroyed');
      const detectedEvents = result.events.filter(e => e.eventType === 'detected');
      expect(destroyedEvents).toHaveLength(1); // Mine 2 → submarine
      expect(detectedEvents).toHaveLength(3); // Mine 1 → sub, Mine 1 → ship, Mine 2 → ship
    });

    it('should only affect enemy units (not same faction)', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Sub',
        faction: 'us', // Same faction as mine
        cardId: 'card-1',
        cardName: 'Submarine Card',
        submarineType: 'submarine',
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
          assignedDate: '2030-06-03'
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: []
      };

      // Mock roll to succeed
      Math.random = () => 0.0; // Roll = 1

      const result = await MineService.processMinePhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(['us-020_instance1']),
        [], // No task forces (no ships)
        [], // No units (no ships)
        createMockCards('us') // US mine should not affect US submarine
      );

      expect(result.eliminatedSubmarineIds).toHaveLength(0);
      expect(result.eliminatedUnitIds).toHaveLength(0);
      expect(result.events).toHaveLength(0);
    });

    it('should process both submarines and ships in same area', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'PLAN Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        submarineType: 'submarine',
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
          assignedDate: '2030-06-03'
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: []
      };

      // Mock: Both submarine and ship get hit
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.0; // Submarine: roll = 1 (hit)
        if (callCount === 2) return 0.5; // EventBuilder ID for submarine
        if (callCount === 3) return 0.0; // Ship: roll = 1 (hit)
        if (callCount === 4) return 0.5; // EventBuilder ID for ship
        return 0.5;
      };

      const result = await MineService.processMinePhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(['us-020_instance1']),
        createMockTaskForces(),
        createMockUnits(),
        createMockCards('us')
      );

      expect(result.eliminatedSubmarineIds).toHaveLength(1);
      expect(result.eliminatedUnitIds).toHaveLength(1);
      expect(result.events).toHaveLength(2); // Both destroyed
    });

    it('should not affect already eliminated units', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'PLAN Sub',
        faction: 'china',
        cardId: 'card-1',
        cardName: 'Submarine Card',
        submarineType: 'submarine',
        status: 'destroyed', // Already destroyed
        missionsCompleted: 0,
        totalKills: 0
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: []
      };

      // Mock roll to succeed
      Math.random = () => 0.0; // Roll = 1

      const result = await MineService.processMinePhase(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas(['us-020_instance1']),
        [], // No task forces (no ships)
        [], // No units (no ships)
        createMockCards('us')
      );

      expect(result.eliminatedSubmarineIds).toHaveLength(0);
      expect(result.eliminatedUnitIds).toHaveLength(0);
      expect(result.events).toHaveLength(0);
    });
  });
});
