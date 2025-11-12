import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createGame } from '../firestoreService';
import { initializeGameWithSeedData } from '../firestoreServiceMultiGame';
import { initialOperationalAreas } from '../data/operationalAreas';
import { initialLocations } from '../data/locations';
import { initialOperationalData } from '../data/operationalData';
import { initialTaskForces } from '../data/taskForces';
import { initialUnits } from '../data/units';
import { initialCards, initialCommandPoints } from '../data/cards';
import { initialPurchaseHistory } from '../data/purchaseHistory';
import { initialCardPurchaseHistory } from '../data/cardPurchaseHistory';
import { initialTurnState } from '../data/turnState';
import { initialInfluenceMarker } from '../data/influenceMarker';

interface CreateGameModalProps {
  onClose: () => void;
  onGameCreated: (gameId: string) => void;
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({ onClose, onGameCreated }) => {
  const { currentUser, userProfile } = useAuth();
  const [gameName, setGameName] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !userProfile) return;

    if (!gameName.trim()) {
      setError('GAME NAME IS REQUIRED');
      return;
    }

    if (hasPassword && !password.trim()) {
      setError('PASSWORD IS REQUIRED');
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
        hasPassword ? password.trim() : undefined
      );

      // Initialize game with seed data
      await initializeGameWithSeedData(gameId, {
        operationalAreas: initialOperationalAreas,
        operationalData: initialOperationalData,
        locations: initialLocations,
        taskForces: initialTaskForces,
        units: initialUnits,
        cards: initialCards,
        commandPoints: initialCommandPoints,
        purchaseHistory: initialPurchaseHistory,
        cardPurchaseHistory: initialCardPurchaseHistory,
        turnState: initialTurnState,
        influenceMarker: initialInfluenceMarker
      });

      // Close modal and return to lobby
      // Creator will need to join the game like any other player
      onClose();
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError('FAILED TO CREATE GAME');
      setLoading(false);
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

          {/* Password Checkbox */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPassword}
                onChange={(e) => {
                  setHasPassword(e.target.checked);
                  if (!e.target.checked) {
                    setPassword('');
                  }
                }}
                className="w-5 h-5 bg-gray-900 border-2 border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 checked:bg-green-600 checked:border-green-500"
              />
              <span className="font-mono text-sm text-gray-300 uppercase tracking-wide">
                PASSWORD PROTECTED
              </span>
            </label>
          </div>

          {/* Password Input (conditional) */}
          {hasPassword && (
            <div>
              <label className="block font-mono text-sm text-gray-300 uppercase tracking-wide mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded font-mono text-green-400 focus:outline-none focus:border-green-500"
                placeholder="••••••••"
                required={hasPassword}
                maxLength={50}
              />
            </div>
          )}

          {/* Info */}
          <div className="bg-green-900 bg-opacity-20 border border-green-600 rounded p-3">
            <p className="font-mono text-xs text-green-300 uppercase tracking-wide">
              AS GAME CREATOR:
            </p>
            <ul className="font-mono text-xs text-gray-300 mt-2 space-y-1">
              <li>• YOU WILL BE THE MASTER (GAME DIRECTOR)</li>
              <li>• AFTER CREATING, JOIN THE GAME FROM THE LOBBY</li>
              <li>• SELECT YOUR FACTION WHEN JOINING</li>
              <li>• OTHER PLAYERS CAN JOIN AND SELECT THEIR FACTIONS</li>
            </ul>
          </div>

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
