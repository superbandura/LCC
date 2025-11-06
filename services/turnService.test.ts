import { describe, it, expect } from 'vitest';
import { TurnService } from './turnService';
import { TurnState } from '../types';

describe('TurnService', () => {
  describe('advanceTurn', () => {
    it('should transition from planning phase to Turn 1', () => {
      const planningState: TurnState = {
        currentDate: '2030-06-01',
        dayOfWeek: 0,
        turnNumber: 0,
        isPlanningPhase: true,
      };

      const result = TurnService.advanceTurn(planningState);

      expect(result.newTurnState.currentDate).toBe('2030-06-02');
      expect(result.newTurnState.dayOfWeek).toBe(1); // Monday
      expect(result.newTurnState.turnNumber).toBe(1);
      expect(result.newTurnState.isPlanningPhase).toBe(false);
      expect(result.completedWeek).toBe(false);
      expect(result.isPlanningPhaseTransition).toBe(true);
    });

    it('should advance a regular day without completing a week', () => {
      const currentState: TurnState = {
        currentDate: '2030-06-03', // Monday
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = TurnService.advanceTurn(currentState);

      expect(result.newTurnState.currentDate).toBe('2030-06-04'); // Tuesday
      expect(result.newTurnState.dayOfWeek).toBe(2); // Tuesday
      expect(result.newTurnState.turnNumber).toBe(1); // Same turn
      expect(result.newTurnState.isPlanningPhase).toBe(false);
      expect(result.completedWeek).toBe(false);
      expect(result.isPlanningPhaseTransition).toBe(false);
    });

    it('should complete a week and advance turn when advancing from Sunday to Monday', () => {
      const sundayState: TurnState = {
        currentDate: '2030-06-09', // Sunday
        dayOfWeek: 7,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = TurnService.advanceTurn(sundayState);

      expect(result.newTurnState.currentDate).toBe('2030-06-10'); // Monday
      expect(result.newTurnState.dayOfWeek).toBe(1); // Monday
      expect(result.newTurnState.turnNumber).toBe(2); // Turn advanced!
      expect(result.completedWeek).toBe(true);
      expect(result.isPlanningPhaseTransition).toBe(false);
    });

    it('should handle mid-week day advancement correctly', () => {
      const wednesdayState: TurnState = {
        currentDate: '2030-06-05', // Wednesday
        dayOfWeek: 3,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const result = TurnService.advanceTurn(wednesdayState);

      expect(result.newTurnState.currentDate).toBe('2030-06-06'); // Thursday
      expect(result.newTurnState.dayOfWeek).toBe(4); // Thursday
      expect(result.newTurnState.turnNumber).toBe(1); // Same turn
      expect(result.completedWeek).toBe(false);
    });
  });

  describe('getDayOfWeek', () => {
    it('should convert Sunday (JS day 0) to 7', () => {
      const sunday = new Date('2030-06-09'); // Sunday
      expect(TurnService.getDayOfWeek(sunday)).toBe(7);
    });

    it('should convert Monday (JS day 1) to 1', () => {
      const monday = new Date('2030-06-03'); // Monday
      expect(TurnService.getDayOfWeek(monday)).toBe(1);
    });

    it('should convert Saturday (JS day 6) to 6', () => {
      const saturday = new Date('2030-06-08'); // Saturday
      expect(TurnService.getDayOfWeek(saturday)).toBe(6);
    });

    it('should convert Wednesday (JS day 3) to 3', () => {
      const wednesday = new Date('2030-06-05'); // Wednesday
      expect(TurnService.getDayOfWeek(wednesday)).toBe(3);
    });
  });

  describe('isTurnChange', () => {
    it('should return false when prevState is undefined', () => {
      const currentState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.isTurnChange(undefined, currentState)).toBe(false);
    });

    it('should detect turn number change', () => {
      const prevState: TurnState = {
        currentDate: '2030-06-09',
        dayOfWeek: 7,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const currentState: TurnState = {
        currentDate: '2030-06-10',
        dayOfWeek: 1,
        turnNumber: 2, // Turn changed!
        isPlanningPhase: false,
      };

      expect(TurnService.isTurnChange(prevState, currentState)).toBe(true);
    });

    it('should detect day of week change', () => {
      const prevState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const currentState: TurnState = {
        currentDate: '2030-06-04',
        dayOfWeek: 2, // Day changed!
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.isTurnChange(prevState, currentState)).toBe(true);
    });

    it('should detect planning phase exit', () => {
      const prevState: TurnState = {
        currentDate: '2030-06-01',
        dayOfWeek: 0,
        turnNumber: 0,
        isPlanningPhase: true,
      };

      const currentState: TurnState = {
        currentDate: '2030-06-02',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false, // Exited planning phase!
      };

      expect(TurnService.isTurnChange(prevState, currentState)).toBe(true);
    });

    it('should return false when nothing changed', () => {
      const prevState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const currentState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.isTurnChange(prevState, currentState)).toBe(false);
    });
  });

  describe('formatTurnDisplay', () => {
    it('should format planning phase', () => {
      const planningState: TurnState = {
        currentDate: '2030-06-01',
        dayOfWeek: 0,
        turnNumber: 0,
        isPlanningPhase: true,
      };

      expect(TurnService.formatTurnDisplay(planningState)).toBe('Planning Phase');
    });

    it('should format a regular turn with day name', () => {
      const mondayState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.formatTurnDisplay(mondayState)).toBe('Week 1, Monday (2030-06-03)');
    });

    it('should format Wednesday correctly', () => {
      const wednesdayState: TurnState = {
        currentDate: '2030-06-05',
        dayOfWeek: 3,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.formatTurnDisplay(wednesdayState)).toBe('Week 1, Wednesday (2030-06-05)');
    });

    it('should format Sunday correctly', () => {
      const sundayState: TurnState = {
        currentDate: '2030-06-09',
        dayOfWeek: 7,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.formatTurnDisplay(sundayState)).toBe('Week 1, Sunday (2030-06-09)');
    });
  });

  describe('isStartOfWeek', () => {
    it('should return true for Monday (day 1) not in planning phase', () => {
      const mondayState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.isStartOfWeek(mondayState)).toBe(true);
    });

    it('should return false for planning phase even if day is 1', () => {
      const planningState: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 0,
        isPlanningPhase: true,
      };

      expect(TurnService.isStartOfWeek(planningState)).toBe(false);
    });

    it('should return false for Tuesday (day 2)', () => {
      const tuesdayState: TurnState = {
        currentDate: '2030-06-04',
        dayOfWeek: 2,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.isStartOfWeek(tuesdayState)).toBe(false);
    });
  });

  describe('isEndOfWeek', () => {
    it('should return true for Sunday (day 7) not in planning phase', () => {
      const sundayState: TurnState = {
        currentDate: '2030-06-09',
        dayOfWeek: 7,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.isEndOfWeek(sundayState)).toBe(true);
    });

    it('should return false for planning phase even if day is 7', () => {
      const planningState: TurnState = {
        currentDate: '2030-06-09',
        dayOfWeek: 7,
        turnNumber: 0,
        isPlanningPhase: true,
      };

      expect(TurnService.isEndOfWeek(planningState)).toBe(false);
    });

    it('should return false for Saturday (day 6)', () => {
      const saturdayState: TurnState = {
        currentDate: '2030-06-08',
        dayOfWeek: 6,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.isEndOfWeek(saturdayState)).toBe(false);
    });
  });

  describe('daysBetween', () => {
    it('should return 0 if fromState is in planning phase', () => {
      const planningState: TurnState = {
        currentDate: '2030-06-01',
        dayOfWeek: 0,
        turnNumber: 0,
        isPlanningPhase: true,
      };

      const normalState: TurnState = {
        currentDate: '2030-06-05',
        dayOfWeek: 4,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.daysBetween(planningState, normalState)).toBe(0);
    });

    it('should return 0 if toState is in planning phase', () => {
      const normalState: TurnState = {
        currentDate: '2030-06-02',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const planningState: TurnState = {
        currentDate: '2030-06-01',
        dayOfWeek: 0,
        turnNumber: 0,
        isPlanningPhase: true,
      };

      expect(TurnService.daysBetween(normalState, planningState)).toBe(0);
    });

    it('should calculate days between consecutive days', () => {
      const monday: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const tuesday: TurnState = {
        currentDate: '2030-06-04',
        dayOfWeek: 2,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.daysBetween(monday, tuesday)).toBe(1);
    });

    it('should calculate days between Monday and Friday', () => {
      const monday: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const friday: TurnState = {
        currentDate: '2030-06-07',
        dayOfWeek: 5,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.daysBetween(monday, friday)).toBe(4);
    });

    it('should calculate days across multiple weeks', () => {
      const week1Monday: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const week3Wednesday: TurnState = {
        currentDate: '2030-06-19',
        dayOfWeek: 3,
        turnNumber: 3,
        isPlanningPhase: false,
      };

      expect(TurnService.daysBetween(week1Monday, week3Wednesday)).toBe(16);
    });

    it('should return negative days when toState is before fromState', () => {
      const friday: TurnState = {
        currentDate: '2030-06-07',
        dayOfWeek: 5,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      const monday: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.daysBetween(friday, monday)).toBe(-4);
    });
  });

  describe('getGamePhase', () => {
    it('should return "planning" for planning phase', () => {
      const planningState: TurnState = {
        currentDate: '2030-06-01',
        dayOfWeek: 0,
        turnNumber: 0,
        isPlanningPhase: true,
      };

      expect(TurnService.getGamePhase(planningState)).toBe('planning');
    });

    it('should return "early-game" for turn 1', () => {
      const turn1: TurnState = {
        currentDate: '2030-06-03',
        dayOfWeek: 1,
        turnNumber: 1,
        isPlanningPhase: false,
      };

      expect(TurnService.getGamePhase(turn1)).toBe('early-game');
    });

    it('should return "early-game" for turn 2', () => {
      const turn2: TurnState = {
        currentDate: '2030-06-10',
        dayOfWeek: 1,
        turnNumber: 2,
        isPlanningPhase: false,
      };

      expect(TurnService.getGamePhase(turn2)).toBe('early-game');
    });

    it('should return "mid-game" for turn 3', () => {
      const turn3: TurnState = {
        currentDate: '2030-06-17',
        dayOfWeek: 1,
        turnNumber: 3,
        isPlanningPhase: false,
      };

      expect(TurnService.getGamePhase(turn3)).toBe('mid-game');
    });

    it('should return "mid-game" for turn 5', () => {
      const turn5: TurnState = {
        currentDate: '2030-07-01',
        dayOfWeek: 1,
        turnNumber: 5,
        isPlanningPhase: false,
      };

      expect(TurnService.getGamePhase(turn5)).toBe('mid-game');
    });

    it('should return "late-game" for turn 6', () => {
      const turn6: TurnState = {
        currentDate: '2030-07-08',
        dayOfWeek: 1,
        turnNumber: 6,
        isPlanningPhase: false,
      };

      expect(TurnService.getGamePhase(turn6)).toBe('late-game');
    });

    it('should return "late-game" for turn 10', () => {
      const turn10: TurnState = {
        currentDate: '2030-08-05',
        dayOfWeek: 1,
        turnNumber: 10,
        isPlanningPhase: false,
      };

      expect(TurnService.getGamePhase(turn10)).toBe('late-game');
    });
  });
});
