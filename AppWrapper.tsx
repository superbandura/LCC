/**
 * AppWrapper - Main application wrapper with authentication and game routing
 *
 * Handles the flow:
 * 1. Not authenticated → AuthScreen
 * 2. Authenticated but no game selected → GameLobby
 * 3. Authenticated with game selected → Game (App.tsx)
 */

import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProvider, useGame } from './contexts/GameContext';
import AuthScreen from './components/AuthScreen';
import GameLobby from './components/GameLobby';
import App from './App';

const AppRouter: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { gameId, setGameId } = useGame();

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
          <p className="font-mono text-green-400 uppercase tracking-wider">LOADING...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → Show auth screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  // Authenticated but no game selected → Show game lobby
  if (!gameId) {
    return <GameLobby onGameSelected={setGameId} />;
  }

  // Authenticated with game selected → Show game
  return <App />;
};

const AppWrapper: React.FC = () => {
  return (
    <AuthProvider>
      <GameProvider>
        <AppRouter />
      </GameProvider>
    </AuthProvider>
  );
};

export default AppWrapper;
