import React from 'react';
import { TurnState } from '../types';

interface TurnControlProps {
  turnState: TurnState;
  onAdvanceTurn: () => void;
  canAdvanceTurn: boolean;
  sidebarOpen?: boolean;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const TurnControl: React.FC<TurnControlProps> = ({
  turnState,
  onAdvanceTurn,
  canAdvanceTurn,
  sidebarOpen = false,
}) => {

  const leftPosition = sidebarOpen ? 'left-[340px]' : 'left-24';

  // CASE 1: Pre-Planning Phase (pulsing button with no text)
  if (turnState.isPrePlanningPhase) {
    return (
      <div
        className={`absolute top-3 ${leftPosition} z-[1000] bg-black/80 border-2 border-gray-800 transition-all duration-300`}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          {canAdvanceTurn && (
            <button
              onClick={onAdvanceTurn}
              className="bg-black border-2 border-green-600 hover:border-green-500 text-green-400 hover:text-green-300 w-8 h-8 flex items-center justify-center text-xs font-mono font-bold transition-colors animate-pulse"
              title="Begin Campaign Planning"
            >
              ▶
            </button>
          )}
        </div>
      </div>
    );
  }

  // CASE 2: Planning Phase
  if (turnState.isPlanningPhase) {
    return (
      <div
        className={`absolute top-3 ${leftPosition} z-[1000] bg-black/80 border-2 border-gray-800 transition-all duration-300`}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          {canAdvanceTurn && (
            <button
              onClick={onAdvanceTurn}
              className="bg-black border-2 border-red-900 hover:border-red-700 text-red-400 hover:text-red-300 w-8 h-8 flex items-center justify-center text-xs font-mono font-bold transition-colors"
              title="Start Turn 1"
            >
              ▶
            </button>
          )}
          <div className="text-green-400 font-mono font-bold text-xs whitespace-nowrap uppercase tracking-wider">
            PLANNING
          </div>
        </div>
      </div>
    );
  }

  // CASE 3: Normal turns
  // Parse current date
  const currentDate = new Date(turnState.currentDate);
  const dayName = DAYS_OF_WEEK[currentDate.getDay()];
  const day = currentDate.getDate();
  const monthName = MONTHS[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  // Format: "Monday, June 2, 2030 (Turn 1)"
  const dateDisplay = `${dayName}, ${monthName} ${day}, ${year} (Turn ${turnState.turnNumber})`;

  // Button is red on day 7 (will complete week), green otherwise
  const isLastDay = turnState.dayOfWeek === 7;
  const buttonBorderColor = isLastDay
    ? 'border-red-900 hover:border-red-700'
    : 'border-green-900 hover:border-green-700';
  const buttonTextColor = isLastDay
    ? 'text-red-400 hover:text-red-300'
    : 'text-green-400 hover:text-green-300';

  return (
    <div
      className={`absolute top-3 ${leftPosition} z-[1000] bg-black/80 border-2 border-gray-800 transition-all duration-300`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        {canAdvanceTurn && (
          <button
            onClick={onAdvanceTurn}
            className={`bg-black border-2 ${buttonBorderColor} ${buttonTextColor} w-8 h-8 flex items-center justify-center text-xs font-mono font-bold transition-colors`}
            title={isLastDay ? "Advance turn (new week)" : "Advance 1 day"}
          >
            ▶
          </button>
        )}
        <div className="text-green-400 font-mono text-xs whitespace-nowrap uppercase">
          {dateDisplay}
        </div>
      </div>
    </div>
  );
};
