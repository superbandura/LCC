import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { TaskForce, Unit, Card, OperationalArea, PendingDeployments, TurnState } from '../types';
import UnitCard from './UnitCard';
import UnitDetailModal from './UnitDetailModal';

interface TaskForceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskForce: TaskForce;
  units: Unit[];
  onUnitsUpdate: (updatedUnits: Unit[]) => void;
  isAdmin?: boolean;
  viewerFaction: 'us' | 'china';
  cards?: Card[];
  operationalAreas?: OperationalArea[];
  onOperationalAreasUpdate?: (areas: OperationalArea[]) => void;
  taskForces?: TaskForce[];
  pendingDeployments?: PendingDeployments;
  turnState?: TurnState;
}

const TaskForceDetailModal: React.FC<TaskForceDetailModalProps> = ({
  isOpen,
  onClose,
  taskForce,
  units,
  onUnitsUpdate,
  isAdmin = false,
  viewerFaction,
  cards = [],
  operationalAreas = [],
  onOperationalAreasUpdate,
  taskForces = [],
  pendingDeployments,
  turnState
}) => {
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<Unit | null>(null);
  const [showDestroyedUnits, setShowDestroyedUnits] = useState(true);
  const [showPendingUnits, setShowPendingUnits] = useState(true);

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

  if (!isOpen) return null;

  const isUs = taskForce.faction === 'us';
  const isEnemy = taskForce.faction !== viewerFaction;
  // Force read-only mode for enemy TFs (only admin can edit them)
  const effectiveIsAdmin = isEnemy ? false : isAdmin;

  // Separate units into operational, pending, and destroyed
  const operationalUnits = units.filter(unit => {
    const damageCount = unit.currentDamage.filter(d => d).length;
    const isPending = unit.isPendingDeployment === true;
    return damageCount < unit.damagePoints && !isPending;
  });

  const pendingUnits = units.filter(unit => {
    return unit.isPendingDeployment === true;
  });

  const destroyedUnits = units.filter(unit => {
    const damageCount = unit.currentDamage.filter(d => d).length;
    const isPending = unit.isPendingDeployment === true;
    return damageCount === unit.damagePoints && !isPending;
  });

  // Get ETAs for pending units
  const pendingUnitsWithETA = useMemo(() => {
    if (!pendingDeployments || !turnState) return [];

    return pendingUnits.map(unit => {
      const pending = pendingDeployments.units.find(p => p.unitId === unit.id);
      return {
        unit,
        eta: pending ? { turn: pending.activatesAtTurn, day: pending.activatesAtDay } : null
      };
    });
  }, [pendingUnits, pendingDeployments, turnState]);

  // Handle info icon click - open unit detail modal
  const handleInfoClick = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      setSelectedUnitForDetail(unit);
    }
  };

  // Handle save from unit detail modal
  const handleUnitDetailSave = (updatedUnit: Unit) => {
    const updatedUnits = units.map(u =>
      u.id === updatedUnit.id ? updatedUnit : u
    );
    onUnitsUpdate(updatedUnits);
  };

  // Handle detection toggle
  const handleDetectionToggle = (unitId: string) => {
    const updatedUnits = units.map(u =>
      u.id === unitId ? { ...u, isDetected: !(u.isDetected ?? false) } : u
    );
    onUnitsUpdate(updatedUnits);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[10001]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-4 border-b-2 ${
            isEnemy
              ? 'border-orange-500 bg-orange-950 bg-opacity-30'
              : isUs
                ? 'border-blue-500 bg-blue-950 bg-opacity-30'
                : 'border-red-500 bg-red-950 bg-opacity-30'
          }`}
          style={isEnemy ? { borderStyle: 'dashed' } : {}}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                {isEnemy && <span className="text-2xl">👁️</span>}
                <h2 className={`text-2xl font-bold ${
                  isEnemy ? 'text-orange-400' : isUs ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {taskForce.name}
                </h2>
              </div>
              {isEnemy && (
                <p className="text-sm text-orange-300 mt-1 font-semibold">
                  🔍 TASK FORCE ENEMIGA - INTELIGENCIA
                </p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-green-400 font-semibold">
                  ⚡ Operational: {operationalUnits.length}
                </p>
                {pendingUnits.length > 0 && (
                  <p className="text-sm text-orange-400 font-semibold">
                    ⏳ En Tránsito: {pendingUnits.length}
                  </p>
                )}
                {destroyedUnits.length > 0 && (
                  <p className="text-sm text-red-400 font-semibold">
                    💀 Destroyed: {destroyedUnits.length}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Units Grid */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {units.length > 0 ? (
            <div className="space-y-6">
              {/* Operational Units */}
              {operationalUnits.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                    🟢 Operational Units
                    <span className="text-sm font-normal text-gray-400">({operationalUnits.length})</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {operationalUnits.map((unit) => (
                      <UnitCard
                        key={unit.id}
                        unit={unit}
                        showSimplified={true}
                        onInfoClick={handleInfoClick}
                        onDetectionToggle={isEnemy ? undefined : handleDetectionToggle}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Units (Reinforcements) */}
              {pendingUnits.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <button
                    onClick={() => setShowPendingUnits(!showPendingUnits)}
                    className="w-full text-left mb-3 flex items-center justify-between hover:bg-gray-700 hover:bg-opacity-30 p-2 rounded transition-colors"
                  >
                    <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                      ⏳ Refuerzos en Tránsito
                      <span className="text-sm font-normal text-gray-400">({pendingUnits.length})</span>
                    </h3>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${showPendingUnits ? 'rotate-180' : ''}`}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showPendingUnits && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {pendingUnitsWithETA.map(({ unit, eta }) => (
                        <div key={unit.id} className="relative">
                          <UnitCard
                            unit={unit}
                            showSimplified={true}
                            onInfoClick={handleInfoClick}
                            onDetectionToggle={undefined}
                          />
                          {eta && (
                            <div className="absolute bottom-0 left-0 right-0 bg-orange-600 text-white text-xs font-bold px-2 py-1 text-center">
                              ETA: {formatETA(eta)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Destroyed Units */}
              {destroyedUnits.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <button
                    onClick={() => setShowDestroyedUnits(!showDestroyedUnits)}
                    className="w-full text-left mb-3 flex items-center justify-between hover:bg-gray-700 hover:bg-opacity-30 p-2 rounded transition-colors"
                  >
                    <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                      💀 Destroyed Units
                      <span className="text-sm font-normal text-gray-400">({destroyedUnits.length})</span>
                    </h3>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${showDestroyedUnits ? 'rotate-180' : ''}`}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showDestroyedUnits && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {destroyedUnits.map((unit) => (
                        <UnitCard
                          key={unit.id}
                          unit={unit}
                          showSimplified={true}
                          onInfoClick={handleInfoClick}
                          onDetectionToggle={isEnemy ? undefined : handleDetectionToggle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {operationalUnits.length === 0 && destroyedUnits.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">This Task Force has no assigned units</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">Esta Task Force no tiene unidades asignadas</p>
            </div>
          )}
        </div>
      </div>

      {/* Unit Detail Modal - Rendered via Portal to escape parent constraints */}
      {selectedUnitForDetail && createPortal(
        <UnitDetailModal
          unit={selectedUnitForDetail}
          onClose={() => setSelectedUnitForDetail(null)}
          onSave={handleUnitDetailSave}
          isAdmin={effectiveIsAdmin && !selectedUnitForDetail.isPendingDeployment}
          cards={cards}
          operationalAreas={operationalAreas}
          onOperationalAreasUpdate={onOperationalAreasUpdate}
          currentOperationalAreaId={taskForce.operationalAreaId}
          taskForces={taskForces}
          isReadOnly={selectedUnitForDetail.isPendingDeployment}
        />,
        document.body
      )}
    </div>
  );
};

export default TaskForceDetailModal;
