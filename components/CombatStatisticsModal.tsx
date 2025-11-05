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

  // Submarine orders state
  const [submarineOrders, setSubmarineOrders] = useState<Record<string, { order: string; targetId?: string }>>({});
  const [selectedSubmarineForOrder, setSelectedSubmarineForOrder] = useState<string | null>(null);

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
      setSubmarineOrders({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Influence value change handler (value-based, not position-based)
  const handleInfluenceChange = (newValue: number) => {
    onInfluenceMarkerUpdate({ value: newValue });
  };

  // Submarine order handlers
  const handleAssignOrder = (submarineId: string, order: string, targetId?: string) => {
    setSubmarineOrders(prev => ({
      ...prev,
      [submarineId]: { order, targetId }
    }));
  };

  const handleExecuteSubmarineOrders = () => {
    // This would be implemented later - for now just placeholder
    console.log('Executing submarine orders:', submarineOrders);
    alert('Submarine orders execution not yet implemented');
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
  const renderInfluenceTab = () => (
    <div className="flex flex-col h-full">
      <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded">
        <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
          Current Influence Marker
        </h3>
        {influenceMarker && influenceMarker.position.lat !== 0 && influenceMarker.position.lng !== 0 ? (
          <div className="space-y-2 font-mono text-xs">
            <div>
              <span className="text-gray-400">Faction: </span>
              <span className={`font-bold ${influenceMarker.faction === 'us' ? 'text-blue-400' : 'text-red-400'}`}>
                {influenceMarker.faction === 'us' ? 'US' : 'China'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Position: </span>
              <span className="text-green-400">
                {influenceMarker.position.lat.toFixed(4)}, {influenceMarker.position.lng.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Last Updated: </span>
              <span className="text-gray-300">
                {new Date(influenceMarker.lastUpdated).toLocaleString()}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={handleRemoveInfluence}
                className="mt-3 px-4 py-2 bg-red-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-red-700 transition-colors"
              >
                Remove Marker
              </button>
            )}
          </div>
        ) : (
          <div className="text-gray-500 font-mono text-xs">
            No influence marker placed yet. Place marker on the map.
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-800 border border-gray-700 rounded">
        <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
          Influence Rules
        </h3>
        <div className="font-mono text-xs text-gray-300 space-y-2">
          <p>• Influence marker can be placed by either faction</p>
          <p>• Position affects command point calculations</p>
          <p>• Use influence cards to place/move marker</p>
          <p>• Marker position visible to both players</p>
        </div>
      </div>
    </div>
  );

  // Render Submarine Campaign tab
  const renderSubmarineTab = () => (
    <div className="flex flex-col h-full">
      <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded">
        <h3 className="font-mono text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
          Submarine Operations
        </h3>
        <div className="grid grid-cols-2 gap-4 font-mono text-xs mb-4">
          <div>
            <div className="text-blue-400 font-bold text-lg">{deployedSubmarines.us.length}</div>
            <div className="text-gray-400 uppercase tracking-wide">US Submarines</div>
          </div>
          <div>
            <div className="text-red-400 font-bold text-lg">{deployedSubmarines.china.length}</div>
            <div className="text-gray-400 uppercase tracking-wide">China Submarines</div>
          </div>
        </div>

        <button
          onClick={() => setIsDetailedReportOpen(true)}
          className="w-full px-4 py-2 bg-green-600 text-white font-mono text-xs uppercase tracking-wide rounded hover:bg-green-700 transition-colors"
        >
          View Detailed Report
        </button>
      </div>

      {/* Deployed Submarines List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <div className="p-3 bg-gray-800 border border-gray-700 rounded">
          <h4 className="font-mono text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
            US Submarines
          </h4>
          {deployedSubmarines.us.length === 0 ? (
            <div className="text-gray-500 font-mono text-xs">No US submarines deployed</div>
          ) : (
            deployedSubmarines.us.map(sub => (
              <div key={sub.id} className="mb-2 p-2 bg-gray-900 rounded">
                <div className="font-mono text-xs text-white font-bold">{sub.submarineName}</div>
                <div className="font-mono text-xs text-gray-400">Type: {sub.cardName}</div>
                {sub.currentAreaId && (
                  <div className="font-mono text-xs text-gray-400">
                    Area: {operationalAreas.find(a => a.id === sub.currentAreaId)?.name || sub.currentAreaId}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-gray-800 border border-gray-700 rounded">
          <h4 className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
            China Submarines
          </h4>
          {deployedSubmarines.china.length === 0 ? (
            <div className="text-gray-500 font-mono text-xs">No China submarines deployed</div>
          ) : (
            deployedSubmarines.china.map(sub => (
              <div key={sub.id} className="mb-2 p-2 bg-gray-900 rounded">
                <div className="font-mono text-xs text-white font-bold">{sub.submarineName}</div>
                <div className="font-mono text-xs text-gray-400">Type: {sub.cardName}</div>
                {sub.currentAreaId && (
                  <div className="font-mono text-xs text-gray-400">
                    Area: {operationalAreas.find(a => a.id === sub.currentAreaId)?.name || sub.currentAreaId}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

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
