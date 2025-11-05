import React, { useState, useEffect } from 'react';

interface DiceAnimationProps {
  finalValue: number; // The final value to display (1-20)
  isRolling: boolean; // Whether the dice is currently rolling
  onRollComplete?: () => void; // Callback when animation completes
}

/**
 * D20 Dice Animation Component
 * Displays a rolling dice animation with a final value
 */
const DiceAnimation: React.FC<DiceAnimationProps> = ({
  finalValue,
  isRolling,
  onRollComplete
}) => {
  const [displayValue, setDisplayValue] = useState<number>(finalValue);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isRolling) {
      setIsAnimating(true);

      // Rapid number cycling effect
      const cycleInterval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 20) + 1);
      }, 50);

      // Stop after 2 seconds and show final value
      const timeout = setTimeout(() => {
        clearInterval(cycleInterval);
        setDisplayValue(finalValue);
        setIsAnimating(false);
        if (onRollComplete) {
          onRollComplete();
        }
      }, 2000);

      return () => {
        clearInterval(cycleInterval);
        clearTimeout(timeout);
      };
    } else {
      setDisplayValue(finalValue);
      setIsAnimating(false);
    }
  }, [isRolling, finalValue, onRollComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Dice container */}
      <div
        className={`
          relative w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl
          shadow-2xl flex items-center justify-center transform transition-all duration-200
          ${isAnimating ? 'animate-spin-slow' : 'hover:scale-105'}
        `}
        style={{
          boxShadow: isAnimating
            ? '0 0 40px rgba(6, 182, 212, 0.8)'
            : '0 20px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* D20 label */}
        <div className="absolute top-2 left-2 text-xs font-bold text-white opacity-50">
          D20
        </div>

        {/* Dice value */}
        <div className="text-6xl font-bold text-white select-none">
          {displayValue}
        </div>

        {/* Shine effect */}
        <div
          className={`
            absolute inset-0 rounded-2xl bg-gradient-to-br from-white to-transparent opacity-20
            ${isAnimating ? 'animate-pulse' : ''}
          `}
        />
      </div>

      {/* Status text */}
      <div className="mt-4 text-center">
        {isAnimating ? (
          <p className="text-cyan-400 font-semibold animate-pulse">
            🎲 Tirando dado...
          </p>
        ) : (
          <p className="text-gray-400 text-sm">
            Resultado: <span className="text-white font-bold text-lg">{finalValue}</span>
          </p>
        )}
      </div>

      {/* Custom CSS for slow spin animation */}
      <style jsx>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(90deg) scale(1.1);
          }
          50% {
            transform: rotate(180deg) scale(1);
          }
          75% {
            transform: rotate(270deg) scale(1.1);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DiceAnimation;
