import React from 'react';
import { Location } from '../../../../types';

interface BasesTabProps {
  nearbyBases: Location[];
  selectedBaseId: string | null;
  baseDamage: Record<string, boolean[]>;
  onSelectBase: (baseId: string) => void;
  onBaseDamageChange: (baseId: string, index: number) => void;
}

const BasesTab: React.FC<BasesTabProps> = ({
  nearbyBases,
  selectedBaseId,
  baseDamage,
  onSelectBase,
  onBaseDamageChange
}) => {
  if (nearbyBases.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No military bases in this operational area</p>
      </div>
    );
  }

  const selectedBase = nearbyBases.find(b => b.id === selectedBaseId);
  const damage = selectedBase
    ? (baseDamage[selectedBase.id] || Array(selectedBase.damagePoints).fill(false))
    : [];
  const isUsBase = selectedBase?.country === 'EE. UU.';
  const color = isUsBase ? 'blue' : 'red';

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Select base:
        </label>
        <select
          value={selectedBaseId || ''}
          onChange={(e) => onSelectBase(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm focus:outline-none focus:border-cyan-500"
        >
          <option value="">-- Select a base --</option>
          {nearbyBases.map((base) => (
            <option key={base.id} value={base.id}>
              {base.name} ({base.country})
            </option>
          ))}
        </select>
      </div>

      {selectedBase && (
        <div
          className={`border-2 rounded-lg p-3 ${
            isUsBase
              ? 'border-blue-500 bg-blue-950 bg-opacity-30'
              : 'border-red-500 bg-red-950 bg-opacity-30'
          }`}
        >
          <h4 className={`text-sm font-bold mb-1 ${
            isUsBase ? 'text-blue-400' : 'text-red-400'
          }`}>
            {selectedBase.name}
          </h4>
          <p className="text-xs text-gray-400 mb-1">
            {selectedBase.country} - {selectedBase.type}
          </p>
          <p className="text-xs text-gray-300 mb-2">{selectedBase.description}</p>

          <div className="mt-2 pt-2 border-t border-gray-600">
            <label className={`block text-xs font-medium mb-1.5 ${
              isUsBase ? 'text-blue-300' : 'text-red-300'
            }`}>
              Base Damage
            </label>
            <div className="flex gap-2 flex-wrap">
              {damage.map((checked, index) => (
                <label key={index} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onBaseDamageChange(selectedBase.id, index)}
                    className="sr-only peer"
                  />
                  <div className={`w-5 h-5 border-2 rounded ${
                    checked
                      ? `bg-${color}-500 border-${color}-500`
                      : 'bg-gray-700 border-gray-600'
                  }`}></div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasesTab;
