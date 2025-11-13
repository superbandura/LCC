import React, { useState, useMemo } from 'react';
import { OperationalArea, PlayerAssignment, RegisteredPlayer } from '../types';
import {
  assignPlayerToAreaMultiGame,
  removePlayerAssignmentMultiGame,
  changeFactionAndClearAssignments
} from '../firestoreServiceMultiGame';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import FactionChangeConfirmationModal from './FactionChangeConfirmationModal';

interface PlayerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  operationalAreas: OperationalArea[];
  playerAssignments: PlayerAssignment[];
  registeredPlayers: RegisteredPlayer[];
}

const PlayerAssignmentModal: React.FC<PlayerAssignmentModalProps> = ({
  isOpen,
  onClose,
  gameId,
  operationalAreas,
  playerAssignments,
  registeredPlayers
}) => {
  const { gameMetadata, isMaster } = useGame();
  const { userProfile, currentUser } = useAuth();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showFactionChangeModal, setShowFactionChangeModal] = useState(false);
  const [isChangingFaction, setIsChangingFaction] = useState(false);

  // Group operational areas by type (Command Centers vs Tactical Areas)
  const groupedAreas = useMemo(() => {
    const commandCenters = operationalAreas.filter(area => area.isCommandCenter === true);
    const tacticalAreas = operationalAreas.filter(area => !area.isCommandCenter);
    return { commandCenters, tacticalAreas };
  }, [operationalAreas]);

  // Get players assigned to selected area
  const selectedAreaPlayers = useMemo(() => {
    if (!selectedAreaId) return [];
    return playerAssignments.filter(pa => pa.operationalAreaId === selectedAreaId);
  }, [selectedAreaId, playerAssignments]);

  // Get current player's faction from gameMetadata
  const currentPlayerFaction = useMemo(() => {
    if (!currentUser || !gameMetadata) return null;
    const player = gameMetadata.players[currentUser.uid];
    return player?.faction || null;
  }, [currentUser, gameMetadata]);

  // Get current player's assignments
  const myAssignments = useMemo(() => {
    return playerAssignments.filter(
      pa => pa.playerName === userProfile?.displayName
    );
  }, [playerAssignments, userProfile]);

  // Check if current player is assigned to selected area
  const isAssignedToSelectedArea = useMemo(() => {
    if (!selectedAreaId) return false;
    return myAssignments.some(a => a.operationalAreaId === selectedAreaId);
  }, [myAssignments, selectedAreaId]);

  // Check if a player is currently connected
  const isPlayerConnected = (playerName: string): boolean => {
    return registeredPlayers.some(rp => rp.playerName === playerName);
  };

  const selectedArea = operationalAreas.find(a => a.id === selectedAreaId);

  // Handle self-assignment
  const handleAssignMe = async () => {
    if (!selectedAreaId || !userProfile?.displayName || !currentPlayerFaction) {
      setError('CANNOT ASSIGN: MISSING INFORMATION');
      return;
    }

    try {
      await assignPlayerToAreaMultiGame(gameId, userProfile.displayName, selectedAreaId, currentPlayerFaction);
      setError('');
    } catch (err: any) {
      console.error('Error assigning self:', err);
      // Show the actual error message if it's a faction validation error
      if (err?.message && err.message.includes('Cannot assign')) {
        setError(err.message.toUpperCase());
      } else {
        setError('ASSIGNMENT FAILED');
      }
    }
  };

  // Handle self-unassignment
  const handleRemoveMe = async () => {
    if (!selectedAreaId || !userProfile?.displayName || !currentPlayerFaction) {
      setError('CANNOT REMOVE: MISSING INFORMATION');
      return;
    }

    try {
      await removePlayerAssignmentMultiGame(gameId, userProfile.displayName, selectedAreaId, currentPlayerFaction);
      setError('');
    } catch (err) {
      console.error('Error removing self:', err);
      setError('REMOVAL FAILED');
    }
  };

  // Handle removing another player (Master/Admin only)
  const handleRemovePlayer = async (assignment: PlayerAssignment) => {
    try {
      await removePlayerAssignmentMultiGame(
        gameId,
        assignment.playerName,
        assignment.operationalAreaId,
        assignment.faction
      );
    } catch (err) {
      console.error('Error removing player assignment:', err);
      setError('REMOVAL FAILED');
    }
  };

  // Handle faction change confirmation
  const handleConfirmFactionChange = async () => {
    if (!currentUser || !userProfile || !currentPlayerFaction) return;

    const newFaction: 'us' | 'china' = currentPlayerFaction === 'us' ? 'china' : 'us';

    setIsChangingFaction(true);
    try {
      await changeFactionAndClearAssignments(
        gameId,
        currentUser.uid,
        userProfile.displayName,
        newFaction
      );
      setShowFactionChangeModal(false);
      setError('');
    } catch (err) {
      console.error('Error changing faction:', err);
      setError('FACTION CHANGE FAILED');
    } finally {
      setIsChangingFaction(false);
    }
  };

  if (!isOpen) return null;

  const newFaction: 'us' | 'china' = currentPlayerFaction === 'us' ? 'china' : 'us';

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75">
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
              {/* Command Centers */}
              <div className="p-4 border-b border-green-700">
                <h3 className="text-lg font-mono font-bold uppercase text-yellow-400 mb-3 tracking-wider">
                  COMMAND CENTERS
                </h3>
                <div className="space-y-2">
                  {groupedAreas.commandCenters.map(area => {
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
                            ? 'bg-yellow-600 text-black font-bold'
                            : 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm uppercase tracking-wide">{area.name}</span>
                          {playerCount > 0 && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              selectedAreaId === area.id ? 'bg-black text-yellow-400' : 'bg-yellow-900 text-yellow-300'
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

              {/* Tactical Areas */}
              <div className="p-4">
                <h3 className="text-lg font-mono font-bold uppercase text-green-400 mb-3 tracking-wider">
                  OPERATIONAL AREAS
                </h3>
                <div className="space-y-2">
                  {groupedAreas.tacticalAreas.map(area => {
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
                            ? 'bg-green-600 text-black font-bold'
                            : 'bg-gray-800 text-green-300 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm uppercase tracking-wide">{area.name}</span>
                          {playerCount > 0 && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              selectedAreaId === area.id ? 'bg-black text-green-400' : 'bg-green-900 text-green-300'
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

            {/* Right Panel: Area Details & Self-Assignment */}
            <div className="flex-1 p-6 overflow-y-auto">
              {!selectedArea ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 font-mono text-lg uppercase tracking-wider">
                    SELECT AN AREA
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
                      {selectedArea.isCommandCenter ? '⭐ COMMAND CENTER' : '📍 OPERATIONAL AREA'}
                    </p>
                  </div>

                  {/* Section 1: My Profile (always visible) */}
                  <div className="bg-black bg-opacity-50 border-2 border-cyan-600 rounded p-4">
                    <h4 className="text-md font-mono font-bold uppercase text-cyan-400 mb-3 tracking-wider">
                      MY PROFILE
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-gray-300 text-sm">NAME:</span>
                        <span className="font-mono text-green-300 font-bold">{userProfile?.displayName || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-gray-300 text-sm">FACTION:</span>
                        <span className={`px-3 py-1 rounded font-mono font-bold text-xs uppercase ${
                          currentPlayerFaction === 'us'
                            ? 'bg-cyan-600 text-black'
                            : 'bg-red-600 text-white'
                        }`}>
                          {currentPlayerFaction === 'us' ? '🔵 US NAVY' : '🔴 PLAN'}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowFactionChangeModal(true)}
                        className="w-full py-2 rounded font-mono font-bold uppercase text-xs bg-yellow-600 hover:bg-yellow-500 text-black border-2 border-yellow-400 transition-colors"
                      >
                        CHANGE FACTION
                      </button>
                    </div>
                  </div>

                  {/* Section 2: My Assignment in This Area */}
                  <div className="bg-black bg-opacity-50 border-2 border-green-600 rounded p-4">
                    <h4 className="text-md font-mono font-bold uppercase text-green-400 mb-3 tracking-wider">
                      MY ASSIGNMENT IN THIS AREA
                    </h4>
                    {isAssignedToSelectedArea ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-900 bg-opacity-30 border border-green-600 rounded text-center">
                          <p className="text-green-300 font-mono text-sm font-bold uppercase">
                            ✓ YOU ARE ASSIGNED HERE
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveMe}
                          className="w-full py-2 rounded font-mono font-bold uppercase text-xs bg-red-600 hover:bg-red-500 text-white border-2 border-red-400 transition-colors"
                        >
                          REMOVE ME FROM THIS AREA
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAssignMe}
                        disabled={!currentPlayerFaction}
                        className={`w-full py-2 rounded font-mono font-bold uppercase text-xs transition-colors border-2 ${
                          !currentPlayerFaction
                            ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-500 text-black border-green-400'
                        }`}
                      >
                        {!currentPlayerFaction ? 'NO FACTION SELECTED' : 'ASSIGN ME TO THIS AREA'}
                      </button>
                    )}
                  </div>

                  {/* Section 3: All Players Assigned Here */}
                  <div>
                    <h4 className="text-md font-mono font-bold uppercase text-green-400 mb-3 tracking-wider">
                      ALL PLAYERS ASSIGNED HERE ({selectedAreaPlayers.length})
                    </h4>
                    {selectedAreaPlayers.length === 0 ? (
                      <p className="text-gray-500 font-mono text-sm italic">
                        No players assigned to this area
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedAreaPlayers.map((assignment, idx) => {
                          const isConnected = isPlayerConnected(assignment.playerName);
                          const isMe = assignment.playerName === userProfile?.displayName;

                          return (
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
                                {isMe && (
                                  <span className="px-2 py-0.5 rounded font-mono text-xs uppercase bg-cyan-900 text-cyan-300 border border-cyan-600">
                                    YOU
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded font-mono text-xs uppercase ${
                                  isConnected
                                    ? 'bg-green-900 text-green-300 border border-green-600'
                                    : 'bg-gray-700 text-gray-400 border border-gray-600'
                                }`}>
                                  {isConnected ? '● ONLINE' : '○ OFFLINE'}
                                </span>
                              </div>
                              {isMaster && !isMe && (
                                <button
                                  onClick={() => handleRemovePlayer(assignment)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-xs uppercase rounded transition-colors"
                                >
                                  REMOVE
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded">
                      <p className="text-red-300 font-mono text-sm tracking-wide">{error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Faction Change Confirmation Modal */}
      {currentPlayerFaction && (
        <FactionChangeConfirmationModal
          isOpen={showFactionChangeModal}
          onClose={() => setShowFactionChangeModal(false)}
          currentFaction={currentPlayerFaction}
          newFaction={newFaction}
          currentAssignments={myAssignments}
          operationalAreas={operationalAreas}
          onConfirm={handleConfirmFactionChange}
          isLoading={isChangingFaction}
        />
      )}
    </>
  );
};

export default PlayerAssignmentModal;
