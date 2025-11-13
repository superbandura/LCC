import { TurnState } from '../types';

// Initial turn state: Pre-Planning Phase (before Planning Phase)
// Flow: Pre-Planning → Planning → Turn 1 (starts June 2, 2030)
export const initialTurnState: TurnState = {
  currentDate: '2030-06-01', // ISO format (placeholder date)
  dayOfWeek: 0, // Not used during pre-planning
  turnNumber: 0, // 0 = Pre-planning/planning phase
  isPrePlanningPhase: true, // Pre-planning phase (pulsing button, no text)
  isPlanningPhase: false, // Not yet in planning phase
};
