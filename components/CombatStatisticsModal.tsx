import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  CommandPoints,
  AswShipDeployment
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
  onCommandPointsUpdate: (points: CommandPoints) => void;
  turnState: TurnState;
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
  commandPoints,
  onCommandPointsUpdate,
  turnState
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
  const SUBMARINE_COST = 2;  // Cost for submarines (patrol and attack)
  const ASW_COST = 2;         // Cost for ASW patrol orders
  const ASSET_COST = 1;       // Cost for asset deploy orders

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

  // Filter submarine campaign events for operations log - only show successful events affecting player
  const recentEvents = useMemo(() => {
    if (!selectedFaction || !submarineCampaign?.events) return [];

    return submarineCampaign.events
      .filter(event => {
        // Only show events for selected faction
        if (event.faction !== selectedFaction) return false;

        // Show successful attacks (patrols with damage dealt)
        if (event.eventType === 'attack_success') {
          // For patrols against areas, only show if damage was dealt (enemy detected)
          if (event.targetInfo?.targetType === 'area') {
            return event.targetInfo.damageDealt !== undefined && event.targetInfo.damageDealt > 0;
          }
          return true; // Show other successful attacks (against bases, etc.)
        }

        // Show destructions
        if (event.eventType === 'destroyed') return true;

        // Hide everything else (failed patrols, detection attempts, etc.)
        return false;
      })
      .slice(-30)
      .reverse();
  }, [submarineCampaign?.events, selectedFaction]);

  // Reset orders when modal opens (track transition to avoid race condition)
  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    // Only clear state when modal transitions from closed → open
    if (isOpen && !prevIsOpenRef.current) {
      setPendingOrders({});
      setSelectedTargets({});
      setOrderErrors({});

      // Hydrate from Firestore: populate local state from confirmed orders
      const hydrated: Record<string, PendingOrder> = {};
      const targets: Record<string, string> = {};

      submarineCampaign?.deployedSubmarines?.forEach(sub => {
        if (sub.currentOrder) {
          hydrated[sub.id] = {
            type: sub.currentOrder.orderType as OrderType,
            targetId: sub.currentOrder.targetId
          };
          if (sub.currentOrder.targetId) {
            targets[sub.id] = sub.currentOrder.targetId;
          }
        }
      });

      setPendingOrders(hydrated);
      setSelectedTargets(targets);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, submarineCampaign]);

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

  // Track submarine campaign props updates
  useEffect(() => {
    console.log('🔄 [PROPS] Campaign updated, subs with pending orders:',
      submarineCampaign?.deployedSubmarines?.filter(s => s.pendingOrder).map(s => ({
        id: s.id,
        name: s.submarineName,
        pendingOrder: s.pendingOrder
      })));
  }, [submarineCampaign]);

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

  // Helper: Convert operationalData to Record for SubmarineService
  const getOperationalDataRecord = (): Record<string, OperationalData> => {
    // Check if operationalData is already a Record (object)
    if (operationalData && typeof operationalData === 'object' && !Array.isArray(operationalData)) {
      console.log('📊 [OPERATIONAL DATA] Already a Record, using as-is');
      return operationalData as Record<string, OperationalData>;
    }

    // If it's an array, convert to Record
    if (Array.isArray(operationalData)) {
      console.log('📊 [OPERATIONAL DATA] Is array with', operationalData.length, 'items, converting to Record');
      const record: Record<string, OperationalData> = {};
      operationalAreas.forEach(area => {
        const areaData = operationalData.find(od => {
          return (od as any).id === area.id;
        });
        if (areaData) {
          record[area.id] = areaData;
        }
      });
      return record;
    }

    // Fallback: return empty record
    console.warn('⚠️ [OPERATIONAL DATA] Unexpected type:', typeof operationalData);
    return {};
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
        type: orderType as 'patrol' | 'attack' | 'deploy',
        targetId: selectedTargets[subId]
      }
    }));
  };

  const handleTargetSelect = (subId: string, targetId: string) => {
    setSelectedTargets(prev => ({...prev, [subId]: targetId}));

    // Update pending order with target
    if (pendingOrders[subId]) {
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

    console.log('🟢 [CONFIRM] Started:', subId);
    console.log('🟢 Local order:', order);
    console.log('🟢 Sub.pendingOrder:', sub?.pendingOrder);

    if (!order || !sub) return;

    // Validation
    if (order.type === 'attack' && !order.targetId) {
      setOrderErrors(prev => ({...prev, [subId]: 'Target required for attack orders'}));
      return;
    }

    if (!order.targetId) {
      setOrderErrors(prev => ({...prev, [subId]: 'Target required'}));
      return;
    }

    // Determine command point cost based on submarine type
    const cost = sub.submarineType === 'asset' ? ASSET_COST :
                 sub.submarineType === 'asw' ? ASW_COST :
                 SUBMARINE_COST;

    // Check if faction has enough command points
    const currentPoints = sub.faction === 'us' ? commandPoints.us : commandPoints.china;
    if (currentPoints < cost) {
      setOrderErrors(prev => ({...prev, [subId]: `Insufficient CP (need ${cost}, have ${currentPoints})`}));
      return;
    }

    // Deduct command points
    const newCommandPoints = {
      ...commandPoints,
      [sub.faction]: currentPoints - cost
    };
    onCommandPointsUpdate(newCommandPoints);
    console.log('💰 [CP] Deducted:', cost, 'New points:', newCommandPoints);

    // ========== VALIDACIÓN RED TÁCTICA (CÓDIGO RESTAURADO) ==========
    const opDataRecord = getOperationalDataRecord();
    const avgDamage = SubmarineService.getAverageTacticalNetworkDamage(
      opDataRecord,
      sub.faction
    );

    const commCheck = SubmarineService.checkCommunicationFailure(avgDamage);
    console.log('📡 [TACTICAL] Result:', commCheck);

    if (commCheck.failed) {
      setOrderErrors(prev => ({
        ...prev,
        [subId]: `Communication failure! (Roll: ${commCheck.roll}/${commCheck.threshold}, Tactical Network Damage: ${avgDamage})`
      }));

      // Clear local pending state (CP already deducted as penalty)
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

      return; // Do NOT confirm order
    }
    // ========== FIN VALIDACIÓN RED TÁCTICA ==========

    // Update submarine with confirmed order (active and ready for execution)
    const updatedSubs = submarineCampaign.deployedSubmarines.map(s => {
      if (s.id === subId) {
        // Remove pendingOrder field by destructuring (Firestore doesn't accept undefined)
        const { pendingOrder, ...rest } = s;

        // Calculate execution date for attacks (2 days from now)
        let executionDate: string | undefined;
        if (order.type === 'attack') {
          const currentDate = new Date(turnState.currentDate);
          currentDate.setDate(currentDate.getDate() + 2);
          executionDate = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        }

        return {
          ...rest,
          currentOrder: {
            orderId: `${subId}-${Date.now()}`,           // Unique order ID
            submarineId: subId,                          // Submarine executing the order
            orderType: order.type,                       // Transform 'type' to 'orderType' for Firestore
            status: 'pending',                           // Order status
            targetId: order.targetId,                    // Target area or base
            assignedTurn: turnState.turnNumber,          // Turn when order was assigned
            assignedDate: turnState.currentDate,         // Date when order was assigned
            // For attacks, set execution date to current + 2 days
            ...(order.type === 'attack' && { executionDate })
          }
        };
      }
      return s;
    });

    console.log('🔄 [FIRESTORE] Updating campaign');
    console.log('🔄 Updated sub:', updatedSubs.find(s => s.id === subId));

    onUpdateSubmarineCampaign({
      ...submarineCampaign,
      deployedSubmarines: updatedSubs
    });

    // Update local state to reflect confirmed order (keep dropdowns populated)
    setPendingOrders(prev => ({
      ...prev,
      [subId]: {
        type: order.type,
        targetId: order.targetId
      }
    }));

    // Clear any errors
    setOrderErrors(prev => {
      const updated = {...prev};
      delete updated[subId];
      return updated;
    });

    console.log('✅ [CONFIRMED] Order saved and reflected in dropdowns for:', subId);
  };

  const handleCancelOrder = (subId: string) => {
    const sub = getSubmarineById(subId);
    if (!sub) return;

    // If order is confirmed (in currentOrder), remove it from submarine
    if (sub.currentOrder) {
      const updatedSubs = submarineCampaign.deployedSubmarines.map(s => {
        if (s.id === subId) {
          // Remove currentOrder field by destructuring (Firestore doesn't accept undefined)
          const { currentOrder, ...rest } = s;
          return rest;
        }
        return s;
      });

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

    console.log('🎨 [RENDER]', sub.id, 'localPending:', pendingOrder, 'currentOrder:', sub.currentOrder);

    // Get enemy bases (opposite faction)
    const enemyFaction = sub.faction === 'us' ? 'China' : 'EE. UU.';
    const enemyBases = locations.filter(loc => loc.country === enemyFaction);

    // Check if there are unconfirmed changes (order with target but not saved OR different from confirmed)
    const hasChanges = !!pendingOrder && !!pendingOrder.targetId && (
      !sub.currentOrder ||
      sub.currentOrder.orderType !== pendingOrder.type ||
      sub.currentOrder.targetId !== pendingOrder.targetId
    );

    console.log('🔍 [HASCHANGES]', sub.id, '=', hasChanges,
      '(local:', !!pendingOrder, 'target:', !!pendingOrder?.targetId, 'different:',
      sub.currentOrder ? (sub.currentOrder.orderType !== pendingOrder?.type || sub.currentOrder.targetId !== pendingOrder?.targetId) : true, ')');

    // Check if order is incomplete (order without target)
    const needsConfirmation = !!pendingOrder && !pendingOrder.targetId;

    return (
      <div key={sub.id} className={`mb-2 p-2 rounded transition-colors ${
        hasChanges ? 'bg-red-900/20 border border-gray-700' : 'bg-gray-900 border border-gray-700 hover:border-gray-600'
      }`}>
        {console.log(`🎨 [PANEL] ${sub.id}: ${hasChanges ? 'RED' : 'GRAY'}`)}
        <div className="flex items-center gap-2">
          {/* Submarine Name */}
          <div className={`font-mono text-xs font-bold ${factionColor} flex-shrink-0 w-48 truncate`}>
            {sub.submarineName}
          </div>

          {/* Type and Stats */}
          <div className="font-mono text-xs text-gray-500 flex-shrink-0 w-28 flex items-center gap-2">
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
              className="font-mono text-xs bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 w-40"
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
            <>
              {console.log(`✉️ [ENVELOPE] ${sub.id}: VISIBLE (hasChanges=${hasChanges}, isAdmin=${isAdmin})`)}
              <button
                onClick={() => handleConfirmOrder(sub.id)}
                className="flex-shrink-0 w-6 h-6 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center transition-colors animate-pulse"
                title="Confirm order"
              >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            </>
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

  // Helper: Render ASW row
  const renderASWRow = (asw: SubmarineDeployment) => {
    const pendingOrder = pendingOrders[asw.id];
    const factionColor = asw.faction === 'us' ? 'text-blue-400' : 'text-red-400';

    // Check if there are unconfirmed changes (order with target but not saved OR different from confirmed)
    const hasChanges = !!pendingOrder && !!pendingOrder.targetId && (
      !asw.currentOrder ||
      asw.currentOrder.orderType !== pendingOrder.type ||
      asw.currentOrder.targetId !== pendingOrder.targetId
    );

    return (
      <div key={asw.id} className={`mb-2 p-2 rounded transition-colors ${
        hasChanges ? 'bg-red-900/20 border border-gray-700' : 'bg-gray-900 border border-gray-700 hover:border-gray-600'
      }`}>
        <div className="flex items-center gap-2">
          {/* ASW Name */}
          <div className={`font-mono text-xs font-bold ${factionColor} flex-shrink-0 w-48 truncate`}>
            {asw.submarineName}
          </div>

          {/* Type and Stats */}
          <div className="font-mono text-xs text-gray-500 flex-shrink-0 w-28 flex items-center gap-2">
            <span>{asw.cardName?.split(' ')[0]}</span>
            {((asw.missionsCompleted ?? 0) > 0 || (asw.totalKills ?? 0) > 0) && (
              <span className="text-gray-600">
                {(asw.missionsCompleted ?? 0) > 0 && `M:${asw.missionsCompleted}`}
                {(asw.missionsCompleted ?? 0) > 0 && (asw.totalKills ?? 0) > 0 && ' '}
                {(asw.totalKills ?? 0) > 0 && <span className="text-red-500">K:{asw.totalKills}</span>}
              </span>
            )}
          </div>

          {/* Order Type Dropdown - Only PATROL for ASW */}
          <select
            value={pendingOrder?.type || ''}
            onChange={(e) => handleOrderTypeChange(asw.id, e.target.value)}
            className="font-mono text-xs bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 w-24"
          >
            <option value="">-- ORDER --</option>
            <option value="patrol">PATROL</option>
          </select>

          {/* Target Dropdown */}
          {pendingOrder && (
            <select
              value={pendingOrder.targetId || ''}
              onChange={(e) => handleTargetSelect(asw.id, e.target.value)}
              className="font-mono text-xs bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 w-40"
            >
              <option value="">-- SELECT TARGET --</option>
              {operationalAreas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
              <option value="south-china-sea">Mar de China</option>
            </select>
          )}

          {/* Confirm Icon */}
          {hasChanges && isAdmin && (
            <button
              onClick={() => handleConfirmOrder(asw.id)}
              className="flex-shrink-0 w-6 h-6 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center transition-colors animate-pulse"
              title="Confirm order"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>

        {/* Error message */}
        {orderErrors[asw.id] && (
          <div className="mt-1 text-xs text-red-400 font-mono">
            ⚠ {orderErrors[asw.id]}
          </div>
        )}
      </div>
    );
  };

  // Helper: Render ASW Ship row (surface ships with ASW capability)
  const renderASWShipRow = (ship: AswShipDeployment) => {
    const factionColor = ship.faction === 'us' ? 'text-blue-400' : 'text-red-400';

    return (
      <div key={ship.unitId} className="mb-2 p-2 rounded bg-gray-900 border border-gray-700">
        <div className="flex items-center gap-2">
          {/* Ship Name */}
          <div className={`font-mono text-xs font-bold ${factionColor} flex-shrink-0 w-48 truncate`}>
            {ship.unitName}
          </div>

          {/* Task Force */}
          <div className="font-mono text-xs text-gray-400 flex-shrink-0 w-32 truncate">
            TF: {ship.taskForceName}
          </div>

          {/* Operational Area */}
          <div className="font-mono text-xs text-gray-500 flex-1 truncate">
            AREA: {ship.operationalAreaName}
          </div>
        </div>
      </div>
    );
  };

  // Helper: Render Asset row
  const renderAssetRow = (asset: SubmarineDeployment) => {
    const pendingOrder = pendingOrders[asset.id];
    const factionColor = asset.faction === 'us' ? 'text-blue-400' : 'text-red-400';

    // Check if there are unconfirmed changes (order with target but not saved OR different from confirmed)
    const hasChanges = !!pendingOrder && !!pendingOrder.targetId && (
      !asset.currentOrder ||
      asset.currentOrder.orderType !== pendingOrder.type ||
      asset.currentOrder.targetId !== pendingOrder.targetId
    );

    return (
      <div key={asset.id} className={`mb-2 p-2 rounded transition-colors ${
        hasChanges ? 'bg-red-900/20 border border-gray-700' : 'bg-gray-900 border border-gray-700 hover:border-gray-600'
      }`}>
        <div className="flex items-center gap-2">
          {/* Asset Name */}
          <div className={`font-mono text-xs font-bold ${factionColor} flex-shrink-0 w-48 truncate`}>
            {asset.submarineName}
          </div>

          {/* Type and Stats */}
          <div className="font-mono text-xs text-gray-500 flex-shrink-0 w-28 flex items-center gap-2">
            <span>{asset.cardName?.split(' ')[0]}</span>
            {((asset.missionsCompleted ?? 0) > 0 || (asset.totalKills ?? 0) > 0) && (
              <span className="text-gray-600">
                {(asset.missionsCompleted ?? 0) > 0 && `M:${asset.missionsCompleted}`}
                {(asset.missionsCompleted ?? 0) > 0 && (asset.totalKills ?? 0) > 0 && ' '}
                {(asset.totalKills ?? 0) > 0 && <span className="text-red-500">K:{asset.totalKills}</span>}
              </span>
            )}
          </div>

          {/* Order Type Dropdown - Only DEPLOY for Assets */}
          <select
            value={pendingOrder?.type || ''}
            onChange={(e) => handleOrderTypeChange(asset.id, e.target.value)}
            className="font-mono text-xs bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 w-24"
          >
            <option value="">-- ORDER --</option>
            <option value="deploy">DEPLOY</option>
          </select>

          {/* Target Dropdown */}
          {pendingOrder && (
            <select
              value={pendingOrder.targetId || ''}
              onChange={(e) => handleTargetSelect(asset.id, e.target.value)}
              className="font-mono text-xs bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 w-40"
            >
              <option value="">-- SELECT TARGET --</option>
              {operationalAreas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
              <option value="south-china-sea">Mar de China</option>
            </select>
          )}

          {/* Confirm Icon */}
          {hasChanges && isAdmin && (
            <button
              onClick={() => handleConfirmOrder(asset.id)}
              className="flex-shrink-0 w-6 h-6 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center transition-colors animate-pulse"
              title="Confirm order"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>

        {/* Error message */}
        {orderErrors[asset.id] && (
          <div className="mt-1 text-xs text-red-400 font-mono">
            ⚠ {orderErrors[asset.id]}
          </div>
        )}
      </div>
    );
  };

  // Render Submarine Campaign tab
  const renderSubmarineTab = () => {
    // Filter deployed elements by selected faction and submarineType
    const factionSubmarines = selectedFaction
      ? deployedSubmarines[selectedFaction].filter(s =>
          s.submarineType === 'submarine' || !s.submarineType // Backwards compatibility
        )
      : [];

    const factionASW = selectedFaction
      ? deployedSubmarines[selectedFaction].filter(s => s.submarineType === 'asw')
      : [];

    // Filter ASW ships by selected faction
    const factionASWShips = selectedFaction && submarineCampaign?.aswShips
      ? submarineCampaign.aswShips.filter(ship => ship.faction === selectedFaction)
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
          {/* Left Column - Unified List (50%) */}
          <div className="w-1/2 flex flex-col overflow-y-auto bg-gray-800 border border-gray-700 rounded">
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
                  {factionASWShips.length === 0 && factionASW.length === 0 ? (
                    <div className="text-gray-500 font-mono text-xs py-2 pl-2">-- NO ASW ELEMENTS DEPLOYED --</div>
                  ) : (
                    <div className="space-y-0">
                      {/* ASW Ships (displayed first) */}
                      {factionASWShips.map(ship => renderASWShipRow(ship))}

                      {/* ASW Cards (displayed after ships) */}
                      {factionASW.map(asw => renderASWRow(asw))}
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
                      {factionAssets.map(asset => renderAssetRow(asset))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Operations Log (50%) */}
          <div className="w-1/2 flex flex-col bg-gray-800 border border-gray-700 rounded">
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
                  {recentEvents.map((event, idx) => {
                    // Format date from game turn and day
                    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const dateStr = `Week ${event.turn}, ${dayNames[(event.dayOfWeek ?? 1) - 1]}`;
                    const factionLabel = event.faction === 'us' ? 'USMC' : 'PLAN';

                    return (
                      <div
                        key={`${event.eventId}-${idx}`}
                        className="font-mono text-xs py-1 px-2"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500 flex-shrink-0">
                            [{dateStr}]
                          </span>
                          <span className={`font-bold flex-shrink-0 ${event.faction === 'us' ? 'text-blue-400' : 'text-red-400'}`}>
                            {factionLabel}
                          </span>
                          <span className="text-gray-400 flex-shrink-0">
                            {event.submarineName}
                          </span>
                          <span className="text-gray-500">
                            -
                          </span>
                          <span className="text-gray-300 flex-1">
                            {event.description}
                          </span>
                          {event.targetInfo?.damageDealt && event.targetInfo.damageDealt > 0 && (
                            <span className="text-red-400 font-bold flex-shrink-0">
                              - {event.targetInfo.damageDealt} CP LOST
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
            locations={locations}
          />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-[95vw] max-h-[90vh] flex flex-col">
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
