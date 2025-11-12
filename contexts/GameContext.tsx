import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameMetadata, GameRole } from '../types';
import { getGameMetadata, subscribeToGameMetadata } from '../firestoreService';
import { useAuth } from './AuthContext';

interface GameContextType {
  gameId: string | null;
  gameMetadata: GameMetadata | null;
  currentPlayerRole: GameRole | null;
  currentPlayerFaction: 'us' | 'china' | null;
  setGameId: (gameId: string | null) => void;
  leaveGame: () => void;
  isMaster: boolean;
  isPlayer: boolean;
  canControlFaction: (faction: 'us' | 'china') => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [gameId, setGameIdState] = useState<string | null>(() => {
    // Try to restore game ID from localStorage
    return localStorage.getItem('lcc_current_game_id');
  });
  const [gameMetadata, setGameMetadata] = useState<GameMetadata | null>(null);

  // Subscribe to game metadata when gameId changes
  useEffect(() => {
    if (!gameId) {
      setGameMetadata(null);
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = subscribeToGameMetadata(gameId, (metadata) => {
      setGameMetadata(metadata);
    });

    return unsubscribe;
  }, [gameId]);

  // Persist gameId to localStorage
  const setGameId = (newGameId: string | null) => {
    setGameIdState(newGameId);
    if (newGameId) {
      localStorage.setItem('lcc_current_game_id', newGameId);
    } else {
      localStorage.removeItem('lcc_current_game_id');
    }
  };

  const leaveGame = () => {
    setGameId(null);
    setGameMetadata(null);
  };

  // Get current player's role and faction
  const currentPlayer = currentUser && gameMetadata ? gameMetadata.players[currentUser.uid] : null;
  const currentPlayerRole = currentPlayer?.role || null;
  const currentPlayerFaction = currentPlayer?.faction || null;

  // Helper flags
  const isMaster = currentPlayerRole === 'master';
  const isPlayer = currentPlayerRole === 'player';

  // Check if current user can control a specific faction
  const canControlFaction = (faction: 'us' | 'china'): boolean => {
    if (!currentUser || !gameMetadata) return false;

    // Masters can control both factions
    if (isMaster) return true;

    // Players can only control their assigned faction
    if (isPlayer && currentPlayerFaction === faction) return true;

    return false;
  };

  const value: GameContextType = {
    gameId,
    gameMetadata,
    currentPlayerRole,
    currentPlayerFaction,
    setGameId,
    leaveGame,
    isMaster,
    isPlayer,
    canControlFaction,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
