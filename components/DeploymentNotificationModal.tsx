import React, { useMemo } from 'react';
import { Card, TaskForce, Unit, OperationalArea, CommandPoints, InfluenceMarker, SubmarineEvent } from '../types';


interface DeploymentNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  arrivedCards: Card[];
  arrivedTaskForces: TaskForce[];
  arrivedUnits: Unit[];
  faction: 'us' | 'china';
  operationalAreas: OperationalArea[];
  units: Unit[];
  taskForces: TaskForce[];
  pendingDeployments: { cards: any[], taskForces: any[], units: any[] };
  arrivedCardDeployments: any[];
  arrivedTaskForceDeployments: any[];
  arrivedUnitDeployments: any[];
  commandPoints: CommandPoints;
  previousCommandPoints?: CommandPoints;
  influenceMarker: InfluenceMarker;
  submarineEvents?: SubmarineEvent[];
}

const DeploymentNotificationModal: React.FC<DeploymentNotificationModalProps> = ({
  isOpen,
  onClose,
  arrivedCards,
  arrivedTaskForces,
  arrivedUnits,
  faction,
  operationalAreas,
  units,
  taskForces,
  pendingDeployments,
  arrivedCardDeployments,
  arrivedTaskForceDeployments,
  arrivedUnitDeployments,
  commandPoints,
  previousCommandPoints,
  influenceMarker,
  submarineEvents = [],
}) => {
  // Format event date from turn and dayOfWeek
  const formatEventDate = (turn: number, dayOfWeek?: number) => {
    if (!dayOfWeek) return `[T${String(turn).padStart(2, '0')}]`; // Old events without dayOfWeek

    // Campaign starts 2030-06-02 (Turn 1, Day 1)
    const startDate = new Date('2030-06-02');

    // Calculate days since start
    const daysSinceStart = ((turn - 1) * 7) + (dayOfWeek - 1);

    // Calculate event date
    const eventDate = new Date(startDate);
    eventDate.setDate(startDate.getDate() + daysSinceStart);

    // Format as "DD MMM"
    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];

    const day = eventDate.getDate();
    const month = months[eventDate.getMonth()];

    return `[${day} ${month}]`;
  };

  if (!isOpen) return null;

  // Filter units to exclude those belonging to arrived Task Forces
  const filteredArrivedUnits = useMemo(() => {
    const arrivedTFIds = new Set(arrivedTaskForces.map(tf => tf.id));
    return arrivedUnits.filter(unit => !arrivedTFIds.has(unit.taskForceId || ''));
  }, [arrivedUnits, arrivedTaskForces]);

  // Calculate command points data
  const currentCommandPoints = faction === 'us' ? commandPoints.us : commandPoints.china;
  const previousPoints = previousCommandPoints
    ? (faction === 'us' ? previousCommandPoints.us : previousCommandPoints.china)
    : currentCommandPoints;
  const commandPointsDelta = currentCommandPoints - previousPoints;
  const influenceValue = influenceMarker.value;
  const hasCommandPointsData = previousCommandPoints !== undefined;

  const hasArrivals = arrivedCards.length > 0 || arrivedTaskForces.length > 0 || filteredArrivedUnits.length > 0;

  // Filter submarine events for current faction - ONLY show successful operations
  const factionSubmarineEvents = submarineEvents.filter(event =>
    event.faction === faction &&
    (event.eventType === 'attack_success' || event.eventType === 'destroyed')
  );

  // Always show modal (removed validation - modal shows command points even when nothing else happens)

  const factionName = faction === 'us' ? 'USMC' : 'PLAN';
  const factionColor = faction === 'us' ? 'blue-400' : 'red-400';

  // Helper to get area name by ID
  const getAreaName = (areaId: string): string => {
    const area = operationalAreas.find(a => a.id === areaId);
    return area ? area.name : 'Unknown Area';
  };

  // Helper to get TF units
  const getTFUnits = (tfId: string): Unit[] => {
    return units.filter(u => u.taskForceId === tfId && !u.isPendingDeployment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]">
      <div className="bg-gray-800 w-[700px] max-h-[85vh] flex flex-col border-2 border-gray-700">
        {/* Header - Retro Style */}
        <div className="p-4 border-b-2 border-gray-800 bg-black/80">
          <h2 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider">
            {hasArrivals || factionSubmarineEvents.length > 0 ? 'OPERATIONS REPORT' : 'WEEKLY SUMMARY'}
          </h2>
          <p className={`text-xs font-mono mt-1 text-${factionColor}`}>
            {factionName}
          </p>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">

          {/* 1. Command Points Summary - Always shown */}
          <div className="bg-black/40 border border-gray-800 p-3">
            <h3 className="text-green-400 font-bold mb-2 uppercase tracking-wide border-b border-green-900 pb-1.5 text-sm">
              COMMAND POINTS
            </h3>
            <div className="flex items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 uppercase">Current:</span>
                <span className="text-white font-bold text-lg">{currentCommandPoints}</span>
              </div>
              {hasCommandPointsData && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-500 uppercase">Change:</span>
                  <span className={`font-bold ${
                    commandPointsDelta > 0 ? 'text-green-400' : commandPointsDelta < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {commandPointsDelta > 0 ? '+' : ''}{commandPointsDelta}
                  </span>
                </div>
              )}
              {hasCommandPointsData && influenceValue !== 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-500 uppercase">Influence:</span>
                  <span className={`font-bold ${
                    (influenceValue > 0 && faction === 'us') || (influenceValue < 0 && faction === 'china')
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {(influenceValue > 0 && faction === 'us') || (influenceValue < 0 && faction === 'china')
                      ? `+${Math.abs(influenceValue * 10)}%`
                      : `-${Math.abs(influenceValue * 10)}%`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Deployments & Reinforcements */}
          {(arrivedTaskForces.length > 0 || arrivedCards.length > 0 || filteredArrivedUnits.length > 0) && (
            <div className="bg-black/40 border border-gray-800 p-3">
              <h3 className="text-green-400 font-bold mb-2 uppercase tracking-wide border-b border-green-900 pb-1.5 text-sm">
                DEPLOYMENTS & REINFORCEMENTS
              </h3>

              {/* Task Forces */}
              {arrivedTaskForces.length > 0 && (
                <div className="mb-2 pt-1">
                  <div className="text-gray-600 mb-1 uppercase text-xs">TASK FORCES ({arrivedTaskForces.length}):</div>
                  <div className="space-y-1">
                    {arrivedTaskForces.map(tf => {
                      const tfUnits = getTFUnits(tf.id);
                      const areaName = getAreaName(tf.operationalAreaId || '');
                      const unitsList = tfUnits.map(u => u.name).join(', ');

                      return (
                        <div key={tf.id} className="bg-gray-900/50 border border-gray-800 px-3 py-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-white font-bold">{tf.name}</span>
                            <span className="text-gray-600">→</span>
                            <span className="text-gray-400">{areaName}</span>
                            {tfUnits.length > 0 && (
                              <>
                                <span className="text-gray-600">|</span>
                                <span className="text-gray-500">{tfUnits.length} units</span>
                              </>
                            )}
                            <span className="text-gray-600">|</span>
                            <span className="text-green-400">OPERATIONAL</span>
                          </div>
                          {unitsList && (
                            <div className="text-gray-500 text-xs mt-0.5 ml-1">
                              └ {unitsList}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cards */}
              {arrivedCards.length > 0 && (
                <div className="mb-2">
                  <div className="text-gray-600 mb-1 uppercase text-xs">CARDS ({arrivedCards.length}):</div>
                  <div className="space-y-1">
                    {arrivedCardDeployments.map(deployment => {
                      const card = arrivedCards.find(c => c.id === deployment.cardId);
                      if (!card) return null;
                      const areaName = getAreaName(deployment.areaId);

                      return (
                        <div key={deployment.cardInstanceId} className="bg-gray-900/50 border border-gray-800 px-3 py-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-white font-bold">{card.name}</span>
                            <span className="text-gray-600">→</span>
                            <span className="text-gray-400">{areaName}</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-purple-400">AVAILABLE</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reinforcements */}
              {filteredArrivedUnits.length > 0 && (
                <div>
                  <div className="text-gray-600 mb-1 uppercase text-xs">REINFORCEMENTS ({filteredArrivedUnits.length}):</div>
                  <div className="space-y-1">
                    {filteredArrivedUnits.map(unit => {
                      const taskForce = unit.taskForceId ? taskForces.find(tf => tf.id === unit.taskForceId) : null;
                      const tfName = taskForce?.name || '-';
                      const areaName = taskForce?.operationalAreaId ? getAreaName(taskForce.operationalAreaId) : 'UNKNOWN';

                      return (
                        <div key={unit.id} className="bg-gray-900/50 border border-gray-800 px-3 py-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-white font-bold">{unit.name}</span>
                            <span className="text-gray-600">→</span>
                            <span className="text-gray-500">{tfName}</span>
                            <span className="text-gray-600">→</span>
                            <span className="text-gray-400">{areaName}</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-orange-400">OPERATIONAL</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Submarine Operations */}
          {factionSubmarineEvents.length > 0 && (
            <div className="bg-black/40 border border-gray-800 p-3">
              <h3 className="text-green-400 font-bold mb-2 uppercase tracking-wide border-b border-green-900 pb-1.5 text-sm">
                SUBMARINE OPERATIONS
              </h3>
              <div className="space-y-1 pt-1">
                {factionSubmarineEvents.map(event => (
                  <div key={event.eventId} className="bg-gray-900/50 border border-gray-800 px-3 py-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600">{formatEventDate(event.turn, event.dayOfWeek)}</span>
                      <span className="text-cyan-400 font-bold">{event.submarineName}</span>
                      <span className="text-gray-600">→</span>
                      <span className="text-gray-400">{event.description}</span>
                      {event.targetInfo && (
                        <>
                          <span className="text-gray-600">→</span>
                          <span className="text-yellow-500">{event.targetInfo.targetName}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Retro Style */}
        <div className="p-4 border-t-2 border-gray-800 bg-black/80">
          <button
            onClick={onClose}
            className={`w-full py-3 bg-black border-2 font-mono font-bold uppercase tracking-wide text-xs transition-colors ${
              faction === 'us'
                ? 'border-blue-900 hover:border-blue-700 text-blue-400 hover:text-blue-300'
                : 'border-red-900 hover:border-red-700 text-red-400 hover:text-red-300'
            }`}
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentNotificationModal;
