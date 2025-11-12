import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GameRole } from '../types';
import { createGame } from '../firestoreService';
import { initialOperationalAreas } from '../data/operationalAreas';
import { initialLocations } from '../data/locations';
import { initialOperationalData } from '../data/operationalData';
import { initialTaskForces } from '../data/taskForces';
import { initialUnits } from '../data/units';
import { initialCards } from '../data/cards';
import { initialTurnState } from '../data/turnState';

interface CreateGameModalProps {
  onClose: () => void;
  onGameCreated: (gameId: string) => void;
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({ onClose, onGameCreated }) => {
  const { currentUser, userProfile } = useAuth();
  const [gameName, setGameName] = useState('');
  const [selectedRole, setSelectedRole] = useState<GameRole>('player');
  const [selectedFaction, setSelectedFaction] = useState<'us' | 'china' | null>('us');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !userProfile) return;

    if (!gameName.trim()) {
      setError('GAME NAME IS REQUIRED');
      return;
    }

    if (selectedRole === 'player' && !selectedFaction) {
      setError('PLEASE SELECT A FACTION');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create the game
      const gameId = await createGame(
        gameName.trim(),
        currentUser.uid,
        userProfile.displayName,
        selectedRole,
        selectedRole === 'master' ? null : selectedFaction
      );

      // Initialize game state (this will be moved to a separate initialization function)
      // For now, we'll just navigate to the game
      // The game state initialization will happen in the next phase

      onGameCreated(gameId);
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError('FAILED TO CREATE GAME');
      setLoading(false);
    }
  };

  const handleRoleChange = (role: GameRole) => {
    setSelectedRole(role);
    if (role === 'master') {
      setSelectedFaction(null);
    } else if (!selectedFaction) {
      setSelectedFaction('us');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border-2 border-green-600 rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-mono font-bold text-green-400 uppercase tracking-wider">
            CREATE GAME
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-mono text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Game Name */}
          <div>
            <label className="block font-mono text-sm text-gray-300 uppercase tracking-wide mb-2">
              GAME NAME
            </label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-green-400 focus:outline-none focus:border-green-500"
              placeholder="PACIFIC CAMPAIGN 2030"
              required
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block font-mono text-sm text-gray-300 uppercase tracking-wide mb-2">
              YOUR ROLE
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleRoleChange('player')}
                className={`w-full px-4 py-3 font-mono font-bold rounded uppercase tracking-wide border-2 transition-colors ${
                  selectedRole === 'player'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-blue-500'
                }`}
              >
                PLAYER
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('master')}
                className={`w-full px-4 py-3 font-mono font-bold rounded uppercase tracking-wide border-2 transition-colors ${
                  selectedRole === 'master'
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-green-500'
                }`}
              >
                MASTER (GAME DIRECTOR)
              </button>
            </div>
          </div>

          {/* Faction Selection (only for players) */}
          {selectedRole === 'player' && (
            <div>
              <label className="block font-mono text-sm text-gray-300 uppercase tracking-wide mb-2">
                YOUR FACTION
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFaction('us')}
                  className={`px-4 py-3 font-mono font-bold rounded uppercase tracking-wide border-2 transition-colors ${
                    selectedFaction === 'us'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-blue-500'
                  }`}
                >
                  US
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFaction('china')}
                  className={`px-4 py-3 font-mono font-bold rounded uppercase tracking-wide border-2 transition-colors ${
                    selectedFaction === 'china'
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-red-500'
                  }`}
                >
                  CHINA
                </button>
              </div>
            </div>
          )}

          {/* Master Info */}
          {selectedRole === 'master' && (
            <div className="bg-green-900 bg-opacity-20 border border-green-600 rounded p-3">
              <p className="font-mono text-xs text-green-300 uppercase tracking-wide">
                MASTER ROLE CAPABILITIES:
              </p>
              <ul className="font-mono text-xs text-gray-300 mt-2 space-y-1">
                <li>• CONTROL BOTH FACTIONS</li>
                <li>• ADVANCE TURN</li>
                <li>• ASSIGN PLAYERS TO AREAS</li>
                <li>• MANAGE PLAYERS</li>
              </ul>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 border border-red-600 rounded p-3">
              <p className="font-mono text-sm text-red-200 uppercase tracking-wide">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-mono font-bold py-3 rounded uppercase tracking-wider transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-mono font-bold py-3 rounded uppercase tracking-wider transition-colors"
            >
              {loading ? 'CREATING...' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGameModal;
