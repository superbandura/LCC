import React from 'react';
import { SubmarineCampaignState, TurnState, SubmarineEvent, Location } from '../types';

interface SubmarineDetailedReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  submarineCampaign: SubmarineCampaignState;
  turnState: TurnState;
  locations: Location[];
}

const SubmarineDetailedReportModal: React.FC<SubmarineDetailedReportModalProps> = ({
  isOpen,
  onClose,
  submarineCampaign,
  turnState,
  locations
}) => {
  if (!isOpen) return null;

  // Get all events from current day only (not entire week)
  const currentTurnEvents = submarineCampaign?.events?.filter(
    e => e.turn === turnState.turnNumber &&
         (!e.dayOfWeek || e.dayOfWeek === turnState.dayOfWeek) // If no dayOfWeek, include for backward compatibility
  ) || [];

  // Group events by phase (ASW, Attack, Patrol, Mine, Asset Deploy)
  const aswEvents = currentTurnEvents.filter(e =>
    (e.submarineType?.toLowerCase() === 'asw' ||
     (e.eventType === 'destroyed' && e.rollDetails?.aswElementInfo)) &&
    e.submarineType?.toLowerCase() !== 'asset'
  );
  const attackEvents = currentTurnEvents.filter(e =>
    e.targetInfo?.targetType === 'base' &&
    e.submarineType?.toLowerCase() !== 'asw' &&
    e.submarineType?.toLowerCase() !== 'asset' &&
    e.eventType !== 'destroyed'
  );
  const patrolEvents = currentTurnEvents.filter(e =>
    e.targetInfo?.targetType === 'area' &&
    e.submarineType?.toLowerCase() !== 'asw' &&
    e.submarineType?.toLowerCase() !== 'asset' &&
    !e.description?.includes('Enemy patrol')  // Only show attacker's perspective
  );
  // Mine events: All events related to maritime mines (both detected and destroyed)
  const mineEvents = currentTurnEvents.filter(e =>
    (e.description?.includes('mine') || e.description?.includes('minefield')) &&
    e.submarineType?.toLowerCase() !== 'asset'
  );
  // Asset deployment events
  const assetEvents = currentTurnEvents.filter(e =>
    e.eventType === 'asset_deployed'
  );

  // Get pending attack orders (attacks that haven't executed yet)
  const pendingAttacks = submarineCampaign?.deployedSubmarines?.filter(sub =>
    sub.currentOrder?.orderType === 'attack' &&
    sub.currentOrder?.status === 'pending' &&
    sub.currentOrder?.executionDate !== undefined &&
    sub.currentOrder.executionDate > turnState.currentDate
  ) || [];

  // Calculate summary statistics for ASW Phase
  // Separate detection attempts from elimination events
  const aswDetectionAttempts = aswEvents.filter(e =>
    e.submarineType?.toLowerCase() === 'asw' && e.eventType !== 'destroyed'
  );
  const aswTotalAttempts = aswDetectionAttempts.length;
  const aswSuccessfulDetections = aswDetectionAttempts.filter(e =>
    e.rollDetails?.primaryRoll !== undefined &&
    e.rollDetails?.primaryThreshold !== undefined &&
    e.rollDetails.primaryRoll <= e.rollDetails.primaryThreshold
  ).length;
  const aswEliminations = aswEvents.filter(e =>
    e.eventType === 'destroyed'
  ).length;

  // Calculate summary statistics for Attack Phase
  const attackTotal = attackEvents.length;
  const attackSuccessful = attackEvents.filter(e =>
    e.rollDetails?.primaryRoll !== undefined &&
    e.rollDetails?.primaryThreshold !== undefined &&
    e.rollDetails.primaryRoll <= e.rollDetails.primaryThreshold
  ).length;
  const attackTotalDamage = attackEvents.reduce((sum, e) =>
    sum + (e.targetInfo?.damageDealt || 0), 0
  );

  // Calculate summary statistics for Patrol Phase
  const patrolTotal = patrolEvents.length;
  const successfulPatrols = patrolEvents.filter(e =>
    e.rollDetails?.primaryRoll !== undefined &&
    e.rollDetails?.primaryThreshold !== undefined &&
    e.rollDetails.primaryRoll <= e.rollDetails.primaryThreshold
  );
  const patrolSuccessful = successfulPatrols.length;
  // Only successful patrols cause damage
  const patrolDamageUS = successfulPatrols
    .filter(e => e.faction === 'china') // China's patrols damage US CP
    .reduce((sum, e) => sum + (e.targetInfo?.damageDealt || 0), 0);
  const patrolDamageChina = successfulPatrols
    .filter(e => e.faction === 'us') // US patrols damage China CP
    .reduce((sum, e) => sum + (e.targetInfo?.damageDealt || 0), 0);

  // Calculate summary statistics for Asset Deploy Phase
  const assetTotal = assetEvents.length;
  const assetsByArea = assetEvents.reduce((acc, event) => {
    const areaName = event.targetInfo?.targetName || 'Unknown';
    if (!acc[areaName]) {
      acc[areaName] = [];
    }
    acc[areaName].push(event);
    return acc;
  }, {} as Record<string, typeof assetEvents>);

  // Calculate summary statistics for Mine Phase
  // Total attempts includes both failed detections and successful hits
  const mineDetectionAttempts = mineEvents.length;
  const mineHits = mineEvents.filter(e =>
    e.eventType === 'destroyed'
  ).length;

  const renderSimpleEventLine = (event: SubmarineEvent, index: number) => {
    const rolls = event.rollDetails;
    if (!rolls) return null;

    // Determine if operation was successful
    // ASW detection requires EXACTLY 1 (5% chance), other operations use <= threshold
    const isSuccess = rolls.primaryRoll !== undefined && rolls.primaryThreshold !== undefined &&
      (rolls.primaryThreshold === 1
        ? rolls.primaryRoll === rolls.primaryThreshold  // ASW: must roll exactly 1
        : rolls.primaryRoll <= rolls.primaryThreshold); // Others: roll must be <= threshold

    const factionColor = event.faction === 'us' ? 'text-blue-400' : 'text-red-400';
    const resultColor = isSuccess ? 'text-green-400' : 'text-yellow-500';

    // Build dice info
    const primaryDice = `d20: ${rolls.primaryRoll}/${rolls.primaryThreshold}`;
    const secondaryDice = rolls.secondaryRoll !== undefined ? ` | ${rolls.secondaryRoll}/${rolls.secondaryThreshold || '?'}` : '';

    // Build target info
    let targetInfo = '';
    if (event.targetInfo) {
      targetInfo = ` → ${event.targetInfo.targetName}`;
      if (event.targetInfo.damageDealt !== undefined) {
        targetInfo += ` (${event.targetInfo.damageDealt} dmg)`;
      }
    }

    // Build action description
    const action = isSuccess ? event.description.split(' - ')[0] : event.description.split(' - ')[0];

    return (
      <div key={`${event.eventId}-${index}`} className="font-mono text-xs text-gray-300 py-1">
        <span className={`font-bold ${factionColor}`}>[{event.faction.toUpperCase()}]</span>
        {' '}
        <span className="text-gray-400">{event.submarineName}</span>
        {' → '}
        <span className={resultColor}>{isSuccess ? '✓' : '✗'}</span>
        {' '}
        <span className="text-gray-400">{action}</span>
        {' '}
        <span className="text-gray-500">({primaryDice}{secondaryDice})</span>
        <span className="text-yellow-500">{targetInfo}</span>
      </div>
    );
  };

  // Group patrol events by operational area
  const groupPatrolEventsByArea = (events: SubmarineEvent[]): Record<string, SubmarineEvent[]> => {
    const grouped: Record<string, SubmarineEvent[]> = {};
    events.forEach(event => {
      const areaName = event.targetInfo?.targetName || 'Unknown Area';
      if (!grouped[areaName]) {
        grouped[areaName] = [];
      }
      grouped[areaName].push(event);
    });
    return grouped;
  };

  // Group ASW events by operational area
  const groupASWEventsByArea = (events: SubmarineEvent[]): Record<string, SubmarineEvent[]> => {
    const grouped: Record<string, SubmarineEvent[]> = {};
    events.forEach(event => {
      const areaName = event.rollDetails?.aswElementInfo?.areaName || 'Submarine Campaign';
      if (!grouped[areaName]) {
        grouped[areaName] = [];
      }
      grouped[areaName].push(event);
    });
    return grouped;
  };

  // Get grouped patrol events by area
  const patrolEventsByArea = groupPatrolEventsByArea(patrolEvents);

  // Get grouped ASW events by area
  const aswEventsByArea = groupASWEventsByArea(aswEvents);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border-2 border-green-600 rounded-lg w-full max-w-7xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b-2 border-green-600 flex items-center justify-between shrink-0 bg-black/40">
          <div>
            <h2 className="text-xl font-mono font-bold text-green-400 uppercase tracking-wider">
              🔍 ADMIN DETAILED REPORT
            </h2>
            <p className="text-xs font-mono text-gray-400 mt-1 tracking-wide">
              Turn {turnState.turnNumber} - Complete operation logs with dice rolls
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 border border-red-600 text-red-400 hover:bg-red-900/30 hover:border-red-500 font-mono text-xs font-bold uppercase tracking-wider transition-all"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Mine Phase - Always shown */}
            <div>
              <h3 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider mb-2 border-l-4 border-green-600 pl-2">
                MINE PHASE ({mineDetectionAttempts} detection attempts)
              </h3>
              <div className="font-mono text-xs text-gray-500 mb-3 pl-2">
                Total: {mineHits}/{mineDetectionAttempts} hits
              </div>
              {mineEvents.length > 0 ? (
                <div className="pl-2 space-y-0.5">
                  {mineEvents.map((event, idx) => renderSimpleEventLine(event, idx))}
                </div>
              ) : (
                <div className="pl-2">
                  <p className="text-gray-500 font-mono text-xs">
                    -- NO MINE DETECTIONS THIS TURN --
                  </p>
                </div>
              )}
            </div>

            {/* Asset Deploy Phase - Show if there are deployments */}
            {assetTotal > 0 && (
              <div>
                <h3 className="text-sm font-mono font-bold text-yellow-400 uppercase tracking-wider mb-2 border-l-4 border-yellow-600 pl-2">
                  ASSET DEPLOY PHASE ({assetTotal} {assetTotal === 1 ? 'operation' : 'operations'})
                </h3>
                <div className="font-mono text-xs text-gray-500 mb-3 pl-2">
                  Total: {assetTotal} {assetTotal === 1 ? 'deployment' : 'deployments'}
                </div>
                <div className="pl-2 space-y-3">
                  {Object.entries(assetsByArea).map(([areaName, areaAssets]) => (
                    <div key={areaName}>
                      <div className="font-mono text-xs text-cyan-400 mb-1 font-bold">
                        → {areaName} ({areaAssets.length} {areaAssets.length === 1 ? 'deployment' : 'deployments'})
                      </div>
                      <div className="space-y-0.5 ml-2">
                        {areaAssets.map((event, idx) => (
                          <div key={idx} className="font-mono text-xs">
                            <span className={`font-bold ${event.faction === 'us' ? 'text-blue-400' : 'text-red-400'}`}>
                              [{event.faction.toUpperCase()}]
                            </span>
                            {' '}
                            <span className="text-gray-300">{event.cardName || event.submarineName}</span>
                            {' → '}
                            <span className="text-green-400">✓</span>
                            {' '}
                            <span className="text-gray-400">{event.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ASW Phase - Always shown */}
            <div>
              <h3 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider mb-2 border-l-4 border-green-600 pl-2">
                ASW PHASE ({aswEvents.length} operations)
              </h3>
              <div className="font-mono text-xs text-gray-500 mb-3 pl-2">
                Total: {aswTotalAttempts} attempts → {aswSuccessfulDetections} detected → {aswEliminations} eliminated
              </div>
              {aswEvents.length > 0 ? (
                <div className="pl-2 space-y-3">
                  {Object.entries(aswEventsByArea).map(([areaName, areaEvents]) => {
                    const areaEliminations = areaEvents.filter(e =>
                      e.eventType === 'destroyed'
                    ).length;

                    return (
                      <div key={areaName}>
                        <div className="font-mono text-xs text-cyan-400 mb-1 font-bold">
                          → {areaName} ({areaEvents.length} operations, {areaEliminations} eliminated)
                        </div>
                        <div className="space-y-0.5 ml-2">
                          {areaEvents.map((event, idx) => renderSimpleEventLine(event, idx))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pl-2">
                  <p className="text-gray-500 font-mono text-xs">
                    -- NO ASW OPERATIONS THIS TURN --
                  </p>
                </div>
              )}
            </div>

            {/* Attack Phase - Always shown */}
            <div>
              <h3 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider mb-2 border-l-4 border-green-600 pl-2">
                ATTACK PHASE ({attackEvents.length} operations, {pendingAttacks.length} pending)
              </h3>
              <div className="font-mono text-xs text-gray-500 mb-3 pl-2">
                Total: {attackSuccessful}/{attackTotal} successful → {attackTotalDamage} base damage
              </div>

              {/* Executed attacks */}
              {attackEvents.length > 0 && (
                <div className="pl-2 space-y-0.5 mb-3">
                  <div className="font-mono text-xs text-cyan-400 mb-1 font-bold">
                    → EXECUTED ATTACKS
                  </div>
                  <div className="ml-2 space-y-0.5">
                    {attackEvents.map((event, idx) => renderSimpleEventLine(event, idx))}
                  </div>
                </div>
              )}

              {/* Pending attacks */}
              {pendingAttacks.length > 0 && (
                <div className="pl-2 space-y-0.5">
                  <div className="font-mono text-xs text-cyan-400 mb-1 font-bold">
                    → PENDING ATTACKS
                  </div>
                  <div className="ml-2 space-y-0.5">
                    {pendingAttacks.map((sub, idx) => {
                      const targetLocation = locations.find(loc => loc.id === sub.currentOrder?.targetId);
                      const targetName = targetLocation?.name || 'Unknown Base';

                      // Calculate days remaining until execution
                      let daysRemaining = '?';
                      if (sub.currentOrder?.executionDate) {
                        const currentDate = new Date(turnState.currentDate);
                        const executionDate = new Date(sub.currentOrder.executionDate);
                        const diffTime = executionDate.getTime() - currentDate.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        daysRemaining = diffDays.toString();
                      }

                      const factionColor = sub.faction === 'us' ? 'text-blue-400' : 'text-red-400';

                      return (
                        <div key={`pending-${sub.id}-${idx}`} className="font-mono text-xs text-gray-300 py-1">
                          <span className={`font-bold ${factionColor}`}>[{sub.faction.toUpperCase()}]</span>
                          {' '}
                          <span className="text-gray-400">{sub.submarineName}</span>
                          {' → '}
                          <span className="text-yellow-500">⏳ Preparing attack</span>
                          {' '}
                          <span className="text-gray-400">against</span>
                          {' '}
                          <span className="text-yellow-500">{targetName}</span>
                          {' '}
                          <span className="text-gray-500">(Execute in {daysRemaining} days)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No attacks at all */}
              {attackEvents.length === 0 && pendingAttacks.length === 0 && (
                <div className="pl-2">
                  <p className="text-gray-500 font-mono text-xs">
                    -- NO ATTACK OPERATIONS THIS TURN --
                  </p>
                </div>
              )}
            </div>

            {/* Patrol Phase - Always shown */}
            <div>
              <h3 className="text-sm font-mono font-bold text-green-400 uppercase tracking-wider mb-2 border-l-4 border-green-600 pl-2">
                PATROL PHASE ({patrolEvents.length} operations)
              </h3>
              <div className="font-mono text-xs text-gray-500 mb-3 pl-2">
                Total: {patrolSuccessful}/{patrolTotal} successful → US: -{patrolDamageUS} CP | China: -{patrolDamageChina} CP
              </div>
              {patrolEvents.length > 0 ? (
                <div className="pl-2 space-y-3">
                  {Object.entries(patrolEventsByArea).map(([areaName, areaEvents]) => {
                    const areaSuccessful = areaEvents.filter(e =>
                      e.rollDetails?.primaryRoll !== undefined &&
                      e.rollDetails?.primaryThreshold !== undefined &&
                      e.rollDetails.primaryRoll <= e.rollDetails.primaryThreshold
                    ).length;

                    return (
                      <div key={areaName}>
                        <div className="font-mono text-xs text-cyan-400 mb-1 font-bold">
                          → {areaName} ({areaSuccessful}/{areaEvents.length} successful)
                        </div>
                        <div className="space-y-0.5 ml-2">
                          {areaEvents.map((event, idx) => renderSimpleEventLine(event, idx))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pl-2">
                  <p className="text-gray-500 font-mono text-xs">
                    -- NO PATROL OPERATIONS THIS TURN --
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmarineDetailedReportModal;
