import React, { useState, useEffect } from 'react';
import { Card, Unit, TaskForce } from '../../../../types';

interface NewTaskForceConfig {
  id: string; // Temporary ID for UI
  name: string;
  unitIds: string[];
}

interface DisembarkConfig {
  newTaskForces: NewTaskForceConfig[];
  existingTFAssignments: { unitId: string; taskForceId: string }[];
}

interface DisembarkModalProps {
  card: Card;
  embarkedUnits: Unit[];
  areaTaskForces: TaskForce[]; // Task Forces in this operational area
  existingTFNames: string[];
  onDisembark: (config: DisembarkConfig) => void;
  onCancel: () => void;
}

const DisembarkModal: React.FC<DisembarkModalProps> = ({
  card,
  embarkedUnits,
  areaTaskForces,
  existingTFNames,
  onDisembark,
  onCancel,
}) => {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C'>('A');
  const [newTFName, setNewTFName] = useState<string>('');
  const [selectedExistingTFId, setSelectedExistingTFId] = useState<string>('');
  const [newTaskForces, setNewTaskForces] = useState<NewTaskForceConfig[]>([
    { id: 'temp_1', name: '', unitIds: [] }
  ]);
  const [existingAssignments, setExistingAssignments] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Check if a name is duplicate
  const isDuplicateName = (name: string, excludeTempId?: string): boolean => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return false;

    // Check against existing TFs in area
    if (existingTFNames.some(n => n.toLowerCase() === trimmed)) {
      return true;
    }

    // Check against other new TFs in modal
    const otherNewTFs = newTaskForces.filter(ntf =>
      ntf.id !== excludeTempId && ntf.name.trim().toLowerCase() === trimmed
    );
    return otherNewTFs.length > 0;
  };

  // Validate assignments
  const validateAssignments = (): boolean => {
    const newErrors: string[] = [];

    if (selectedOption === 'A') {
      if (!newTFName.trim()) {
        newErrors.push('Task Force name is required');
      } else if (isDuplicateName(newTFName)) {
        newErrors.push('A Task Force with that name already exists');
      }
    }

    if (selectedOption === 'B') {
      if (!selectedExistingTFId) {
        newErrors.push('You must select a Task Force');
      }
    }

    if (selectedOption === 'C') {
      // Count assigned units
      let assignedCount = 0;

      // Check new TFs
      newTaskForces.forEach((ntf, idx) => {
        if (ntf.unitIds.length > 0 && !ntf.name.trim()) {
          newErrors.push(`Task Force ${idx + 1} needs a name`);
        }
        if (ntf.name.trim() && isDuplicateName(ntf.name, ntf.id)) {
          newErrors.push(`The name "${ntf.name}" is already in use`);
        }
        assignedCount += ntf.unitIds.length;
      });

      // Check existing assignments
      Object.values(existingAssignments).forEach(tfId => {
        if (tfId && tfId !== 'unassigned') assignedCount++;
      });

      if (assignedCount < embarkedUnits.length) {
        newErrors.push(`${embarkedUnits.length - assignedCount} units remaining to assign`);
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle confirm
  const handleConfirm = () => {
    if (!validateAssignments()) return;

    let config: DisembarkConfig = {
      newTaskForces: [],
      existingTFAssignments: []
    };

    if (selectedOption === 'A') {
      config.newTaskForces = [{
        id: 'temp_new',
        name: newTFName.trim(),
        unitIds: embarkedUnits.map(u => u.id)
      }];
    } else if (selectedOption === 'B') {
      config.existingTFAssignments = embarkedUnits.map(u => ({
        unitId: u.id,
        taskForceId: selectedExistingTFId
      }));
    } else if (selectedOption === 'C') {
      // Filter new TFs that have units assigned
      config.newTaskForces = newTaskForces
        .filter(ntf => ntf.unitIds.length > 0)
        .map(ntf => ({
          id: ntf.id,
          name: ntf.name.trim(),
          unitIds: ntf.unitIds
        }));

      // Add existing assignments
      config.existingTFAssignments = Object.entries(existingAssignments)
        .filter(([_, tfId]) => tfId && tfId !== 'unassigned')
        .map(([unitId, tfId]) => ({ unitId, taskForceId: tfId }));
    }

    onDisembark(config);
  };

  // Add new TF in Option C
  const handleAddNewTF = () => {
    const newId = `temp_${Date.now()}`;
    setNewTaskForces([...newTaskForces, { id: newId, name: '', unitIds: [] }]);
  };

  // Remove TF in Option C
  const handleRemoveTF = (tfId: string) => {
    setNewTaskForces(newTaskForces.filter(ntf => ntf.id !== tfId));
  };

  // Toggle unit assignment in new TF (Option C)
  const handleToggleUnitInNewTF = (tfId: string, unitId: string) => {
    setNewTaskForces(newTaskForces.map(ntf => {
      if (ntf.id === tfId) {
        const isAssigned = ntf.unitIds.includes(unitId);
        return {
          ...ntf,
          unitIds: isAssigned
            ? ntf.unitIds.filter(id => id !== unitId)
            : [...ntf.unitIds, unitId]
        };
      }
      return ntf;
    }));
  };

  // Update TF name in Option C
  const handleUpdateTFName = (tfId: string, name: string) => {
    setNewTaskForces(newTaskForces.map(ntf =>
      ntf.id === tfId ? { ...ntf, name } : ntf
    ));
  };

  // Handle existing TF assignment in Option C
  const handleExistingAssignment = (unitId: string, tfId: string) => {
    setExistingAssignments({
      ...existingAssignments,
      [unitId]: tfId
    });
  };

  // Check if unit is assigned in Option C
  const isUnitAssignedInNewTFs = (unitId: string): boolean => {
    return newTaskForces.some(ntf => ntf.unitIds.includes(unitId));
  };

  // Count unassigned units in Option C
  const getUnassignedCount = (): number => {
    const assignedInNewTFs = newTaskForces.reduce((sum, ntf) => sum + ntf.unitIds.length, 0);
    const assignedToExisting = Object.values(existingAssignments).filter(
      tfId => tfId && tfId !== 'unassigned'
    ).length;
    return embarkedUnits.length - assignedInNewTFs - assignedToExisting;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        <h2 className="text-xl font-mono font-bold text-green-400 mb-2 uppercase tracking-wider">
          Disembark Units from "{card.name}"
        </h2>
        <p className="text-sm font-mono text-gray-400 mb-4">
          {embarkedUnits.length} units to disembark
        </p>

        {/* Options */}
        <div className="space-y-2 mb-4">
          <label className="flex items-center space-x-2 text-white cursor-pointer font-mono">
            <input
              type="radio"
              value="A"
              checked={selectedOption === 'A'}
              onChange={() => setSelectedOption('A')}
              className="form-radio text-green-500"
            />
            <span>A) New Task Force (all units)</span>
          </label>
          <label className="flex items-center space-x-2 text-white cursor-pointer font-mono">
            <input
              type="radio"
              value="B"
              checked={selectedOption === 'B'}
              onChange={() => setSelectedOption('B')}
              className="form-radio text-green-500"
              disabled={areaTaskForces.length === 0}
            />
            <span>B) Existing TF (all units)</span>
            {areaTaskForces.length === 0 && (
              <span className="text-xs font-mono text-yellow-400">(No TFs in this area)</span>
            )}
          </label>
          <label className="flex items-center space-x-2 text-white cursor-pointer font-mono">
            <input
              type="radio"
              value="C"
              checked={selectedOption === 'C'}
              onChange={() => setSelectedOption('C')}
              className="form-radio text-green-500"
            />
            <span>C) Mixed (distribute manually)</span>
          </label>
        </div>

        {/* Option A UI */}
        {selectedOption === 'A' && (
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg mb-4">
            <label className="block text-sm font-mono text-gray-300 mb-2 uppercase tracking-wide">
              Task Force Name: <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={newTFName}
              onChange={(e) => setNewTFName(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 text-white font-mono text-sm rounded border border-gray-800 focus:outline-none focus:border-green-500"
              placeholder="Ex: Task Force Alpha"
            />

            <div className="mt-4">
              <p className="text-sm font-mono text-gray-300 mb-2 uppercase tracking-wide">Units to assign:</p>
              <ul className="space-y-1">
                {embarkedUnits.map(unit => (
                  <li key={unit.id} className="text-sm font-mono text-gray-400">
                    • {unit.name} ({unit.type})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Option B UI */}
        {selectedOption === 'B' && (
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg mb-4">
            <label className="block text-sm font-mono text-gray-300 mb-2 uppercase tracking-wide">
              Select Task Force: <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedExistingTFId}
              onChange={(e) => setSelectedExistingTFId(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 text-white font-mono text-sm rounded border border-gray-800 focus:outline-none focus:border-green-500"
            >
              <option value="">-- Select --</option>
              {areaTaskForces.map(tf => (
                <option key={tf.id} value={tf.id}>
                  {tf.name}
                </option>
              ))}
            </select>

            <div className="mt-4">
              <p className="text-sm font-mono text-gray-300 mb-2 uppercase tracking-wide">Units to integrate:</p>
              <ul className="space-y-1">
                {embarkedUnits.map(unit => (
                  <li key={unit.id} className="text-sm font-mono text-gray-400">
                    • {unit.name} ({unit.type})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Option C UI */}
        {selectedOption === 'C' && (
          <div className="space-y-4 mb-4">
            {/* New Task Forces Section */}
            <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg">
              <h3 className="font-mono font-bold text-green-400 mb-3 uppercase tracking-wider border-b border-green-900 pb-2">New Task Forces</h3>
              {newTaskForces.map((ntf, idx) => (
                <div key={ntf.id} className="mb-4 pb-4 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={ntf.name}
                      onChange={(e) => handleUpdateTFName(ntf.id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-black/40 text-white font-mono text-sm rounded border border-gray-800 focus:outline-none focus:border-green-500"
                      placeholder={`TF ${idx + 1}: Name`}
                    />
                    {newTaskForces.length > 1 && (
                      <button
                        onClick={() => handleRemoveTF(ntf.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-sm rounded border border-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {embarkedUnits.map(unit => {
                      const isAssignedHere = ntf.unitIds.includes(unit.id);
                      const isAssignedElsewhere = !isAssignedHere && isUnitAssignedInNewTFs(unit.id);
                      const isAssignedToExisting = existingAssignments[unit.id] &&
                        existingAssignments[unit.id] !== 'unassigned';

                      return (
                        <label
                          key={unit.id}
                          className={`flex items-center space-x-2 text-sm font-mono ${
                            isAssignedElsewhere || isAssignedToExisting
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'text-gray-300 cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssignedHere}
                            onChange={() => handleToggleUnitInNewTF(ntf.id, unit.id)}
                            disabled={isAssignedElsewhere || isAssignedToExisting}
                            className="form-checkbox text-green-500"
                          />
                          <span>{unit.name} ({unit.type})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddNewTF}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-mono text-sm rounded border border-green-500 uppercase tracking-wide"
              >
                + Add Task Force
              </button>
            </div>

            {/* Existing TFs Section */}
            {areaTaskForces.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg">
                <h3 className="font-mono font-bold text-green-400 mb-3 uppercase tracking-wider border-b border-green-900 pb-2">Assign to Existing TFs</h3>
                <div className="space-y-2">
                  {embarkedUnits.map(unit => {
                    const isAssignedToNewTF = isUnitAssignedInNewTFs(unit.id);
                    return (
                      <div key={unit.id} className="flex items-center gap-2">
                        <span className={`text-sm font-mono flex-1 ${isAssignedToNewTF ? 'text-gray-500' : 'text-gray-300'}`}>
                          {unit.name}
                        </span>
                        <select
                          value={existingAssignments[unit.id] || 'unassigned'}
                          onChange={(e) => handleExistingAssignment(unit.id, e.target.value)}
                          disabled={isAssignedToNewTF}
                          className="px-3 py-1 bg-black/40 text-white font-mono text-sm rounded border border-gray-800 focus:outline-none focus:border-green-500 disabled:opacity-50"
                        >
                          <option value="unassigned">Unassigned</option>
                          {areaTaskForces.map(tf => (
                            <option key={tf.id} value={tf.id}>
                              {tf.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unassigned warning */}
            {getUnassignedCount() > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-600/50 rounded p-3">
                <p className="text-yellow-400 font-mono text-sm">
                  ⚠ Unassigned units: {getUnassignedCount()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-900/30 border border-red-600 rounded p-3 mb-4">
            {errors.map((error, idx) => (
              <p key={idx} className="text-red-400 font-mono text-sm">
                • {error}
              </p>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-mono font-medium uppercase tracking-wide border border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-mono font-medium uppercase tracking-wide border border-green-500"
          >
            Confirm Disembarkation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisembarkModal;
