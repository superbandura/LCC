import React, { useState, useMemo } from 'react';
import { OperationalArea, PlayerAssignment, RegisteredPlayer } from '../types';
import { assignPlayerToArea, removePlayerAssignment } from '../firestoreService';

interface PlayerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  operationalAreas: OperationalArea[];
  playerAssignments: PlayerAssignment[];
  registeredPlayers: RegisteredPlayer[];
}

const PlayerAssignmentModal: React.FC<PlayerAssignmentModalProps> = ({
  isOpen,
  onClose,
  operationalAreas,
  playerAssignments,
  registeredPlayers
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState('');
  const [newPlayerFaction, setNewPlayerFaction] = useState<'us' | 'china'>('us');
  const [error, setError] = useState('');

  // Group operational areas by faction
  const groupedAreas = useMemo(() => {
    const us = operationalAreas.filter(area => area.name.toLowerCase().includes('us') || area.name.toLowerCase().includes('navy') || area.id.includes('us'));
    const china = operationalAreas.filter(area => !us.includes(area));

    return { us, china };
  }, [operationalAreas]);

  // Get players assigned to selected area
  const selectedAreaPlayers = useMemo(() => {
    if (!selectedAreaId) return [];
    return playerAssignments.filter(pa => pa.operationalAreaId === selectedAreaId);
  }, [selectedAreaId, playerAssignments]);

  // Calculate unassigned players by faction
  const unassignedPlayers = useMemo(() => {
    // Filter registered players by selected faction
    const factionPlayers = registeredPlayers.filter(rp => rp.faction === newPlayerFaction);

    // Filter out players who already have ANY assignment (not just to this area)
    const unassigned = factionPlayers.filter(rp =>
      !playerAssignments.some(pa =>
        pa.playerName === rp.playerName && pa.faction === rp.faction
      )
    );

    return unassigned;
  }, [registeredPlayers, playerAssignments, newPlayerFaction]);

  const selectedArea = operationalAreas.find(a => a.id === selectedAreaId);

  const handleAssignPlayer = async () => {
    if (!selectedAreaId) {
      setError('SELECT AN AREA FIRST');
      return;
    }

    if (!selectedPlayerName) {
      setError('SELECT A PLAYER');
      return;
    }

    // Check if player is already assigned to this area with this faction
    const existingAssignment = playerAssignments.find(
      pa => pa.playerName === selectedPlayerName &&
            pa.operationalAreaId === selectedAreaId &&
            pa.faction === newPlayerFaction
    );

    if (existingAssignment) {
      setError('PLAYER ALREADY ASSIGNED TO THIS AREA');
      return;
    }

    try {
      await assignPlayerToArea(selectedPlayerName, selectedAreaId, newPlayerFaction);
      setSelectedPlayerName('');
      setError('');
    } catch (err) {
      console.error('Error assigning player:', err);
      setError('ASSIGNMENT FAILED');
    }
  };

  const handleRemovePlayer = async (assignment: PlayerAssignment) => {
    try {
      await removePlayerAssignment(
        assignment.playerName,
        assignment.operationalAreaId,
        assignment.faction
      );
    } catch (err) {
      console.error('Error removing player assignment:', err);
      setError('REMOVAL FAILED');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-900 border-2 border-green-600 rounded-lg w-11/12 max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-green-600">
          <h2 className="text-2xl font-mono font-bold uppercase text-green-400 tracking-wider">
            PLAYER ASSIGNMENTS
          </h2>
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-300 font-mono text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Operational Areas List */}
          <div className="w-1/3 border-r-2 border-green-600 overflow-y-auto">
            {/* US Areas */}
            <div className="p-4 border-b border-green-700">
              <h3 className="text-lg font-mono font-bold uppercase text-cyan-400 mb-3 tracking-wider">
                US NAVY AREAS
              </h3>
              <div className="space-y-2">
                {groupedAreas.us.map(area => {
                  const playerCount = playerAssignments.filter(pa => pa.operationalAreaId === area.id).length;
                  return (
                    <button
                      key={area.id}
                      onClick={() => {
                        setSelectedAreaId(area.id);
                        setError('');
                      }}
                      className={`w-full text-left p-3 rounded font-mono transition-colors ${
                        selectedAreaId === area.id
                          ? 'bg-cyan-600 text-black font-bold'
                          : 'bg-gray-800 text-cyan-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm uppercase tracking-wide">{area.name}</span>
                        {playerCount > 0 && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            selectedAreaId === area.id ? 'bg-black text-cyan-400' : 'bg-cyan-900 text-cyan-300'
                          }`}>
                            {playerCount} {playerCount === 1 ? 'PLAYER' : 'PLAYERS'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* China Areas */}
            <div className="p-4">
              <h3 className="text-lg font-mono font-bold uppercase text-red-400 mb-3 tracking-wider">
                PLAN AREAS
              </h3>
              <div className="space-y-2">
                {groupedAreas.china.map(area => {
                  const playerCount = playerAssignments.filter(pa => pa.operationalAreaId === area.id).length;
                  return (
                    <button
                      key={area.id}
                      onClick={() => {
                        setSelectedAreaId(area.id);
                        setError('');
                      }}
                      className={`w-full text-left p-3 rounded font-mono transition-colors ${
                        selectedAreaId === area.id
                          ? 'bg-red-600 text-white font-bold'
                          : 'bg-gray-800 text-red-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm uppercase tracking-wide">{area.name}</span>
                        {playerCount > 0 && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            selectedAreaId === area.id ? 'bg-black text-red-400' : 'bg-red-900 text-red-300'
                          }`}>
                            {playerCount} {playerCount === 1 ? 'PLAYER' : 'PLAYERS'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Assignment Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!selectedArea ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 font-mono text-lg uppercase tracking-wider">
                  SELECT AN OPERATIONAL AREA
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Area Title */}
                <div className="border-b-2 border-green-600 pb-4">
                  <h3 className="text-xl font-mono font-bold uppercase text-green-400 tracking-wider">
                    {selectedArea.name}
                  </h3>
                  <p className="text-sm font-mono text-gray-400 mt-1">
                    AREA ID: {selectedArea.id}
                  </p>
                </div>

                {/* Current Assignments */}
                <div>
                  <h4 className="text-md font-mono font-bold uppercase text-green-400 mb-3 tracking-wider">
                    ASSIGNED PLAYERS ({selectedAreaPlayers.length})
                  </h4>
                  {selectedAreaPlayers.length === 0 ? (
                    <p className="text-gray-500 font-mono text-sm italic">
                      No players assigned to this area
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedAreaPlayers.map((assignment, idx) => (
                        <div
                          key={`${assignment.playerName}-${assignment.faction}-${idx}`}
                          className="flex items-center justify-between bg-gray-800 p-3 rounded border border-green-700"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded font-mono font-bold text-xs uppercase ${
                              assignment.faction === 'us'
                                ? 'bg-cyan-600 text-black'
                                : 'bg-red-600 text-white'
                            }`}>
                              {assignment.faction === 'us' ? 'US' : 'PLAN'}
                            </span>
                            <span className="font-mono text-green-300 tracking-wide">
                              {assignment.playerName}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemovePlayer(assignment)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-xs uppercase rounded transition-colors"
                          >
                            REMOVE
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Player Form */}
                <div className="bg-black bg-opacity-50 border-2 border-green-600 rounded p-4">
                  <h4 className="text-md font-mono font-bold uppercase text-green-400 mb-4 tracking-wider">
                    ASSIGN NEW PLAYER
                  </h4>

                  <div className="space-y-4">
                    {/* Faction Selection */}
                    <div>
                      <label className="block text-sm font-mono uppercase text-green-400 mb-2 tracking-wider">
                        FACTION:
                      </label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setNewPlayerFaction('us');
                            setError('');
                          }}
                          className={`flex-1 py-2 rounded font-mono font-bold uppercase transition-colors ${
                            newPlayerFaction === 'us'
                              ? 'bg-cyan-600 text-black border-2 border-cyan-400'
                              : 'bg-gray-700 text-cyan-400 border-2 border-gray-600 hover:bg-gray-600'
                          }`}
                        >
                          US NAVY
                        </button>
                        <button
                          onClick={() => {
                            setNewPlayerFaction('china');
                            setError('');
                          }}
                          className={`flex-1 py-2 rounded font-mono font-bold uppercase transition-colors ${
                            newPlayerFaction === 'china'
                              ? 'bg-red-600 text-white border-2 border-red-400'
                              : 'bg-gray-700 text-red-400 border-2 border-gray-600 hover:bg-gray-600'
                          }`}
                        >
                          PLAN
                        </button>
                      </div>
                    </div>

                    {/* Player Name Dropdown */}
                    <div>
                      <label className="block text-sm font-mono uppercase text-green-400 mb-2 tracking-wider">
                        SELECT PLAYER ({unassignedPlayers.length} AVAILABLE):
                      </label>
                      {unassignedPlayers.length === 0 ? (
                        <div className="p-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded text-center">
                          <p className="text-yellow-400 font-mono text-sm">
                            NO UNASSIGNED PLAYERS AVAILABLE
                          </p>
                          <p className="text-yellow-300 font-mono text-xs mt-1">
                            All registered players of this faction are already assigned.
                          </p>
                        </div>
                      ) : (
                        <select
                          value={selectedPlayerName}
                          onChange={(e) => {
                            setSelectedPlayerName(e.target.value);
                            setError('');
                          }}
                          className="w-full bg-gray-800 border-2 border-green-700 text-green-300 font-mono px-4 py-2 rounded focus:outline-none focus:border-green-500"
                        >
                          <option value="">SELECT PLAYER...</option>
                          {unassignedPlayers.map((player) => (
                            <option key={player.playerName} value={player.playerName}>
                              {player.playerName.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded">
                        <p className="text-red-300 font-mono text-sm tracking-wide">{error}</p>
                      </div>
                    )}

                    {/* Assign Button */}
                    <button
                      onClick={handleAssignPlayer}
                      disabled={!selectedPlayerName || unassignedPlayers.length === 0}
                      className={`w-full font-mono font-bold uppercase tracking-wider py-3 rounded border-2 transition-colors ${
                        !selectedPlayerName || unassignedPlayers.length === 0
                          ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-500 text-black border-green-400'
                      }`}
                    >
                      ASSIGN PLAYER
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerAssignmentModal;
