import { TurnState } from '../types';

// Initial turn state: Planning Phase (before Turn 1)
// When planning ends, game will start on June 2, 2030 (Monday)
export const initialTurnState: TurnState = {
  currentDate: '2030-06-02', // ISO format (not used during planning phase)
  dayOfWeek: 1, // Monday (not used during planning phase)
  turnNumber: 0, // 0 = Planning phase
  isPlanningPhase: true, // Special planning turn before Turn 1
};
