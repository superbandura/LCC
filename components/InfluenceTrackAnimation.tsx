import React, { useState, useEffect } from 'react';

interface InfluenceTrackAnimationProps {
  previousValue: number;
  newValue: number;
  influenceEffect?: number;
}

const InfluenceTrackAnimation: React.FC<InfluenceTrackAnimationProps> = ({
  previousValue,
  newValue,
  influenceEffect
}) => {
  const [currentValue, setCurrentValue] = useState(previousValue);

  // Animate between previous and new value every 1 second
  useEffect(() => {
    // If no change, show static position
    if (previousValue === newValue) {
      setCurrentValue(newValue);
      return;
    }

    // Start animation loop
    const interval = setInterval(() => {
      setCurrentValue(prev => prev === previousValue ? newValue : previousValue);
    }, 1000); // 1 second per cycle

    return () => clearInterval(interval);
  }, [previousValue, newValue]);

  // Generate positions from -10 to +10
  const positions = Array.from({ length: 21 }, (_, i) => i - 10);

  // Get color for position based on value
  const getPositionColor = (position: number): string => {
    if (position < -5) return 'bg-red-700';
    if (position < 0) return 'bg-red-500';
    if (position === 0) return 'bg-yellow-400';
    if (position <= 5) return 'bg-blue-500';
    return 'bg-blue-700';
  };

  // Get opacity for position
  const getOpacity = (position: number): string => {
    return position === currentValue ? 'opacity-100' : 'opacity-40';
  };

  // Calculate direction and color for arrow
  const direction = newValue > previousValue ? 'right' : 'left';
  const arrowColor = (influenceEffect ?? 0) > 0 ? 'text-blue-400' : 'text-red-400';
  const hasChange = previousValue !== newValue;

  return (
    <div className="font-mono">
      {/* Directional arrow (only if there's a change) */}
      {hasChange && (
        <div className="flex justify-center mb-2">
          <div className={`${arrowColor} text-3xl font-bold animate-pulse`}>
            {direction === 'right' ? '→' : '←'}
          </div>
        </div>
      )}

      {/* Header: CHINA (left) and US (right) */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-600"></div>
          <span className="text-xs font-bold text-red-400 uppercase tracking-wide">CHINA</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">US</span>
          <div className="w-2 h-2 bg-blue-600"></div>
        </div>
      </div>

      {/* Track: 21 columns from -10 to +10 */}
      <div className="flex items-stretch gap-0.5 mb-2">
        {positions.map((position) => (
          <div
            key={position}
            className={`
              flex-1 h-8 transition-all duration-300 relative
              ${getPositionColor(position)}
              ${getOpacity(position)}
            `}
          >
            {/* Highlight current position with pulsing border */}
            {position === currentValue && (
              <div className="absolute inset-0 border-2 border-white animate-pulse"></div>
            )}
          </div>
        ))}
      </div>

      {/* Current value display */}
      <div className="text-center text-xs text-gray-400">
        <span className="font-mono">
          Current: <span className={`font-bold ${
            currentValue < 0 ? 'text-red-400' :
            currentValue > 0 ? 'text-blue-400' :
            'text-yellow-400'
          }`}>
            {currentValue > 0 ? '+' : ''}{currentValue}
          </span>
        </span>
      </div>
    </div>
  );
};

export default InfluenceTrackAnimation;
