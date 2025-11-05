import React, { useState } from 'react';
import { Card, InfluenceMarker, InfluenceThreshold } from '../types';
import DiceAnimation from './DiceAnimation';
import { rollD20, getInfluenceEffect, formatInfluenceEffect } from '../utils/dice';

export interface InfluenceRollDetails {
  roll: number;                      // The dice roll result (1-20)
  effect: InfluenceThreshold;        // The matched threshold
  previousValue: number;             // Influence value before the roll
}

interface DiceRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  currentInfluence: InfluenceMarker;
  onApplyInfluence: (newInfluence: InfluenceMarker, card: Card, rollDetails?: InfluenceRollDetails) => void;
  opposingNotificationTimestamp?: string | null;
}

type RollMode = 'select' | 'manual' | 'automatic';

const DiceRollModal: React.FC<DiceRollModalProps> = ({
  isOpen,
  onClose,
  card,
  currentInfluence,
  onApplyInfluence,
  opposingNotificationTimestamp
}) => {
  const [rollMode, setRollMode] = useState<RollMode>('select');
  const [manualInput, setManualInput] = useState<string>('');
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [effectResult, setEffectResult] = useState<InfluenceThreshold | null>(null);

  if (!isOpen) return null;

  const handleManualSubmit = () => {
    const value = parseInt(manualInput);
    if (isNaN(value) || value < 1 || value > 20) {
      alert('Please enter a valid value between 1 and 20');
      return;
    }
    setDiceResult(value);
    calculateEffect(value);
  };

  const handleAutomaticRoll = () => {
    setIsRolling(true);
    const result = rollD20();
    setDiceResult(result);
    // Effect will be calculated when animation completes
  };

  const handleRollComplete = () => {
    setIsRolling(false);
    if (diceResult !== null) {
      calculateEffect(diceResult);
    }
  };

  const calculateEffect = (roll: number) => {
    if (!card.influenceThresholds || card.influenceThresholds.length === 0) {
      console.error('Card has no influence thresholds defined');
      return;
    }

    const effect = getInfluenceEffect(roll, card.influenceThresholds);
    if (effect) {
      setEffectResult(effect);
      // Auto-apply effect immediately
      handleAutoApply(roll, effect);
    } else {
      console.warn(`No matching threshold found for roll ${roll}`);
    }
  };

  const handleAutoApply = (roll: number, effect: InfluenceThreshold) => {
    // Just calculate and display the effect, don't apply yet
    // Application happens when user clicks "APPLY & CLOSE"
  };

  const handleApply = () => {
    if (diceResult === null || effectResult === null) {
      alert('You must roll the dice first');
      return;
    }
    // Result is already displayed, user will click "APPLY & CLOSE" to apply
  };

  const handleReset = () => {
    setRollMode('select');
    setManualInput('');
    setDiceResult(null);
    setEffectResult(null);
    setIsRolling(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleApplyAndClose = () => {
    if (diceResult === null || effectResult === null) {
      alert('Error: No dice result to apply');
      return;
    }

    // Invert effect for PLAN cards (their success should move marker left/negative)
    const adjustedEffect = card.faction === 'china'
      ? -effectResult.influenceEffect
      : effectResult.influenceEffect;

    const newValue = currentInfluence.value + adjustedEffect;
    const clampedValue = Math.max(-10, Math.min(10, newValue)); // Clamp to valid range

    // Create rollDetails object with all roll information
    const rollDetails: InfluenceRollDetails = {
      roll: diceResult,
      effect: effectResult,
      previousValue: currentInfluence.value
    };

    // Apply influence change and trigger Phase 2 notification for both players
    onApplyInfluence({ value: clampedValue }, card, rollDetails);

    // Close modal after applying
    handleReset();
    onClose();
  };

  const getFactionColor = (faction: 'us' | 'china') => {
    return faction === 'us' ? 'blue' : 'red';
  };

  const color = getFactionColor(card.faction);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10004]"
      onClick={handleClose}
    >
      <div
        className="bg-gray-800 shadow-2xl w-[90vw] max-w-2xl flex flex-col border-2 border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-gray-800 bg-black/80">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider">
              🎲 INFLUENCE ROLL
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white text-2xl leading-none font-mono"
            >
              ×
            </button>
          </div>
          <p className={`text-xs font-mono mt-1 text-${color}-400`}>
            {card.name} - {card.faction === 'us' ? 'USMC' : 'PLAN'}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[70vh] font-mono text-xs">
          {/* Mode Selection */}
          {rollMode === 'select' && (
            <div className="space-y-3">
              <h3 className="text-green-400 font-bold mb-3 uppercase tracking-wide text-sm">Select Roll Mode:</h3>

              <button
                onClick={() => setRollMode('manual')}
                className="w-full p-4 bg-black/40 hover:bg-black/60 border-2 border-cyan-500 transition-colors"
              >
                <div className="text-left">
                  <div className="font-bold text-cyan-400 mb-1 text-sm">📝 MANUAL ROLL</div>
                  <div className="text-gray-300">
                    Roll a physical d20 and enter the result
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRollMode('automatic')}
                className="w-full p-4 bg-black/40 hover:bg-black/60 border-2 border-purple-500 transition-colors"
              >
                <div className="text-left">
                  <div className="font-bold text-purple-400 mb-1 text-sm">🤖 AUTOMATIC ROLL</div>
                  <div className="text-gray-300">
                    The application generates a random number (1-20)
                  </div>
                </div>
              </button>

              {/* Thresholds Table */}
              <div className="mt-4 bg-black/40 border border-gray-800 p-3">
                <h4 className="text-green-400 font-bold mb-2 uppercase tracking-wide border-b border-green-900 pb-1.5 text-sm">Roll Thresholds</h4>
                <div className="space-y-1.5 pt-1">
                  {card.influenceThresholds?.map((threshold, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-800 p-2 border border-gray-700"
                    >
                      <span className="text-gray-400 font-mono">
                        🎲 {threshold.minRoll}-{threshold.maxRoll}
                      </span>
                      <span className={`font-bold ${
                        threshold.influenceEffect > 0 ? 'text-blue-400' :
                        threshold.influenceEffect < 0 ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {formatInfluenceEffect(threshold.influenceEffect)}
                      </span>
                      <span className="text-gray-400">{threshold.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Manual Mode */}
          {rollMode === 'manual' && (
            <div className="space-y-3">
              <button
                onClick={() => setRollMode('select')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 font-mono text-xs"
              >
                ← BACK
              </button>

              <div className="bg-black/40 border border-gray-800 p-4">
                <h3 className="text-green-400 font-bold mb-3 uppercase tracking-wide text-sm">Enter Die Result:</h3>

                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-gray-500 mb-2 uppercase tracking-wide">Result (1-20)</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-white border-2 border-gray-600 focus:border-cyan-500 focus:outline-none text-2xl text-center font-bold font-mono"
                      placeholder="1-20"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleManualSubmit}
                    className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold font-mono uppercase tracking-wide transition-colors text-xs"
                  >
                    CONFIRM
                  </button>
                </div>
              </div>

              {diceResult !== null && effectResult && (
                <div className="bg-black/40 border-2 border-green-600 p-3">
                  <h4 className="text-green-400 font-bold mb-2 uppercase tracking-wide text-sm">Result:</h4>
                  <p className="text-white font-mono">
                    Roll: <span className="text-2xl font-bold">{diceResult}</span>
                  </p>
                  <p className="text-white mt-2 font-mono">
                    Effect: <span className="text-lg font-bold">{effectResult.description}</span>
                  </p>
                  <p className="text-gray-400 mt-1 font-mono">
                    Influence Change: {formatInfluenceEffect(effectResult.influenceEffect)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Automatic Mode */}
          {rollMode === 'automatic' && (
            <div className="space-y-3">
              <button
                onClick={() => setRollMode('select')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 font-mono text-xs"
              >
                ← BACK
              </button>

              <DiceAnimation
                finalValue={diceResult || 1}
                isRolling={isRolling}
                onRollComplete={handleRollComplete}
              />

              {!isRolling && diceResult === null && (
                <button
                  onClick={handleAutomaticRoll}
                  className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold font-mono uppercase tracking-wide text-sm transition-colors border-2 border-purple-800"
                >
                  🎲 ROLL D20
                </button>
              )}

              {diceResult !== null && effectResult && !isRolling && (
                <div className="bg-black/40 border-2 border-green-600 p-3">
                  <h4 className="text-green-400 font-bold mb-2 uppercase tracking-wide text-sm">Result:</h4>
                  <p className="text-white font-mono">
                    Roll: <span className="text-2xl font-bold">{diceResult}</span>
                  </p>
                  <p className="text-white mt-2 font-mono">
                    Effect: <span className="text-lg font-bold">{effectResult.description}</span>
                  </p>
                  <p className="text-gray-400 mt-1 font-mono">
                    Influence Change: {formatInfluenceEffect(effectResult.influenceEffect)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(rollMode === 'manual' || rollMode === 'automatic') && diceResult !== null && effectResult && !isRolling && (
          <div className="p-4 border-t-2 border-gray-800 bg-black/80">
            <button
              onClick={handleApplyAndClose}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold font-mono uppercase tracking-wide transition-colors text-xs border-2 border-green-800"
            >
              APPLY & CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceRollModal;
