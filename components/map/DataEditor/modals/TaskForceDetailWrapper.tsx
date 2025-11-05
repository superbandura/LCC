import React from 'react';
import { TaskForce, Unit, Card, OperationalArea, PendingDeployments, TurnState } from '../../../../types';
import TaskForceDetailModal from '../../../TaskForceDetailModal';
import { getTaskForceUnits } from '../helpers';

interface TaskForceDetailWrapperProps {
  taskForce: TaskForce;
  units: Unit[];
  cards: Card[];
  operationalAreas: OperationalArea[];
  selectedFaction: 'us' | 'china';
  isAdmin: boolean;
  taskForces: TaskForce[];
  onClose: () => void;
  onUnitsUpdate: (units: Unit[]) => void;
  onOperationalAreasUpdate: (areas: OperationalArea[]) => void;
  pendingDeployments?: PendingDeployments;
  turnState?: TurnState;
}

const TaskForceDetailWrapper: React.FC<TaskForceDetailWrapperProps> = ({
  taskForce,
  units,
  cards,
  operationalAreas,
  selectedFaction,
  isAdmin,
  taskForces,
  onClose,
  onUnitsUpdate,
  onOperationalAreasUpdate,
  pendingDeployments,
  turnState
}) => {
  // Get units for this task force, respecting fog of war
  const tfUnits = getTaskForceUnits(taskForce.id, units);
  const visibleUnits = taskForce.faction !== selectedFaction
    ? tfUnits.filter(u => u.isDetected === true)
    : tfUnits;

  const handleUnitsUpdate = (updatedUnits: Unit[]) => {
    // Merge updated Task Force units with all other units
    // This prevents losing units that are not in the current Task Force
    const mergedUnits = units.map(u => {
      const updatedUnit = updatedUnits.find(updated => updated.id === u.id);
      return updatedUnit || u;
    });
    onUnitsUpdate(mergedUnits);
  };

  return (
    <TaskForceDetailModal
      isOpen={true}
      onClose={onClose}
      taskForce={taskForce}
      units={visibleUnits}
      onUnitsUpdate={handleUnitsUpdate}
      isAdmin={isAdmin}
      viewerFaction={selectedFaction}
      cards={cards}
      operationalAreas={operationalAreas}
      onOperationalAreasUpdate={onOperationalAreasUpdate}
      taskForces={taskForces}
      pendingDeployments={pendingDeployments}
      turnState={turnState}
    />
  );
};

export default TaskForceDetailWrapper;
