import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GameMetadata } from '../types';
import { subscribeToPublicGames, joinGame, deleteGame, verifyGamePassword } from '../firestoreService';
import CreateGameModal from './CreateGameModal';
import DeleteGameModal from './DeleteGameModal';
import PasswordPromptModal from './PasswordPromptModal';
import FactionSelector from './FactionSelector';
import SuccessModal from './SuccessModal';

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
  const [gameToDelete, setGameToDelete] = useState<{ id: string; name: string } | null>(null);

  // Password flow states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameMetadata | null>(null);

  // Faction selector flow states
  const [showFactionSelector, setShowFactionSelector] = useState(false);

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Subscribe to games list with real-time updates
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const unsubscribe = subscribeToPublicGames((publicGames) => {
      setGames(publicGames);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const handleEnterGame = (game: GameMetadata) => {
    setSelectedGame(game);
    setJoiningGameId(game.id);
    setPasswordError('');

    // If game has password, show password modal
    if (game.hasPassword) {
      setShowPasswordModal(true);
    } else {
      // No password, go directly to faction selector
      setShowFactionSelector(true);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!selectedGame) return;

    try {
      const isValid = await verifyGamePassword(selectedGame.id, password);

      if (isValid) {
        // Password correct, show faction selector
        setShowPasswordModal(false);
        setPasswordError('');
        setShowFactionSelector(true);
      } else {
        // Password incorrect
        setPasswordError('INCORRECT PASSWORD');
      }
    } catch (err) {
      console.error('Error verifying password:', err);
      setPasswordError('ERROR VERIFYING PASSWORD');
    }
  };

  const handleFactionSelect = async (faction: 'us' | 'china') => {
    if (!currentUser || !userProfile || !selectedGame) return;

    try {
      setError('');

      // Determine role: master if creator, player otherwise
      const role = selectedGame.creatorUid === currentUser.uid ? 'master' : 'player';

      await joinGame(
        selectedGame.id,
        currentUser.uid,
        userProfile.displayName,
        role,
        faction
      );

      // Navigate to game
      onGameSelected(selectedGame.id);
    } catch (err: any) {
      console.error('Error joining game:', err);
      setError(err.message || 'FAILED TO JOIN GAME');
      setJoiningGameId(null);
      setShowFactionSelector(false);
    }
  };

  const handleCancelPasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordError('');
    setSelectedGame(null);
    setJoiningGameId(null);
  };

  const handleGameCreated = (gameId: string) => {
    setShowCreateModal(false);
    onGameSelected(gameId);
  };

  const handleDeleteGame = (gameId: string, gameName: string) => {
    setGameToDelete({ id: gameId, name: gameName });
  };

  const confirmDeleteGame = async () => {
    if (!gameToDelete) return;

    try {
      setError('');
      const deletedGameName = gameToDelete.name;
      await deleteGame(gameToDelete.id);
      setGameToDelete(null);
      // Reload games list after deletion
      await loadGames();
      // Show success modal
      setSuccessMessage(`GAME "${deletedGameName}" DELETED SUCCESSFULLY`);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Error deleting game:', err);
      setError('ERROR DELETING GAME');
      setGameToDelete(null);
    }
  };

  const cancelDeleteGame = () => {
    setGameToDelete(null);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Show faction selector as fullscreen (replaces lobby)
  if (showFactionSelector) {
    return <FactionSelector onSelect={handleFactionSelect} />;
  }

  // Show error screen if user profile failed to load
  if (!currentUser || !userProfile) {
    console.error('[GameLobby] Missing user data - profile may not have loaded');

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-gray-800 border-2 border-red-600 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-mono font-bold text-red-400 uppercase tracking-wider mb-2">
              PROFILE ERROR
            </h1>
            <p className="font-mono text-sm text-gray-400 tracking-wide">
              YOUR USER PROFILE COULD NOT BE LOADED
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded p-4 mb-6">
            <p className="font-mono text-xs text-gray-300 mb-2">TECHNICAL DETAILS:</p>
            <p className="font-mono text-xs text-red-300">
              {!currentUser && '• No authenticated user found'}
              {currentUser && !userProfile && '• User profile not found in database'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-mono font-bold py-3 px-6 rounded uppercase tracking-wider transition-colors"
            >
              RETRY
            </button>
            <button
              onClick={logout}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-mono font-bold py-3 px-6 rounded uppercase tracking-wider transition-colors"
            >
              LOGOUT
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="font-mono text-xs text-gray-500 tracking-wide">
              If this problem persists, contact support
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              {userProfile.role === 'admin' && (
                <span className="ml-2 inline-block bg-yellow-600 text-gray-900 px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded border border-yellow-400">
                  ADMIN
                </span>
              )}
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
              const isAlreadyInGame = currentUser && game.players[currentUser.uid];
              const isAdmin = userProfile?.role === 'admin';
              const canDelete = isAdmin || (currentUser && game.creatorUid === currentUser.uid);

              return (
                <div
                  key={game.id}
                  className="bg-gray-800 border-2 border-green-600 rounded-lg p-6 hover:border-green-500 transition-colors relative"
                >
                  {/* Password indicator - top-left corner */}
                  <div className="absolute top-2 left-2">
                    {game.hasPassword ? (
                      <span className="text-yellow-400 text-lg" title="Password protected">
                        🔒
                      </span>
                    ) : (
                      <div
                        className="w-5 h-5 bg-green-500 rounded-full"
                        title="Open access"
                      />
                    )}
                  </div>

                  {/* Delete button - X in top-right corner (for game master or admin) */}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteGame(game.id, game.name)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
                      title="Delete game"
                    >
                      ✕
                    </button>
                  )}

                  {/* Game Name - centered */}
                  <h3 className="font-mono text-xl font-bold text-green-400 uppercase tracking-wider mb-4 text-center">
                    {game.name}
                  </h3>

                  {/* Player Count - centered */}
                  <div className="text-center mb-4">
                    <span className={`font-mono text-sm uppercase tracking-wide ${isFull ? 'text-red-400' : 'text-green-400'}`}>
                      {playerCount} / {game.maxPlayers} PLAYERS
                    </span>
                  </div>

                  {/* Action Button */}
                  {isAlreadyInGame ? (
                    <button
                      onClick={() => onGameSelected(game.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-mono font-bold py-3 rounded uppercase tracking-wider text-sm transition-colors"
                    >
                      ENTER GAME →
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnterGame(game)}
                      disabled={isFull || isJoining}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-mono font-bold py-3 rounded uppercase tracking-wider text-sm transition-colors"
                    >
                      {isJoining ? 'JOINING...' : 'JOIN GAME'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Game Modal */}
      {showCreateModal && (
        <CreateGameModal
          onClose={() => setShowCreateModal(false)}
          onGameCreated={handleGameCreated}
        />
      )}

      {/* Delete Game Modal */}
      {gameToDelete && (
        <DeleteGameModal
          gameName={gameToDelete.name}
          onConfirm={confirmDeleteGame}
          onCancel={cancelDeleteGame}
        />
      )}

      {/* Password Prompt Modal */}
      {showPasswordModal && selectedGame && (
        <PasswordPromptModal
          gameName={selectedGame.name}
          onSubmit={handlePasswordSubmit}
          onCancel={handleCancelPasswordModal}
          error={passwordError}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          title="SUCCESS"
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default GameLobby;
