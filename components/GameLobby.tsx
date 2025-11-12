import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GameMetadata, GameRole } from '../types';
import { getPublicGames, joinGame } from '../firestoreService';
import CreateGameModal from './CreateGameModal';

interface GameLobbyProps {
  onGameSelected: (gameId: string) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ onGameSelected }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [games, setGames] = useState<GameMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const publicGames = await getPublicGames();
      setGames(publicGames);
    } catch (err) {
      console.error('Error loading games:', err);
      setError('FAILED TO LOAD GAMES');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load games when user is authenticated
  useEffect(() => {
    if (currentUser) {
      loadGames();
    }
  }, [currentUser, loadGames]);

  const handleJoinGame = async (gameId: string, role: GameRole, faction: 'us' | 'china' | null) => {
    if (!currentUser || !userProfile) return;

    try {
      setJoiningGameId(gameId);
      setError('');

      await joinGame(gameId, currentUser.uid, userProfile.displayName, role, faction);

      // Navigate to game
      onGameSelected(gameId);
    } catch (err: any) {
      console.error('Error joining game:', err);
      setError(err.message || 'FAILED TO JOIN GAME');
      setJoiningGameId(null);
    }
  };

  const handleGameCreated = (gameId: string) => {
    setShowCreateModal(false);
    onGameSelected(gameId);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!currentUser || !userProfile) return null;

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-mono font-bold text-green-400 uppercase tracking-wider">
              GAME LOBBY
            </h1>
            <p className="font-mono text-gray-400 mt-2 tracking-wide">
              WELCOME, {userProfile.displayName.toUpperCase()}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-mono font-bold px-6 py-3 rounded uppercase tracking-wider transition-colors"
            >
              + CREATE GAME
            </button>
            <button
              onClick={logout}
              className="bg-gray-700 hover:bg-gray-600 text-white font-mono font-bold px-6 py-3 rounded uppercase tracking-wider transition-colors"
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-600 rounded p-4 mb-4">
            <p className="font-mono text-sm text-red-200 uppercase tracking-wide">{error}</p>
          </div>
        )}
      </div>

      {/* Games List */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <p className="font-mono text-gray-400 uppercase tracking-wide">LOADING GAMES...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 border-2 border-gray-700 rounded-lg">
            <p className="font-mono text-gray-400 uppercase tracking-wide mb-4">NO ACTIVE GAMES</p>
            <p className="font-mono text-sm text-gray-500">CREATE A NEW GAME TO GET STARTED</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const playerCount = Object.keys(game.players).length;
              const isFull = playerCount >= game.maxPlayers;
              const isJoining = joiningGameId === game.id;

              return (
                <div
                  key={game.id}
                  className="bg-gray-800 border-2 border-green-600 rounded-lg p-6 hover:border-green-500 transition-colors"
                >
                  {/* Game Name */}
                  <h3 className="font-mono text-xl font-bold text-green-400 uppercase tracking-wider mb-3">
                    {game.name}
                  </h3>

                  {/* Game Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-gray-400 uppercase">Players:</span>
                      <span className="text-green-400">
                        {playerCount} / {game.maxPlayers}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-gray-400 uppercase">Created:</span>
                      <span className="text-green-400">{formatDate(game.createdAt)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-gray-400 uppercase">Status:</span>
                      <span className={isFull ? 'text-red-400' : 'text-green-400'}>
                        {isFull ? 'FULL' : 'OPEN'}
                      </span>
                    </div>
                  </div>

                  {/* Join Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleJoinGame(game.id, 'player', 'us')}
                      disabled={isFull || isJoining}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-mono font-bold py-2 rounded uppercase tracking-wide text-sm transition-colors"
                    >
                      {isJoining ? 'JOINING...' : 'JOIN AS US PLAYER'}
                    </button>
                    <button
                      onClick={() => handleJoinGame(game.id, 'player', 'china')}
                      disabled={isFull || isJoining}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-mono font-bold py-2 rounded uppercase tracking-wide text-sm transition-colors"
                    >
                      {isJoining ? 'JOINING...' : 'JOIN AS CHINA PLAYER'}
                    </button>
                    <button
                      onClick={() => handleJoinGame(game.id, 'master', null)}
                      disabled={isFull || isJoining}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-mono font-bold py-2 rounded uppercase tracking-wide text-sm transition-colors"
                    >
                      {isJoining ? 'JOINING...' : 'JOIN AS MASTER'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadGames}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-mono font-bold px-6 py-2 rounded uppercase tracking-wider transition-colors"
          >
            {loading ? 'REFRESHING...' : 'REFRESH LIST'}
          </button>
        </div>
      </div>

      {/* Create Game Modal */}
      {showCreateModal && (
        <CreateGameModal
          onClose={() => setShowCreateModal(false)}
          onGameCreated={handleGameCreated}
        />
      )}
    </div>
  );
};

export default GameLobby;
