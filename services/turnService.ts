/**
 * TurnService
 *
 * Handles all turn advancement mechanics including:
 * - Planning phase to Turn 1 transition
 * - Day and week advancement
 * - Turn state calculations
 *
 * This service is pure and testable - it doesn't directly modify Firebase,
 * but returns updated data structures for the caller to persist.
 */

import { TurnState } from '../types';

export interface TurnAdvancementResult {
  newTurnState: TurnState;
  completedWeek: boolean;
  isPlanningPhaseTransition: boolean;
  isPrePlanningPhaseTransition: boolean; // Pre-planning → Planning transition
}

/**
 * TurnService class
 * Contains all turn advancement logic
 */
export class TurnService {
  /**
   * Advance the turn by one day
   * Handles pre-planning, planning phase transitions and normal day advancement
   */
  static advanceTurn(currentTurnState: TurnState): TurnAdvancementResult {
    // CASE 1: Transition from Pre-Planning Phase → Planning Phase
    if (currentTurnState.isPrePlanningPhase) {
      const newTurnState: TurnState = {
        currentDate: currentTurnState.currentDate || '2030-06-01', // Keep current or default
        dayOfWeek: currentTurnState.dayOfWeek || 0,
        turnNumber: 0, // Still in planning
        isPrePlanningPhase: false, // Exit pre-planning phase
        isPlanningPhase: true, // Enter planning phase
      };

      console.log('Pre-planning phase completed! Entering Planning Phase');

      return {
        newTurnState,
        completedWeek: false,
        isPlanningPhaseTransition: false,
        isPrePlanningPhaseTransition: true
      };
    }

    // CASE 2: Transition from Planning Phase → Turn 1
    if (currentTurnState.isPlanningPhase) {
      const newTurnState: TurnState = {
        currentDate: '2030-06-02', // Start date of the game
        dayOfWeek: 1, // Monday
        turnNumber: 1, // Start Turn 1
        isPlanningPhase: false, // Exit planning phase
      };

      console.log('Planning phase completed! Starting Turn 1');

      return {
        newTurnState,
        completedWeek: false,
        isPlanningPhaseTransition: true,
        isPrePlanningPhaseTransition: false
      };
    }

    // CASE 3: Normal day advancement
    // Parse current date and add 1 day
    const currentDate = new Date(currentTurnState.currentDate);
    currentDate.setDate(currentDate.getDate() + 1);

    // Calculate new day of week (1-7, where 1 = Monday, 7 = Sunday)
    const jsDay = currentDate.getDay(); // 0-6 where 0 = Sunday
    const newDayOfWeek = jsDay === 0 ? 7 : jsDay;

    // Check if we completed a week (transitioned from day 7 to day 1)
    const completedWeek = currentTurnState.dayOfWeek === 7 && newDayOfWeek === 1;

    // Prepare new turn state
    const newTurnState: TurnState = {
      currentDate: currentDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
      dayOfWeek: newDayOfWeek,
      turnNumber: completedWeek ? currentTurnState.turnNumber + 1 : currentTurnState.turnNumber,
      isPlanningPhase: false, // Always false in normal turns
    };

    if (completedWeek) {
      console.log('Week completed! Turn advanced to:', newTurnState.turnNumber);
    } else {
      console.log('Day advanced:', newDayOfWeek, '/', 7);
    }

    return {
      newTurnState,
      completedWeek,
      isPlanningPhaseTransition: false,
      isPrePlanningPhaseTransition: false
    };
  }

  /**
   * Calculate the day of week (1-7) from a JavaScript Date
   * 1 = Monday, 7 = Sunday
   */
  static getDayOfWeek(date: Date): number {
    const jsDay = date.getDay(); // 0-6 where 0 = Sunday
    return jsDay === 0 ? 7 : jsDay;
  }

  /**
   * Check if two turn states represent different turns
   * Used to detect turn changes for triggering notifications
   */
  static isTurnChange(prevState: TurnState | undefined, currentState: TurnState): boolean {
    if (!prevState) return false;

    // Check for turn number change
    if (prevState.turnNumber !== currentState.turnNumber) {
      return true;
    }

    // Check for day change
    if (prevState.dayOfWeek !== currentState.dayOfWeek) {
      return true;
    }

    // Check for planning phase exit
    if (prevState.isPlanningPhase && !currentState.isPlanningPhase) {
      return true;
    }

    return false;
  }

  /**
   * Format turn state for display
   */
  static formatTurnDisplay(turnState: TurnState): string {
    if (turnState.isPrePlanningPhase) {
      return 'Pre-Planning Phase';
    }

    if (turnState.isPlanningPhase) {
      return 'Planning Phase';
    }

    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayName = dayNames[turnState.dayOfWeek] || 'Day ' + turnState.dayOfWeek;

    return `Week ${turnState.turnNumber}, ${dayName} (${turnState.currentDate})`;
  }

  /**
   * Check if turn state represents the start of a new week
   */
  static isStartOfWeek(turnState: TurnState): boolean {
    return turnState.dayOfWeek === 1 && !turnState.isPlanningPhase;
  }

  /**
   * Check if turn state represents the end of a week
   */
  static isEndOfWeek(turnState: TurnState): boolean {
    return turnState.dayOfWeek === 7 && !turnState.isPlanningPhase;
  }

  /**
   * Calculate the number of days between two turn states
   * Useful for deployment timing and other time-based calculations
   */
  static daysBetween(fromState: TurnState, toState: TurnState): number {
    if (fromState.isPlanningPhase || toState.isPlanningPhase) {
      // Can't calculate days for planning phase
      return 0;
    }

    const fromDate = new Date(fromState.currentDate);
    const toDate = new Date(toState.currentDate);

    const diffTime = toDate.getTime() - fromDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Get the current phase of the game
   */
  static getGamePhase(turnState: TurnState): 'pre-planning' | 'planning' | 'early-game' | 'mid-game' | 'late-game' {
    if (turnState.isPrePlanningPhase) {
      return 'pre-planning';
    }

    if (turnState.isPlanningPhase) {
      return 'planning';
    }

    if (turnState.turnNumber <= 2) {
      return 'early-game';
    }

    if (turnState.turnNumber <= 5) {
      return 'mid-game';
    }

    return 'late-game';
  }

  /**
   * Get the initial turn state with pre-planning phase enabled
   */
  static getInitialTurnState(): TurnState {
    return {
      currentDate: '2030-06-01',
      dayOfWeek: 0,
      turnNumber: 0,
      isPrePlanningPhase: true,
      isPlanningPhase: false,
    };
  }
}
