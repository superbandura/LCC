import React from 'react';
import { TaskForce, Unit, TurnState } from '../../../../types';
import { getTaskForceUnits } from '../helpers';

interface PendingTaskForceData {
  taskForce: TaskForce;
  eta: { turn: number; day: number } | null;
}

interface TaskForcesTabProps {
  areaTaskForces: TaskForce[];
  units: Unit[];
  selectedFaction: 'us' | 'china';
  onSelectTaskForce: (tf: TaskForce) => void;
  pendingTaskForces?: PendingTaskForceData[];
  turnState?: TurnState;
}

const TaskForcesTab: React.FC<TaskForcesTabProps> = ({
  areaTaskForces,
  units,
  selectedFaction,
  onSelectTaskForce,
  pendingTaskForces = [],
  turnState
}) => {
  // Helper function to format ETA date
  const formatETA = (eta: { turn: number; day: number } | null): string => {
    if (!eta || !turnState) return 'Fecha desconocida';

    // Parse current date
    const currentDate = new Date(turnState.currentDate);

    // Calculate days to add (each turn is 7 days)
    const turnsToAdd = eta.turn - turnState.turnNumber;
    const daysToAdd = (turnsToAdd * 7) + (eta.day - turnState.dayOfWeek);

    // Calculate arrival date
    const arrivalDate = new Date(currentDate);
    arrivalDate.setDate(arrivalDate.getDate() + daysToAdd);

    // Format: "8 de junio"
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${arrivalDate.getDate()} de ${monthNames[arrivalDate.getMonth()]}`;
  };
  if (areaTaskForces.length === 0 && pendingTaskForces.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No Task Forces deployed in this operational area</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
      {areaTaskForces.map(tf => {
        const tfUnits = getTaskForceUnits(tf.id, units);
        const isUs = tf.faction === 'us';
        const isEnemy = tf.faction !== selectedFaction;

        // For enemy TFs, only show detected units (fog of war)
        const visibleUnits = isEnemy
          ? tfUnits.filter(u => u.isDetected === true)
          : tfUnits;

        // Calculate operational vs destroyed vs pending units
        const operationalCount = visibleUnits.filter(u => {
          const damageCount = u.currentDamage.filter(d => d).length;
          const isPending = u.isPendingDeployment === true;
          return damageCount < u.damagePoints && !isPending;
        }).length;
        const destroyedCount = visibleUnits.filter(u => {
          const damageCount = u.currentDamage.filter(d => d).length;
          const isPending = u.isPendingDeployment === true;
          return damageCount === u.damagePoints && !isPending;
        }).length;
        const pendingCount = visibleUnits.filter(u => u.isPendingDeployment === true).length;

        // Calculate category counts (only operational units, excluding pending and destroyed)
        const operationalUnits = visibleUnits.filter(u => {
          const damageCount = u.currentDamage.filter(d => d).length;
          const isPending = u.isPendingDeployment === true;
          return damageCount < u.damagePoints && !isPending;
        });
        const categoryCounts = {
          ground: operationalUnits.filter(u => u.category === 'ground').length,
          naval: operationalUnits.filter(u => u.category === 'naval').length,
          artillery: operationalUnits.filter(u => u.category === 'artillery').length,
          interception: operationalUnits.filter(u => u.category === 'interception').length,
          supply: operationalUnits.filter(u => u.category === 'supply').length,
        };

        // Calculate supply capacity (only operational units, excluding destroyed and pending)
        // Includes ammunition AND supply points
        const maxCapacity = operationalUnits.reduce((sum, unit) => {
          return sum +
            (unit.attackPrimary || 0) +
            (unit.attackSecondary || 0) +
            (unit.interception || 0) +
            (unit.groundCombat || 0) +
            (unit.supply || 0);
        }, 0);

        const currentCapacity = operationalUnits.reduce((sum, unit) => {
          return sum +
            ((unit.attackPrimary || 0) - (unit.attackPrimaryUsed || 0)) +
            ((unit.attackSecondary || 0) - (unit.attackSecondaryUsed || 0)) +
            ((unit.interception || 0) - (unit.interceptionUsed || 0)) +
            ((unit.groundCombat || 0) - (unit.groundCombatUsed || 0)) +
            ((unit.supply || 0) - (unit.supplyUsed || 0));
        }, 0);

        const supplyPercentage = maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;

        // Calculate color gradient from red to green based on percentage
        // 0% = red (hue 0), 100% = green (hue 120)
        const hue = (supplyPercentage * 120) / 100;
        const barColor = `hsl(${hue}, 80%, 50%)`;

        return (
          <div
            key={tf.id}
            onClick={() => onSelectTaskForce(tf)}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
              isEnemy
                ? 'border-orange-500 bg-orange-950 bg-opacity-30 hover:bg-opacity-50'
                : isUs
                  ? 'border-blue-500 bg-blue-950 bg-opacity-30 hover:bg-opacity-50'
                  : 'border-red-500 bg-red-950 bg-opacity-30 hover:bg-opacity-50'
            }`}
            style={isEnemy ? { borderStyle: 'dashed' } : {}}
          >
            <h4 className={`font-semibold text-sm flex items-center gap-2 ${
              isEnemy ? 'text-orange-400' : isUs ? 'text-blue-400' : 'text-red-400'
            }`}>
              {isEnemy && <span>👁️</span>}
              {tf.name}
              {isEnemy && <span className="text-xs bg-orange-900 px-2 py-0.5 rounded">ENEMIGA - DETECTADA</span>}
            </h4>
            <div className="flex flex-col gap-1 mt-2">
              {/* Row 1: Status + Ground/Naval */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-300">
                  ⚡ {operationalCount}
                </span>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-900 text-orange-300">
                    ⏳ {pendingCount}
                  </span>
                )}
                {destroyedCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900 text-red-300">
                    💀 {destroyedCount}
                  </span>
                )}
                {categoryCounts.ground > 0 && (
                  <span className="text-xs text-green-400">🟢 {categoryCounts.ground}</span>
                )}
                {categoryCounts.naval > 0 && (
                  <span className="text-xs text-blue-400">⚓ {categoryCounts.naval}</span>
                )}
              </div>
              {/* Row 2: Artillery/Interception/Supply */}
              {(categoryCounts.artillery > 0 || categoryCounts.interception > 0 || categoryCounts.supply > 0) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {categoryCounts.artillery > 0 && (
                    <span className="text-xs text-red-400">🔴 {categoryCounts.artillery}</span>
                  )}
                  {categoryCounts.interception > 0 && (
                    <span className="text-xs text-purple-400">🟣 {categoryCounts.interception}</span>
                  )}
                  {categoryCounts.supply > 0 && (
                    <span className="text-xs text-blue-400">🔵 {categoryCounts.supply}</span>
                  )}
                </div>
              )}
              {/* Row 3: Supply Level - Only show for own faction (classified info) */}
              {!isEnemy && maxCapacity > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Supplies</span>
                    <span className="text-xs font-medium text-cyan-400">
                      {currentCapacity}/{maxCapacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${supplyPercentage}%`,
                        backgroundColor: barColor
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Pending Task Forces */}
      {pendingTaskForces.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-orange-400 mb-3">
            Task Forces En Tránsito
          </h4>
          {pendingTaskForces.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-900 rounded-lg p-3 mb-2 border border-orange-500 border-dashed"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-white text-sm">{item.taskForce.name}</div>
                  <div className="text-xs text-orange-400 mt-1">
                    ETA: {formatETA(item.eta)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskForcesTab;
