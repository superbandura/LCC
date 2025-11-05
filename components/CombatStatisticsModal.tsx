import React, { useState, useMemo, useEffect } from 'react';
import {
  Unit,
  TaskForce,
  DestructionRecord,
  InfluenceMarker,
  SubmarineCampaignState,
  Location,
  OperationalArea,
  OperationalData,
  PendingDeployments,
  SubmarineDeployment,
  SubmarineEvent,
  TurnState,
  CommandPoints
} from '../types';
import { CloseIcon } from './Icons';
import InfluenceTrack from './InfluenceTrack';
import SubmarineDetailedReportModal from './SubmarineDetailedReportModal';
import { SubmarineService } from '../services/submarineService';

interface CombatStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: Unit[];
  taskForces: TaskForce[];
  destructionLog: DestructionRecord[];
  influenceMarker: InfluenceMarker | null;
  onInfluenceMarkerUpdate: (marker: InfluenceMarker) => void;
  isAdmin: boolean;
  submarineCampaign: SubmarineCampaignState;
  onUpdateSubmarineCampaign: (state: SubmarineCampaignState) => void;
  locations: Location[];
  operationalAreas: OperationalArea[];
  operationalData: OperationalData[];
  selectedFaction: 'us' | 'china' | null;
  pendingDeployments: PendingDeployments;
  commandPoints: CommandPoints;
}

type TabType = 'combat' | 'influence' | 'submarine';

