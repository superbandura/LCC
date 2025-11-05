import React from 'react';
import { Card, Unit } from '../../../../types';

interface CardPlayModalProps {
  card: Card;
  compatibleUnits: Unit[];
  selectedUnitId: string;
  onSelectUnit: (unitId: string) => void;
  onAttach: () => void;
  onPlay: () => void;
  onCancel: () => void;
}

const CardPlayModal: React.FC<CardPlayModalProps> = ({
  card,
  compatibleUnits,
  selectedUnitId,
  onSelectUnit,
  onAttach,
  onPlay,
  onCancel
}) => {
  const isAttachable = card.isAttachable === true;
  const hasCompatibleUnits = compatibleUnits.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]"
      onClick={onCancel}
    >
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            {card.name}
          </h3>
          <div className="mb-4 flex justify-center">
            <img
              src={card.imagePath}
              alt={card.name}
              className="max-w-full max-h-[50vh] object-contain rounded-lg border-2 border-cyan-400"
            />
          </div>

          {/* Show unit selector only if card is attachable */}
          {isAttachable && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attach to Unit:
              </label>
              {hasCompatibleUnits ? (
                <select
                  value={selectedUnitId}
                  onChange={(e) => onSelectUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Select a unit --</option>
                  {compatibleUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.type})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-yellow-400 bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded px-3 py-2">
                  ⚠️ No compatible units of category "{card.attachableCategory}" in this operational area.
                </p>
              )}

              {/* Show card bonuses */}
              {(card.hpBonus || card.secondaryAmmoBonus) && (
                <div className="mt-3 p-3 bg-cyan-900 bg-opacity-20 border border-cyan-600 rounded">
                  <p className="text-xs font-semibold text-cyan-400 mb-1">Bonuses:</p>
                  {card.hpBonus && card.hpBonus > 0 && (
                    <p className="text-xs text-white">💚 +{card.hpBonus} HP</p>
                  )}
                  {card.secondaryAmmoBonus && card.secondaryAmmoBonus > 0 && (
                    <p className="text-xs text-white">🔶 +{card.secondaryAmmoBonus} Secondary Ammunition</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
            >
              Cancel
            </button>
            {isAttachable ? (
              <button
                onClick={onAttach}
                disabled={!selectedUnitId}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔗 Attach
              </button>
            ) : (
              <button
                onClick={onPlay}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
              >
                ▶ Play
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPlayModal;
