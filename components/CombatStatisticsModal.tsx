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
  TurnState
} from '../types';
import { CloseIcon } from './Icons';
import InfluenceTrack from './InfluenceTrack';
import SubmarineDetailedReportModal from './SubmarineDetailedReportModal';

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
  pendingDeployments
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
    const bonusCP = Math.floor(Math.abs(currentValue) / 2);
    const favoredFaction = currentValue > 0 ? 'US' : currentValue < 0 ? 'China' : 'Neutral';

    return (
      <div className="flex flex-col h-full space-y-4">
        {/* InfluenceTrack Component */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded">
          <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider mb-4">
            Influence Marker
          </h3>
          <InfluenceTrack
            value={currentValue}
            onChange={isAdmin ? handleInfluenceChange : undefined}
          />
        </div>

        {/* Command Point Bonus Preview */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded">
          <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
            Command Point Effects
          </h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Value:</span>
              <span className={`font-bold text-lg ${
                currentValue > 0 ? 'text-blue-400' :
                currentValue < 0 ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {currentValue > 0 ? `+${currentValue}` : currentValue}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Favored Faction:</span>
              <span className={`font-bold ${
                currentValue > 0 ? 'text-blue-400' :
                currentValue < 0 ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {favoredFaction}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span className="text-gray-400">CP Bonus (End of Week):</span>
              <span className="font-bold text-green-400">+{bonusCP} CP</span>
            </div>
            <div className="text-gray-500 text-xs pt-2">
              Formula: Bonus = |value| / 2 (rounded down)
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="p-4 bg-gray-800 border border-gray-700 rounded">
            <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
              Admin Controls
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleInfluenceChange(Math.max(-10, currentValue - 5))}
                disabled={currentValue <= -10}
                className="px-3 py-2 bg-red-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                -5 (China)
              </button>
              <button
                onClick={() => handleInfluenceChange(Math.max(-10, currentValue - 1))}
                disabled={currentValue <= -10}
                className="px-3 py-2 bg-red-500 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                -1
              </button>
              <button
                onClick={() => handleInfluenceChange(0)}
                disabled={currentValue === 0}
                className="px-3 py-2 bg-yellow-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => handleInfluenceChange(Math.min(10, currentValue + 1))}
                disabled={currentValue >= 10}
                className="px-3 py-2 bg-blue-500 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +1
              </button>
              <button
                onClick={() => handleInfluenceChange(Math.min(10, currentValue + 5))}
                disabled={currentValue >= 10}
                className="px-3 py-2 bg-blue-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +5 (US)
              </button>
            </div>
          </div>
        )}

        {/* Influence Rules */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded">
          <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
            Influence Rules
          </h3>
          <div className="font-mono text-xs text-gray-300 space-y-2">
            <p>• Influence ranges from -10 (China) to +10 (US)</p>
            <p>• Affects Command Point calculations at end of week</p>
            <p>• Play influence cards to shift the marker</p>
            <p>• Bonus CP = |value| / 2 (rounded down)</p>
            <p>• Favored faction receives bonus at weekly reset</p>
          </div>
        </div>
      </div>
    );
  };

  // Helper: Render compact submarine row
  const renderSubmarineRow = (sub: SubmarineDeployment) => {
    const pendingOrder = pendingOrders[sub.id];
    const confirmedOrder = sub.pendingOrder;
    const selectedTarget = selectedTargets[sub.id];
    const hasChanges = !!pendingOrder && !confirmedOrder;
    const factionColor = sub.faction === 'us' ? 'text-blue-400' : 'text-red-400';

    return (
      <div key={sub.id} className="mb-2 p-2 bg-gray-900 border border-gray-700 rounded hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-2">
          {/* Submarine Name */}
          <div className={`font-mono text-xs font-bold ${factionColor} flex-shrink-0 w-32`}>
            {sub.submarineName}
          </div>

          {/* Type */}
          <div className="font-mono text-xs text-gray-500 flex-shrink-0 w-24">
            {sub.cardName?.split(' ')[0]}
          </div>

          {/* Patrol Zone Dropdown */}
          <select
            value={pendingOrder?.targetId ?? confirmedOrder?.targetId ?? selectedTarget ?? sub.currentAreaId ?? ''}
            onChange={(e) => handleTargetSelect(sub.id, e.target.value)}
            disabled={!!confirmedOrder}
            className="font-mono text-xs bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 flex-1 disabled:opacity-50"
          >
            <option value="">-- ZONA PATRULLA --</option>
            {operationalAreas.map(area => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>

          {/* Confirm Icon (Green Envelope) */}
          {hasChanges && isAdmin && (
            <button
              onClick={() => handleConfirmOrder(sub.id)}
              className="flex-shrink-0 w-6 h-6 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center transition-colors"
              title="Confirm order (2 CP)"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          )}

          {/* Confirmed indicator */}
          {confirmedOrder && (
            <div className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded flex items-center justify-center" title="Order confirmed">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Missions and Kills */}
        {((sub.missionsCompleted ?? 0) > 0 || (sub.totalKills ?? 0) > 0) && (
          <div className="mt-1 flex gap-4 font-mono text-xs text-gray-500">
            {(sub.missionsCompleted ?? 0) > 0 && <span>M:{sub.missionsCompleted}</span>}
            {(sub.totalKills ?? 0) > 0 && <span className="text-red-400">K:{sub.totalKills}</span>}
          </div>
        )}
      </div>
    );
  };

  // Render Submarine Campaign tab
  const renderSubmarineTab = () => {
    // Get recent events for operations log (last 30 events, newest first)
    const recentEvents = submarineCampaign?.events?.slice(-30).reverse() || [];

    return (
      <div className="flex flex-col h-full">
        {/* Header with Admin Report Button */}
        <div className="mb-3 flex justify-between items-center">
          <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider">
            Submarine Campaign
          </h3>
          <button
            onClick={() => setIsDetailedReportOpen(true)}
            className="px-3 py-1 bg-green-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-green-700 transition-colors"
          >
            Admin Report
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex-1 flex gap-3 overflow-hidden">
          {/* Left Column - Submarine/ASW/Assets List (40%) */}
          <div className="w-2/5 flex flex-col space-y-3 overflow-y-auto">
            {/* US Submarines Section */}
            <div className="p-2 bg-gray-800 border border-gray-700 rounded">
              <h4 className="font-mono text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
                US Submarines ({deployedSubmarines.us.length})
              </h4>
              {deployedSubmarines.us.length === 0 ? (
                <div className="text-gray-500 font-mono text-xs py-2">-- NO DEPLOYED --</div>
              ) : (
                <div className="space-y-0">
                  {deployedSubmarines.us.map(sub => renderSubmarineRow(sub))}
                </div>
              )}
            </div>

            {/* China Submarines Section */}
            <div className="p-2 bg-gray-800 border border-gray-700 rounded">
              <h4 className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
                China Submarines ({deployedSubmarines.china.length})
              </h4>
              {deployedSubmarines.china.length === 0 ? (
                <div className="text-gray-500 font-mono text-xs py-2">-- NO DEPLOYED --</div>
              ) : (
                <div className="space-y-0">
                  {deployedSubmarines.china.map(sub => renderSubmarineRow(sub))}
                </div>
              )}
            </div>

            {/* ASW Elements Section (placeholder) */}
            <div className="p-2 bg-gray-800 border border-gray-700 rounded">
              <h4 className="font-mono text-xs font-bold text-green-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
                ASW Elements (0)
              </h4>
              <div className="text-gray-500 font-mono text-xs py-2">-- NO ELEMENTS DEPLOYED --</div>
            </div>

            {/* Assets Section (placeholder) */}
            <div className="p-2 bg-gray-800 border border-gray-700 rounded">
              <h4 className="font-mono text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
                Assets (0)
              </h4>
              <div className="text-gray-500 font-mono text-xs py-2">-- NO ASSETS DEPLOYED --</div>
            </div>
          </div>

          {/* Right Column - Operations Log (60%) */}
          <div className="w-3/5 flex flex-col bg-gray-800 border border-gray-700 rounded">
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
                <div className="space-y-1">
                  {recentEvents.map((event, idx) => (
                    <div
                      key={`${event.eventId}-${idx}`}
                      className="font-mono text-xs py-1 px-2 bg-gray-900 border border-gray-700 rounded hover:border-gray-600 transition-colors"
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
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
            Submarines
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
