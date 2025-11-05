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

  // Helper: Render individual submarine card with order UI
  const renderSubmarineCard = (sub: SubmarineDeployment) => {
    const pendingOrder = pendingOrders[sub.id];
    const confirmedOrder = sub.pendingOrder;
    const currentOrder = sub.currentOrder;
    const selectedTarget = selectedTargets[sub.id];
    const error = orderErrors[sub.id];
    const commBlocked = isCommBlocked(sub);
    const factionColor = sub.faction === 'us' ? 'text-blue-400' : 'text-red-400';
    const bgColor = sub.faction === 'us' ? 'bg-blue-900' : 'bg-red-900';

    return (
      <div key={sub.id} className={`mb-3 p-3 ${bgColor} bg-opacity-20 border border-gray-700 rounded`}>
        {/* Submarine Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className={`font-mono text-sm font-bold ${factionColor}`}>
              {sub.submarineName}
            </div>
            <div className="font-mono text-xs text-gray-400 mt-1">
              Type: {sub.cardName}
            </div>
          </div>
          {commBlocked && (
            <div className="px-2 py-1 bg-yellow-600 text-white font-mono text-xs uppercase rounded">
              Comm Blocked ({sub.communicationBlockedUntilDay} days)
            </div>
          )}
        </div>

        {/* Submarine Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2 font-mono text-xs text-gray-400">
          {sub.currentAreaId && (
            <div>
              Area: <span className="text-green-400">
                {operationalAreas.find(a => a.id === sub.currentAreaId)?.name || sub.currentAreaId}
              </span>
            </div>
          )}
          {(sub.missionsCompleted ?? 0) > 0 && (
            <div>
              Missions: <span className="text-cyan-400">{sub.missionsCompleted}</span>
            </div>
          )}
          {(sub.totalKills ?? 0) > 0 && (
            <div>
              Kills: <span className="text-red-400">{sub.totalKills}</span>
            </div>
          )}
          {sub.status && (
            <div>
              Status: <span className={`${
                sub.status === 'active' ? 'text-green-400' :
                sub.status === 'destroyed' ? 'text-red-400' :
                'text-yellow-400'
              }`}>{sub.status}</span>
            </div>
          )}
        </div>

        {/* Current Order Display */}
        {currentOrder && (
          <div className="mb-2 p-2 bg-gray-900 border border-yellow-600 rounded">
            <div className="font-mono text-xs text-yellow-400 font-bold">
              ACTIVE ORDER: {currentOrder.type?.toUpperCase()}
              {currentOrder.targetId && ` → ${locations.find(l => l.id === currentOrder.targetId)?.name || currentOrder.targetId}`}
            </div>
          </div>
        )}

        {/* Confirmed Pending Order Display */}
        {confirmedOrder && !currentOrder && (
          <div className="mb-2 p-2 bg-gray-900 border border-cyan-600 rounded">
            <div className="font-mono text-xs text-cyan-400 font-bold">
              CONFIRMED ORDER: {confirmedOrder.type?.toUpperCase()}
              {confirmedOrder.targetId && ` → ${locations.find(l => l.id === confirmedOrder.targetId)?.name || confirmedOrder.targetId}`}
            </div>
          </div>
        )}

        {/* Order Assignment UI */}
        {!currentOrder && !commBlocked && isAdmin && (
          <div className="space-y-2">
            {/* Order Type Dropdown */}
            <div>
              <label className="font-mono text-xs text-gray-400 block mb-1">Assign Order:</label>
              <select
                value={pendingOrder?.type ?? confirmedOrder?.type ?? 'none'}
                onChange={(e) => handleOrderTypeChange(sub.id, e.target.value)}
                disabled={!!confirmedOrder}
                className="w-full font-mono text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 disabled:opacity-50"
              >
                <option value="none">No Order</option>
                <option value="patrol">Patrol ({PATROL_COST} CP)</option>
                <option value="attack">Attack Base ({ATTACK_COST} CP)</option>
              </select>
            </div>

            {/* Target Selection for Attack */}
            {pendingOrder?.type === 'attack' && !confirmedOrder && (
              <div>
                <label className="font-mono text-xs text-gray-400 block mb-1">Select Target Base:</label>
                <select
                  value={selectedTarget ?? pendingOrder.targetId ?? ''}
                  onChange={(e) => handleTargetSelect(sub.id, e.target.value)}
                  className="w-full font-mono text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
                >
                  <option value="">-- Select Base --</option>
                  {locations
                    .filter(loc => loc.faction !== sub.faction)
                    .map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.country})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="font-mono text-xs text-red-400 bg-red-900 bg-opacity-30 border border-red-600 rounded px-2 py-1">
                ⚠ {error}
              </div>
            )}

            {/* Action Buttons */}
            {pendingOrder && !confirmedOrder && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirmOrder(sub.id)}
                  className="flex-1 px-3 py-1 bg-green-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleCancelOrder(sub.id)}
                  className="flex-1 px-3 py-1 bg-gray-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Cancel Confirmed Order Button */}
            {confirmedOrder && (
              <button
                onClick={() => handleCancelOrder(sub.id)}
                className="w-full px-3 py-1 bg-red-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-red-700 transition-colors"
              >
                Cancel Confirmed Order
              </button>
            )}
          </div>
        )}

        {/* Communication Blocked Message */}
        {commBlocked && (
          <div className="mt-2 font-mono text-xs text-yellow-400 bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded px-2 py-1">
            Cannot assign orders while communication is blocked
          </div>
        )}
      </div>
    );
  };

  // Render Submarine Campaign tab
  const renderSubmarineTab = () => {
    // Count confirmed orders
    const confirmedOrders = submarineCampaign?.deployedSubmarines?.filter(s => s.pendingOrder) || [];
    const confirmedOrdersCount = confirmedOrders.length;

    return (
      <div className="flex flex-col h-full">
        {/* Header with Stats and Report Button */}
        <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded">
          <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
            Submarine Operations
          </h3>
          <div className="grid grid-cols-3 gap-4 font-mono text-xs mb-4">
            <div>
              <div className="text-blue-400 font-bold text-lg">{deployedSubmarines.us.length}</div>
              <div className="text-gray-400 uppercase tracking-wide">US Submarines</div>
            </div>
            <div>
              <div className="text-red-400 font-bold text-lg">{deployedSubmarines.china.length}</div>
              <div className="text-gray-400 uppercase tracking-wide">China Submarines</div>
            </div>
            <div>
              <div className="text-green-400 font-bold text-lg">{confirmedOrdersCount}</div>
              <div className="text-gray-400 uppercase tracking-wide">Confirmed Orders</div>
            </div>
          </div>

          <button
            onClick={() => setIsDetailedReportOpen(true)}
            className="w-full px-4 py-2 bg-green-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-green-700 transition-colors"
          >
            View Detailed Report
          </button>
        </div>

        {/* Deployed Submarines List with Order UI */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {/* US Submarines */}
          <div className="p-3 bg-gray-800 border border-gray-700 rounded">
            <h4 className="font-mono text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
              US Submarines
            </h4>
            {deployedSubmarines.us.length === 0 ? (
              <div className="text-gray-500 font-mono text-xs">No US submarines deployed</div>
            ) : (
              deployedSubmarines.us.map(sub => renderSubmarineCard(sub))
            )}
          </div>

          {/* China Submarines */}
          <div className="p-3 bg-gray-800 border border-gray-700 rounded">
            <h4 className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider mb-3">
              China Submarines
            </h4>
            {deployedSubmarines.china.length === 0 ? (
              <div className="text-gray-500 font-mono text-xs">No China submarines deployed</div>
            ) : (
              deployedSubmarines.china.map(sub => renderSubmarineCard(sub))
            )}
          </div>
        </div>

        {/* Execute Turn Section */}
        {isAdmin && confirmedOrdersCount > 0 && (
          <div className="mt-3 p-4 bg-gray-800 border border-green-600 rounded">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-gray-300">
                <div className="font-bold text-green-400 mb-1">Ready to Execute Turn</div>
                <div>Confirmed Orders: <span className="text-cyan-400">{confirmedOrdersCount}</span></div>
              </div>
              <button
                onClick={handleExecuteSubmarineTurn}
                disabled={isExecutingTurn}
                className="px-6 py-3 bg-green-600 text-white font-mono text-sm uppercase tracking-wide rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExecutingTurn ? 'Executing...' : `Execute Turn (${confirmedOrdersCount} orders)`}
              </button>
            </div>
          </div>
        )}

        {/* Recent Events Summary */}
        <div className="mt-3 p-3 bg-gray-800 border border-gray-700 rounded">
          <h4 className="font-mono text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
            Recent Events
          </h4>
          {submarineCampaign?.events?.length === 0 ? (
            <div className="text-gray-500 font-mono text-xs">No submarine events yet</div>
          ) : (
            <div className="font-mono text-xs text-gray-300">
              {(submarineCampaign?.events || []).slice(-3).reverse().map((event, idx) => (
                <div key={`${event.eventId}-${idx}`} className="mb-1">
                  <span className={event.faction === 'us' ? 'text-blue-400' : 'text-red-400'}>
                    [{event.faction.toUpperCase()}]
                  </span>{' '}
                  {event.description.split(' - ')[0]}
                </div>
              ))}
            </div>
          )}
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
