import React from 'react';

interface InfluenceTrackProps {
  value: number; // Current influence value (-10 to +10)
  onChange?: (newValue: number) => void; // Optional callback for manual changes (future feature)
}

/**
 * InfluenceTrack Component
 *
 * Displays a horizontal track showing the campaign influence between US and China.
 * - Internal value range: -10 (China advantage) to +10 (US advantage)
 * - Display: Shows absolute values (10 to 1 for China, 0 neutral, 1 to 10 for US)
 * - Visual gradient: Red (China) to Yellow (Neutral) to Blue (US)
 * - Includes numeric labels and position marker
 */
const InfluenceTrack: React.FC<InfluenceTrackProps> = ({ value, onChange }) => {
  // Generate array of positions from -10 to 10
  const positions = Array.from({ length: 21 }, (_, i) => i - 10);

  // Helper function to get display label (absolute value)
  const getDisplayLabel = (position: number): string => {
    if (position === 0) return '0';
    return Math.abs(position).toString();
  };

  // Helper function to get color for each position
  const getPositionColor = (position: number): string => {
    if (position < -5) return 'bg-red-700'; // Strong China advantage
    if (position < 0) return 'bg-red-500';  // China advantage
    if (position === 0) return 'bg-yellow-400'; // Neutral
    if (position <= 5) return 'bg-blue-500';  // US advantage
    return 'bg-blue-700'; // Strong US advantage
  };

  // Helper function to get opacity for non-active positions
  const getOpacity = (position: number): string => {
    return position === value ? 'opacity-100' : 'opacity-40';
  };

  return (
    <div className="w-full">
      {/* Header with faction labels */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <span className="text-sm font-semibold text-red-400">CHINA</span>
        </div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Marcador de Influencia
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-blue-400">US</span>
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
        </div>
      </div>

      {/* Track container */}
      <div className="relative bg-gray-800 rounded-lg p-4 shadow-inner">
        {/* Track bar */}
        <div className="flex items-stretch gap-0.5 mb-2">
          {positions.map((position) => (
            <div
              key={position}
              className={`
                flex-1 h-12 rounded transition-all duration-300
                ${getPositionColor(position)}
                ${getOpacity(position)}
                ${onChange ? 'cursor-pointer hover:opacity-80' : ''}
                relative
              `}
              onClick={() => onChange?.(position)}
              title={`Influencia: ${position}`}
            >
              {/* Highlight current position */}
              {position === value && (
                <div className="absolute inset-0 border-2 border-white rounded animate-pulse"></div>
              )}
            </div>
          ))}
        </div>

        {/* Numeric labels */}
        <div className="flex items-center justify-between text-xs font-mono">
          {positions.map((position) => {
            // Show labels only at key positions
            const showLabel = position % 5 === 0 || position === value;
            return (
              <div
                key={`label-${position}`}
                className={`
                  flex-1 text-center
                  ${position === value ? 'text-white font-bold' : 'text-gray-500'}
                  ${showLabel ? 'opacity-100' : 'opacity-0'}
                `}
              >
                {getDisplayLabel(position)}
              </div>
            );
          })}
        </div>

        {/* Current value indicator */}
        <div className="mt-3 text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-full">
            <span className="text-xs text-gray-400">Current position:</span>
            <span className={`
              text-lg font-bold
              ${value < 0 ? 'text-red-400' : value > 0 ? 'text-blue-400' : 'text-yellow-400'}
            `}>
              {value === 0 ? '0' : Math.abs(value)}
            </span>
            <span className="text-xs text-gray-400">
              {value < -5 ? '(Strong China advantage)' :
               value < 0 ? '(China advantage)' :
               value === 0 ? '(Neutral)' :
               value <= 5 ? '(US advantage)' :
               '(Strong US advantage)'}
            </span>
          </div>
        </div>

        {/* Admin controls - Only shown when onChange is provided */}
        {onChange && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => onChange(Math.max(-10, value - 1))}
              disabled={value <= -10}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Move toward China (-1)"
            >
              <span className="text-lg">←</span>
              <span className="text-sm">China</span>
            </button>

            <div className="px-3 py-1 bg-gray-900 rounded text-xs text-gray-400 font-mono">
              Admin Controls
            </div>

            <button
              onClick={() => onChange(Math.min(10, value + 1))}
              disabled={value >= 10}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Move toward US (+1)"
            >
              <span className="text-sm">US</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluenceTrack;