const CombatStatisticsModal: React.FC<CombatStatisticsModalProps> = ({
  isOpen,
  onClose,
  units,
  taskForces,
  destructionLog,
  influenceMarker,
  onInfluenceMarkerUpdate,
  isAdmin,
  submarineCampaign,
  onUpdateSubmarineCampaign,
  locations,
  operationalAreas,
  operationalData,
  selectedFaction,
  pendingDeployments,
  commandPoints
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('combat');
  const [factionFilter, setFactionFilter] = useState<'all' | 'us' | 'china'>('all');
  const [isDetailedReportOpen, setIsDetailedReportOpen] = useState(false);

  // Submarine order management state
  type OrderType = 'patrol' | 'attack' | 'none';
  interface PendingOrder {
    type: OrderType;
    targetId?: string;
  }

  const [pendingOrders, setPendingOrders] = useState<Record<string, PendingOrder>>({});
  const [selectedTargets, setSelectedTargets] = useState<Record<string, string>>({});
  const [orderErrors, setOrderErrors] = useState<Record<string, string>>({});
  const [isExecutingTurn, setIsExecutingTurn] = useState(false);

  // Command Points animation state
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevPoints, setPrevPoints] = useState<number>(0);

  // Command Point costs for submarine orders
  const PATROL_COST = 3;
  const ATTACK_COST = 5;

  // Get turn state from submarine campaign or create default
  const turnState: TurnState = useMemo(() => {
    // Try to infer turn from submarine events or use defaults
    const lastEvent = submarineCampaign?.events?.[submarineCampaign.events.length - 1];
    return {
      currentDate: new Date().toISOString().split('T')[0],
      dayOfWeek: new Date().getDay() || 7,
      turnNumber: lastEvent?.turn || 0,
      isPlanningPhase: false
    };
  }, [submarineCampaign]);

  // Filter destruction log
  const filteredLog = useMemo(() => {
    if (factionFilter === 'all') return destructionLog;
    return destructionLog.filter(record => record.faction === factionFilter);
  }, [destructionLog, factionFilter]);

  // Sort log by timestamp (newest first)
  const sortedLog = useMemo(() => {
    return [...filteredLog].sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredLog]);

  // Calculate statistics
  const stats = useMemo(() => {
    const usDestroyed = destructionLog.filter(r => r.faction === 'us').length;
    const chinaDestroyed = destructionLog.filter(r => r.faction === 'china').length;
    return {
      us: usDestroyed,
      china: chinaDestroyed,
      total: usDestroyed + chinaDestroyed
    };
  }, [destructionLog]);

  // Group deployed submarines by faction
  const deployedSubmarines = useMemo(() => {
    const subs = submarineCampaign?.deployedSubmarines || [];
    return {
      us: subs.filter(s => s.faction === 'us'),
      china: subs.filter(s => s.faction === 'china')
    };
  }, [submarineCampaign]);

  // Reset orders when modal opens
  useEffect(() => {
    if (isOpen) {
      setPendingOrders({});
      setSelectedTargets({});
      setOrderErrors({});
    }
  }, [isOpen]);

  // Trigger flash animation when CP decreases
  useEffect(() => {
    if (!selectedFaction) return;

    const currentPoints = selectedFaction === 'us' ? commandPoints.us : commandPoints.china;

    if (prevPoints > 0 && currentPoints < prevPoints) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 600);
    }

    setPrevPoints(currentPoints);
  }, [commandPoints, selectedFaction, prevPoints]);

  if (!isOpen) return null;

  // Influence value change handler (value-based, not position-based)
  const handleInfluenceChange = (newValue: number) => {
    onInfluenceMarkerUpdate({ value: newValue });
  };

  // Helper: Check if submarine has communication blocked
  const isCommBlocked = (sub: SubmarineDeployment): boolean => {
    return (sub.communicationBlockedUntilDay ?? 0) > 0;
  };

  // Helper: Get submarine by ID
  const getSubmarineById = (subId: string): SubmarineDeployment | undefined => {
    return submarineCampaign?.deployedSubmarines?.find(s => s.id === subId);
  };

  // Helper: Convert operationalData array to Record for SubmarineService
  const getOperationalDataRecord = (): Record<string, OperationalData> => {
    const record: Record<string, OperationalData> = {};
    operationalAreas.forEach(area => {
      const areaData = operationalData.find(od => {
        // operationalData might have an id property or we need to match by area somehow
        // Assuming operationalData items have an id that matches area.id
        return (od as any).id === area.id;
      });
      if (areaData) {
        record[area.id] = areaData;
      }
    });
    return record;
  };

  // Submarine Order Handlers
  const handleOrderTypeChange = (subId: string, orderType: string) => {
    // Clear any errors for this submarine
    setOrderErrors(prev => {
      const updated = {...prev};
      delete updated[subId];
      return updated;
    });

    if (orderType === 'none') {
      setPendingOrders(prev => {
        const updated = {...prev};
        delete updated[subId];
        return updated;
      });
      setSelectedTargets(prev => {
        const updated = {...prev};
        delete updated[subId];
        return updated;
      });
      return;
    }

    setPendingOrders(prev => ({
      ...prev,
      [subId]: {
        type: orderType as 'patrol' | 'attack',
        targetId: orderType === 'attack' ? selectedTargets[subId] : undefined
      }
    }));
  };

  const handleTargetSelect = (subId: string, targetId: string) => {
    setSelectedTargets(prev => ({...prev, [subId]: targetId}));

    // Update pending order with target
    if (pendingOrders[subId]?.type === 'attack') {
      setPendingOrders(prev => ({
        ...prev,
        [subId]: {...prev[subId], targetId}
      }));

      // Clear error if target was selected
      setOrderErrors(prev => {
        const updated = {...prev};
        delete updated[subId];
        return updated;
      });
    }
  };

  const handleConfirmOrder = (subId: string) => {
    const order = pendingOrders[subId];
    const sub = getSubmarineById(subId);

    if (!order || !sub) return;

    // Validation
    if (order.type === 'attack' && !order.targetId) {
      setOrderErrors(prev => ({...prev, [subId]: 'Target required for attack orders'}));
      return;
    }

    // Check if already has current order
    if (sub.currentOrder) {
      setOrderErrors(prev => ({...prev, [subId]: 'Submarine already has an active order'}));
      return;
    }

    // ========== VALIDACIÓN RED TÁCTICA (CÓDIGO RESTAURADO) ==========
    const opDataRecord = getOperationalDataRecord();
    const avgDamage = SubmarineService.getAverageTacticalNetworkDamage(
      opDataRecord,
      sub.faction
    );

    const commCheck = SubmarineService.checkCommunicationFailure(avgDamage);

    if (commCheck.failed) {
      setOrderErrors(prev => ({
        ...prev,
        [subId]: `Communication failure! (Roll: ${commCheck.roll}/${commCheck.threshold}, Tactical Network Damage: ${avgDamage})`
      }));
      return; // Do NOT confirm order
    }
    // ========== FIN VALIDACIÓN RED TÁCTICA ==========

    // Update submarine with pending order (will be moved to currentOrder on execution)
    const updatedSubs = submarineCampaign.deployedSubmarines.map(s =>
      s.id === subId ? {...s, pendingOrder: order} : s
    );

    onUpdateSubmarineCampaign({
      ...submarineCampaign,
      deployedSubmarines: updatedSubs
    });

    // Clear local pending state
    setPendingOrders(prev => {
      const updated = {...prev};
      delete updated[subId];
      return updated;
    });

    setOrderErrors(prev => {
      const updated = {...prev};
      delete updated[subId];
      return updated;
    });
  };

  const handleCancelOrder = (subId: string) => {
    const sub = getSubmarineById(subId);
    if (!sub) return;

    // If order is confirmed (in pendingOrder), remove it from submarine
    if (sub.pendingOrder) {
      const updatedSubs = submarineCampaign.deployedSubmarines.map(s =>
        s.id === subId ? {...s, pendingOrder: undefined} : s
      );

      onUpdateSubmarineCampaign({
        ...submarineCampaign,
        deployedSubmarines: updatedSubs
      });
    }

    // Clear local pending state
    setPendingOrders(prev => {
      const updated = {...prev};
      delete updated[subId];
      return updated;
    });

    setSelectedTargets(prev => {
      const updated = {...prev};
      delete updated[subId];
      return updated;
    });

    setOrderErrors(prev => {
      const updated = {...prev};
      delete updated[subId];
      return updated;
    });
  };

  const handleExecuteSubmarineTurn = async () => {
    // Will be implemented with SubmarineService integration
    setIsExecutingTurn(true);

    try {
      // Placeholder for now
      console.log('Executing submarine turn...');
      alert('Submarine turn execution - Service integration pending');
    } catch (error) {
      console.error('Submarine turn execution failed:', error);
      alert('Failed to execute submarine turn. See console for details.');
    } finally {
      setIsExecutingTurn(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render Combat Statistics tab
  const renderCombatTab = () => (
    <div className="flex flex-col h-full">
      {/* Statistics Summary */}
      <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded">
        <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
          Destruction Summary
        </h3>
        <div className="grid grid-cols-3 gap-4 font-mono text-xs">
          <div className="text-center">
            <div className="text-blue-400 font-bold text-lg">{stats.us}</div>
            <div className="text-gray-400 uppercase tracking-wide">US Units Lost</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-bold text-lg">{stats.china}</div>
            <div className="text-gray-400 uppercase tracking-wide">China Units Lost</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold text-lg">{stats.total}</div>
            <div className="text-gray-400 uppercase tracking-wide">Total Destroyed</div>
          </div>
        </div>
      </div>

      {/* Faction Filter */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setFactionFilter('all')}
          className={`px-3 py-1 font-mono text-xs uppercase tracking-wide rounded transition-colors ${
            factionFilter === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFactionFilter('us')}
          className={`px-3 py-1 font-mono text-xs uppercase tracking-wide rounded transition-colors ${
            factionFilter === 'us'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          US
        </button>
        <button
          onClick={() => setFactionFilter('china')}
          className={`px-3 py-1 font-mono text-xs uppercase tracking-wide rounded transition-colors ${
            factionFilter === 'china'
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          China
        </button>
      </div>

      {/* Destruction Log */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {sortedLog.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-mono text-sm">
            No units destroyed yet
          </div>
        ) : (
          sortedLog.map((record, index) => (
            <div
              key={`${record.unitId}-${index}`}
              className="p-3 bg-gray-800 border border-gray-700 rounded hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-mono text-sm font-bold text-white mb-1">
                    {record.unitName}
                  </div>
                  <div className="font-mono text-xs text-gray-400 uppercase tracking-wide">
                    {record.unitType}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded font-mono text-xs font-bold uppercase ${
                    record.faction === 'us' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {record.faction === 'us' ? 'US' : 'China'}
                </div>
              </div>

              {record.operationalAreaName && (
                <div className="font-mono text-xs text-gray-400 mb-1">
                  Area: <span className="text-green-400">{record.operationalAreaName}</span>
                </div>
              )}

              {record.taskForceName && (
                <div className="font-mono text-xs text-gray-400 mb-1">
                  Task Force: <span className="text-cyan-400">{record.taskForceName}</span>
                </div>
              )}

              <div className="font-mono text-xs text-gray-500 mt-2">
                {formatTimestamp(record.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Influence Marker tab
  const renderInfluenceTab = () => {
    const currentValue = influenceMarker?.value ?? 0;

    return (
      <div className="flex flex-col h-full">
        {/* InfluenceTrack Component */}
        {/*
          INFLUENCE FORMULA:
          - Each influence point = +5% CP for favored faction (applied at week start)
          - Each influence point = -5% CP for disfavored faction (applied at week start)
          - Range: -10 (China advantage) to +10 (US advantage)
          - Example: +3 influence → US gets +15% CP, China gets -15% CP
        */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded">
          <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider mb-4">
            Influence Marker
          </h3>
          <InfluenceTrack
            value={currentValue}
            onChange={isAdmin ? handleInfluenceChange : undefined}
          />
        </div>
      </div>
    );
  };

  // Helper: Render compact submarine row
  const renderSubmarineRow = (sub: SubmarineDeployment) => {
    const pendingOrder = pendingOrders[sub.id];
    const factionColor = sub.faction === 'us' ? 'text-blue-400' : 'text-red-400';

    // Get enemy bases (opposite faction)
    const enemyFaction = sub.faction === 'us' ? 'China' : 'EE. UU.';
    const enemyBases = locations.filter(loc => loc.country === enemyFaction);

    // Check if there are unconfirmed changes (order with target but not saved)
    const hasChanges = !!pendingOrder && !!pendingOrder.targetId && !sub.pendingOrder;

    // Check if order is incomplete (order without target)
    const needsConfirmation = !!pendingOrder && !pendingOrder.targetId;

    return (
      <div key={sub.id} className={`mb-2 p-2 rounded transition-colors ${
        needsConfirmation ? 'bg-red-900/20 border border-red-600' : 'bg-gray-900 border border-gray-700 hover:border-gray-600'
      }`}>
        <div className="flex items-center gap-2">
          {/* Submarine Name */}
          <div className={`font-mono text-xs font-bold ${factionColor} flex-shrink-0 w-28`}>
            {sub.submarineName}
          </div>

          {/* Type and Stats */}
          <div className="font-mono text-xs text-gray-500 flex-shrink-0 w-32 flex items-center gap-2">
            <span>{sub.cardName?.split(' ')[0]}</span>
            {((sub.missionsCompleted ?? 0) > 0 || (sub.totalKills ?? 0) > 0) && (
              <span className="text-gray-600">
                {(sub.missionsCompleted ?? 0) > 0 && `M:${sub.missionsCompleted}`}
                {(sub.missionsCompleted ?? 0) > 0 && (sub.totalKills ?? 0) > 0 && ' '}
                {(sub.totalKills ?? 0) > 0 && <span className="text-red-500">K:{sub.totalKills}</span>}
              </span>
            )}
          </div>

          {/* Dropdown 1: Order Type */}
          <select
            value={pendingOrder?.type || ''}
            onChange={(e) => handleOrderTypeChange(sub.id, e.target.value)}
            className="font-mono text-xs bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 w-24"
          >
            <option value="">-- ORDER --</option>
            <option value="patrol">PATROL</option>
            <option value="attack">ATTACK</option>
          </select>

          {/* Dropdown 2: Target (conditional) */}
          {pendingOrder && (
            <select
              value={pendingOrder.targetId || ''}
              onChange={(e) => handleTargetSelect(sub.id, e.target.value)}
              className="font-mono text-xs bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 flex-1"
            >
              <option value="">-- SELECT TARGET --</option>

              {/* Patrol targets: operational areas + Mar de China */}
              {pendingOrder.type === 'patrol' && (
                <>
                  {operationalAreas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                  <option value="south-china-sea">Mar de China</option>
                </>
              )}

              {/* Attack targets: enemy bases */}
              {pendingOrder.type === 'attack' && (
                <>
                  {enemyBases.map(base => (
                    <option key={base.id} value={base.id}>
                      {base.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          )}

          {/* Confirm Icon (Green Envelope with pulse animation) */}
          {hasChanges && isAdmin && (
            <button
              onClick={() => handleConfirmOrder(sub.id)}
              className="flex-shrink-0 w-6 h-6 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center transition-colors animate-pulse"
              title="Confirm order"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          )}

          {/* Confirmed indicator (Cyan Checkmark) */}
          {sub.pendingOrder && (
            <div className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded flex items-center justify-center" title="Order confirmed">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Error message */}
        {orderErrors[sub.id] && (
          <div className="mt-1 text-xs text-red-400 font-mono">
            ⚠ {orderErrors[sub.id]}
          </div>
        )}
      </div>
    );
  };

  // Render Submarine Campaign tab
  const renderSubmarineTab = () => {
    // Get recent events for operations log (last 30 events, newest first)
    const recentEvents = submarineCampaign?.events?.slice(-30).reverse() || [];

    // Filter deployed elements by selected faction and submarineType
    const factionSubmarines = selectedFaction
      ? deployedSubmarines[selectedFaction].filter(s =>
          s.submarineType === 'submarine' || !s.submarineType // Backwards compatibility
        )
      : [];

    const factionASW = selectedFaction
      ? deployedSubmarines[selectedFaction].filter(s => s.submarineType === 'asw')
      : [];

    const factionAssets = selectedFaction
      ? deployedSubmarines[selectedFaction].filter(s => s.submarineType === 'asset')
      : [];

    return (
      <div className="flex flex-col h-full">
        {/* Header with Admin Report Button */}
        <div className="mb-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider">
              {selectedFaction === 'us' ? 'USMC' : selectedFaction === 'china' ? 'PLAN' : ''} SUBMARINE OPERATIONS
            </h3>
            {selectedFaction && (
              <span className="font-mono text-xs text-gray-400">
                COMMAND POINTS:{' '}
                <span className={`font-bold text-base transition-all duration-300 ${
                  isFlashing ? 'text-red-500' : 'text-green-400'
                }`}>
                  {selectedFaction === 'us' ? commandPoints.us : commandPoints.china}
                </span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsDetailedReportOpen(true)}
            className="px-3 py-1 bg-green-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-green-700 transition-colors"
          >
            Admin Report
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex-1 flex gap-3 overflow-hidden">
          {/* Left Column - Unified List (60%) */}
          <div className="w-3/5 flex flex-col overflow-y-auto bg-gray-800 border border-gray-700 rounded">
            {!selectedFaction ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 font-mono text-xs text-center p-4">
                  -- SELECT A FACTION TO VIEW DEPLOYED ELEMENTS --
                </div>
              </div>
            ) : (
              <div className="p-2">
                {/* SUBMARINES Section */}
                <div className="mb-2">
                  <h4 className="font-mono text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                    SUBMARINES
                  </h4>
                  {factionSubmarines.length === 0 ? (
                    <div className="text-gray-500 font-mono text-xs py-2 pl-2">-- NO SUBMARINES DEPLOYED --</div>
                  ) : (
                    <div className="space-y-0">
                      {factionSubmarines.map(sub => renderSubmarineRow(sub))}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 my-3"></div>

                {/* ASW Section */}
                <div className="mb-2">
                  <h4 className="font-mono text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                    ASW (ANTI-SUBMARINE WARFARE)
                  </h4>
                  {factionASW.length === 0 ? (
                    <div className="text-gray-500 font-mono text-xs py-2 pl-2">-- NO ASW ELEMENTS DEPLOYED --</div>
                  ) : (
                    <div className="space-y-0">
                      {/* TODO: Render ASW elements when implemented */}
                      {factionASW.map((asw, idx) => (
                        <div key={idx} className="font-mono text-xs text-gray-300">
                          {asw.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 my-3"></div>

                {/* ASSETS Section */}
                <div className="mb-2">
                  <h4 className="font-mono text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                    ASSETS
                  </h4>
                  {factionAssets.length === 0 ? (
                    <div className="text-gray-500 font-mono text-xs py-2 pl-2">-- NO ASSETS DEPLOYED --</div>
                  ) : (
                    <div className="space-y-0">
                      {/* TODO: Render assets when implemented */}
                      {factionAssets.map((asset, idx) => (
                        <div key={idx} className="font-mono text-xs text-gray-300">
                          {asset.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Operations Log (40%) */}
          <div className="w-2/5 flex flex-col bg-gray-800 border border-gray-700 rounded">
            {/* Operations Log Header */}
            <div className="p-2 border-b border-gray-700">
              <h4 className="font-mono text-xs font-bold text-green-400 uppercase tracking-wider">
                Operations Log
              </h4>
              <div className="font-mono text-xs text-gray-500 mt-1">
                Last {recentEvents.length} operations
              </div>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto p-2">
              {recentEvents.length === 0 ? (
                <div className="text-gray-500 font-mono text-xs text-center py-8">
                  -- NO OPERATIONS YET --
                </div>
              ) : (
                <div className="space-y-0">
                  {recentEvents.map((event, idx) => (
                    <div
                      key={`${event.eventId}-${idx}`}
                      className="font-mono text-xs py-2 px-2 bg-gray-900 hover:bg-gray-800 transition-colors border-b border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-start gap-2">
                        <span className={`font-bold flex-shrink-0 ${event.faction === 'us' ? 'text-blue-400' : 'text-red-400'}`}>
                          [{event.faction.toUpperCase()}]
                        </span>
                        <span className="text-gray-400 flex-shrink-0 w-24 truncate" title={event.submarineName}>
                          {event.submarineName}
                        </span>
                        <span className="text-gray-300 flex-1">
                          {event.description}
                        </span>
                      </div>
                      {event.turn !== undefined && (
                        <div className="text-gray-600 text-xs ml-2 mt-0.5">
                          Turn {event.turn}{event.dayOfWeek ? `, Day ${event.dayOfWeek}` : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Faction Summary */}
            {selectedFaction && (
              <div className="p-2 border-t border-gray-700 bg-gray-900">
                <div className="font-mono text-xs text-gray-400">
                  {selectedFaction === 'us' ? 'USMC' : 'PLAN'}: {factionSubmarines.length + factionASW.length + factionAssets.length} ACTIVOS
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Report Modal */}
        {isDetailedReportOpen && (
          <SubmarineDetailedReportModal
            isOpen={isDetailedReportOpen}
            onClose={() => setIsDetailedReportOpen(false)}
            submarineCampaign={submarineCampaign}
            turnState={turnState}
          />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="font-mono text-lg font-bold text-green-400 uppercase tracking-wider">
            Combat Statistics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('combat')}
            className={`flex-1 px-4 py-3 font-mono text-sm uppercase tracking-wide transition-colors ${
              activeTab === 'combat'
                ? 'bg-gray-800 text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            Combat Log
          </button>
          <button
            onClick={() => setActiveTab('influence')}
            className={`flex-1 px-4 py-3 font-mono text-sm uppercase tracking-wide transition-colors ${
              activeTab === 'influence'
                ? 'bg-gray-800 text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            Influence
          </button>
          <button
            onClick={() => setActiveTab('submarine')}
            className={`flex-1 px-4 py-3 font-mono text-sm uppercase tracking-wide transition-colors ${
              activeTab === 'submarine'
                ? 'bg-gray-800 text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            Submarine Campaign
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden p-4">
          {activeTab === 'combat' && renderCombatTab()}
          {activeTab === 'influence' && renderInfluenceTab()}
          {activeTab === 'submarine' && renderSubmarineTab()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white font-mono text-sm uppercase tracking-wide rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombatStatisticsModal;
