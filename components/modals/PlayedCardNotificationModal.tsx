import React from 'react';
import { PlayedCardNotification } from '../../types';
import InfluenceTrackAnimation from '../InfluenceTrackAnimation';

interface PlayedCardNotificationModalProps {
  notification: PlayedCardNotification;
  onClose: () => void;
}

const PlayedCardNotificationModal: React.FC<PlayedCardNotificationModalProps> = ({
  notification,
  onClose
}) => {
  console.log('🖼️ [MODAL] PlayedCardNotificationModal rendering');
  console.log('🖼️ [MODAL] notification:', notification);
  console.log('🖼️ [MODAL] timestamp:', notification.timestamp);
  console.log('🖼️ [MODAL] notificationPhase:', notification.notificationPhase);
  console.log('🖼️ [MODAL] faction:', notification.faction);
  console.log('🖼️ [MODAL] cardName:', notification.cardName);

  // Determine faction color and name
  const factionColor = notification.faction === 'us' ? 'blue' : 'red';
  const factionName = notification.faction === 'us' ? 'USMC' : 'PLAN';

  // Format day of week (English)
  const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayName = dayNames[notification.dayOfWeek] || `Day ${notification.dayOfWeek}`;

  // Detect phase - only for influence cards
  const phase = notification.isInfluenceCard
    ? (notification.notificationPhase || 'card_shown')
    : undefined;

  console.log('🖼️ [MODAL] Computed phase:', phase);

  const isCardPhase = phase === 'card_shown';
  const isResultPhase = phase === 'result_ready';

  // Format influence effect
  const formatInfluenceEffect = (effect?: number) => {
    if (effect === undefined) return '';
    if (effect > 0) return `+${effect}`;
    return `${effect}`;
  };

  // Get influence effect color
  const getInfluenceEffectColor = (effect?: number) => {
    if (effect === undefined) return 'text-gray-400';
    if (effect > 0) return 'text-blue-400';
    if (effect < 0) return 'text-red-400';
    return 'text-yellow-400';
  };

  // PHASE 1: CARD SHOWN
  if (isCardPhase) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]"
        // NO onClick - Phase 1 cannot be closed manually, must wait for auto-transition to Phase 2
      >
        <div
          className="bg-gray-800 max-w-md w-full mx-4 flex flex-col border-2 border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b-2 border-gray-800 bg-black/80">
            <h2 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider">
              🎴 CARD PLAYED BY {factionName}
            </h2>
            <p className={`text-xs font-mono mt-1 text-${factionColor}-400`}>
              {notification.cardName}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">

            {/* Card Image */}
            <div className="flex justify-center bg-black/40 border border-gray-800 p-3">
              <img
                src={notification.cardImagePath}
                alt={notification.cardName}
                className="max-w-full max-h-[40vh] object-contain"
              />
            </div>

            {/* Basic Information */}
            <div className="bg-black/40 border border-gray-800 p-3">
              <h3 className="text-green-400 font-bold mb-2 uppercase tracking-wide border-b border-green-900 pb-1.5 text-sm">
                OPERATIONS REPORT
              </h3>
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">OPERATIONAL AREA:</span>
                  <span className="text-white">{notification.areaName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">TURN:</span>
                  <span className="text-white">WEEK {notification.turn} <span className="text-gray-600">|</span> {dayName}</span>
                </div>
              </div>
            </div>

            {/* Message for influence cards */}
            {notification.isInfluenceCard && (
              <div className="bg-black/40 border border-gray-800 p-3 text-center">
                <p className="text-cyan-400 text-sm font-mono">
                  This card will affect the influence marker
                </p>
                <p className="text-gray-500 text-xs font-mono mt-2">
                  Waiting for {factionName} to roll dice...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PHASE 2: RESULT READY (No animation, show result immediately)
  if (isResultPhase) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]"
        onClick={onClose}
      >
        <div
          className="bg-gray-800 max-w-md w-full mx-4 flex flex-col border-2 border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b-2 border-gray-800 bg-black/80">
            <h2 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider">
              INFLUENCE ROLL RESULT
            </h2>
            <p className={`text-xs font-mono mt-1 text-${factionColor}-400`}>
              {factionName} - {notification.cardName}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">

            {/* Dice Roll Result - NO ANIMATION, direct display */}
            <div className="bg-black/40 border-2 border-green-600 p-4">
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-2">DICE ROLL (d20):</p>
                <p className="text-white text-5xl font-bold my-4">{notification.diceRoll}</p>
              </div>
            </div>

            {/* Effect Details */}
            <div className="bg-black/40 border border-gray-800 p-3">
              <h3 className="text-green-400 font-bold mb-2 uppercase tracking-wide border-b border-green-900 pb-1.5 text-sm">
                EFFECT
              </h3>
              <div className="space-y-2 pt-1">
                <div>
                  <p className="text-white font-semibold">{notification.influenceDescription}</p>
                </div>
                <div>
                  <span className={`text-lg font-bold ${getInfluenceEffectColor(notification.influenceEffect)}`}>
                    {formatInfluenceEffect(notification.influenceEffect)} INFLUENCE POINTS
                  </span>
                </div>
              </div>
            </div>

            {/* Influence Change */}
            <div className="bg-black/40 border border-gray-800 p-3">
              <h3 className="text-green-400 font-bold mb-2 uppercase tracking-wide border-b border-green-900 pb-1.5 text-sm">
                INFLUENCE CHANGE
              </h3>
              <div className="pt-2">
                <InfluenceTrackAnimation
                  previousValue={notification.previousInfluence ?? 0}
                  newValue={notification.newInfluence ?? 0}
                  influenceEffect={notification.influenceEffect}
                />
              </div>
            </div>

            {/* Operations Report */}
            <div className="bg-black/40 border border-gray-800 p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">OPERATIONAL AREA:</span>
                  <span className="text-white">{notification.areaName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">TURN:</span>
                  <span className="text-white">WEEK {notification.turn} <span className="text-gray-600">|</span> {dayName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t-2 border-gray-800 bg-black/80">
            <button
              onClick={onClose}
              className={`w-full py-3 bg-black border-2 font-mono font-bold uppercase tracking-wide text-xs transition-colors ${
                notification.faction === 'us'
                  ? 'border-blue-900 hover:border-blue-700 text-blue-400 hover:text-blue-300'
                  : 'border-red-900 hover:border-red-700 text-red-400 hover:text-red-300'
              }`}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Regular card (non-influence)
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 max-w-md w-full mx-4 flex flex-col border-2 border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-gray-800 bg-black/80">
          <h2 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider">
            🎴 CARD PLAYED BY {factionName}
          </h2>
          <p className={`text-xs font-mono mt-1 text-${factionColor}-400`}>
            {notification.cardName}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">

          {/* Card Image */}
          <div className="flex justify-center bg-black/40 border border-gray-800 p-3">
            <img
              src={notification.cardImagePath}
              alt={notification.cardName}
              className="max-w-full max-h-[40vh] object-contain"
            />
          </div>

          {/* Basic Information */}
          <div className="bg-black/40 border border-gray-800 p-3">
            <h3 className="text-green-400 font-bold mb-2 uppercase tracking-wide border-b border-green-900 pb-1.5 text-sm">
              OPERATIONS REPORT
            </h3>
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">OPERATIONAL AREA:</span>
                <span className="text-white">{notification.areaName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">TURN:</span>
                <span className="text-white">WEEK {notification.turn} <span className="text-gray-600">|</span> {dayName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-gray-800 bg-black/80">
          <button
            onClick={onClose}
            className={`w-full py-3 bg-black border-2 font-mono font-bold uppercase tracking-wide text-xs transition-colors ${
              notification.faction === 'us'
                ? 'border-blue-900 hover:border-blue-700 text-blue-400 hover:text-blue-300'
                : 'border-red-900 hover:border-red-700 text-red-400 hover:text-red-300'
            }`}
          >
            ACKNOWLEDGE
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayedCardNotificationModal;
