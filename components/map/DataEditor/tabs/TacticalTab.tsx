import React from 'react';
import { OperationalData } from '../../../../types';
import { getTacticalNetworkEffect } from '../helpers';

interface TacticalTabProps {
  data: OperationalData;
  onCheckboxChange: (faction: 'us' | 'plan', field: 'tacticalNetworkDamage', index: number) => void;
  renderCheckboxes: (faction: 'us' | 'plan', field: 'tacticalNetworkDamage', count: number, color: string) => React.ReactNode;
  selectedFaction: 'us' | 'china';
}

const TacticalTab: React.FC<TacticalTabProps> = ({
  data,
  onCheckboxChange,
  renderCheckboxes,
  selectedFaction
}) => {
  // Display only the selected faction's section
  if (selectedFaction === 'us') {
    return (
      <div className="border-2 border-blue-500 rounded-lg p-3 bg-blue-950 bg-opacity-30">
        <h4 className="text-sm font-bold text-blue-400 mb-3">EE. UU.</h4>
        <label className="block text-xs font-medium text-blue-300 mb-1.5">
          Tactical Network Damage
        </label>
        {renderCheckboxes('us', 'tacticalNetworkDamage', 8, 'bg-blue-500')}
        <p className="text-xs text-blue-200 mt-2 italic">
          {getTacticalNetworkEffect(data.us.tacticalNetworkDamage)}
        </p>
      </div>
    );
  } else {
    return (
      <div className="border-2 border-red-500 rounded-lg p-3 bg-red-950 bg-opacity-30">
        <h4 className="text-sm font-bold text-red-400 mb-3">PLAN</h4>
        <label className="block text-xs font-medium text-red-300 mb-1.5">
          Tactical Network Damage
        </label>
        {renderCheckboxes('plan', 'tacticalNetworkDamage', 8, 'bg-red-500')}
        <p className="text-xs text-red-200 mt-2 italic">
          {getTacticalNetworkEffect(data.plan.tacticalNetworkDamage)}
        </p>
      </div>
    );
  }
};

export default TacticalTab;
