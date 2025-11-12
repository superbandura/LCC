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
import ErrorBoundary from './components/ErrorBoundary';

const AppRouter: React.FC = () => {
  try {
    const { currentUser, loading: authLoading, userProfile } = useAuth();
    const { gameId, gameMetadata, setGameId } = useGame();

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

    // Not authenticated OR missing profile → Show auth screen
    // The userProfile check prevents race condition where user loads but profile doesn't
    if (!currentUser || (authLoading === false && !userProfile)) {
      return <AuthScreen />;
    }

    // Authenticated but no game selected → Show game lobby
    if (!gameId) {
      return <GameLobby onGameSelected={setGameId} />;
    }

    // Game selected but metadata not loaded yet → Show loading
    if (gameId && !gameMetadata) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
            <p className="font-mono text-green-400 uppercase tracking-wider">LOADING GAME...</p>
          </div>
        </div>
      );
    }

    // Game selected and metadata loaded → Check if user is in game
    if (gameId && gameMetadata) {
      // If user is not in the game's player list, redirect to lobby
      if (!gameMetadata.players[currentUser.uid]) {
        console.warn('[AppRouter] User not in game player list, redirecting to lobby');
        setGameId(null);
        return <GameLobby onGameSelected={setGameId} />;
      }

      // User is in game, show game
      return <App />;
    }

    // Fallback (should not reach here)
    return <GameLobby onGameSelected={setGameId} />;
  } catch (error) {
    console.error('AppRouter error:', error);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-red-400 uppercase tracking-wider mb-4">ERROR IN APP ROUTER</p>
          <p className="font-mono text-gray-400 text-sm">{String(error)}</p>
        </div>
      </div>
    );
  }
};

const AppWrapper: React.FC = () => {
  try {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <GameProvider>
            <AppRouter />
          </GameProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('AppWrapper error:', error);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-red-400 uppercase tracking-wider mb-4">ERROR IN APP WRAPPER</p>
          <p className="font-mono text-gray-400 text-sm">{String(error)}</p>
        </div>
      </div>
    );
  }
};

export default AppWrapper;
