import React from 'react';
import { PlayerAssignment, OperationalArea } from '../types';

interface FactionChangeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFaction: 'us' | 'china';
  newFaction: 'us' | 'china';
  currentAssignments: PlayerAssignment[];
  operationalAreas: OperationalArea[];
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const FactionChangeConfirmationModal: React.FC<FactionChangeConfirmationModalProps> = ({
  isOpen,
  onClose,
  currentFaction,
  newFaction,
  currentAssignments,
  operationalAreas,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg w-11/12 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-yellow-600">
          <h2 className="text-2xl font-mono font-bold uppercase text-yellow-400 tracking-wider">
            CHANGE FACTION
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-yellow-400 hover:text-yellow-300 font-mono text-2xl font-bold disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="p-4 bg-red-900 bg-opacity-50 border border-red-500 rounded">
            <p className="text-red-300 font-mono text-sm tracking-wide uppercase text-center">
              ⚠️ WARNING: CHANGING FACTION WILL REMOVE ALL YOUR CURRENT ASSIGNMENTS
            </p>
          </div>

          {/* Faction Change Visual */}
          <div className="flex items-center justify-center gap-4 py-4">
            <span className={`px-4 py-2 rounded font-mono font-bold text-lg uppercase ${
              currentFaction === 'us'
                ? 'bg-cyan-600 text-black'
                : 'bg-red-600 text-white'
            }`}>
              {currentFaction === 'us' ? 'US NAVY' : 'PLAN'}
            </span>
            <span className="text-yellow-400 font-mono text-2xl">→</span>
            <span className={`px-4 py-2 rounded font-mono font-bold text-lg uppercase ${
              newFaction === 'us'
                ? 'bg-cyan-600 text-black'
                : 'bg-red-600 text-white'
            }`}>
              {newFaction === 'us' ? 'US NAVY' : 'PLAN'}
            </span>
          </div>

          {/* Current Assignments List */}
          {currentAssignments.length > 0 && (
            <div>
              <p className="text-sm font-mono uppercase text-yellow-400 mb-2 tracking-wider">
                ASSIGNMENTS THAT WILL BE REMOVED:
              </p>
              <div className="space-y-2">
                {currentAssignments.map((assignment, idx) => {
                  const area = operationalAreas.find(a => a.id === assignment.operationalAreaId);
                  return (
                    <div
                      key={`${assignment.operationalAreaId}-${idx}`}
                      className="flex items-center gap-2 bg-gray-800 p-2 rounded border border-gray-700"
                    >
                      <span className="text-red-400 font-mono text-xs">✕</span>
                      <span className="font-mono text-gray-300 text-sm">
                        {area?.name || assignment.operationalAreaId}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentAssignments.length === 0 && (
            <p className="text-gray-500 font-mono text-sm italic text-center">
              No current assignments to remove
            </p>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-4 p-4 border-t-2 border-yellow-600">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded font-mono font-bold uppercase tracking-wider bg-gray-700 hover:bg-gray-600 text-gray-300 border-2 border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded font-mono font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white border-2 border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'CHANGING...' : 'CONFIRM CHANGE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FactionChangeConfirmationModal;
