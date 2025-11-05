import React from 'react';
import { OperationalData, Card } from '../../../../types';
import { areAirPatrolsDestroyed } from '../helpers';

interface PatrolsTabProps {
  data: OperationalData;
  onCheckboxChange: (faction: 'us' | 'plan', field: 'airPatrolsDamage', index: number) => void;
  onUsedChange: (faction: 'us' | 'plan') => void;
  renderCheckboxes: (faction: 'us' | 'plan', field: 'airPatrolsDamage', count: number, color: string) => React.ReactNode;
  playedCards: string[];
  selectedFaction: 'us' | 'china';
  cards: Card[];
}

const PatrolsTab: React.FC<PatrolsTabProps> = ({
  data,
  onCheckboxChange,
  onUsedChange,
  renderCheckboxes,
  playedCards,
  selectedFaction,
  cards
}) => {
  // Check if Combat Air Patrols card has been played
  const combatAirPatrolsCardId = selectedFaction === 'us' ? 'us-002' : 'china-002';
  const isCardPlayed = playedCards.includes(combatAirPatrolsCardId);

  // If card not played, show warning message
  if (!isCardPlayed) {
    return (
      <div className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-900 bg-opacity-20">
        <p className="text-sm text-yellow-300">
          ⚠️ <strong>Must play the "Combat Air Patrols" card</strong> in this operational area first to activate the air patrol system.
        </p>
      </div>
    );
  }

  // Find the played Combat Air Patrols card
  const playedCard = cards.find(c => c.id === combatAirPatrolsCardId);

  // Map selectedFaction to data key
  const factionKey = selectedFaction === 'us' ? 'us' : 'plan';
  const isPatrolsDestroyed = areAirPatrolsDestroyed(data[factionKey].airPatrolsDamage);

  // Display only the selected faction's section
  if (selectedFaction === 'us') {
    return (
      <div className="border-2 border-blue-500 rounded-lg p-3 bg-blue-950 bg-opacity-30">
        <h4 className="text-sm font-bold text-blue-400 mb-3">
          EE. UU.
          {isPatrolsDestroyed && <span className="text-red-500 font-bold ml-2">(DESTRUIDA)</span>}
        </h4>
        <div className="mb-3">
          <label className="block text-xs font-medium text-blue-300 mb-1.5">
            Air Patrol Damage
          </label>
          {renderCheckboxes('us', 'airPatrolsDamage', 2, 'bg-blue-500')}
        </div>
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={data.us.airPatrolsUsed}
            onChange={() => onUsedChange('us')}
            disabled={isPatrolsDestroyed}
            className="h-4 w-4 bg-gray-700 border-gray-600 text-blue-500 rounded focus:ring-blue-600 mr-2 disabled:bg-gray-800 disabled:cursor-not-allowed"
          />
          <label className={`text-xs font-medium ${isPatrolsDestroyed ? 'text-gray-500' : 'text-blue-300'}`}>
            Air Patrols Used
          </label>
        </div>

        {/* Card Image Display */}
        {playedCard && (
          <div className="mt-3 flex justify-center">
            <div className="relative inline-block">
              <img
                src={playedCard.imagePath}
                alt={playedCard.name}
                className={`w-full max-w-[300px] rounded-lg border-2 border-cyan-500 transition-all ${
                  data.us.airPatrolsUsed ? 'grayscale' : ''
                }`}
              />
              {/* Red X Overlay for Destroyed Patrols */}
              {isPatrolsDestroyed && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-[90%] h-[6px] bg-red-600 rotate-45 shadow-lg" />
                  <div className="absolute w-[90%] h-[6px] bg-red-600 -rotate-45 shadow-lg" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="border-2 border-red-500 rounded-lg p-3 bg-red-950 bg-opacity-30">
        <h4 className="text-sm font-bold text-red-400 mb-3">
          PLAN
          {isPatrolsDestroyed && <span className="text-red-500 font-bold ml-2">(DESTRUIDA)</span>}
        </h4>
        <div className="mb-3">
          <label className="block text-xs font-medium text-red-300 mb-1.5">
            Air Patrol Damage
          </label>
          {renderCheckboxes('plan', 'airPatrolsDamage', 2, 'bg-red-500')}
        </div>
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={data.plan.airPatrolsUsed}
            onChange={() => onUsedChange('plan')}
            disabled={isPatrolsDestroyed}
            className="h-4 w-4 bg-gray-700 border-gray-600 text-red-500 rounded focus:ring-red-600 mr-2 disabled:bg-gray-800 disabled:cursor-not-allowed"
          />
          <label className={`text-xs font-medium ${isPatrolsDestroyed ? 'text-gray-500' : 'text-red-300'}`}>
            Air Patrols Used
          </label>
        </div>

        {/* Card Image Display */}
        {playedCard && (
          <div className="mt-3 flex justify-center">
            <div className="relative inline-block">
              <img
                src={playedCard.imagePath}
                alt={playedCard.name}
                className={`w-full max-w-[300px] rounded-lg border-2 border-cyan-500 transition-all ${
                  data.plan.airPatrolsUsed ? 'grayscale' : ''
                }`}
              />
              {/* Red X Overlay for Destroyed Patrols */}
              {isPatrolsDestroyed && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-[90%] h-[6px] bg-red-600 rotate-45 shadow-lg" />
                  <div className="absolute w-[90%] h-[6px] bg-red-600 -rotate-45 shadow-lg" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default PatrolsTab;
